import { AlOptionItem } from '../../types/al-common.types';
import { Component, Input, Self, OnInit, Optional } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
    selector: 'ald-radio',
    templateUrl: './al-radio.component.html',
    styleUrls: ['./al-radio.component.scss']
})
export class AlRadioComponent implements ControlValueAccessor {

    /**
     * Fieldset parameters
     */
    @Input() legend: string;
    @Input() verticalSpace = true;
    @Input() hint?: string;
    @Input() tip?: string;

    /**
     * Radio parameters
     */
    @Input() name: string;
    @Input() options: AlOptionItem[] = [];
    @Input() value: string | number | boolean;
    @Input() inline?: boolean;
    @Input() disabled = false;


    get model(): string | number | boolean {
        return this.value;
    }

    set model(v: string | number | boolean) {
        if (v !== this.value) {
            this.value = v;
            this.change(v);
        }
    }

    onTouch: any = () => {};
    onChange: any = () => {};

    constructor(@Optional() @Self() public ngControl: NgControl) {
        if (this.ngControl != null) {
            this.ngControl.valueAccessor = this;
        }
    }

    // ngOnInit(): void {
    //     this.ngControl.control.valueChanges.subscribe(value => {
    //         if (this.value === value) { return; }
    //         this.writeValue(value);
    //     });
    // }

    writeValue(value: any): void {
        if (value !== this.value) {
            this.value = value;
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    change(value: string | number | boolean) {
        this.value = value;
        this.onChange(value);
        this.onTouch(value);
    }


    // @Output() inputModelChange: EventEmitter<string | number> = new EventEmitter<string | number>();

    // public checked = false;

    // constructor(@Optional() @Self() public ngControl: NgControl) {
    //     if (this.ngControl != null) {
    //         // Setting the value accessor directly (instead of using
    //         // the providers) to avoid running into a circular import.
    //         this.ngControl.valueAccessor = this;
    //     }

    // }

    // onChanged: any = () => { };
    // onTouched: any = () => { };

    // onChange() {
    //     if (!this.disabled) {
    //         this.checked = true;
    //         this.onChanged(this.value);
    //         this.inputModelChange.emit(this.value);
    //     }
    // }
    // writeValue(value: any) {
    //     this.checked = (value === this.value);
    // }

    // registerOnChange(fn: any) {
    //     this.onChanged = fn;
    // }

    // registerOnTouched(fn: any) {
    //     this.onTouched = fn;
    // }

    // setDisabledState(val: boolean): void {
    //     this.disabled = val;
    // }
}
