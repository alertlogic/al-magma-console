import { AlOptionItem } from './../types/al-common.types';
import { ColumnDef, ColumnType } from '../types/al-table.types';
import { Component, EventEmitter, HostBinding, Input, OnInit, Output, OnChanges, SimpleChanges, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AlDropdownComponent } from '../al-dropdown/al-dropdown.component';


@Component({
  selector: 'ald-table',
  templateUrl: './al-table.component.html',
  styleUrls: ['./al-table.component.scss']
})
export class AlTableComponent implements OnInit, OnChanges {

  @HostBinding('class') class = 'u-fill-height';

  @ViewChildren('actionMenu') actionMenu: QueryList<AlDropdownComponent>;
  @ViewChild('multiSelectActionMenu') multiSelectActionMenu: AlDropdownComponent;
  @ViewChild('resultsPerPage') resultsPerPage: AlDropdownComponent;

  @Input() columns: ColumnDef[];      // column definitions
  @Input() data: any[];               // data to display as rows
  @Input() stickyColumn?: boolean;    // enable first data column to be sticky.
  @Input() actions?: AlOptionItem[]; // array of actions
  @Input() multiSelectActions?: AlOptionItem[]; // array of actions
  @Input() linkedPath?: string;        // path for prepending to the link
  @Input() multilineRows?: boolean;    // enables the rows to display as multlines - uglify!
  @Input() checkboxRows?: boolean;     // enables the checkboxes on each row
  @Input() selectableRows?: boolean;   // rows are clickable - typically used to pass the row value to a sidebar
  @Input() defaultSortKey?: string;    // default field to sort by
  @Input() sortDirection?: 'asc' | 'desc' = 'asc';

  @Output() didActionItem:  EventEmitter<{action: AlOptionItem, item: any}> = new EventEmitter();
  @Output() didActionMultiItems: EventEmitter<{action: AlOptionItem, items: any[]}> = new EventEmitter();
  @Output() didSelectRow: EventEmitter<any> = new EventEmitter();
  @Output() didFilter: EventEmitter<any> = new EventEmitter();
  @Output() didSearch: EventEmitter<any> = new EventEmitter();
  @Output() didSort: EventEmitter<any> = new EventEmitter();
  @Output() didChangeResultsPerPage: EventEmitter<number> = new EventEmitter();
  @Output() didNextPage: EventEmitter<void> = new EventEmitter();
  @Output() didBackPage: EventEmitter<void> = new EventEmitter();

  public get columnType(): typeof ColumnType {
    return ColumnType;
  }

  activeActionMenuRow = -1;
  visibleColumns: string[];
  defaultMinColWidth: number;
  defaultMaxColWidth = 400;

