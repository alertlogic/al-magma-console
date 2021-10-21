import { Component, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { AlSimpleFilter, AlSimpleFilterValue } from '../types/filter.types';

interface Chip {
    title: string;
    class?: string;
    icon?: boolean;
    filterValue?: AlSimpleFilterValue;
    toggle?: boolean;
}

@Component({
    selector: 'al-filter2',
    templateUrl: './al-filter2.component.html',
    styleUrls: ['./al-filter2.component.scss']
})
export class AlFilter2Component implements OnChanges {

    @Input() filters?:AlSimpleFilter[];

    @Input() defaultVisibleChips    =   3;
    @Input() defaultVisibleValues   =   10;

    /**
     * The component offers three event outputs for convenience...
     *     `addedFilter`, which emits the filter value that changed when a new filter is added;
     *     `removedFilter`, which emits the filter value that changed when a filter is removed;
     *     `changed`, which emits the complete set of filters after any change.
     */
    @Output() addedFilter           =   new EventEmitter<AlSimpleFilterValue>();
    @Output() removedFilter         =   new EventEmitter<AlSimpleFilterValue>();
    @Output() changed               =   new EventEmitter<AlSimpleFilterValue[]>();

    public chips: Chip[]            =   [];
    public appliedFilterCount       =   0;
    public showAllChips             =   false;

    constructor() {
    }

    /**
     * Public method allowing currently applied filters to be retrieved
     */
    public getSelectedFilters():AlSimpleFilterValue[] {
        if ( this.filters ) {
            let selection:AlSimpleFilterValue[] = [];
            this.filters.forEach( filter => {
                filter.values.forEach( value => {
                    if ( value.selected ) {
                        selection.push( value );
                    }
                } );
            } );
            return selection;
        } else {
            return [];
        }
    }

    ngOnChanges( changes:SimpleChanges ) {
        if ( 'filters' in changes && changes.filters.currentValue ) {
            this.normalizeFilterData();
            this.recalculateChips();
        }
    }

    /**
     * Capture value changes from underlying checkbox
     */
    onFilterValueChanged( property:AlSimpleFilter, value:AlSimpleFilterValue, checked:boolean ) {
        value.selected = checked;
        this.recalculateChips();
        if ( checked ) {
            this.addedFilter.emit( value );
        } else {
            this.removedFilter.emit( value );
        }
        this.changed.emit( this.getSelectedFilters() );
    }

    /**
     * Click on the header of a specific filter property
     */
    onClickFilterHeader( filter:AlSimpleFilter, event:MouseEvent ) {
        filter.collapsed = ! filter.collapsed;
    }

    /**
     * Triggered when user clicks any filter chip
     */
    clickChip( chip:Chip ) {
        console.log("Clicked...", chip );
        if ( chip.toggle ) {
            this.showAllChips = ! this.showAllChips;
        } else if ( chip.filterValue ) {
            chip.filterValue.selected = false;
        }
        this.recalculateChips();
    }

    /**
     * Triggered when user clicks "clear all"
     */
    clearFilters( event?:MouseEvent ) {
        if ( event ) {
            event.preventDefault();
            event.stopPropagation();
        }
        if ( this.filters ) {
            this.filters.forEach( filter => {
                filter.values.forEach( value => value.selected = false );
            } );
        }
        this.recalculateChips();
    }

    /**
     * Toggle filter value expansion
     */
    toggleFilterValueExpansion( filter:AlSimpleFilter, event?:MouseEvent ) {
        if ( event ) {
            event.preventDefault();
            event.stopPropagation();
        }
        if ( filter.value_limit! < filter.values.length ) {
            filter.value_limit = filter.values.length;
        } else {
            filter.value_limit = this.defaultVisibleValues;
        }
    }

    /**
     * Enumerate through filters and values and set reasonable defaults for optional fields used to control display
     */
    normalizeFilterData() {
        if ( this.filters ) {
            this.filters.forEach( filter => {
                filter.value_limit = filter.value_limit || this.defaultVisibleValues;
            } );
        }
    }

    /**
     * Enumerate all filters/values to determine which are currently applied.  Use calculated filter set to determine whether
     * the applied filter chips should include a "show more" or "show less" variant.
     */
    recalculateChips() {
        let chips:Chip[] = [];
        if ( this.filters ) {
            this.filters.forEach( filter => {
                filter.values.forEach( value => {
                    if ( value.selected ) {
                        chips.push( {
                            title: value.title,
                            class: "primary",
                            icon: true,
                            filterValue: value
                        } );
                    }
                } );
            } );
            this.appliedFilterCount = chips.length;
            if ( chips.length > this.defaultVisibleChips ) {
                if ( this.showAllChips ) {
                    chips.push( {
                        title: "Show less",
                        class: "secondary",
                        icon: false,
                        toggle: true
                    } );
                } else {
                    let title = `Show +${chips.length - this.defaultVisibleChips} others`;
                    chips = chips.slice( 0, this.defaultVisibleChips );
                    chips.push( {
                        title,
                        class: "secondary",
                        icon: false,
                        toggle: true
                    } );
                }
            }
            this.chips = chips;
        }
    }
}
