/* eslint-disable no-cond-assign */
/* tslint:disable:no-conditional-assignment */
import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    Output,
    QueryList,
    SimpleChanges,
    ViewChildren,
    ViewEncapsulation,
} from '@angular/core';
import {
    QuickSearch,
    HighlightTextService,
    Match,
    StringSearchObj,
    HtmlViewService
} from '../../services';

/* tslint:disable:component-selector */
@Component({
    selector: '[irHighlightTextComp]',
    templateUrl: './highlight-text.template.html',
    preserveWhitespaces: false,
    styleUrls: ['./highlight-text.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class AlHighlightTextComponent implements OnChanges {

    @Input() public irHighlightTextOptions:StringSearchObj[];
    @Input() public irHighlightTextComp:string;
    @Input() public irRemoveNonPrintable:boolean = false;
    @Input() public irPcre:Array<{ str:string; regex:RegExp }>;
    @Input() public irPcreActive:boolean;
    @Input() public irHexMode:boolean = false;
    @Input() irDisplayHex?:string;
    @Input() irQuickSearchItems:QuickSearch[];

    @Output() irRegisterMarks:EventEmitter<Match[]>                              = new EventEmitter<Match[]>();
    @Output() irSelectionPosition:EventEmitter<{ start:number; end:number }> = new EventEmitter<{ start:number; end:number }>();
    @Output() irLineNumbers:EventEmitter<number>                                    = new EventEmitter<number>();

    public renderThis:Match[];
    public selection:{ start:number; end:number } = null;

    public openModal:boolean = false;

    @ViewChildren('marks') public marksVC:QueryList<ElementRef>;


    constructor(private highlightService:HighlightTextService, public htmlService:HtmlViewService) {
    }

    public ngOnChanges(changes:SimpleChanges):void {
        this.highlightSearchTerm();
    }

    @HostListener('mouseup', ['$event'])
    handleSelection():void {
        if (this.irDisplayHex !== 'sync') {
            return;
        }
        const selection = window.getSelection ? window.getSelection() : document.getSelection();
        if (!selection || selection.isCollapsed) {
            return;
        }
        const selectionRange = selection.getRangeAt(0);
        if (selectionRange.commonAncestorContainer.nodeName !== 'CODE' && selectionRange.commonAncestorContainer.nodeType !== 3) {
            return;
        }
        let start:number;
        let end:number;
        if (this.irHexMode) {
            start = Math.floor((selectionRange.startOffset - Math.floor(selectionRange.startOffset / 5)) / 2);
            end   = Math.ceil((selectionRange.endOffset - Math.floor(selectionRange.endOffset / 5)) / 2);
        } else {
            const singleByteUnprintable      = /[\x00-\x08\x0B\x0C\x0E-\x1F\x80-\xFF]/gmi;
            const irHighlightTextComp                = this.irHighlightTextComp.replace(singleByteUnprintable, '.');
            const selectionText              = this.escapeRegExp(selection.toString()
                .replace(/\n/g, '\r\n'));
            const matches:RegExpMatchArray[] = [];
            const regex:RegExp               = new RegExp(selectionText, 'g');

            let match:RegExpExecArray;
            do {
                match = regex.exec(irHighlightTextComp);
                if (match) {

                    matches.push(match);
                }
            } while (match);

            if (matches.length === 1) {
                start = matches[0].index;
                end   = start + matches[0][0].length;
            } else {
                const startText:string  = selectionRange.startContainer.textContent.replace(singleByteUnprintable, '.');
                const endText:string    = selectionRange.endContainer.textContent.replace(singleByteUnprintable, '.');
                const startIndex:number = irHighlightTextComp.indexOf(startText);
                const endIndex:number   = irHighlightTextComp.indexOf(endText);
                if (startIndex >= 0 && endIndex >= 0) {
                    start = startIndex + selectionRange.startOffset;
                    end   = endIndex + selectionRange.endOffset;
                } else {
                    console.error('error finding selection indexes');
                    return;
                }
            }
        }
        this.irSelectionPosition.emit({ start, end });
    }

    public highlightSelection(selection:{ start:number; end:number }):void {
        this.selection = selection;
        this.highlightSearchTerm();
    }

    @HostListener('document:mousedown', ['$event'])
    cleanSelection(event:MouseEvent):void {

        const selection = window.getSelection ? window.getSelection() : document.getSelection();

        // prevent killing the ace editor
        if (!selection) {
            return;
        }
        if (selection.focusNode
            && (selection.focusNode as HTMLElement).className
            && (selection.focusNode as HTMLElement).className.includes('ace')) {
            return;
        }

        if (event.buttons !== 1) {
            // dont let rightclick thru
            return;
        }


        if (selection.removeAllRanges) {
            selection.removeAllRanges();
        } else if (selection.empty) {
            selection.empty();
        }
        if (this.selection) {
            this.selection = null;
            this.highlightSearchTerm();
        }
    }

    private escapeRegExp(string:string):string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    /**
     * Renders the element content with highlighting
     */
    private highlightSearchTerm():void {
        // initial ngChange call will result with null \ undefined.

        if (!this.irHighlightTextComp) {
            return;
        }
        if (this.irHighlightTextOptions === undefined) {
            throw new Error("Highlight irHighlightTextOptions does not exist");
        }

        this.renderThis = this.highlightService.buldFullRenderMatch(
            this.irHighlightTextComp,
            this.irHighlightTextOptions,
            this.irQuickSearchItems,
            this.irPcreActive,
            this.irPcre,
            this.selection,
        );

        if (this.irHexMode) {
            this.renderThis = this.highlightService.hexConvert(this.renderThis);
        }

        const marks:Match[] = this.renderThis.filter((i:Match) => i.matchIndex >= 0);
        marks.forEach((m:Match, i:number) => {
            m.scrollTo = ():void => {
                const el:ElementRef = this.marksVC.toArray()[i];
                if (el && el.nativeElement) {
                    el.nativeElement.scrollIntoView();
                    if (el.nativeElement.closest('.payload')) {
                        el.nativeElement.closest('.payload').scrollTop -= 80;
                    }
                }
            };
        });
        if (marks) {
            this.irRegisterMarks.emit(marks.filter((i:Match) => i.type !== 'selection'));
        }
        if (this.irHexMode) {
            let total = 0;
            this.renderThis.forEach((item:Match) => {
                total += item.matched.length;
            });
            const lines = Math.ceil(total / 40);
            this.irLineNumbers.emit(lines);
        }
        if (this.selection) {
            const selectionMark:Match = marks.filter((match:Match) => match.type === 'selection')[0];
            if (selectionMark) {
                selectionMark.scrollTo();
            }
        }
    }

}
