import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AlOptionItem } from '../../types/al-common.types';

@Component({
    selector: 'ald-checkbox-group',
    templateUrl: './al-checkbox-group.component.html',
	styleUrls: ['./al-checkbox-group.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => AlCheckboxGroupComponent),
        multi: true
    }]
})
export class AlCheckboxGroupComponent implements OnInit, ControlValueAccessor {

    @Input() label: string;
    @Input() options: AlOptionItem[] = [];
    @Input() inline?: boolean;
    @Input() verticalSpace? = true;
    @Input() hint?: string;
    @Input() tip?: string;

    // tslint:disable-next-line:no-output-on-prefix
    @Output() onSelectionChange: EventEmitter<AlOptionItem[]> = new EventEmitter<AlOptionItem[]>();

    constructor() { }

    ngOnInit(): void {}

    onTouched: () => void = () => { };

    onChange(item: AlOptionItem, checked: boolean) {
        item.selected = checked;
        this.onSelectionChange.emit(this.options);
    }
    writeValue(value: any) {
        this.options = value;
    }

    registerOnChange(fn: any) { this.onChange = fn; }
    registerOnTouched(fn: any) { }

}
