/**
 * @author Andres Echeverri <andres.echeverri@alertlogic.com>
 * @copyright 2020 Alert Logic, Inc.
 */

import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    Optional,
    Renderer2,
    Self,
    ViewChild,
} from "@angular/core";
import {
    ControlValueAccessor,
    NgControl,
} from '@angular/forms';
import { SuggestionInputHelper } from './suggestion-input-helper.class';

@Component({
    selector: 'al-suggestion-input',
    templateUrl: './al-suggestion-input.component.html',
    styleUrls: ['./al-suggestion-input.component.scss']
})

export class AlSuggestionInputComponent implements AfterViewInit, ControlValueAccessor {
    @Input()
    get placeholder() {
        return this.iPlaceholder;
    }
    set placeholder(plh) {
        this.iPlaceholder = plh;
    }
    @Input() type: string = 'input';
    @Input() rows: number = 1;
    @Input() autoResize: boolean = false;
    @Input() required = false;
    @Input() openWithSpecialCharacter: boolean = true;
    @Input() specialCharacter: string = '%';
    @Input() filter: boolean = true;
    @Input() suggestions: string[] = [];
    @ViewChild('hasSuggestions') suggestionList: ElementRef;
    @ViewChild('suggestionPanel', { static: true }) suggestionPanel: ElementRef;
    @ViewChild('tracingPaper', { static: true }) tracingPaper: ElementRef;
    @ViewChild('input') input: ElementRef;
    value: string;
    isDisabled: boolean;
    suggestionTemp: string[] = [];
    suggestionPanelClass: string = 'suggestions-panel-hidden';
    hasFocus: boolean = false;
    private iPlaceholder: string;
    private suggestionInputHelper: SuggestionInputHelper;
    private currentSuggestionSelect: any;
    private uniqueClass: string = '';
    constructor(
        @Self() @Optional() public control: NgControl,
        private render: Renderer2
    ) {
        this.control && (this.control.valueAccessor = this);
    }

    onChangeFn = (_: any) => {
      // empty intentional
     }
    onTouchFn = () => {
      // empty intentional
    }

    ngAfterViewInit(): void {
        this.generateUniqueClass();

        const findAndClose = (e: any) => {
            let bl = false;
            // e.target works for all browsers
            if (e && e.target && this.uniqueClass.length > 0 ) {
                const elem = e.toElement || e.target;
                const el = elem.closest(`.${this.uniqueClass}`);
                if (el) {
                    bl = true;
                }
            }
            if (!bl) {
                this.hiddenSuggestionPanel();
            }
        };

        document.addEventListener('click', findAndClose);
        this.suggestionTemp = this.suggestions;
        this.suggestionInputHelper = new SuggestionInputHelper(this.input, this.tracingPaper, this.type);
        this.hiddenSuggestionPanel();
    }

    onKeyup(e: any) {
        switch (e.keyCode) {
            case 8: // Backspace key code
            case 37: // ArrowRight and ArrowLeft key codes
            case 39: // ArrowRight and ArrowLeft key codes
                this.default();
                break;
            case 13: // Enter
                if (this.type === 'textarea') {
                    this.suggestionInputHelper.trace();
                }
                if ((this.isCursorInMiddle() && this.currentSuggestionSelect !== null) || !this.openWithSpecialCharacter) {
                    const suggestion = this.currentSuggestionSelect.firstChild.textContent;
                    this.putSuggestion(suggestion);
                }
                break;
            default:
                if (this.openWithSpecialCharacter) {
                    const value = e.target.value;
                    if (value.length > 0) {
                        const lastChar = value.substring(value.length - 1);
                        const countSpecialCharacter = this.countSpecialCharacter(value);
                        if (this.isOdd(countSpecialCharacter)) {
                            let penultimateChar = null;
                            if (value.length > 1) {
                                penultimateChar = value.substring(value.length - 2, value.length - 1);
                            }
                            if (!this.isCursorInMiddle()) {
                                if (lastChar === this.specialCharacter
                                    && (penultimateChar !== this.specialCharacter || this.isOdd(countSpecialCharacter))
                                ) {
                                    this.closeSpecialCharacter();
                                    this.suggestionInputHelper.trace();
                                    this.placeCursorInMiddle();
                                    this.openSuggestionPanel();
                                } else {
                                    this.hiddenSuggestionPanel();
                                }
                            }
                        }
                        this.executeFilter();
                    }
                } else {
                    if (this.isSuggestionPanelHidden()) {
                        this.openSuggestionPanel();
                    }
                    this.executeFilter();
                }
                break;
        }
        this.updateValue();
    }

