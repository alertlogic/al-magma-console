import {
    Directive,
    ElementRef,
    Input,
    OnInit,
    OnChanges,
    SimpleChanges
} from "@angular/core";

@Directive({
    selector: "[alForceFocus]"
})
export class AlForceFocusDirective implements OnInit, OnChanges
{
    @Input("alForceFocus") forceFocus = true;
    @Input() targetTag?:string;
    @Input() afterFocus?:{(element:HTMLElement):void};

    constructor(private el: ElementRef) {
    }

    ngOnInit() {
        if (this.forceFocus) {
            setTimeout(() => this.applyFocus() );
        }
    }

    ngOnChanges( changes:SimpleChanges  ) {
        if ( 'forceFocus' in changes && this.forceFocus ) {
            setTimeout(() => this.applyFocus() );
        }
    }

    applyFocus() {
        try {
            let target:HTMLElement;
            if ( this.targetTag ) {
                target = this.el.nativeElement.getElementsByTagName( this.targetTag )[0];
            } else {
                target = this.el.nativeElement;
            }
            if ( ! target ) {
                throw new Error("No native element was selected" );
            }
            target.focus();
            if ( this.afterFocus ) {
                this.afterFocus(target);
            }
        } catch ( e ) {
            console.warn("Warning: could not focus on autocomplete input: ", e );
        }
    }
}
