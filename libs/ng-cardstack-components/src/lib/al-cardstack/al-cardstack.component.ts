import {
    AlCardstackItem,
    AlCardstackPropertyDescriptor,
    AlCardstackValueDescriptor,
    AlCardstackView,
} from '@al/core';
import {
    AlContentToolbarComponent,
    AlStateFilterDescriptor,
    AlToolbarContentConfig,
    AlViewHelperComponent,
    AlFilterDescriptor,
    AlUiFilter,
    AlUiFilterValue,
    AlFilterComponent
} from '@al/ng-generic-components';
import {
    AlNavigationService,
    AlNavigationSidenavMounted,
} from '@al/ng-navigation-components';
import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    AlCardstackViewCharacteristics
} from '../types/al-cardstack.types';

@Component({
    selector: 'al-cardstack',
    templateUrl: './al-cardstack.component.html',
    styleUrls: ['./al-cardstack.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AlCardstackComponent implements OnInit, OnChanges, OnDestroy {
    /**
     * A reference to the view, which provides
     *     - grouping, sorting, and filtering of view items
     *     - raw methods to retrieve/interpret data
     *     - a reference to the AlCardstackCharacteristics that describe the available functionality.
     */
    @Input()
    public view!: AlCardstackView;

    /**
     * A reference to a template describing a card in its compact form
     */
    @Input()
    public cardCompact?: TemplateRef<unknown>;

    /**
     * A reference to a template describing a card in its expanded form
     */
    @Input()
    public cardExpanded?: TemplateRef<unknown>;

    /**
     * A modifier to the appearance of the cardstack.  This should be added as a class to the container
     * to allow other components or apps to customize the visual appearance of the components.
     */
    @Input()
    public theme: string = "default";

    @Input() public description: null|string = null;

    public filters: AlUiFilter[] = [];
    public count: number = 0;

    public characteristics!: AlCardstackViewCharacteristics;
    public toolbarConfig: AlToolbarContentConfig = {
        sort: {
            options: [],
            selectedOption: '',
            order: 'asc'
        },
        group: {
            options: []
        },
        selectAll: false
    };

    @ViewChild('alfilter', {static:false}) alfilter!: AlFilterComponent;

    @ViewChild('alCardStackFilter', {static:false}) alCardStackFilter!: ElementRef;

    @ViewChild(forwardRef(() => AlViewHelperComponent), {static:false}) viewHelper?: AlViewHelperComponent;

    @ViewChild('alContentToolbar', {static:false}) alContentToolbar!: AlContentToolbarComponent;

    @Input()
    public aggregateCount?: {
        [property: string]: {
            [value: string]: number | null;
        };
    };

    @Input()
    public forceToShowTabs: boolean = false;

    @Output() onCheckAll = new EventEmitter<boolean>();
    @Output() onScrollDown: EventEmitter<void> = new EventEmitter<void>();
    @Output() onAddButton = new EventEmitter<{event:MouseEvent}>();
    @Output() onViewChanged = new EventEmitter<string>();
    @Output() onStateFilterChanged = new EventEmitter<AlStateFilterDescriptor>();
    @Output() onClearAllFilters: EventEmitter<void> = new EventEmitter<void>();
    @Output() onAlFilterChanged = new EventEmitter<AlUiFilterValue>();
    @Output() onSortBy = new EventEmitter<string>();
    @Output() onCardsChanged: EventEmitter<void> = new EventEmitter<void>();
    @Output() onTextFilterApplied: EventEmitter<string> = new EventEmitter<string>();

    public showTabs: boolean = false;
    public alFilterConfig : AlFilterDescriptor = {};
    public displayFilterSideNav = true;

    constructor(private alNavigation:AlNavigationService) { }

    ngOnInit() {
        if (!this.view) {
            throw new Error("Invalid usage: the `al-cardstack` element requires a [view] input.");
        }

        if (this.view.characteristics) {
            this.setCharacteristics();
        }

        setTimeout(() => {
            this.showTabs = this.alNavigation.getExperience() === 'default' || this.forceToShowTabs;
        });

        this.view.onFiltersChanged = () => {
            this.setUpFilterData();
        };

        if (this.view.autoDefineCardsChanged) {
            this.view.onCardsChanged = () => {
                this.onCardsChanged.emit();
            };
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        this.updateFilterData();
    }

    ngOnDestroy() {
        const event = new AlNavigationSidenavMounted( null, false );
        this.alNavigation.events.trigger(event);
    }

    public setCharacteristics(){
        this.characteristics = this.view.characteristics as AlCardstackViewCharacteristics;

        if (this.characteristics && this.characteristics.header && this.characteristics.header.description) {
            this.description = this.characteristics.header.description;
        }

        this.setUpFilterData();

        if (this.characteristics) {
            Object.assign(this.toolbarConfig, this.characteristics.toolbarConfig);
            Object.assign(this.alFilterConfig, this.characteristics.alFilterConfig);
            if(!this.alFilterConfig.filterValueIncrement || !this.alFilterConfig.filterValueLimit || !this.alFilterConfig.hideEmptyFilterValues){
                this.alFilterConfig.filterValueIncrement =this.characteristics.filterValueIncrement;
                this.alFilterConfig.filterValueLimit =this.characteristics.filterValueLimit;
                this.alFilterConfig.hideEmptyFilterValues = this.characteristics.hideEmptyFilterValues;
            }
        }

        if (this.toolbarConfig.showSortBy) {
            this.setUpSortDropdownData();
        }

        if (this.toolbarConfig.showGroupBy) {
            this.setUpGroupByDropdownData();
        }

        if(this.characteristics.displayFilterSideNav !== undefined) {
            this.displayFilterSideNav = this.characteristics.displayFilterSideNav;
        }
    }

    public updateToolbarConfig(config: AlToolbarContentConfig) {
        this.toolbarConfig = Object.assign({},config);
    }

    setActiveFilter( vDescriptor:AlUiFilterValue, unused?:any ) {
        if ( vDescriptor.activeFilter ) {
            this.view.removeFilterBy(vDescriptor);
        } else {
            this.view.applyFilterBy(vDescriptor);
        }
        this.onAlFilterChanged.emit(vDescriptor);
        this.resetSelectAll();
    }


    /**
     * Get the count to be shown in the filter
     * @param column
     * @param data
     */
    getFilterCount(column: AlCardstackPropertyDescriptor, data: AlCardstackValueDescriptor): number {
        let count: number = 0;
        if (this.view.aggregations.properties[column.property]) {
            count = this.view.aggregations.properties[column.property][data.value] || 0;
        }
        if (data.hasOwnProperty('count')) {
            count = data.count || 0;
        }
        return count;
    }

    /**
     * This method captures a snapshot of the filter state managed by the underlying `AlCardstackView` and decorates it with display-specific data.
     */
    setUpFilterData() {
        if ( ! this.view.characteristics) {
            return;
        }
        this.filters = [];

        this.view.characteristics.filterableBy.forEach((item) => {
            let pDescr: AlCardstackPropertyDescriptor = {...this.view.getProperty(item)};
            pDescr = this.reduceAllFilters(pDescr);
            let filter = this.toFilter( pDescr );
            this.filters.push(filter);
        });

        this.filters.sort((a,b) => {
            const sortOrderCompareA = a.sortPositionIndex ? a.sortPositionIndex : 0;
            const sortOrderCompareB = b.sortPositionIndex ? b.sortPositionIndex : 0;
            return sortOrderCompareA - sortOrderCompareB;
        });
    }

    /**
     * This method updates left-side filters with updated counts
     */
    updateFilterData() {
        this.filters.forEach((pDescr) => {
            if ( ! ( pDescr.property in this.view.aggregations.properties ) ) {
                return;
            }
            pDescr.values.forEach((vDescr) => {
                if ( vDescr.value in this.view.aggregations.properties[pDescr.property] ) {
                    vDescr.count = this.view.aggregations.properties[pDescr.property][vDescr.value] || 0;
                } else {
                    vDescr.count = 0;
                }
            });
        });
        this.setUpFilterData(); // this will update css
    }

    setUpSortDropdownData() {
        if (!this.view.characteristics) {
            return;
        }
        if (!this.toolbarConfig || !this.toolbarConfig.sort || !this.toolbarConfig.sort.options || !Array.isArray(this.toolbarConfig.sort.options)) {
            return;
        }
        this.toolbarConfig.sort.options  = [];
        const options = this.toolbarConfig.sort.options;
        this.view.characteristics.sortableBy.forEach((data) => {
            const sortdata: AlCardstackPropertyDescriptor = this.view.getProperty(data as string); // data as AlCardstackPropertyDescriptor;
            options.push({
                label: `Sort by ${sortdata.caption}`,
                value: sortdata.property,
            });
        });

        if(options.length){
            this.view.sortingBy = this.view.getProperty(options[0].value);
        }

        this.view.sortOrder = this.toolbarConfig.sort.order === 'asc' ? 'asc' : 'desc';
    }

    setUpGroupByDropdownData() {

        if (!this.view.characteristics) {
            return;
        }
        if (!this.toolbarConfig.group || !this.toolbarConfig.group.options || !Array.isArray(this.toolbarConfig.group.options)) {
            return;
        }
        this.toolbarConfig.group.options = [];
        const options = this.toolbarConfig.group.options;
        this.view.characteristics.groupableBy.forEach((data) => {
            const dataDesc: AlCardstackPropertyDescriptor = this.view.getProperty(data as string); // data as AlCardstackPropertyDescriptor;
            options.push({
                label: `Group by ${dataDesc.caption}`,
                value: dataDesc.property,
            });
        });
        if (this.view.characteristics.groupableBy && this.view.characteristics.groupableBy.length > 0){
            const first = this.view.characteristics.groupableBy[0];
            if(typeof first === 'string'){
                this.groupByChange(first);
            }
        }
    }

    dateRangeSelected(date: Date[]) {
        this.view.dateRange = date;
        this.view.continuation = undefined;
        this.view.start();
    }


    sortByOrder(order: string) {
        this.view.sortOrder = order === 'asc' ? 'asc' : 'desc';
        if (this.view.sortingBy) {
            this.view.applySortBy(this.view.sortingBy, order);
        }
        this.resetSelectAll();
    }

    resetSelectAll(){
        if(this.toolbarConfig.showSelectAll){
            this.toolbarConfig.selectAll = false;
            this.applySelect(false);
        }
    }

    applyTextFilter(searchValue: string) {
        this.view.applyTextFilter(searchValue);
        this.resetSelectAll();
        this.onTextFilterApplied.emit(searchValue);
    }

    groupByChange(groupBy:string){
        this.view.groupingBy = this.view.getProperty(groupBy);

    }

    sortByChanged(sortingParameter: string) {
        this.view.sortingBy = this.view.getProperty(sortingParameter);
        this.view.applySortBy(this.view.sortingBy, this.view.sortOrder.toUpperCase());
        this.onSortBy.emit(sortingParameter);
        this.resetSelectAll();
    }

    applySelect(checked: boolean) {
        this.view.applySelect(checked);
        this.view.cards = [... this.view.cards];
        this.onCheckAll.emit(checked);
    }

    viewChanged(viewName: string) {
        this.onViewChanged.emit(viewName);
    }

    updateCheckState() {
        const current = this.view.cards.filter((c) => c.checked);
        this.toolbarConfig.selectAll = current.length > 0 && current.length === this.view.cards.length;
        this.toolbarConfig = { ...this.toolbarConfig};
    }

    clearAllFilters() {
        this.onClearAllFilters.emit();
        this.view.clearFilters();
    }

    /**
     * Set the state filter and call start
     * can optionally prevent start being called by setting
     * skipFetchOnStateChange to true on the characteristics configuration
     * @param event
     */
    filterSelected(event: {originalEvent: Event; value: AlStateFilterDescriptor}) {
        if (this.characteristics) {
            this.characteristics.selectedState = event.value;
        }
        this.onStateFilterChanged.emit(event.value);
        if(this.characteristics.skipFetchOnStateChange) {
           return;
        }
        this.view.start();

    }

    @HostListener("window:scroll", [])
    onScroll(): void {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight
            && !this.view.loading && (this.view.remainingPages !== 0)) {
            this.view.continue().then(
                () => {
                    this.onScrollDown.emit();
                }
            );
        }
    }

    setInputTextFilter(searchValue: string){
        this.alContentToolbar.setTextFilter(searchValue);
    }

    public uncheckToolbarAllOption() {
        this.alContentToolbar.uncheckAllOption();
    }


    public cardTrackByFn(index:number, item:AlCardstackItem<unknown>): string {
        return item.id;
    }

    public cardGroupTrackByFn<T>(index:number, item:{ groupByValue?: string; cards: AlCardstackItem<T>[] }): string {
        return item.groupByValue || `${index}`;
    }

    /**
     * Handles user-initiated retries in the event of a view failure.  Note that this method must be an arrow function because it
     * is called anonymously/without `this`
     */
    public reloadView = () => {
        this.view.start();
    }

    /**
     * Completely resets state to zero
     */
    public clearState() {
        this.view.cards = [];
        this.view.characteristics = undefined;
        this.view.continuation = undefined;
        this.view.checked = false;
        this.view.activeFilters = [];
        this.toolbarConfig.selectAll = false;
        this.toolbarConfig = { ...this.toolbarConfig};
    }

    /**
     * Casts cardstack property descriptor to AlUiFilter and adds any missing extended properties
     */
    public toFilter( pDescr:AlCardstackPropertyDescriptor ):AlUiFilter {
        let filter = pDescr as AlUiFilter;
        filter.shown = filter.shown || 10;
        return filter;
    }


    private reduceAllFilters(descriptor: AlCardstackPropertyDescriptor): AlCardstackPropertyDescriptor {
        if ( this.view.reduceFilters && this.view.reduceFilters.hasOwnProperty( descriptor.property ) ) {
            const filters = this.view.reduceFilters[descriptor.property];
            if(filters.length === 0){
                descriptor.values = [];
            }else if (filters.length > 0){
                descriptor.values = descriptor.values.filter((d) => filters.indexOf(d.value) === -1 ? false : true);
            }
        }
        return descriptor;
    }
}
