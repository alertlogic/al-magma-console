import { Injectable } from '@angular/core';
import clone from 'lodash/clone';
import escape from 'lodash/escape';
import escapeRegExp from 'lodash/escapeRegExp';
import isEqual from 'lodash/isEqual';
import last from 'lodash/last';
import trimEnd from 'lodash/trimEnd';
import union from 'lodash/union';
import { ChromaHash } from './color-hash.service';


export type MatchType = 'pcre'|'search'|'selection';

export interface MatchingIds {
    invert?:boolean;
    notMatch?:{ [ s:string ]:boolean };
    idTable:{ [ s:string ]:boolean };
    idTable2:{ [ s:string ]:number };
    numIds:number;
    deduplicatedCount:number;
    A:number;
    B:number;
    C:number;
}

export interface StringSearchObj {
    textColor?:string;
    color?:string;
    matchingIds?:MatchingIds;
    decorations?:string;
    description?:string;
    enabled:boolean;
    term:string;
    searchMode:'String'|'Regex'|'Glob'|'Hex';
    invert?:boolean;
}

export interface QuickSearch {
    text:string;
    active:boolean;
    counter:number;
    regex:RegExp;
}

export interface Match {
    scrollTo?:() => void;
    selected?:boolean;
    textColor?:string;
    color?:string;
    matchIndex?:number;
    start:number; // start position of the match
    length:number;
    end:number; // end position of the match
    keys:string[]; // Key terms typed by the user
    matched:string; // String matched
    type:MatchType;
}

@Injectable()
export class HighlightTextService {

    constructor(protected colors:ChromaHash) {
    }

    /**
     * Sorts matches in ascending order
     * @param {Match} a
     * @param {Match} b
     * @returns {number}
     */
    public sortMatches(a:Match, b:Match):number {
        if (a.start < b.start) {
            return -1;
        }
        if (a.start > b.start) {
            return 1;
        }
        if (a.length < b.length) {
            return -1;
        }
        return 1;
    }

    /**
     * Function used to find all matches in a text by using a regex
     * @param keyWord
     * @param regexp
     * @param text
     * @returns {Match[]}
     */
    public getMatches(keyWord:string, regexp:RegExp, text:string, type:MatchType, options?:StringSearchObj):Match[] {
        let match;
        const matches:Match[] = [];
        // eslint-disable-next-line no-cond-assign
        // tslint:disable-next-line:no-conditional-assignment
        while ((match = regexp.exec(text)) != null) {
            const matchObj:Match = {
                type,
                start: match.index,
                length: match[0].length,
                end: (match.index + match[0].length),
                keys: [keyWord],
                matched: match[0]
            };
            if (options) {
                if (options.color) {
                    matchObj.color = options.color;
                }
                if (options.textColor) {
                    matchObj.textColor = options.textColor;
                }
            }
            matches.push(matchObj);
        }
        return matches;
    }

    public getEscaped(mode:string, term:string):string {
        let escaped:string;
        if (mode === 'String') {
            // reshape html things to match input, escape for regex
            escaped = escapeRegExp(escape(term));
        } else if (mode === 'Regex') {
            escaped = term;
        } else if (mode === 'Glob') {
            // simulate glob via regex
            let substituted = term.replace(/\*/g, 'metastar');
            substituted     = substituted.replace(/\?/g, 'metaquestion');

            escaped = escapeRegExp(escape(substituted));

            escaped = escaped.replace(/metastar/g, '.*');
            escaped = escaped.replace(/metaquestion/g, '.');

        } else if (mode === 'Hex') {
            escaped = escapeRegExp(escape(term));
        } else {
            throw new Error(`Unexpected searchMode: ${mode}`);
        }
        return escaped;
    }

