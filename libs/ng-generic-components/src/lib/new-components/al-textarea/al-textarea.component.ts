/**
 * al-texarea
 *
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2021
 *
 */
import { Component, Input, OnInit, Optional, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';

@Component({
    selector: 'al2-textarea',
    templateUrl: './al-textarea.component.html'
})
export class AlTextAreaComponent implements OnInit, ControlValueAccessor {

    @Input() label?: string = '';
    @Input() placeholder?: string = ' ';
    @Input() type?: string = 'text';
    @Input() name?: string = this.label;
    @Input() cols?: number = 30;
    @Input() rows?: number = 3;
    @Input() id?: string;
    @Input() value: string;
    @Input() disabled?: boolean = false;
    @Input() autofocus: boolean = false;
    @Input() required?: boolean = false;
    @Input() hint?: string;
    @Input() tip?: string;
    @Input() error?: string;
    @Input() verticalSpace?: boolean = true;
    @Input() requiredError?: string;
    @Input() formControl?: FormControl;
    @Input() formControlName = '';

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

    onChanged: any = () => { };
    onTouched: any = () => { };

    ngOnInit(): void {
        this.id = this.id || this.label;
    }


    onValueChange(newValue?: string) {
        if (newValue === undefined) {
            this.onChanged(this.value);
        } else {
            this.onChanged(newValue);
            this.value = newValue;
        }
    }
    writeValue(value: any) {
        this.value = value;
    }
    registerOnChange(fn: any) {
        this.onChanged = fn;
    }
    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    setDisabledState(val: boolean): void {
        this.disabled = val;
    }
}
