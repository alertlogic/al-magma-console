import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlSelectItem } from '../types';

@Component({
    selector: 'al-selectable-list',
    templateUrl: './al-selectable-list.component.html',
    styleUrls: ['./al-selectable-list.component.scss']
})
export class AlSelectableListComponent {

    // Array with the items on the checkbox format (AlSelectItem from multi-select-list component)
    @Input() options: AlSelectItem[] = [];

    // Readonly mode
    @Input() readonly: boolean = false;

    // allows removal items
    @Input() allowRemoval: boolean = true;

    // allows select All
    @Input() allowSelectAll: boolean = true;

    // Event Emitter with the selected options
    @Output() onSelectionChanged: EventEmitter<AlSelectItem[]> = new EventEmitter();

    // Control variable which controls the state of the select all checkbox.
    public allChecked: boolean = false;

    public hasSelectedItems: boolean = false;

    /**
     * Function which removes the item from the options list.
     * @param item the item to be removed from the options list.
     */
    removeItem(item: AlSelectItem) {
        const index: number = this.options.indexOf(item);
        if (index !== -1) {
            this.options[index].checked = false;
            this.options.splice(index, 1);
        }
        this.toggleCheck();
        this.onSelectionChanged.emit(this.options);
    }

    /**
     * Function which toggles the options when clicking on the select all checkbox
     */
    toggleCheckAll() {
        this.options.forEach((option) => option.checked = this.allChecked);
        this.hasSelectedItems = this.allChecked;
    }

    /**
     * Function which toggles the hasSelectedItems and allChecked variable
     */
    toggleCheck() {
        if (this.options && this.options.length > 0) {
            this.allChecked = this.options.every(option => option.checked!);
            this.hasSelectedItems = this.options.some((option) => option.checked!);
        }
    }

    /**
     * Functions which iterates over the selected items and remove those.
     */
    removeSelectedItems() {
        this.options.filter((option) => option.checked).forEach(option => this.removeItem(option));
        this.toggleCheck();
    }

}
