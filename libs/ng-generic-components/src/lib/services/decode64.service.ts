import { Injectable } from '@angular/core';
// need the bitwise in thie file for reasons
/* tslint:disable:no-bitwise */

interface Options {
    maxConsecutiveNonMatchingChars:number;
    minRunLength:number;
}

interface DecodesObj {
    offset:number;
    decoded:any;
    digested:any;
}
interface ResultsObject {
    decodes:DecodesObj[];
}
interface Scanner {
    stringOffset:number;
    nonPrintableCount:number;
    accumulation:string;
    digested:string;
    bits:number;
    bitCount:number;
    consecutiveNonMatchingChars:number;
    flush:(options:Options, resultsObject:ResultsObject) => boolean;
    digest:(base64Char:string, options:Options, resultsObject:ResultsObject) => any;
}
type ScannerHolder = Array<Scanner|null>;

@Injectable()
export class Decode64Service {

    protected base64CharRe    = /[A-Za-z0-9+/]/;
    protected printableCharRe = /[A-Za-z0-9!"#$%&'()*+,./:;<=>?@[\] ^_`{|}~-]/;

    protected capsRe  = /[A-Z]/;
    protected lowerRe = /[a-z]/;
    protected digitRe = /[0-9]/;


    base64CharToBits(base64Char:string):number {
        if (base64Char.match(this.capsRe)) {
            return (base64Char.charCodeAt(0)) - ('A'.charCodeAt(0));
        }
        if (base64Char.match(this.lowerRe)) {
            return (base64Char.charCodeAt(0)) + 26 - ('a'.charCodeAt(0));
        }
        if (base64Char.match(this.digitRe)) {
            return (base64Char.charCodeAt(0)) + 52 - ('0'.charCodeAt(0));
        }
        if (base64Char === '+') {
            return 62;
        }
        if (base64Char === '/') {
            return 63;
        }
        if (base64Char === '=') {
            return 0;
        }
        throw new Error(`base64CharToBits: unexpected char: ${base64Char}`);
    }

    makeScanner(stringOffset:number):Scanner {
        const result = {

            stringOffset,

            nonPrintableCount: 0,

            accumulation: '',
            digested: '',
            bits: 0,
            bitCount: 0,
            consecutiveNonMatchingChars: 0,

            flush: (options:Options, resultsObject:ResultsObject):boolean => {
                if (result.accumulation.length > options.minRunLength) {
                    resultsObject.decodes.push({
                        offset: result.stringOffset,
                        decoded: result.accumulation,
                        digested: result.digested,
                    });
                }
                return true;
            },

            digest: (base64Char:string, options:Options, resultsObject:ResultsObject):boolean => {

                const value = this.base64CharToBits(base64Char);
                result.bits = (result.bits << 6) | value;
                result.bitCount += 6;
                if (result.bitCount >= 8) {

                    const eightBits   = result.bits >> (result.bitCount - 8);
                    const decodedChar = String.fromCharCode(eightBits);

                    const isPrintable = decodedChar.match(this.printableCharRe) || (decodedChar === '\n') || (decodedChar === '\r');
                    if (!isPrintable) {
                        if (result.accumulation) {
                            ++result.consecutiveNonMatchingChars;
                            if (result.consecutiveNonMatchingChars > options.maxConsecutiveNonMatchingChars) {
                                result.flush(options, resultsObject);
                                return true;
                            }
                        }
                    } else {
                        result.accumulation                += decodedChar;
                        result.consecutiveNonMatchingChars = 0;
                    }

                    result.digested += base64Char;

                    result.bitCount -= 8;
                    const mask    = 0x00ff >> (8 - result.bitCount);
                    result.bits &= mask;
                } else {
                    result.digested += base64Char;
                }
                return false;

            },
        };

        return result;
    }


    exec(scanners:ScannerHolder, f:(s:Scanner) => boolean):void {
        for (let i = 0; i < 4; ++i) {
            const scanner = scanners[i];
            if (scanner) {
                const shouldDelete = f(scanner);
                if (shouldDelete) {
                    scanners[i] = null;
                }
            }
        }
    }


    scan64(s:string, options:Options = { maxConsecutiveNonMatchingChars: 0, minRunLength: 5 }):ResultsObject {
        const result:ResultsObject = { decodes: [] };

        options                                = options || { maxConsecutiveNonMatchingChars: 0, minRunLength: 5 };
        options.maxConsecutiveNonMatchingChars = options.maxConsecutiveNonMatchingChars || 0;
        options.minRunLength                   = options.minRunLength || 5;

        const scanners:ScannerHolder   = [null, null, null, null];
        let cyclicOffset = 0;
        for (let i = 0, strLen = s.length; i < strLen; ++i, cyclicOffset = (cyclicOffset + 1) % 4) {
            const c = s.charAt(i);
            if ((c !== '=') && !c.match(this.base64CharRe)) {
                this.exec(scanners, (scanner:Scanner) => scanner.flush(options, result));
            } else {
                scanners[cyclicOffset] = scanners[cyclicOffset] || this.makeScanner(i);
                this.exec(scanners, (scanner:Scanner):boolean => scanner.digest(c, options, result));
            }
        }

        return result;
    }


    streamDecode(input:string):string {

        const output = this.scan64(input);

        // figure out spans, in order and with overlaps arbitrated
        let spans:Array<{start:number; end:number; inserts:Array<{start:number; text:string}>}> = [];
        output.decodes.forEach((d) => {

            const c = {
                start: d.offset,
                end: d.offset + d.digested.length,
                inserts: [{ start: d.offset, text: d.decoded }],
            };
            if (spans.length === 0) {
                spans.push(c);
            } else if (c.end < spans[0].start) {
                spans.unshift(c);
            } else if (c.start > spans[spans.length - 1].end) {
                spans.push(c);
            } else {
                const culled:Array<{start:number; end:number; inserts:Array<{start:number; text:string}>}>   = [];
                let inserted = false;
                spans.forEach((s) => {
                    if ((c.start < s.end) && (c.end >= s.start)) {
                        c.start   = Math.min(s.start, c.start);
                        c.end     = Math.max(s.end, c.end);
                        c.inserts = c.inserts.concat(s.inserts);

                        if (!inserted) {
                            culled.push(c);
                            inserted = true;
                        }
                    } else {
                        culled.push(s);
                    }
                });
                spans = culled;
            }

        });


        if (spans.length === 0) {
            return input;
        }

        const parts:string[] = [];
        parts.push(input.slice(0, spans[0].start));
        let spanIdx = 0;
        spans.forEach((s) => {
            s.inserts.sort((a, b) => a.start - b.start);

            s.inserts.forEach((i) => {
                parts.push(i.text);
            });

            if (spanIdx < spans.length - 1) {
                parts.push(input.slice(s.end, spans[spanIdx + 1].start));
            }

            ++spanIdx;
        });
        parts.push(input.slice(spans[spans.length - 1].end));

        return parts.join('');
    }

}