    onKeydown(e: any) {
        if (e.keyCode === 38 || e.keyCode === 40) {
            if((this.type === 'textarea' && this.isCursorInMiddle()) || this.type === 'input'){
                e.preventDefault();
                if ((this.isCursorInMiddle() && this.suggestionList && this.suggestionList.nativeElement) || !this.openWithSpecialCharacter) {
                    const items = (<HTMLElement>this.suggestionList.nativeElement).children;
                    const countItems = items.length - 1;
                    if (e.keyCode === 40) {
                        if (this.currentSuggestionSelect) {
                            this.render.removeClass(this.currentSuggestionSelect, 'suggestion-select');
                            if (this.currentSuggestionSelect.nextSibling) {
                                this.currentSuggestionSelect = this.currentSuggestionSelect.nextSibling;
                            } else {
                                this.currentSuggestionSelect = items[0];
                            }
                        } else {
                            this.currentSuggestionSelect = items[0];
                        }
                        this.render.addClass(this.currentSuggestionSelect, 'suggestion-select');
                    } else {
                        if (this.currentSuggestionSelect) {
                            this.render.removeClass(this.currentSuggestionSelect, 'suggestion-select');
                            if (this.currentSuggestionSelect.previousSibling && this.currentSuggestionSelect.previousSibling.nodeName !== '#comment') {
                                this.currentSuggestionSelect = this.currentSuggestionSelect.previousSibling;
                            } else {
                                this.currentSuggestionSelect = items[countItems];
                            }
                        } else {
                            this.currentSuggestionSelect = items[countItems];
                        }
                        this.render.addClass(this.currentSuggestionSelect, 'suggestion-select');
                    }
                }
        } else if (e.keyCode === 9) {
            this.hiddenSuggestionPanel();
            }
        } else if (e.keyCode === 9) {
            this.hiddenSuggestionPanel();
        }
    }

    onClick(e: any) {
        this.default();
    }

    default() {
        this.suggestionInputHelper.trace();
        this.executeFilter();
        if (this.openWithSpecialCharacter) {
            if (this.isCursorInMiddle()) {
                this.openSuggestionPanel();
            } else {
                this.hiddenSuggestionPanel();
            }
        } else {
            this.openSuggestionPanel();
        }
        this.updateValue();
    }

    updateValue() {
        this.value = this.input.nativeElement.value;
        this.onTouchFn();
        this.onChangeFn(this.value);
        this.writeValue(this.value);
    }

    closeSpecialCharacter() {
        this.input.nativeElement.value += this.specialCharacter;
    }

    placeCursorInMiddle() {
        this.suggestionInputHelper.setCursorPosition(this.input.nativeElement.value.length - 1);
    }

    isCursorInMiddle(): boolean {
        const positionCursor = this.suggestionInputHelper.getCursorPosition();
        const firstPart = this.input.nativeElement.value.substr(0, positionCursor).split("") as string[];
        const secondPart = this.input.nativeElement.value.substr(positionCursor).split("") as string[];

        const count = (acc: number, cv: string) => {
            if (this.isSpecialCharacter(cv)) return acc + 1;
            return acc;
        };

        let countSpecialLeft = firstPart.reduce(count, 0);
        let countSpecialRigth = secondPart.reduce(count, 0);

        if (countSpecialLeft === 0 || countSpecialRigth === 0) {
            return false;
        }

        // %%|%%
        if (this.isPair(countSpecialLeft) && this.isPair(countSpecialRigth)) return false;

        // %%%|%%%
        if (this.isOdd(countSpecialLeft) && this.isOdd(countSpecialRigth)) return true;

        // %%%|%
        if (this.isOdd(countSpecialLeft) && this.isPair(countSpecialRigth)) return true;

        // %%|%%%
        if (this.isPair(countSpecialLeft) && this.isOdd(countSpecialRigth)) return false;

        return false;
    }

    countSpecialCharacter(str: string) {
        return (str.match(new RegExp(this.specialCharacter, "g")) || []).length;
    }

    isPair(n: number) {
        return n % 2 === 0;
    }

    isOdd(n: number) {
        return !this.isPair(n);
    }

    isSpecialCharacter(str: string) {
        return str === this.specialCharacter;
    }

    isSuggestionPanelVisible() {
        return [this.suggestionPanel.nativeElement.classList].includes('suggestions-panel-visible');
    }

    isSuggestionPanelHidden() {
        return !this.isSuggestionPanelVisible();
    }

    hadSuggestion(): boolean {
        return /^%[^%]*%$/.test(this.input.nativeElement.value.trim());
    }

    generateUniqueClass() {
        setTimeout(() => {
            this.uniqueClass = `al-suggestion-${+ new Date()}`;
            this.render.addClass(this.input.nativeElement, this.uniqueClass);
            this.render.addClass(this.suggestionPanel.nativeElement, this.uniqueClass);
        });
    }