    public makeRegex(mode:string, term:string):string {
        let escaped:string;
        if (mode === 'String') {
            // reshape html things to match input, escape for regex
            escaped = escapeRegExp(term);
        } else if (mode === 'Regex') {
            escaped = term;
        } else if (mode === 'Glob') {
            // simulate glob via regex
            let substituted = term.replace(/\*/g, 'metastar');
            substituted     = substituted.replace(/\?/g, 'metaquestion');

            escaped = escapeRegExp(substituted);

            escaped = escaped.replace(/metastar/g, '.*');
            escaped = escaped.replace(/metaquestion/g, '.');

        } else if (mode === 'Hex') {
            escaped = escapeRegExp(term);
        } else {
            throw new Error(`Unexpected searchMode: ${mode}`);
        }
        return escaped;
    }

    /**
     * Function used to remove overlapping/redundant problems in the matches
     * @param matches
     * @returns {Match[]}
     */
    public removeOverlaping(matches:Match[]):Match[] {

        const finalMatches:Match[] = [];
        let temp:Match = null;
        for (const match of matches) {
            if (temp === null) {
                temp = clone(match);
            } else if (temp.end > match.start) {
                if (match.end > temp.end) {
                    temp.end    = match.end;
                    temp.length = temp.end - temp.start;
                    for (const key of match.keys) {
                        if (temp.keys.indexOf(key) === -1) {
                            temp.keys.push(key);
                        }
                    }
                } else {
                    for (const key of match.keys) {
                        if (temp.keys.indexOf(key) === -1) {
                            temp.keys.push(key);
                        }
                    }
                }
            } else {
                finalMatches.push(clone(temp));
                temp = clone(match);
            }
        }
        if (temp !== null) {
            finalMatches.push(clone(temp));
        }

        return finalMatches;
    }

    public removeOverlaping2(inputString:string, matches:Match[]):Match[] {
        const newMatches:Match[][] = [];

        for (let i:number = 0; i < inputString.length; i++) {

            const charMatch:Match[] = matches.filter((m:Match) => i >= m.start && i < m.end);
            newMatches[i] = charMatch;

        }

        let builder:Match;

        const moreMatches:Match[] = [];
        for (let i:number = 0; i < newMatches.length; i++) {
            if (builder === undefined) {
                const keys:string[][]   = newMatches[i].map((m:Match) => m.keys);
                const type:MatchType = newMatches[i].map((m:Match) => m.type)[0];
                const uniqKeys:string[] = union(...keys);
                builder = {
                    type,
                    start: i,
                    length: 1,
                    end: i + 1,
                    keys: uniqKeys,
                    matched: inputString[i]
                };
                // keep building

                continue;

            }

            const lastKeys:string[]    = builder.keys;
            const currentKeys:string[] = union(...(newMatches[i].map((k:Match) => k.keys)));

            if (isEqual(lastKeys, currentKeys)) {
                builder.end++;
                builder.length++;
                builder.matched += inputString[i];
            } else {
                moreMatches.push(builder);
                const type:MatchType = newMatches[i].map((m:Match) => m.type)[0];
                builder = {
                    type,
                    start: i,
                    length: 1,
                    end: i + 1,
                    keys: currentKeys,
                    matched: inputString[i]
                };
            }

        }

        moreMatches.push(builder);

        let j:number = 0;
        moreMatches.forEach((m:Match) => {
            if (m.keys.length > 0) {
                m.matchIndex = j++;
            }

            // m.color     = this.colors.chromahash(m.keys.join(','));
            // m.color     = this.colors.checkBrightness(m.color);
            // m.textColor = this.colors.pickTextColorBasedOnBgColorAdvanced(m.color);

            // Override colors to be consistent with incident app
            m.color = "#56A0D1";
            m.textColor = "#FFFFFF";
        });

        return moreMatches;

    }


    /**
     * Converts a hex expression to string
     * @param {string} hexStr
     * @returns {string}
     */
    public hexToString(hexStr:string):string {
        const hex = hexStr.toString();
        let str   = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
    }

    /**
     * Converts a string in its hex expression
     * @param {string} str
     * @returns {string}
     */
    public stringToHex(str:string):string {
        let result = '';
        for (let i = 0; i < str.length; i++) {
            const hex = str.charCodeAt(i).toString(16);
            if (hex) {
                result += (hex.length === 2 ? hex : `0${hex}`);
            }
        }
        return result;
    }

