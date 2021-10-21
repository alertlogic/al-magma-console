import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AlSelectFilterItem, AlSelectFilterItemDetails } from './al-dropdown-filter.types';

@Component({
    selector: 'al-dropdown-filter',
    templateUrl: './al-dropdown-filter.component.html',
    styleUrls: ['./al-dropdown-filter.component.scss']
})

export class AlDropdownFilterComponent implements OnInit {
    /**
     * List of dashboard options
     */
    @Input() filterOptions: AlSelectFilterItem[];
    @Input() selectedOption: AlSelectFilterItem;

    /**
     * Optional width setting
     */
    @Input() dropDownWidth: string;

    /**
     * Event to  fire dashboard object
     */
    @Output() onFilterSelection: EventEmitter<AlSelectFilterItemDetails> = new EventEmitter<AlSelectFilterItemDetails>();

    public defaultWidth: string;

    ngOnInit() {
        this.dropDownWidth ? this.defaultWidth = this.dropDownWidth : this.defaultWidth = '350px';
    }

    public clickEvent(item: AlSelectFilterItemDetails) {
        this.onFilterSelection.emit(item);
    }
}
