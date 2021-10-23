import { debounceTime } from 'rxjs/operators';
/**
 * al-header-nav-tool
 *
 * @author Jiovanny Ibarguen <jibarguen@alertlogic.com>,
 * @author Juan Sanchez <juan.sanchez@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2017
 *
 * Sample about how to use it
 * <al-header-nav-tool [config]="headerNavToolConf" (onOpenedForm)="onOpenForm($event)" (onArchived)="onArchive($event)"
 *      (onSettingMenu)="onSettingMenu($event)" >
 * </al-header-nav-tool>
 * where headerNavToolConf = {
        title: "Navigation Tools Component",
        withIconTitle: true,
        iconTitle:{
            iconClass:'material-icons',
            icon:'add'
        },
        sortItems: [
            {
                name: 'type',
                caption: 'Type',
                ascending: false,
                width: '72px',
                align: 'left'
            }
        ],
        selectedSortName: 'type',
        rowLeftPadding: '20px',
        enableSortBySelect: false,
        isArchiveEnable: true,
        archiveTitle: 'Show Archive',
        isSearchEnable: true,
        topRowAligned: false,
        textPlaceHolder: 'Type Search Terms',
        isSettingsEnable: true,
        settingsMenuOptions: [
            {
                name: "Mass Edit",
                value: "massEdit"
            },
            {
                name: "Export",
                value: "export"
            },
            {
                name: "Import",
                value: "import"
            },
        ],
        buttonPlusMenu: false,
        menuAddTitle: 'Add new deployment',
        menuAddItems: [
            {
                id:'aws',
                description: 'Amazon web service',
                icon:'al al-aws',
                badge: 'badge-aws'
            },
            {
                id:'azure',
                description: 'Microsoft azure',
                icon:'al al-azure',
                badge: 'badge-azure'
            }
        ]
    };
 */
import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { FormControl, Validators } from '@angular/forms';
import { AlMultiSelectComponent } from '../al-multi-select/al-multi-select.component';
import { AlSelectorConfig } from "../al-order-selector/al-order-selector.component";

export interface MenuAddIconItem {
    id: string;
    description: string;
    icon: string;
    badge: string;
    matIcon?:string;
}

export interface HeaderSortItem {
    name: string;
    caption?:string;
    ascending?:boolean;
    width?:string;
    align?:string;
}

type NameValue = { name: string; value: string };

export interface AlHeaderNavToolConfig {
    alSelectorConfig?: AlSelectorConfig;
    archiveTitle?: string;
    buttonPlusMenu?: boolean;
    buttonPlusMenuToggle?: boolean;
    currentSearch?: string;
    currentSort?:string;
    enableAlSelector?: boolean;
    enableMultipleFilter: boolean;
    enableSortBySelect: boolean;
    iconTitle: { icon: string; iconClass: string; };
    iconWidth?: string;
    isArchiveEnable: boolean;
    isSearchEnable?: boolean;
    isSettingsEnable: boolean;
    maxSearchLength?: ''|number;
    menuAddItems: Array<MenuAddIconItem>;
    menuAddTitle: string;
    multiSelectConfig?: { labelToBind: string; valueToBind: string; placeholder: string; groupBy: string; items: any[]; selectedItems: any[] };
    rowLeftPadding: string;
    selectedSortName?: string;
    settingsMenuOptions?: Array<NameValue>;
    sortItems?: HeaderSortItem[];
    textPlaceHolder: string;
    title: string;
    titleClass?: string;
    titleLeftPadding?: string;
    topRowAligned?: boolean;
    withIconTitle: boolean;
}

@Component({
    selector: 'al-header-nav-tool',
    templateUrl: './al-header-nav-tool.component.html',
    styleUrls: ['./al-header-nav-tool.component.scss']
})
export class AlHeaderNavToolComponent implements OnInit, AfterViewInit {
    private delayDebounce: number = 500;
    public currentSortItem: string = "";
    public showArchived: boolean = false;

    /**
     *  External accessible inputs
     */
    @Input() config: AlHeaderNavToolConfig = {
        // Title and title's icon config
        title: '',// string title in the list header
        titleClass: '',
        titleLeftPadding: '', // Left padding to apply on the title
        withIconTitle: false,
        iconTitle: null, // icon title configuration
        iconWidth: '72px', // Width for the icon - Default to 72px
        buttonPlusMenu: false,
        buttonPlusMenuToggle: false,
        menuAddTitle: '',
        menuAddItems: [],

        // Sorting config
        enableSortBySelect: false, // this is to configure the way to sort if it is in a table or using a select
        sortItems: [], // Array<any> options to sort
        // Enable the component AlSelector, for filtering and ordering elements
        enableAlSelector: false,
        alSelectorConfig: {
            isChecked: false,
            placeholder: '',
            selectedOption: '',
            order: '',
            options: [
            ],
            border: false
        }, // JSon
        selectedSortName: '', // string default sort value
        rowLeftPadding: '0', // string
        topRowAligned: false, // useful when you need title aligned vertically with plus button

        // Filtering config
        enableMultipleFilter: false, // boolean, this is to configure the way to sort if it is in a table or using a select
        multiSelectConfig: {
            placeholder: "Select Filters",
            items: [],
            selectedItems: [],
            labelToBind: "",
            valueToBind: "",
            groupBy: ""
        },

        // Search Config
        isSearchEnable: true, // show/hide the search input
        textPlaceHolder: '', // the text placeholder for the search input
        currentSearch: '', // by default search
        maxSearchLength: '', // maxlength of search - default '' deactivated

        // Archive Config
        isArchiveEnable: false, // to enable or disable the archive option
        archiveTitle: 'Show Archive',

        // Setting's Menu
        isSettingsEnable: false,
        settingsMenuOptions: []
    };

