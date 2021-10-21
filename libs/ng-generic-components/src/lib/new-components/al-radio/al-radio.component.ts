/**
 * al-radio
 *
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2021
 *
 */

import { Component, Input, Output, EventEmitter, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
    selector: 'al2-radio',
    templateUrl: './al-radio.component.html'
})
export class AlRadioComponent implements ControlValueAccessor {

    @Input() name: string = '';
    @Input() label: string = '';
    @Input() value: string | number;
    @Input() inline?: boolean;
    @Input() disabled = false;

    @Output() inputModelChange: EventEmitter<string | number> = new EventEmitter<string | number>();

    public checked = false;

    constructor(@Optional() @Self() public ngControl: NgControl) {
        if (this.ngControl != null) {
            // Setting the value accessor directly (instead of using
            // the providers) to avoid running into a circular import.
            this.ngControl.valueAccessor = this;
        }

    }

    onChanged: any = () => { };
    onTouched: any = () => { };
    onChange() {
        if (!this.disabled) {
            this.checked = true;
            this.onChanged(this.value);
            this.inputModelChange.emit(this.value);
        }
    }
    writeValue(value: any) {
        this.checked = (value === this.value);
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
