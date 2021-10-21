/**
 * al2-checkbox
 *
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2021
 *
 */

import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { AlOptionItem } from '../../types';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'al2-checkbox-group',
    templateUrl: './al-checkbox-group.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => AlCheckboxGroupComponent),
        multi: true
    }]
})
export class AlCheckboxGroupComponent implements OnInit, ControlValueAccessor {

    @Input() label: string = '';
    @Input() options: AlOptionItem[] = [];
    @Input() inline?: boolean;
    @Input() verticalSpace: boolean = true;
    @Input() hint?: string;
    @Input() tip?: string;

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
