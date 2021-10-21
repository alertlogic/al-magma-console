import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MultiSelect } from 'primeng/multiselect';
import { AlSearchBarComponent } from "../al-search-bar/al-search-bar.component";

@Component({
    selector: 'al-table-caption',
    templateUrl: './al-table-caption.component.html',
    styleUrls: ['./al-table-caption.component.scss'],
})
export class AlTableCaption implements OnInit {
    // inputs
    @Input() cols: any[] = [];
    @Input() defaultColumns: any[] = [];
    @Input() storageKey: string = "dynamic-table-default";
    @Input() showColumnsSelector : boolean = true;
    @Input() showSearch : boolean = true;
    @Input() showDownload: boolean = false;
    @Input() donwloadLabel: string = "Download All";
    @Input() useLocalStorage: boolean = true;
    @Input() get selectedColumns(): any[] {
        return this.selectedCols;
    }
    @Input() searchPatternRegex: string | null = null;
    @Input() invalidSearchPatternText: string | null = null;


    // outputs
    @Output() onSearched:EventEmitter<string> = new EventEmitter<string>();
    @Output() onChangeColumns:EventEmitter<any> = new EventEmitter<any>();
    @Output() onInvalidSearchPattern: EventEmitter<void> = new EventEmitter();
    @Output() onDownload:EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild(MultiSelect) multiSelect?: MultiSelect;
    @ViewChild('alSearchBar') alSearchBar?: AlSearchBarComponent;

    private selectedCols:any[] = [];

    ngOnInit(): void {
        const storage:string = localStorage.getItem(this.storageKey) || '{}';
        if (storage && storage !== '{}' && this.useLocalStorage) {
            const localState = JSON.parse(storage);
            if (localState) {
                if (localState.hasOwnProperty("columnOrder")) {
                    const columnOrder = localState.columnOrder;
                    const cols = this.cols.filter((column) => columnOrder.includes(column.field));
                    this.selectedCols = cols.sort((a, b) => {
                        const aIndex = columnOrder.indexOf(a.field);
                        const bIndex = columnOrder.indexOf(b.field);
                        return aIndex < bIndex ? -1 : aIndex > bIndex ? 1 : 0;
                    });
                }
                if (localState.hasOwnProperty("columnWidths")) {
                    const columnsWidths:string[] = localState.columnWidths.split(",");
                    columnsWidths.shift();
                    columnsWidths.pop();
                    for (let index = 0; index < columnsWidths.length; index++) {
                        this.selectedCols[index]["width"] = columnsWidths[index];
                    }
                }
            }
        } else if (this.defaultColumns.length > 0) {
            this.selectedCols = this.defaultColumns;
        } else {
            this.selectedCols = this.cols;
            this.defaultColumns = this.cols;
        }

        this.onChangeColumns.emit({columns: this.selectedCols});
    }

    public openMultiselect(e:any) {
        if(this.multiSelect) {
            this.multiSelect.show();
            e.stopPropagation();
        }
    }

    public resetDefaultColumns() {
        this.selectedCols = this.defaultColumns;

        if (this.useLocalStorage) {
            this.storeColumnsSelections(this.selectedCols);
        }

        this.onChangeColumns.emit({columns: this.selectedCols});
    }

    public storeColumnsSelections(columns:any[]) {
        let localState:any = {};
        if (localStorage.getItem(this.storageKey)) {
            localState = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            delete localState.columnWidths;
        }
        localState["columnOrder"] = [];
        columns.forEach((column) => {
            localState["columnOrder"].push(column.field);
        });

        localStorage.setItem(this.storageKey, JSON.stringify(localState));
    }

    public onSearchChanged(event:any) {
        this.onSearched.emit(event);
    }

    public onDownloadAll() {
        this.onDownload.emit(true);
    }

    set selectedColumns(val: any[]) {
        this.selectedCols = val;

        if (this.useLocalStorage) {
            this.storeColumnsSelections(this.selectedCols);
        }

        this.onChangeColumns.emit({columns: this.selectedCols});
    }

}
