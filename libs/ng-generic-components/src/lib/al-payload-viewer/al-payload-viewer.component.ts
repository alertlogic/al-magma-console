import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation,
    EventEmitter
} from '@angular/core';
import { DecodesPipe } from '../pipes';
import {
    Match,
    QuickSearch,
    StringSearchObj,
} from '../services';

import range from 'lodash/range';
import sumBy from 'lodash/sumBy';
import { AlHighlightTextComponent } from '../directives/highlight';
import {SelectItem} from 'primeng/api';

export interface SearchIndex {
    messageIndex:number; // http message index
    matchIndex:number; // match index
    current:number; // Current highlighted match
    total:number; // Total of matches
}

@Component({
    selector: 'al-payload-viewer',
    templateUrl: './al-payload-viewer.component.html',
    styleUrls: ['./al-payload-viewer.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AlPayloadViewerComponent implements AfterViewInit {

    public showAscii:boolean = true;

    public showHex:boolean = true;

    public options:string[] = [];

    public multiple:boolean = true;

    public hightlightOptions:StringSearchObj[] = [];

    public quickSearchItems:QuickSearch[] = [];

    public hexLineNumbers:string = "";

    public searchIndex:SearchIndex = {
        messageIndex: 0, matchIndex: 0, current: 1, total: 0,
    };

    public searchMarks:Match[][] = [];

    public decodeOptions: SelectItem[] = [];
    public selectedDecodeOption: string[] = ['hex', 'ascii'];
    // possible decoders [ 'URL', '||', 'SQL', 'Base64', '/** /', 'unicode', '+', '0x'  ]
    public decoderOptions: SelectItem[] = [];
    public selectedDecoderOption: string[] = [];
    public rawAscii: string = '';
    public transformedAscii?: string;

    @Input() payload?: string;
    // This is really something I do not know how is used as
    // I did not find any reference in incidents app so
    // I add it for compatibility and to solve build issues
    // @Input() pcre?: { str:string; regex:RegExp }[];

    @Output() onHexGenerated: EventEmitter<string> = new EventEmitter<string>();

    @ViewChild('hex') hex?: AlHighlightTextComponent;

    @ViewChild('ascii') ascii?: AlHighlightTextComponent;

    constructor(private cdr:ChangeDetectorRef,
                private decodePipe:DecodesPipe) {

        this.decodeOptions.push({ label:'HEX', value:'hex' });
        this.decodeOptions.push({ label:'ASCII', value:'ascii' });
    }

    ngAfterViewInit(): void {
        // Let's wait for the lifecycle to finish before we setup the gzip information
        setTimeout(() => {
            this.setupGzipData();
        });
    }

    toggleDecodeOption(): void {
        this.showAscii = this.selectedDecodeOption.includes('ascii');
        this.showHex = this.selectedDecodeOption.includes('hex');
    }

    /**
     * Toggle the available decoders
     */
    public toggleDecoder() {
        this.transformedAscii = this.decodePipe.transform(this.rawAscii, this.selectedDecoderOption.join(','));
    }

    /**
     * This function might not be needed when the app upgrade to angular 6
     * @param text string
     * @param max number
     * @param mask string
     */
    public padStart(text: string, max: number, mask: string) {
        const cur = text.length;
        if (max <= cur) {
            return text;
        }
        const masked = max - cur;
        let filler = String(mask) || ' ';
        while (filler.length < masked) {
            filler += filler;
        }
        const fillerSlice = filler.slice(0, masked);
        return fillerSlice + text;
    }


    public generateHexLineNumbers(lines: number):void {
        const lineNumbers:string = range(0, lines * 16, 16)
            .map((i:number) => `0x${this.padStart(i.toString(16), 4, '0')}:`)
            .join('\n');

        this.hexLineNumbers = lineNumbers;
        this.processHex();
    }

    public registerMarks(marks: Match[], index: number):void {
        while (this.searchMarks.length <= index) {
            this.searchMarks.push([]);
        }
        this.searchMarks[index] = marks;
        this.searchIndex = {
            messageIndex: 0, matchIndex: 0, current: 1, total: 0,
        };
        this.searchIndex.total = sumBy(this.searchMarks, (matches:Match[]) => matches.length);
        this.searchIndex.messageIndex = this.searchMarks.findIndex((matches:Match[]) => matches.length > 0);
        this.findMatch();
        // angular complained about "Expression has changed after it was checked." without this next line
        // but only when searchMarks had one thing in it
        // I think its because the change detection doesnt trigger on array pushes
        // doesnt make any sense
        // jason was here

        this.cdr.detectChanges();
    }

    // Return an array of applicable decoders
    public getApplicableDecoders(ascii: string) {
        const availableDecoders:string[] = DecodesPipe.getAvailableTransforms();
        const value = ascii;

        const applicableDecoders:string[] = availableDecoders.filter((decoder) => {
            const first:string = value;
            const next:string  = this.decodePipe.transform(first, decoder);
            return first !== next;
        });

        return applicableDecoders;
    }

    private findMatch(scroll: boolean = false):void {
        this.searchMarks.forEach((matches: Match[], i: number) => {
            matches.forEach((m: Match, j: number) => {
                m.selected = (i === this.searchIndex.messageIndex && j === this.searchIndex.matchIndex);
                if (scroll && m.selected && m.scrollTo) {
                    m.scrollTo();
                }
            });
        });
    }

    private setupGzipData(): void {
        if (this.payload) {
            const ascii: string = window.atob(this.payload);
            this.decoderOptions = this.getApplicableDecoders(ascii).map(decoder => {
                return {
                    label: decoder,
                    value: decoder
                };
            });
            this.rawAscii = ascii;
            this.transformedAscii = ascii;
        }
    }

    private processHex(): void {
        if (this.hex?.renderThis[0].matched) {
            const originalHex: string = this.hex?.renderThis[0].matched;
            let count: number = 0;
            let processedHexArray: string[] = originalHex.split(' ').map((byteGroup: string) => {
                if (count === 7) {
                    byteGroup += '\n';
                    count = 0;
                } else {
                    count++;
                }
                return byteGroup;
            });

            count = 0;
            let processedHex: string = '';
            processedHexArray.forEach((byteGroup: string) => {
                if (count === 7) {
                    processedHex += byteGroup;
                    count = 0;
                } else {
                    processedHex += `${byteGroup} `;
                    count++;
                }
            });
            this.onHexGenerated.emit(processedHex);
        }
    }
}
