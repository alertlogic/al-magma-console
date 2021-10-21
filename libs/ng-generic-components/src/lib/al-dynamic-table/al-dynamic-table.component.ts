import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

/**
 *  IMPORTANT NOTICE TO UI ENGINEERS WHO FIRST WORK WITH THIS
 *
 *  Before this component goes into service, please make sure that the following changes are made to it:
 *
 *  1.  The component itself should be a generic AlDynamicTableComponent<Type=unknown>, such that
 *      all of its event emitters and inputs can be used to work against specific interfaces instead of just `unknown`.
 *      This will also be the default type of the `rows` and `selectedRows` arrays.
 *
 *  2.  Please, create an interface for the columns (and make columns and visibleColumns) and make sure references to them as arrays
 *      are used as arrays instead of just `any`.  In general, kill all the `any`s except where they're appropriate.
 *
 *  3.  There are some unused properties in here -- please scrap them so we can start with cold, hard metal.
 *
 *  4.  Last and not least, please add logic so that *the first time* columns are set, all of them will be selected by default
 *      unless the host specifies otherwise (you may need to add a field to the [not yet created] column interface, or another
 *      @Input(), to make this happen).
 */

@Component({
    selector: 'al-dynamic-table',
    templateUrl: './al-dynamic-table.component.html',
    styleUrls: ['./al-dynamic-table.component.scss'],
})
export class AlDynamicTableComponent implements OnInit, OnChanges {

    @Output() onSearched:EventEmitter<string> = new EventEmitter<string>();
    @Output() onDownloadAll: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() onSelected: EventEmitter<unknown> = new EventEmitter<unknown>();
    @Output() onUnselected: EventEmitter<unknown> = new EventEmitter<unknown>();
    @Output() onSorted: EventEmitter<string> = new EventEmitter<string>();
    @Output() onRowHover: EventEmitter<unknown> = new EventEmitter<unknown>();
    @Output() onRowOut: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() onOpenItem: EventEmitter<unknown> = new EventEmitter<unknown>();
    @Output() onLazyLoad: EventEmitter<unknown> = new EventEmitter<unknown>();

    @Input() columns: any[] = [];
    @Input() rows: any[] = [];
    @Input() dataKey: string = "";
    @Input() rowsPerPage: number = 20;
    @Input() isVisible: boolean = true;

    products: any;
    selectedRows: any;
    visibleColumns: any;
    event:any;
    items: any;


    constructor() { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty('cols') && changes.columns.previousValue && changes.columns.previousValue.length === 0) {
            this.columns = changes.columns.currentValue;
            this.visibleColumns = this.columns;
        }
        if (changes.hasOwnProperty('rows')) {
            this.rows = changes.rows.currentValue;
        }
    }

    ngOnInit(): void {
    }

    @Input()
    public get selectedColumns(): any[] {
        return this.visibleColumns;
    }

    public set selectedColumns(val: any[]) {
        // restore original order
        this.visibleColumns = this.columns.filter((col) => val.includes(col));
    }

    public downloadAll() {
        this.onDownloadAll.emit(true);
    }

    public openItem(rowData: any[]) {
        this.onOpenItem.emit(rowData);
    }

    public onMouseEnter(rowData: any[]) {
        this.onRowHover.emit(rowData);
    }

    public onMouseLeave() {
        this.onRowOut.emit(true);
    }

    public onRowSelect(event: any) {
        this.onSelected.emit({ selectedRows : this.selectedRows, rowSelected : event.data });
    }

    public onRowUnselect(event: any) {
        this.onUnselected.emit({ selectedRows : this.selectedRows, rowUnselected : event.data });
    }

    public onHeaderCheckboxToggle(event: any) {
        if (event.checked) {
            this.onRowSelect({data: this.rows});
        } else {
            this.onRowUnselect({data: this.rows});
        }
    }

    public loadItemsLazy(event: any) {
        this.onLazyLoad.emit(event);
    }

    public customSort(event: any) {
        this.onSorted.emit(event);
    }

    public onSearchChanged(event: any) {
        this.onSearched.emit(event);
    }

}
