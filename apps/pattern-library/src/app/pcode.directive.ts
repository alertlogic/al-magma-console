import {Directive, ElementRef, OnInit} from '@angular/core';

declare var Prism: any;

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[pCode]'
})
export class CodeHighlighterDirective implements OnInit {

    constructor(private el: ElementRef) {}

    ngOnInit() {
        Prism.highlightElement(this.el.nativeElement);
    }
}
