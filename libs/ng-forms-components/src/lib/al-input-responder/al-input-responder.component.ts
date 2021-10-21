import { AlDynamicFormControlElementOptions, AlDynamicFormControlInputResponderOptions } from '@al/core';
import { Component, Input, forwardRef, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AlDynamicFormControlElementCommon } from '../types';

@Component({
    selector: 'al-input-responder',
    templateUrl: './al-input-responder.component.html',
    styleUrls: ['./al-input-responder.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AlInputResponderComponent),
            multi: true
        }
    ]
})
export class AlInputResponderComponent implements ControlValueAccessor {
    public value: string = '';
    public position = 0;
    public search = '';
    public showSuggestions = false;
    public isDisabled = false;
    public visual: 'input'| 'textarea' | 'dropdown' | 'multiSelectList' = 'input';
    public buttonLabel = '';
    public buttonTooltip = "";
    public suggestionsItems: { group: string; description?: string; options: { label: string; value: string; description?: string; }[]; }[] = [];

    /** for reative form that may not have a element */
    @Input() key: string = '';
    @Input() label:string = '';
    @Input() placeholder: string = '';
    @Input() required: boolean = false;
    @Input() dropdownOptions: AlDynamicFormControlElementOptions[] = [];

    /** for dinamic forms */
    @Input() element: AlDynamicFormControlElementCommon | undefined;
    @Input() options: AlDynamicFormControlInputResponderOptions = {};

    @ViewChild('responderButton') responderButton: ElementRef | undefined;
    @ViewChild('responderList') responderList: ElementRef | undefined;

    private listenerFn: () => void;

    constructor(private renderer: Renderer2) {
        this.hideListWhenClickoutside();
    }

    // the method set in registerOnChange to emit changes back to the form
    /* tslint:disable:no-empty */
    propagateChange = (_: any) => { };
    propagateTouch = () => { };
    /* tslint:enable:no-empty */

    ngOnInit() {
        if (this.options && this.options.options) {
            this.suggestionsItems = this.options.options;
        }
        if (this.options && this.options.type) {
            this.visual = this.options.type;
        }
        if (this.options && this.options.buttonLabel) {
            this.buttonLabel = this.options.buttonLabel;
        }
        if (this.options?.buttonTooltip) {
            this.buttonTooltip = this.options.buttonTooltip;
        }
        if (this.element) {
            this.key = this.element.key;
            this.label = this.element.label || '';
            this.placeholder = this.element.placeholder || '';
            this.required = this.element.required || false;
            this.dropdownOptions = this.element.options || [];
        }
    }

    ngOnDestroy() {
        if (this.listenerFn) {
            this.listenerFn();
        }
    }

    hideListWhenClickoutside(){
        this.listenerFn = this.renderer.listen('window', 'click', (e: Event) => {
            // we need to diferenciate what targets
            if (!this.responderButton?.nativeElement.contains(e.target)
                && !this.responderList?.nativeElement.contains(e.target)
            ) {
                this.showSuggestions = false;
            }
        });
    }

    toggleSuggestion() {
        this.search = '';
        this.showSuggestions = !this.showSuggestions;
    }

    insertText(event: MouseEvent, suggestion: string) {
        event.stopPropagation();
        if(this.visual === 'dropdown'){
            this.value = suggestion;
        } else {
            this.value = this.value.substring(0, this.position) + suggestion + this.value.substring(this.position);
        }
        this.toggleSuggestion();

        this.propagateChange(this.value);
    }

    applyTextFilter(value: string) {
        this.search = value;
    }

    onFocusEvent($event: any) {
        this.position = $event.target.selectionStart;
        this.propagateChange(this.value);
    }

    // angular will call to initialize or set the value
    writeValue(value: any): void {
        this.value = value || '';
    }

    // configure the funcion that is going to handle the changes
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    // configure the funcion that is going to handle the on touch
    registerOnTouched(fn: any): void {
        this.propagateTouch = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    onBlur() {
        this.propagateTouch();
    }

    change() {
        this.propagateChange(this.value);
        this.propagateTouch();
    }
}
