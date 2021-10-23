import { Component, EventEmitter, Input, OnInit, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
    selector: 'ald-checkbox',
    templateUrl: './al-checkbox.component.html',
	styleUrls: ['./al-checkbox.component.scss']
})
export class AlCheckboxComponent implements OnInit, ControlValueAccessor {

    @Input() label: string = '';
    @Input() id: string = '';
    @Input() name?: string;
    @Input() checked = false;
    @Input() disabled = false;
    @Input() indeterminate ? = false;
    @Input() verticalSpace ? = true;
    @Output() onCheckedChange: EventEmitter<boolean> = new EventEmitter();

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
        this.name = this.name || this.label;
    }

    onChanged: any = () => { };
    onTouched: any = () => { };

    onValueChange(newValue: boolean) {

        if (this.indeterminate) {
            this.indeterminate = false;
        }

        if (newValue === undefined) {
            this.onChanged(this.checked);
        } else {
            this.onChanged(newValue);
            this.checked = newValue;
        }
        this.onCheckedChange.emit(this.checked);
    }
    writeValue(value: any) {
        this.checked = value;
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

    setIndeterminateState(val: boolean): void {
        this.indeterminate = val;
    }

}