    public alSelectorConfig: AlSelectorConfig = {
        isChecked: false,
        placeholder: '',
        selectedOption: '',
        order: '',
        options: [
        ]
    };

    public searchControl: FormControl = this.config.maxSearchLength === '' ? new FormControl() : new FormControl(Validators.maxLength(this.config.maxSearchLength));


    /**
     * Outputs
     */
    @Output() onSearched: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSorted: EventEmitter<HeaderSortItem|string> = new EventEmitter<HeaderSortItem|string>();
    @Output() onFiltered: EventEmitter<any> = new EventEmitter();
    @Output() onArchived: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() onOpenedForm: EventEmitter<MenuAddIconItem|undefined> = new EventEmitter<MenuAddIconItem|undefined>();
    @Output() onSettingMenu: EventEmitter<NameValue> = new EventEmitter<NameValue>();
    @Output() onChangeGrouping: EventEmitter<MatSelectChange> = new EventEmitter<MatSelectChange>();

    /**
     * Close Menu Plus
     */

    @ViewChild("elementMenuPlus", { read: ElementRef }) elementMenuPlus: ElementRef;

    @ViewChild('alMultiSelect')
    public alMultiSelectComponent: AlMultiSelectComponent;

    @ViewChild('matSelect')
    public matSelect: MatSelect;

    @HostListener('document:click', ['$event']) onClick(event) {
        this.listenAllClicks(event);
    }
    constructor() { }

    ngOnInit() {
        if (this.config.currentSort !== '') {
            this.currentSortItem = this.config.currentSort;
        }
        if (this.config.currentSearch) {
            this.searchControl.setValue(this.config.currentSearch);
        }
        // i need to enforce default value if not provided
        if (!this.config.hasOwnProperty("isSearchEnable")) {
            this.config.isSearchEnable = true;
        }
        if(this.config.enableAlSelector){
            this.alSelectorConfig.options = this.config.alSelectorConfig.options;
            this.alSelectorConfig.selectedOption = this.config.alSelectorConfig.selectedOption;
            this.alSelectorConfig.order = this.config.alSelectorConfig.order;
            if(this.config.alSelectorConfig.hasOwnProperty('groupSelect') && this.config.alSelectorConfig.groupSelect){
                this.alSelectorConfig.groupSelect = this.config.alSelectorConfig.groupSelect;
                this.alSelectorConfig.border = this.config.alSelectorConfig.border;
            }
        }
    }

    /**
     * Emit the event search
     */
    ngAfterViewInit() {
        this.searchControl.valueChanges.pipe(
            debounceTime(this.delayDebounce)) // delay search
            .subscribe(newValue => {
                if (this.searchControl.valid) {
                    this.onSearched.emit(this.searchControl.value);
                }
            });
    }

    /**
     * Clears the current search.
     */
    clearSearch() {
        this.searchControl.setValue('');
    }

    /**
     * Emit the event when the user sort
     */
    onSort(sortItem:HeaderSortItem) {
        sortItem.ascending = !sortItem.ascending;
        this.onSorted.emit(sortItem);
    }
    /**
     * Emit the event when the user sort with AlSelector component
     */
    onSortAlSelector(sort:string) {
        this.onSorted.emit(sort);
    }
    onFilterAlSelector(select: string) {
        this.onFiltered.emit(select);
    }

    /**
     * Emit the event when the user filter
     */
    onFilter(filterItems: Array<any>) {
        this.onFiltered.emit(filterItems);
    }

    /**
     * Emit the event when the user clicks archive bottom
     */
    onArchive() {
        this.onArchived.emit(this.showArchived);
    }

    /**
     * Emit the event when the user clicks open form bottom
     */
    onOpenForm(openForm) {
        this.onOpenedForm.emit(openForm);
    }

    /**
     * Emit the event when the user clicks a settings's menu option
     */
    onSettingMenuOption(menuOption:NameValue) {
        this.onSettingMenu.emit(menuOption);
    }

    /*
     * Enable the additional menu in Add button
     */
    enableButtonPlusMenu() {
        this.config.buttonPlusMenuToggle = true;
    }

    /*
     * Disable the additional menu in Add button
     */
    listenAllClicks(event: Event) {
        if (event && this.elementMenuPlus !== undefined) {
            if (!this.elementMenuPlus.nativeElement.contains(event.target)) {
                this.config.buttonPlusMenuToggle = false;
                event.stopPropagation();
            }
        }
    }

    /**
     * Emit the event when the user change group option
     * @param event: MatSelectChange
     */
    changeGroupingAlSelector(event: MatSelectChange){
        this.onChangeGrouping.emit(event);
    }
}
