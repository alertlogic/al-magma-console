/**
 * @author Andres Echeverri <andres.echeverri@alertlogic.com>
 * @copyright 2020 Alert Logic, Inc.
 */

import { ElementRef } from '@angular/core';

export class SuggestionInputHelper {
    private input: ElementRef;
    private tracingPaper: ElementRef;
    private boxLetter: HTMLElement;
    private type: string = 'input';

    constructor(
        input: ElementRef,
        tracingPaper: ElementRef,
        type: string = 'input'
    ) {
        this.input = input;
        this.type = type;
        this.tracingPaper = tracingPaper;
        this.boxLetter = document.createElement('span');
        this.trace();
    }

    trace() {
        this.tracingPaper.nativeElement.innerHTML = "";
        this.updateHeight();
        const letters = this.input.nativeElement.value.split("");
        for (let i = 0; i < letters.length; i++) {
            let char = letters[i];
            const code = char.charCodeAt(0);
            if (code === 32) { // spacebar
                this.boxLetter.innerHTML = "&nbsp;";
            } else if (code === 10 && this.type === 'textarea') {
                this.tracingPaper.nativeElement.appendChild(document.createElement("br"));
                continue;
            } else {
                this.boxLetter.textContent = char;
            }
            this.tracingPaper.nativeElement.appendChild(this.boxLetter.cloneNode(true));
        }
        if (this.tracingPaper.nativeElement.children.length > 0) {
            this.scrollToLetter(this.getLastCharacter());
        }
    }

    getLastCharacter(): HTMLElement {
        return this.tracingPaper.nativeElement.lastChild;
    }

    getTracingPaper(): HTMLElement {
        return this.tracingPaper.nativeElement;
    }

    setCursorPosition(position: number): void {
        if (this.input.nativeElement.setSelectionRange) {
            setTimeout(() => {
                this.input.nativeElement.focus();
                this.input.nativeElement.setSelectionRange(position, position);
            }, 0);
        }
    }

    getCursorPosition(): number {
        return this.input.nativeElement.selectionStart;
    }

    getCharacterBeforeCursor(): string {
        const position = this.getCursorPosition();
        return this.input.nativeElement.value.charAt(position);
    }

    getCharacterAfterCursor(): string {
        const position = this.getCursorPosition();
        return this.input.nativeElement.value.charAt(position - 1);
    }

    scrollToLastLetter() {
        this.scrollToLetter(this.getLastCharacter());
    }

    scrollToPosition(position: number) {
        if (this.tracingPaper.nativeElement.children.length > 0 && position >= 0) {
            this.scrollToLetter(this.tracingPaper.nativeElement.children[position]);
        }
    }

    scrollToLetter(elm: HTMLElement) {
        try {
            if (!elm.parentElement) {
                throw new Error('elm.parentElement is undefined');
            }
            if (this.type === 'textarea') {
                elm.parentElement.scrollTop = elm.offsetTop;
            }
            elm.parentElement.scrollLeft = elm.offsetLeft;
        } catch (error) {
          console.error('The element (letter) is not defined within the tracing paper, first try calling the trace() function');
        }
    }

    updateHeight() {
        this.tracingPaper.nativeElement.style.minHeight = `${this.input.nativeElement.offsetHeight}px`;
        this.tracingPaper.nativeElement.style.maxHeight = `${this.input.nativeElement.offsetHeight}px`;
    }
}
