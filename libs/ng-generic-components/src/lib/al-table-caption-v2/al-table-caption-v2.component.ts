import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MultiSelect } from 'primeng/multiselect';
import { AlSearchBarComponent } from "../al-search-bar/al-search-bar.component";
export interface DynamicTableColumns {
    field: string;
    header: string;
    width?: string;
}

@Component({
    selector: 'al-table-caption-v2',
    templateUrl: './al-table-caption-v2.component.html',
    styleUrls: ['./al-table-caption-v2.component.scss'],
})
export class AlTableCaptionV2 implements OnInit {
    // inputs
    @Input() cols: DynamicTableColumns[] = [];
    @Input() defaultColumns: DynamicTableColumns[] = [];
    @Input() donwloadLabel: string = "Download All";
    @Input() invalidSearchPatternText: string | null = null;
    @Input() searchPatternRegex: string | null = null;
    @Input() selectedColumns: DynamicTableColumns[] = [];
    @Input() showColumnsSelector: boolean = true;
    @Input() showDownload: boolean = false;
    @Input() showSearch: boolean = true;
    @Input() storageKey: string = "default-table-caption";
    @Input() useLocalStorage: boolean = true;


    // outputs
    @Output() onInvalidSearchPattern: EventEmitter<void> = new EventEmitter();
    @Output() onChangeColumns: EventEmitter<{ columns: DynamicTableColumns[] }> = new EventEmitter<{ columns: DynamicTableColumns[] }>();
    @Output() onDownload: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() onSearched: EventEmitter<string> = new EventEmitter<string>();

    @ViewChild(MultiSelect) multiSelect?: MultiSelect;
    @ViewChild('alSearchBar') alSearchBar?: AlSearchBarComponent;

    ngOnInit(): void {
        this.defaultColumns = this.inferDefaultColumns(this.defaultColumns, this.cols);
        this.selectedColumns = this.inferSelectedColumns(this.useLocalStorage, this.defaultColumns, this.cols, this.storageKey);
        if(this.useLocalStorage) {
            this.storeSelectedColumns(this.selectedColumns);
        }
    }

    public openMultiselect($event: MouseEvent): void {
        if (this.multiSelect) {
            this.multiSelect.show();
            $event.stopPropagation();
        }
    }

    public resetToDefaultColumns(): void {
        this.selectedColumns = this.defaultColumns;
        if (this.useLocalStorage) {
            this.storeSelectedColumns(this.selectedColumns);
        }
        this.onChangeColumns.emit({ columns: this.selectedColumns });
    }

    public storeSelectedColumns(columns: DynamicTableColumns[]): void {
        let localState: any = {};
        if (localStorage.getItem(this.storageKey)) {
            localState = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        }
        localState["selectedColumns"] = columns.map(column => column.field);
        localStorage.setItem(this.storageKey, JSON.stringify(localState));
    }

    public onSearchChanged($event: string): void {
        this.onSearched.emit($event);
    }

    public onDownloadAll(): void {
        this.onDownload.emit(true);
    }

    public onChangeSelectedColumns($event: {value: DynamicTableColumns[]}): void {
        this.selectedColumns = $event.value;
        if (this.useLocalStorage) {
            this.storeSelectedColumns(this.selectedColumns);
        }
        this.onChangeColumns.emit({ columns: this.selectedColumns });
    }

    private inferDefaultColumns(defaultColumns: DynamicTableColumns[], cols: DynamicTableColumns[]): DynamicTableColumns[] {
        return !!defaultColumns ? defaultColumns : cols;
    }

    private inferSelectedColumns(
        useLocalStorage: boolean, defaultColumns: DynamicTableColumns[], cols: DynamicTableColumns[], storageKey: string
    ): DynamicTableColumns[] {
        // all columns selected by default
        let selectedColumns = [...cols];
        // unless there are defalutColumns defined
        if(!!defaultColumns && defaultColumns.length > 0) {
            selectedColumns = defaultColumns;
        }
        // or there are selected columns stored in localstorage
        if(useLocalStorage) {
            const localState = JSON.parse(localStorage.getItem(storageKey) || '{}');
            if (!!localState && localState.hasOwnProperty("selectedColumns")) {
                const localSelectedColumns = cols.filter((column) => localState.selectedColumns.includes(column.field));
                selectedColumns = localSelectedColumns.sort((a, b) => {
                    const aIndex = localState.selectedColumns.indexOf(a.field);
                    const bIndex = localState.selectedColumns.indexOf(b.field);
                    return aIndex < bIndex ? -1 : aIndex > bIndex ? 1 : 0;
                });
            }
        }
        return selectedColumns;
    }

}
