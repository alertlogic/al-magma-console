import { AlButtonComponent } from './../../al-button/al-button.component';
import { BehaviorSubject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { AlDropdownComponent } from '../../al-dropdown/al-dropdown.component';
import { AlOptionItem } from '../../types/al-common.types';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output, ViewChild, OnInit, AfterViewInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'ald-table-header',
    templateUrl: './table-header.component.html',
    styleUrls: ['./table-header.component.scss']
})
export class AlTableHeaderComponent implements OnInit, AfterViewInit, OnChanges {

    @ViewChild('columnDropdown') columnConfigDropdown: AlDropdownComponent;
    @ViewChild('tableSettings') tableSettings: AlDropdownComponent;
    @ViewChild('filtersToggleButton') filtersToggleButton: AlButtonComponent;

    @Input() columnOptions: AlOptionItem[];
    @Input() filterOptions: AlOptionItem[];

    @Output() didApplyColumnConfig: EventEmitter<AlOptionItem[]> = new EventEmitter();
    @Output() didSearch: EventEmitter<string> = new EventEmitter();
    @Output() didFilter: EventEmitter<{field: string, values: any[]}> = new EventEmitter();
    @Output() didFormatTable: EventEmitter<void> = new EventEmitter();

    tableSearchControl = new FormControl();
    columnSearchControl = new FormControl();

    columnsList: AlOptionItem[];
    columnsSubject$: BehaviorSubject<AlOptionItem[]> = new BehaviorSubject<AlOptionItem[]>([]);
    previousColumnsList: AlOptionItem[];

    filterList: AlOptionItem[];
    filtersSubject$: BehaviorSubject<AlOptionItem[]> = new BehaviorSubject<AlOptionItem[]>([]);
    
    displayFilters = false;
    filtersToggleButtonLabel = 'Filters';

    constructor(private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {;

        // Initialise the column options with the input column options
        this.columnsSubject$.next(this.columnOptions);
        this.columnsSubject$.subscribe((columns) => {
            this.columnsList = columns;
        });

        // subscription to the table search, emitting the search term to the table component to handle
        this.tableSearchControl.valueChanges.subscribe((searchTerm: string) => {
            this.didSearch.emit(searchTerm);
        });

        // subsription to the column search to update the column options
        this.columnSearchControl.valueChanges.subscribe((searchTerm: string) => {

            const columns = [...this.columnsList];
            let filteredColumns: AlOptionItem[];

            if (!searchTerm) {
                filteredColumns = columns;
            } else {
                const filteredResults = columns.filter((value: any) => {
                    return Object.values(value).reduce((prev, curr) => {
                        return prev || curr.toString().toLowerCase().includes(searchTerm.toLowerCase());
                    }, false);
                });
                filteredColumns = filteredResults;
            }

            this.columnsSubject$.next(filteredColumns);
        });
    }

    ngAfterViewInit() {
        this.filtersSubject$.next(this.filterOptions);
        this.filtersSubject$.subscribe((filters) => {
            this.filterList = filters;
            this.filterList.forEach(filter => {
                this.applyFilters(filter);
            });
        });

        this.cdr.detectChanges();
    }

    ngOnChanges(changes: SimpleChanges) {

        // if the filteOptions chnage, update the list of filters
        if (changes['filterOptions'] && !changes['filterOptions'].firstChange) {
            this.filterList = changes['filterOptions'].currentValue;
            this.filterList.forEach(filter => {
                this.applyFilters(filter);
            });
        }
    }

    public dropColumn(item: CdkDragDrop<AlOptionItem>): void {

        this.previousColumnsList = [...this.columnsList];

        // Forces the current index (where the item was dropped) to only be after the first (disabled item).
        if (item.currentIndex > 0) {
            moveItemInArray(this.columnsList, item.previousIndex, item.currentIndex);
        } else {
            moveItemInArray(this.columnsList, item.previousIndex, item.currentIndex + 1);
        }

        this.columnsSubject$.next(this.columnsList);
    }

    public didSelectColumn($event: boolean, id: string): void {

        this.previousColumnsList = [...this.columnsList];

        const foundColumn = [...this.columnsList].find(({value}) => value === id);
        if (!foundColumn) {
            return;
        }
        foundColumn.selected = $event;
        this.columnsSubject$.next(this.columnsList);
    }

    public applyColumnConfig(): void {
        this.columnSearchControl.reset();
        this.didApplyColumnConfig.emit(this.columnsList);
        this.columnConfigDropdown.close();
    }

    public cancelColumnConfig(): void {
        // TODO: Undo selected options...
        this.columnSearchControl.reset();
        this.columnConfigDropdown.close();
        this.columnsSubject$.next(this.previousColumnsList);
    }

    public tableFormat(): void {
        this.didFormatTable.emit();
        this.tableSettings.close();
    }

    public applyFilters(filter: AlOptionItem): void {

        if (!filter.items) { return; } 

        const filterValues = [];
        let filterCount = 0;

        filter.items.forEach(item => {
            if (item.selected) {
                filterValues.push(item.value);
                filterCount++;
            }
        });

        // saves the filter label to the filter's description field only if it's empty
        if (!filter.description) {
            filter.description = filter.label;
        }

        // update the filter label with a count, or if no count, set the label to the description value saved earlier
        filter.label = filterCount ? filter.description + ' (' + filterCount + ')' : filter.description;
        filter.selected = filterCount ? true : false;

        this.toggleFiltersButtonState();

        this.didFilter.emit({field: filter.value, values: filterValues});
    }

    public clearFilters(filter) {

        if (!filter.items) { return; }

        filter.items.forEach(item => {
            item.selected = false;
        });

        filter.label = filter.description ? filter.description : filter.label;
        filter.selected = false;

        this.toggleFiltersButtonState();

        this.didFilter.emit({field: filter.value, values: filter.items});
    }

    // Clear all filters
    clearAll() {
        this.filterList.forEach(filterType => {
            this.clearFilters(filterType);
        });
    }

    // make the "Filters" button selected or not if at least one filter is applied.
    toggleFiltersButtonState() {
        let hasFiltersApplied = 0;

        this.filterList.forEach(filterType => {
            if (filterType.selected) {
                hasFiltersApplied++;
            }
        });

        this.filtersToggleButton.selected = hasFiltersApplied ? true : false;
        this.filtersToggleButton.label = hasFiltersApplied ? this.filtersToggleButtonLabel + ' (' + hasFiltersApplied + ')' : this.filtersToggleButtonLabel;
    }

}
