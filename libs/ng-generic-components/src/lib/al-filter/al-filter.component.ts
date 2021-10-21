import { OverlayPanel } from 'primeng/overlaypanel';
import { Component, Input, Output, EventEmitter, SimpleChanges, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { AlFilterDescriptor, AlUiFilter, AlUiFilterValue } from './al-filter-descriptor.type';
import { AlCardstackValueDescriptor } from '@al/core';

@Component({
    selector: 'al-filter',
    templateUrl: './al-filter.component.html',
    styleUrls: ['./al-filter.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AlFilterComponent {

    @Input() filters: AlUiFilter[] = [];
    @Input() alFilterConfig: AlFilterDescriptor = {};

    @Output() onClick: EventEmitter<AlUiFilterValue> = new EventEmitter();
    @Output() onClearAllFilters: EventEmitter<any> = new EventEmitter();

    @ViewChild('popoverModal') popoverModal !: OverlayPanel;
    @ViewChild('searchFilterKey', {static:false}) searchFilterKey!: ElementRef;


    public filterConfig = {
        showFiltersCount: true,
        hideEmptyFilterValues: false,
        hideNotSelectedValues: false,
        filterValueLimit: 10,
        filterValueIncrement: 10,
        expanded: true,  // Show view expanded or collapse
        showMoreType: "plain",
        showClearFilter: true,
        showSearch:true,
        showToolTip:false,
        toolTipText:'',
        helpText:'',
        showHelpText:false,
        highlight:false,
        activeIcon: false,
        showMoreZeros: false,
        showMoreNoActive: false,
    };
    public searchShowMorekey: string = "";
    public clearFilter: boolean = false;

    positionLeft = '260px';
    public marginStyle = { 'margin-left': this.positionLeft };
    public lastFilterSelection: any = null;

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty('alFilterConfig')) {
            Object.assign(this.filterConfig, this.alFilterConfig);
        }
        this.setUpFilterData();

    }
    public selectedFilter(vDescriptor: AlUiFilterValue, event: Event) {
        this.lastFilterSelection = event.target;
        if (this.filterConfig.showMoreType === 'popover' && this.popoverModal) {
             this.popoverModal.hide();
        }
        this.onClick.emit(vDescriptor);
    }

    public showMoreFilterValues(filterProperty: AlUiFilter) {
        if (this.filterConfig) {
            filterProperty.shown = Math.min(filterProperty.shown + this.filterConfig.filterValueIncrement, filterProperty.values.length);
        }
    }

    public onFilterOpened(filterProperty: AlUiFilter) {
        //  Reset the number of shown entries back to a reasonable default
        if (this.filterConfig) {
            filterProperty.shown = Math.min(filterProperty.values.length, this.filterConfig.filterValueLimit);

            // compensating for the show more so you dont show more and then get 1
            if (filterProperty.values.length - 1 === this.filterConfig.filterValueLimit) {
                filterProperty.shown = filterProperty.values.length;
            }
        }
    }

    public filterTrackByFn(index: number, item: AlUiFilter): string {
        return item.property;
    }

    public filterItemTrackByFn(index: number, item: AlUiFilterValue): string {
        return item.valueKey;
    }

    public applyShowMoreSearchFilter(searchInput: string) {
        this.searchShowMorekey = searchInput;
    }


    public toFilterValue(vDescr: AlCardstackValueDescriptor): AlUiFilterValue {
        let value = vDescr as AlUiFilterValue;
        value.cssClasses = value.cssClasses || [];
        return value;
    }

    public clearAllFilters() {
        if (this.searchFilterKey) {
             this.searchFilterKey.nativeElement.value = '';
        }
        this.clearFilter = false;
        this.onClearAllFilters.emit();
    }
    private classifyFilterValue(value: AlUiFilterValue, activeFilter: boolean | undefined) {
        value.cssClasses = [];
        if (value.metadata && 'borderLeft' in value.metadata) {
            value.cssClasses.push(value.metadata.borderLeft as string);
        }
        if (value.activeFilter) {
            value.cssClasses.push("al-bold");     //  If it's active, make it bold!
        } else if (value.count === 0 && this.filterConfig!.hideEmptyFilterValues) {
            value.cssClasses.push("hide");
        } else if(activeFilter && this.filterConfig!.hideNotSelectedValues ){
            value.cssClasses.push("hide");
        }
    }
    private setUpFilterData() {
        this.clearFilter = false;

        const auxFn = (filters: AlUiFilter[]) => {
            for (let i = 0; i < filters.length; i++) {
                const filter = filters[i];
                if(filter.children){
                    auxFn(filter.children);
                }
                filter.shown = filter.activeFilter || (filter.values.length < this.filterConfig.filterValueLimit + 2) ?
                    filter.values.length : this.filterConfig.filterValueLimit;  // don't bother hiding fewer than 3 overflow items and Reset the number of shown for active filters;
                filter.values = filter.values.map(value => this.toFilterValue(value));

                // Logic to show in the show more the filters that are not active
                if(this.filterConfig!.showMoreNoActive && filter.values.some((v) => v.activeFilter)) {
                    const totalNoActiveCount = filter.values.filter((v) => !v.activeFilter).length;
                    filter.values = filter.values.sort((a, b) =>  (a.activeFilter === b.activeFilter) ? 0 : a.activeFilter ? -1 : 1);
                    filter.shown = filter.values.length - totalNoActiveCount;
                }

                if(this.filterConfig!.showMoreZeros){
                    const totalZeros = filter.values.filter((v) => v.count === 0).length;
                    filter.values = filter.values.sort((a, b) => {
                        return a.activeFilter ? -1 : (b.count ?? 0) - (a.count ?? 0);
                    });
                    if(this.filterConfig!.showMoreNoActive && filter.values.some((v) => v.activeFilter)){
                        const totalToHidden = filter.values.filter((v) => (v.count === 0 && !v.activeFilter) || !v.activeFilter).length;
                        filter.shown = filter.values.length - totalToHidden;
                    } else {
                        filter.shown = filter.values.length - totalZeros;
                    }
                }

                filter.values.forEach(filterValue => {
                    this.classifyFilterValue(filterValue as AlUiFilterValue, filter.activeFilter);
                });
                if (filter.activeFilter) {
                    this.clearFilter = true;
                }
            }
        };
        auxFn(this.filters);
    }

}
