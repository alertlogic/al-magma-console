/**
 * al-input
 *
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2021
 *
 */
import { Component, Input, OnInit, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

enum InputType {
    text = 'text',
    number = 'number',
    email = 'email',
    password = 'password',
    range = 'range',
    search = 'search'
}

@Component({
    selector: 'al2-input',
    templateUrl: './al-input.component.html'
})
export class AlInputComponent implements OnInit, ControlValueAccessor {

    @Input() label: string = '';
    @Input() verticalSpace = true;
    @Input() placeholder: string = '';
    @Input() type: InputType = InputType.text;
    @Input() name: string = this.label;
    @Input() id?: string;
    @Input() disabled = false;
    @Input() autofocus = false;
    @Input() value: any = '';
    @Input() required?: boolean = false;
    @Input() requiredError?: string;
    @Input() validationPattern?: string;
    @Input() patternError?: string;
    @Input() hint?: string;
    @Input() tip?: string;
    @Input() minValue?: number;
    @Input() maxValue?: number;
    @Input() minLength?: number;
    @Input() maxLength?: number;

    constructor(@Optional() @Self() public ngControl: NgControl) {
        if (this.ngControl != null) {
            // Setting the value accessor directly (instead of using
            // the providers) to avoid running into a circular import.
            this.ngControl.valueAccessor = this;
        }
    }

    get control() {
        return this.ngControl?.control;
    }

    ngOnInit(): void {
        this.id = this.id || this.label;
    }

    onChange: any = ( value:string ) => { };
    onTouch: any = () => { };

    writeValue(value: any) {
        this.value = value;
    }
    registerOnChange(fn: any) {
        this.onChange = fn;
    }
    registerOnTouched(fn: any) {
        this.onTouch = fn;
    }

    setDisabledState(val: boolean): void {
        this.disabled = val;
    }

    onValueChange( event:Event ) {
        this.onChange( ( event.target as HTMLInputElement ).value );
    }
}