  dataSource$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]); // the data source. When this changes, it updates the displayed data.
  displayedData$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]); // the data supplied to the table cdk for display.
  displayedColumns$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  resultsCount$: BehaviorSubject<number> = new BehaviorSubject(0);
  filters$: BehaviorSubject<AlOptionItem[]> = new BehaviorSubject([]);

  columnOptions: AlOptionItem[];
  filters: AlOptionItem[] = [];
  selectedRow: number;
  rowIndexesChecked: number[] = [];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['data']) {
      this.dataSource$.next(changes.data.currentValue);
    }
  }

  ngOnInit(): void {

    this.columnOptions = this.columns.map(column => {
      return {
        label: column.header,
        value: column.field,
        selected: !column.hidden
      };
    });

    this.defineFilters(this.columns);
    this.filters$.subscribe(filters => {
      this.filters = filters;
    });

    this.dataSource$.next(this.data);

    // Subscribe the columns displayed to changes
    this.displayedColumns$.subscribe();
    this.showColumns(this.columns);

    this.dataSource$.subscribe(data => {
      this.displayedData$.next(data);
      this.resultsCount$.next(data.length);
    });
  }

  /**
   * Defines the list of filters to pass to the table header area
   * @param columns 
   */
  defineFilters(columns: ColumnDef[]) {
    let filters = [];

    columns.forEach(column => {
      // if (!column.hidden && column.filters) {
      if (column.filters) {
        let filter: AlOptionItem;
        filter = {
          label: column.header,
          value: column.field,
          items: column.filters
        }
        filters.push(filter);
      }
    });

    this.filters$.next(filters);
  }

  /**
   * Defines the visible columns for the table and the order in which to show them.
   */
  public showColumns(columns: ColumnDef[]) {
    const visibleHeaders = columns.filter((col: ColumnDef) => {
      return !col.hidden;
    }).map((col: ColumnDef) => col.header);

    this.displayedColumns$.next([
      ...(this.actions ? ['actions'] : []),
      ...(this.checkboxRows ? ['checkboxRows'] : []),
      ...visibleHeaders
    ]);
  }

  applyColumnConfig(columnOptions: AlOptionItem[]) {

    let displayColumns: ColumnDef[] = columnOptions.map(col => {
      let columnDef = this.columns.find(({field}) => {
        return field === col.value;
      });

      // ensure that when a column is removed from view, the filters are removed too.
      // if (!col.selected && columnDef.filters) {
      //   columnDef.filters.forEach(filter => {
      //     filter.selected = false;
      //   });
      // }

      columnDef.hidden = !col.selected;
      return columnDef;
    });

    this.showColumns(displayColumns);
    this.defineFilters(displayColumns);
  }

  /**
   * Emits the sort key when a column is selected for sorting.
   * @param key The value of the column field to sort by
   */
  public adjustSort(key: string) {
    this.didSort.emit(key);
  }

  /**
   * Emits the selected action when a user selects an action item.
   * @param action The $event emitted
   * @param item The action item selected
   */
  public actionSelected(action, item) {
    this.didActionItem.emit({action, item});
    this.actionMenu.forEach((menu) => menu.close());
  }

  /**
   * When a user selects a row
   * @param index The table row index
   * @param item The item selected
   */
  public rowSelected(index, item) {
    if (this.selectableRows) {
      this.selectedRow = index;
      this.didSelectRow.emit(item);
    }
  }

  public checkAllRows(checked) {
    this.rowIndexesChecked = [];

    this.displayedData$.value.forEach((row, index) => {
      row.checked = checked;
      if (row.checked) {
        this.rowIndexesChecked.push(index);
      }
    });
  }

  /**
   * When a row checkbox is checked/unchecked
   * @param checked The checkbox value of the checked/unchecked checkbox
   * @param index The row index of the checked/unchecked item
   */
  public didCheckRow(checked: boolean, index: number) {
    if (checked) {
      this.rowIndexesChecked.push(index);
    } else {
      const removeRowIndex = this.rowIndexesChecked.findIndex(rowIndex => {
        return rowIndex === index;
      });

      this.rowIndexesChecked.splice(removeRowIndex, 1);
    }
  }

  /**
   * Emits the selected action for multiple selected rows and the array of checked row indexes.
   * @param action The action menu item
   */
  public actionMultiItems(action: AlOptionItem) {
    this.multiSelectActionMenu.close();
    this.didActionMultiItems.emit({action, items: this.rowIndexesChecked});
  }

  /**
   * Emits the search term when a user types in the search box
   * @param term The search term entered
   */
  public didApplySearch(term): void {
    this.didSearch.emit(term);
  }

  /**
   * Emits the filter used when a user applies filter/s
   * @param filter The filter applied
   */
  public didApplyFilter(filter: {field: string, values: any[]}): void {
    this.didFilter.emit(filter);
  }

  public selectNumberOfResultsPerPage(selected: AlOptionItem) {
    this.resultsPerPage.close();
    this.resultsPerPage.label = selected.value + ' per page';
    this.didChangeResultsPerPage.emit(selected.value);
  }



}
