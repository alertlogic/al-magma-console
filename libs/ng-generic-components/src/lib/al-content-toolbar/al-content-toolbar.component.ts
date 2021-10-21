import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { AlSearchBarComponent } from '../al-search-bar/al-search-bar.component';
import { AlToolbarContentConfig, AlViewByItem } from '../types/al-generic.types';

@Component({
    selector: 'al-content-toolbar',
    templateUrl: './al-content-toolbar.component.html',
    styleUrls: ['./al-content-toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AlContentToolbarComponent {
    @Input() config: AlToolbarContentConfig;
    @Output() onOrderBy: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSearched: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSortSelection: EventEmitter<string> = new EventEmitter<string>();
    @Output() onGroupSelection: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSelectAll: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() onViewSelection: EventEmitter<string> = new EventEmitter<string>();

    @ViewChild('alSearchBar') alSearchBar: AlSearchBarComponent;

    public state = {
        showSelectAll: false,
        selectAll: false,
        showSortBy: false,
        sort: {
            options: [] as SelectItem[],
            selectedOption: '',
            order: 'asc'
        },
        showGroupBy: false,
        group: {
            options: [] as SelectItem[],
            selectedOption: ''
        },
        showSearch: true,
        search: {
            maxSearchLength: 0,
            textPlaceHolder: ''
        },
        showViewBy: false,
        viewBy:[] as AlViewByItem[],
        viewSelected:''
    };

    public showDateSelector: boolean;

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty('config')) {
            Object.assign(this.state, this.config);
            if(this.state.viewBy && this.state.viewBy.length){
                this.state.viewBy.forEach(viewDef=>{
                    if(viewDef.default) {
                        this.state.viewSelected = viewDef.value;
                    }
                });
            }
        }
    }

    public selectAllValues() {
        this.onSelectAll.emit(this.state.selectAll);
    }

    public sort() {
        this.state.sort.order = this.state.sort.order === 'asc' ? 'desc' : 'asc';
        this.onOrderBy.emit(this.state.sort.order);
    }

    public handleSortSelection() {
        if (this.state.sort.selectedOption) {
            this.onSortSelection.emit(this.state.sort.selectedOption);
        }
    }

    public handleGroupSelection() {
        if (this.state.group.selectedOption) {
            this.onGroupSelection.emit(this.state.group.selectedOption);
        }
    }

    public handleViewSelection() {
        if(this.state.viewSelected){
            this.onViewSelection.emit(this.state.viewSelected);
        }
    }

    /**
      * Emit the event search
      */
    public applyTextFilter(searchInput: string) {
        this.onSearched.emit(searchInput);
    }

    public setTextFilter(searchInput: string) {
        this.alSearchBar.searchControl.setValue(searchInput);
    }

    public uncheckAllOption() {
        this.state.selectAll = false;
    }
}
