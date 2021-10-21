/**
 * An enhanced version of the primeng multiselect but with list.
 *
 * @author Gisler Garces <ggarces@alertlogic.com>
 * @author Fábio Miranda <fmiranda@alertlogic.com>
 * @author Andres Echeverri <andres.echeverri@alertlogic.com>
 * @copyright 2020 Alert Logic, Inc.
 */
import {
    Component,
    EventEmitter,
    Input,
    Optional,
    Output,
    Self,
    ViewChild
} from '@angular/core';
import {
    ControlValueAccessor,
    NgControl,
} from '@angular/forms';
import { MultiSelect } from "primeng/multiselect";
import { AlSelectableListComponent } from "../al-selectable-list/al-selectable-list.component";
import {
    AlChipItem,
    AlSelectItem,
} from '../types';

@Component({
    selector: 'al-multiselect-list',
    templateUrl: './al-multiselect-list.component.html',
    styleUrls: ['./al-multiselect-list.component.scss']
})
export class AlMultiSelectListComponent<T=any> implements ControlValueAccessor {
    // The default label placeholder to display on the dropdown selector
    @Input() placeholder: string = 'Choose';
    // The options to be displayed on the dropdown menu list
    @Input() options: AlSelectItem<T>[] | AlChipItem<T>[] = [];
    // Read only mode
    @Input() readonly: boolean = false;
    // This tells the component how to render the selected options.
    @Input() selectableListMode: 'list' | 'chips' = 'list';
    // Whether the filter should be displayed
    @Input() filter: boolean = true;
    // Whether the details should be displayed in the same line as the title
    @Input() inline: boolean = false;

    // The selected items from the dropdown menu
    public value: T[] | null;
    public isDisabled: boolean;

    @ViewChild(MultiSelect, { static: true }) primeMultiSelect!:MultiSelect;
    @ViewChild(AlSelectableListComponent) selectableList!:AlSelectableListComponent;

    // Emitter which emits the selected items
    @Output() onSelectionChanged: EventEmitter<T[]> = new EventEmitter<T[]>();

    constructor(
        @Self() @Optional() public control: NgControl
    ) {
        this.control && (this.control.valueAccessor = this);
    }

    ngOnInit(): void {
        /**
         * Why these shenanigans?
         */

        // removing all of below for ng12 migration since getVisibleOptions is no available anymore it seems
        // unit tests failing
        // function newGetVisible() {
        //     // @ts-ignore
        //     return this.visibleOptions || this.options;
        // }
        // const newGetVisibleOptions = (newGetVisible).bind(this.primeMultiSelect);

        // ( this.primeMultiSelect as any ).getVisibleOptions = newGetVisibleOptions;

    }

    onChangeFn = (value: any[] | null) => {
        // empty intentional
    }
    onTouchFn = () => {
        // empty intentional
    }

    /**
     * Function which triggers when an item is selected from the dropdown list
     * @param event The prime-ng event with the selected items and the last changed item
     **/
    selectOption(event:{value:T[], itemValue?:T}) {
        const selectedOptions = event.value;
        const changedItem = event.itemValue;
        if (changedItem && Array.isArray(this.options)) {
            // idk why it has to have any, i suspect its the type union of AlSelectItem | AlChipItem -jst
            const found = (this.options as any).find((o:{value:T}) => o.value === changedItem);
            if (!found) {
                if ('checked' in found.value) {
                    ( found.value).checked = false;
                }
            }
        }
        this.changeValue(selectedOptions);
        if (this.selectableListMode === 'list') {
            this.selectableList.allChecked = true;
            // have to set timeout so the selectable list can get the new values injested
            setTimeout(() => {
                this.selectableList.toggleCheckAll();
            }, 1);
        }

    }

    changeValue(selectedOptions: T[]){
        this.onChangeFn(this.value);
        this.onSelectionChanged.emit(selectedOptions);
    }

    writeValue(value: T[]): void {
        if ( value ) {
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
