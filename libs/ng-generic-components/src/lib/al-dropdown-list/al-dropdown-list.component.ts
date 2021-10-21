/**
 * An enhanced version of the primeng multiselect but with list.
 *
 * @author Gisler Garces <ggarces@alertlogic.com>
 * @author Fábio Miranda <fmiranda@alertlogic.com>
 * @copyright 2020 Alert Logic, Inc.
 */
import { Component, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { AlSelectItem } from '../types';

@Component({
    selector: 'al-dropdown-list',
    templateUrl: './al-dropdown-list.component.html',
    styleUrls: ['./al-dropdown-list.component.scss']
})
export class AlDropdownListComponent<T> implements ControlValueAccessor {

    // The default label placeholder to display on the dropdown selector
    @Input() placeholder: string = 'Choose';

    // The options to be displayed on the dropdown menu list
    @Input() options: AlSelectItem<T>[] = [];

    // Read only mode for dropdown
    @Input() readonly: boolean = false;

    public value: T[] | null;
    public isDisabled: boolean;

    constructor(
        @Self() @Optional() public control: NgControl
    ) {
        this.control && (this.control.valueAccessor = this);
    }

    onChangeFn = (value: T[] | null) => {
        // empty intentional
    }

    onTouchFn = () => {
        // empty intentional
    }

    /**
     * Function which triggers when an item is selected from the dropdown list
     * @param event The prime-ng event with the selected items and the last changed item
     **/
    selectOption(event: any): void {
        const addedItem = event.value;
        if (!this.value) {
            this.value = [];
        }
        const index = this.value.indexOf(addedItem);
        if (index === -1) {
            this.value.push(addedItem);
        }
        this.onChangeFn(this.value);
    }

    writeValue(value: T[]): void {
        if (value) {
            this.value = value || null;
        } else {
            this.value = null;
        }
    }

    registerOnChange(fn: (value: T[] | null) => void): void {
        this.onChangeFn = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouchFn = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    get invalid(): boolean {
        return this.control ? !!this.control.invalid : false;
    }

}