    openSuggestionPanel() {
        setTimeout(() => {
            if (this.openWithSpecialCharacter) {
                const position = this.suggestionInputHelper.getCursorPosition();
                const letter = this.suggestionInputHelper.getTracingPaper().children[position] as HTMLElement;
                this.render.setStyle(this.suggestionPanel.nativeElement, 'left', `${letter.offsetLeft}px`);
                if (this.type === 'textarea') {
                    let topPosition = letter.offsetTop + letter.offsetHeight;
                    if (this.input.nativeElement.scrollTop > 0) {
                        topPosition -= this.input.nativeElement.scrollTop;
                    }
                    this.render.setStyle(this.suggestionPanel.nativeElement, 'top', `${topPosition}px`);
                }
            } else {
                if (this.hadSuggestion() && !this.isCursorInMiddle()) {
                    this.hiddenSuggestionPanel();
                    return;
                }
            }
            this.suggestionPanelClass = 'suggestions-panel-visible';
        }, 0);
    }

    hiddenSuggestionPanel() {
        setTimeout(() => {
            this.suggestionPanelClass = 'suggestions-panel-hidden';
            if (this.currentSuggestionSelect) {
                this.render.removeClass(this.currentSuggestionSelect, 'suggestion-select');
            }
            this.currentSuggestionSelect = null;
        }, 100);
    }

    putSuggestion(str: string) {
        if (this.openWithSpecialCharacter) {
            const position = this.removeTextInMiddle();
            this.input.nativeElement.value = (this.input.nativeElement.value.slice(0, position || 0) + str + this.input.nativeElement.value.slice(position || 0)).trim();
            this.input.nativeElement.value += " ";
        } else {
            this.input.nativeElement.value = `${this.specialCharacter}${str}${this.specialCharacter}`;
        }
        this.suggestionInputHelper.setCursorPosition(this.input.nativeElement.value.length);
        this.updateValue();
        this.hiddenSuggestionPanel();
    }

    getTextInMiddle() {
        if (this.isCursorInMiddle()) {
            const position = this.suggestionInputHelper.getCursorPosition();
            let text = [];
            for (let i = position - 1; i >= 0; i--) {
                const char = this.input.nativeElement.value.charAt(i);
                if (char === this.specialCharacter) {
                    break;
                } else {
                    text[i] = char;
                }
            }
            return text.join("");
        }
        return "";
    }

    removeTextInMiddle(): number|null {
        let positionStart: number|null = null;
        if (this.isCursorInMiddle()) {
            const position = this.suggestionInputHelper.getCursorPosition();
            for (let i = position - 1; i >= 0; i--) {
                const char = this.input.nativeElement.value.charAt(i);
                if (char === this.specialCharacter) {
                    positionStart = i + 1;
                    break;
                }
            }
            let positionEnd = null;
            for (let i = position; i < this.input.nativeElement.value.length; i++) {
                const char = this.input.nativeElement.value.charAt(i);
                if (char === this.specialCharacter) {
                    positionEnd = i;
                    break;
                }
            }
            if (positionStart !== null && positionEnd !== null) {
                const part1 = this.input.nativeElement.value.slice(0, positionStart);
                const part2 = this.input.nativeElement.value.slice(positionEnd);
                this.input.nativeElement.value = part1 + part2;
            }
        }
        return positionStart;
    }

    filterSuggestions(value: string) {
        if (value !== '') {
            value = value.toLowerCase();
            this.suggestionTemp = this.suggestions.filter(s => s.toLowerCase().includes(value));
        } else {
            this.suggestionTemp = this.suggestions;
        }
    }

    executeFilter() {
        if (this.filter) {
            /**
             * %test sugg|estion%
             * Case 1 (!this.openWithSpecialCharacter && this.hadSuggestion() && this.isCursorInMiddle()):
             * When not is necessary special character, but the suggestion is already in input and the cursor in middle and we want filter by text in middle
             * Case 2 this.openWithSpecialCharacter:
             * In this case always we want filter by text in middle
             */
            if ((!this.openWithSpecialCharacter && this.hadSuggestion() && this.isCursorInMiddle()) || this.openWithSpecialCharacter) {
                this.filterSuggestions(this.getTextInMiddle());
                /**
                 * When is without Special character and the suggestion has not been put in the input
                 * We will filter by all text in the input
                 */
            } else if (!this.openWithSpecialCharacter) {
                this.filterSuggestions(this.input.nativeElement.value);
            }
        }
    }

    writeValue(value: any): void {
        if (value) {
            this.value = value || '';
        } else {
            this.value = '';
        }
        if(this.input){
            this.render.setAttribute(this.input.nativeElement, 'value', this.value);
        }
    }

    registerOnChange(fn: any): void {
        this.onChangeFn = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouchFn = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    get invalid(): boolean {
        return this.control ? !!this.control.invalid : false;
    }

    onChange() {
        this.onChangeFn(this.value);
    }
}