    /**
     * Highlights each matched value in the input string
     * @param {number} contentIndex
     * @param {string} inputString
     * @param {Match[]} matches
     * @returns {string}
     */
    public highlihtMatches(contentIndex:number, inputString:string, matches:Match[]):string {
        let content   = '';
        let lastMatch = 0;
        matches.forEach((match, index) => {
            const subContent  = inputString.substr(lastMatch, match.start - lastMatch);
            const matched     = inputString.substr(match.start, match.length);
            const keys        = match.keys.join(' - ');
            const highlighted = `<mark style="background-color: orange;" id="r-${contentIndex}-${index}" title="${keys}">${matched}</mark>`;
            content += subContent + highlighted;
            lastMatch         = match.end;
            if (index === matches.length - 1) {
                content += inputString.substr(lastMatch, inputString.length);
            }
        });

        return content;
    }

    public hexConvert(renderThis:Match[], grouping:number = 4):Match[] {
        let extra:number  = 0;
        renderThis.forEach((match:Match) => {
            let hexed:string = this.stringToHex(match.matched);

            const front:string = hexed.slice(0, extra) + (extra > 0 ? ' ' : '');
            hexed              = hexed.substr(extra);

            hexed = hexed.replace(/\s/g, '').replace(/\w\w\w\w/g, "$& ");
            const spaced:string = front + hexed;

            extra = hexed.length % (grouping + 1);

            match.matched = spaced;
        });

        const lastElement: Match | undefined = last(renderThis);
        if (lastElement) {
            lastElement.matched = trimEnd(lastElement.matched);
        }


        return renderThis;

    }

    public buldFullRenderMatch(inputString:string,
                               options:StringSearchObj[],
                               quickSearchItems?:QuickSearch[],
                               pcreActive:boolean = false,
                               pcre?:Array<{ str:string; regex:RegExp }>,
                               syncHex?:{start:number; end:number}):Match[] {

        if (typeof inputString !== 'string') {
            return [];
        }
        if (options === undefined) {
            throw new Error("Highlight options does not exist");
        }

        const matches:Match[]      = [];

        options.filter((o) => o.enabled && !o.invert).forEach((option) => {
            const searchMode                = option.searchMode || 'String';
            const validSearchModes:string[] = ['String', 'Regex', 'Glob', 'Hex'];
            if (!validSearchModes.includes(searchMode)) {
                throw new Error(`Unexpected searchMode: ${searchMode}`);
            }
            const term:string        = searchMode === 'Hex' ? this.hexToString(option.term) : option.term;
            const escaped:string     = this.makeRegex(searchMode, term);
            const searchRegex:RegExp = searchMode === 'Hex' ? new RegExp(escaped, 'gm') : new RegExp(escaped, 'gmi');
            matches.push(...this.getMatches(
                option.term,
                searchRegex,
                inputString,
                'search',
                option,
            ));
        });

        if (quickSearchItems) {
            quickSearchItems.filter((item:QuickSearch) => item.active).forEach((item:QuickSearch) => {
                matches.push(...this.getMatches(
                    item.text,
                    item.regex,
                    inputString,
                    'search',
                ));
            });
        }

        if (pcreActive) {
            pcre.forEach((item:{ str:string; regex:RegExp }) => {
                matches.push(...this.getMatches(this.getEscaped(
                    'String',
                    item.str,
                ), item.regex, inputString, 'pcre'));
            });
        }

        if (syncHex) {
            matches.push({
                start: syncHex.start,
                length: syncHex.end - syncHex.start,
                end: syncHex.end,
                keys: ['Selection'],
                matched: '',
                type: 'selection',
            });
        }

        if (matches.length > 0) {
            return this.removeOverlaping2(inputString, matches.sort(this.sortMatches));

        }
        return [
            {
                start: 0,
                length: inputString.length,
                end: inputString.length,
                keys: [],
                matched: inputString,
                type: 'search',
            },
        ];


    }
}
