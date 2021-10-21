import { AlCardstackItem, AIMSClient, AlSession, AlLocation } from '@al/core';
import {
    AlAlertDefinition,
} from '@al/gestalt';
import {
    AlActionFooterButtons,
    AlBaseCardConfig,
    AlBaseCardFooterActionEvent,
    AlBaseCardFooterActions,
    AlBaseCardItem,
    AlCardstackComponent,
    alEditDeleteFooterActions
} from '@al/ng-cardstack-components';
import {
    AlActionSnackbarElement,
    AlActionSnackbarEvent,
    AlToastMessage,
    AlToastService,
    AlViewHelperComponent,
    AlTrackingMetricEventName,
    AlTrackingMetricEventCategory
} from '@al/ng-generic-components';
import { AlNavigationService } from '@al/ng-navigation-components';
import {
    AfterViewInit,
    Component,
    OnInit,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewEncapsulation,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';
import {
    ConfirmationService,
} from 'primeng/api';
import { combineLatest } from 'rxjs';
import { AlSavedSearchComponent } from '../types/saved-search';


import { AlSavedSearchesFormComponent } from '../al-saved-searches-form/al-saved-searches-form.component';
import { AlNotificationReportScheduleFormComponent } from '../al-notification-report-schedule-form/al-notification-report-schedule-form.component';
import { ALCargoV2, ScheduledReportV2, SearchReportDefinitionV2 } from '@al/cargo';
import { AlSavedQueryV2, AlSuggestionsClientV2 } from '@al/suggestions';

interface ZeroStateConfig {
    icon: string;
    entityName: string;
    entityNamePlural: string;
    requiredAction: string;
}

@Component({
    selector: 'al-saved-searches-list',
    templateUrl: './al-saved-searches-list.component.html',
    styleUrls: ['./al-saved-searches-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AlSavedSearchesListComponent implements OnInit, AfterViewInit {

    // action snackbar variables
    public actionSnackbarText = '';
    public actionSnackbarVisible = false;
    public initialFilter = '';
    public actionSnackbarButtons: AlActionSnackbarElement[] = [
        {
            event: "edit",
            icon: "edit",
            text: "EDIT",
            visible: true,
            type: 'button'
        },
        {
            event: "add",
            icon: "add",
            text: "ADD SCHEDULE",
            visible: true,
            type: 'button'
        },
        {
            event: "delete",
            icon: "delete",
            text: "DELETE",
            visible: true,
            type: 'button'
        },
    ];

    // al-base-card variables
    public configAlBaseCard: AlBaseCardConfig = {
        toggleable: true,
        toggleableButton: true,
        checkable: true
    };

    public zeroStateConfig: ZeroStateConfig = {
        icon: 'announcement',
        entityName: 'saved search',
        entityNamePlural: 'saved searches',
        requiredAction: 'save any search'
    };

    public savedSearchCardstack?: AlSavedSearchComponent;
    public accountId: string = "";
    public timeoutShowMsg: number = 5000;
    public currentSelection: Array<AlCardstackItem<AlAlertDefinition>> = [];
    public viewError?:string|Error;

    @ViewChild('reportCardExpanded') reportCardExpanded?: TemplateRef<unknown>;
    @ViewChildren('alCardstack') cardstack!: QueryList<AlCardstackComponent>;
    @ViewChild('savedSearchForm') savedSearchForm!: AlSavedSearchesFormComponent;
    @ViewChild('savedSearchScheduleForm') savedSearchScheduleForm!: AlNotificationReportScheduleFormComponent;
    @ViewChild(AlViewHelperComponent, { static: true } ) viewHelper!:AlViewHelperComponent;

    private alCardstack?: AlCardstackComponent;

    constructor(
        private alToastService: AlToastService,
        private confirmationService: ConfirmationService,
        private navigation: AlNavigationService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(async (params) => {
            this.accountId = params.has('accountId') ? params.get( 'accountId' ) as string : AlSession.getActingAccountId();
            this.loadCardstack(this.accountId);
        }, (e) => {
            console.error(e);
        });
        this.route.queryParamMap.subscribe(async (queryParamMap) => {
            if (queryParamMap.has('scheduleId')) {
                const scheduleId = queryParamMap.get('scheduleId') as string;
                ALCargoV2.getSchedule(this.accountId, scheduleId).then(scheduleReport => {
                    this.initialFilter = (scheduleReport.definition as SearchReportDefinitionV2).saved_query_id;
                    this.savedSearchScheduleForm.setTitle("Edit Saved Search Schedule");
                    this.savedSearchScheduleForm.editModal(scheduleReport);
                });
            } else if ( queryParamMap.has( 'savedSearchId' ) ) {
                this.restoreSavedSearchEdit( queryParamMap.get( 'savedSearchId' ) as string );
            } else if ( queryParamMap.has( 'scheduledSearchId' ) ) {
                this.restoreScheduledSearchEdit( queryParamMap.get( 'scheduledSearchId' ) as string );
            }
        }, (e) => {
            console.error(e);
        });
    }

    async loadCardstack(accountId:string) {
        if (this.alCardstack) {
            this.alCardstack.clearState();
        }
        if (!this.savedSearchCardstack) {
            this.savedSearchCardstack = new AlSavedSearchComponent();
        }
        this.savedSearchCardstack.loading = true;
        this.closeActionSnackbar();
        this.currentSelection = [];

        try {
            await this.savedSearchCardstack.setAccount(accountId);
        } catch ( e ) {
            this.savedSearchCardstack.error = e;
        }

        this.reloadList();
    }

    async restoreSavedSearchEdit( savedSearchId:string ) {
        try {
            let savedSearch = await AlSuggestionsClientV2.getSavedQuery( this.accountId, savedSearchId );
            this.savedSearchForm.setTitle("Edit Saved Search");
            this.savedSearchForm.editModal(savedSearch);      /* WTH did these types diverge?  Bah! */
            this.closeActionSnackbar();
        } catch( e ) {
            this.viewError = e;
        }
    }

    async restoreScheduledSearchEdit( scheduledSearchId:string ) {
        try {
            let scheduledReport = await ALCargoV2.getSchedule(this.accountId, scheduledSearchId);
            this.savedSearchScheduleForm.setTitle("Edit Saved Search Schedule");
            this.savedSearchScheduleForm.editModal(scheduledReport);
            this.closeActionSnackbar();
        } catch( e ) {
            this.viewError = e;
        }
    }

    ngAfterViewInit() {
        this.alCardstack = this.cardstack.first ? this.cardstack.first : undefined;
        combineLatest([
            this.cardstack.changes,
            this.route.queryParamMap,
        ]).subscribe(([cardstack, queryParam]) => {
            if (!this.alCardstack) {
                this.alCardstack = cardstack.first;
            } else {
                if (queryParam.has('search') || this.initialFilter) {
                    this.alCardstack.setInputTextFilter(queryParam.get('search') || this.initialFilter);
                    this.initialFilter = '';
                    // clear out the query param
                    // search didnt have a 2 way upadate, so what was in the url was overwriting the search bar
                    this.router.navigate([], {
                        queryParams: {
                            search: null,
                        },
                        queryParamsHandling: 'merge'
                    });
                }
                setTimeout(() => { this.alCardstack && !this.alCardstack.view.textFilter && this.alCardstack.applyTextFilter(''); });
            }
        }, (error) => console.log(error));
    }

    onDeleteItemConfirmation(ids: string[]) {
        let message = '';
        let texts: {[key: string]:string};
        let header = '';
        if (ids.length > 1) {
            texts = this.getTextsByEntity(true);
            header = texts.confirmDeleteTitle;
            message = texts.confirmDeleteMultiple.replace('{0}', `${ids.length}`);
        } else {
            texts = this.getTextsByEntity();
            header = texts.confirmDeleteTitle;
            message = texts.confirmDeleteOne;
        }
        this.confirmationService.confirm({
            message,
            header,
            acceptLabel: "Delete",
            rejectLabel: "Cancel",
            accept: async () => {
                try {
                    await this.onDeleteSavedSearch(ids);
                    if (ids.length > 1) {
                        message = texts.successfulRemove.replace('{0}', `${ids.length}`);
                    } else {
                        message = texts.successfulRemove;
                    }
                    this.closeActionSnackbar();
                    this.showMessage(message);
                    if (this.alCardstack) {
                        this.alCardstack.uncheckToolbarAllOption();
                    }
                } catch (error) {
                    this.showGeneralErrorMessage("Something went wrong. Refresh the page and try again.");
                    this.actionSnackbarProcess();
                }
            },
        });
    }

    async onDeleteSavedSearch(ids: string[]): Promise<boolean[]> {
        try {
            return Promise.all(ids.map(async (id) => {
                return AlSuggestionsClientV2.updateSavedQuery(this.accountId, id, {deleted: true}).then(_ => {
                    this.reloadList();
                    return this.savedSearchCardstack?.removeItems(ids) || false;
                });
            }));
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        }
    }

    showMessage = (mgs: string) => {
        const alToastMessage: AlToastMessage = {
            sticky: true,
            closable: false,
            life: this.timeoutShowMsg,
            data: {
                message: mgs,
            },
        };
        this.alToastService.showMessage('saved_searches', alToastMessage);
        setTimeout(() => {
            this.alToastService.clearMessages('saved_searches');
        }, this.timeoutShowMsg);
    }

    /**
     * Show an error
     * @param msg
     */
    showGeneralErrorMessage(msg: string) {
        if (!this.alCardstack) {
            throw new Error('alCardstack view must be defined');
        }
        if (!this.alCardstack.viewHelper) {
            throw new Error('alCardstack.viewHelper view must be defined');
        }
        this.alCardstack.viewHelper.notifyError(msg, this.timeoutShowMsg);
    }

    onCreateSavedSearchSuccess = (message: string) => {
        this.showMessage(message);
        this.reloadList();
        this.navigation.navigate.byNgRoute( [], { queryParams: { savedSearchId: undefined, scheduledSearchId: undefined } } );
    }

    onCreateSavedSearchCancel = () => {
        this.navigation.navigate.byNgRoute( [], { queryParams: { savedSearchId: undefined, scheduledSearchId: undefined } } );
    }

    onCreateSavedSearchError = (message: string) => {
        this.showGeneralErrorMessage(message);
        this.reloadList();
        this.navigation.navigate.byNgRoute( [], { queryParams: { savedSearchId: undefined, scheduledSearchId: undefined } } );
    }

    changeAllSelection(checked: boolean = false) {
        if (!this.alCardstack) {
            throw new Error('alCardstack view must be defined');
        }
        this.updateCurrentSelection(checked);
        this.alCardstack.updateCheckState();
        this.actionSnackbarProcess();
    }

    changeSimpleSelection(item: AlBaseCardItem) {
        if (!item.checked && this.alCardstack) {
            this.alCardstack.uncheckToolbarAllOption();
        }
        const card = this.savedSearchCardstack?.cards.find(c=>c.id === item.id);
        if (card){
            card.checked = item.checked;
        }

        this.updateCurrentSelection(false);
        this.actionSnackbarProcess();
    }

    updateCurrentSelection(checked: boolean = false) {
        this.currentSelection = checked ? [...this.savedSearchCardstack?.cards || []] : this.savedSearchCardstack?.cards.filter((c) => c.checked) || [];
    }

    actionSnackbarProcess() {
        if (this.currentSelection.length === 0) {
            this.closeActionSnackbar();
        } else {
            this.changeVisibleAlSnackbarButtons('edit', this.currentSelection.length === 1);
            this.changeVisibleAlSnackbarButtons('add', this.currentSelection.length === 1);
            this.openActionSnackbar(`${this.currentSelection.length} Selected`);
        }
    }

    changeVisibleAlSnackbarButtons(event: string, value: boolean) {
        const button = this.actionSnackbarButtons.find(b => b.event === event);
        if (button) {
            button.visible = value;
        }
    }

    async actionSnackbarEvent(event: AlActionSnackbarEvent) {
        const totalElements = this.currentSelection.length;
        switch (event) {
            case 'edit':
                if (totalElements > 1) {
                    throw new Error('Cannot edit multiple items');
                }
                this.onEditSavedSearch(this.currentSelection[0]);
                break;
            case 'add':
                this.onScheduleSavedSearch(this.currentSelection[0]);
                break;
            case 'delete':
                const ids: string[] = this.currentSelection.reduce((arr, cv) => arr.concat(cv.id), [] as string[]);
                this.onDeleteItemConfirmation(ids);
                break;
            default:
                break;
        }
    }

    async onEditSavedSearch(item: AlCardstackItem<AlAlertDefinition>) {
        this.navigation.navigate.byNgRoute( [], { queryParams: { savedSearchId: item.id } } );
        this.savedSearchForm.setTitle("Edit Saved Search");
        this.savedSearchForm.editModal(item.properties);
        this.closeActionSnackbar();
    }

    async onScheduleSavedSearch(item: AlCardstackItem<AlAlertDefinition>) {
        this.savedSearchScheduleForm.setTitle("Create Saved Search Schedule");
        this.savedSearchScheduleForm.openModal(this.setBaseSavedSearchSchedule(item.id));
        this.closeActionSnackbar();
    }

    public async onEditScheduleSavedSearch(item: ScheduledReportV2) {
        this.navigation.navigate.byNgRoute( [], { queryParams: { scheduledSearchId: item.id } } );
        this.savedSearchScheduleForm.setTitle("Edit Saved Search Schedule");
        this.savedSearchScheduleForm.editModal(item);
        this.closeActionSnackbar();
    }

    closeActionSnackbar() {
        this.actionSnackbarVisible = false;
        this.actionSnackbarText = '';
    }

    openActionSnackbar(text: string) {
        this.actionSnackbarVisible = true;
        this.actionSnackbarText = text;
    }

    functionFooterActions = (item:  AlCardstackItem<AlAlertDefinition, any>): AlBaseCardFooterActions => {
        let footerLeftActions: AlActionFooterButtons[] = [];
        let alEditDeleteFooterActionsWithSchedule = [...alEditDeleteFooterActions];
        alEditDeleteFooterActionsWithSchedule.splice(1, 0, {
            event: "add",
            icon: "ui-icon-add",
            text: "ADD SCHEDULE",
            visible: true,
        });
        return {
            left: footerLeftActions,
            right: alEditDeleteFooterActionsWithSchedule
        } as AlBaseCardFooterActions;
    }

    iconCardFunction = (item: AlCardstackItem<AlAlertDefinition, any>): any => {
        return {};
    }

    actionFooterEvent(event: AlBaseCardFooterActionEvent) {
        const savedSearch = this.savedSearchCardstack?.cards.find((c) => c.id === event.value.id);
        if (!savedSearch) { throw new Error('Saved search not found'); }
        switch (event.name) {
            case 'edit':
                this.onEditSavedSearch(savedSearch);
                break;
            case 'delete':
                this.onDeleteItemConfirmation([savedSearch.id]);
                break;
            case 'add':
                this.onScheduleSavedSearch(savedSearch);
                break;
            case 'search':
                this.onSearchSavedSearch(savedSearch);
                break;
            default:
                break;
        }
    }

    onSearchSavedSearch(savedSearch: AlCardstackItem<AlAlertDefinition>) {
        const relativeUrl: string = `/#/search/expert/${this.accountId}`;
        const params = {
            sql: savedSearch.properties.search_request,
            mode: 'expert'
        };
        this.navigation.navigate.byLocation( AlLocation.SearchUI, relativeUrl, params );

        // Let's track the open search query event
        this.trackSavedSearchEvent(undefined, { label: 'Load saved search from other tab' });
    }

    async itemExpanded(item: AlCardstackItem<AlAlertDefinition, any> & AlBaseCardItem) {
        const createdById: string = item.properties && item.properties.created && item.properties.created.by || '';
        const modifiedById: string = item.properties && item.properties.modified && item.properties.modified.by || '';
        if (createdById) {
            item.properties.createdByName = await (await AIMSClient.getUserDetailsByUserId(createdById)).name;
            if (createdById === modifiedById) {
                item.properties.modifiedByName = item.properties.createdByName;
            }
        }
        if (modifiedById && !item.properties.modifiedByName) {
            item.properties.modifiedByName = await (await AIMSClient.getUserDetailsByUserId(modifiedById)).name;
        }
    }

    getTextsByEntity(multiple: boolean = false): {[key: string]:string} {
        let deleteTitle = '';
        let remove = '';
        let successfulRemove = '';
        if (multiple) {
            deleteTitle = 'Saved Searches';
            remove = 'saved searches';
            successfulRemove = `{0} ${remove} were deleted successfully.`;
        } else {
            deleteTitle = 'Saved Search';
            remove = 'saved search';
            successfulRemove = `The ${remove} was deleted successfully.`;
        }
        return {
            successfulRemove,
            confirmDeleteTitle: `Delete ${deleteTitle}?`,
            confirmDeleteOne: `Are you sure you want to delete this ${remove}?`,
            confirmDeleteMultiple: `Are you sure you want to delete {0} ${remove}?`
        };
    }

    reloadList():void {
        this.savedSearchCardstack?.start().then(() => {
            if (this.savedSearchCardstack) {
                this.savedSearchCardstack.loading = false;
            }
            if (this.cardstack.first) {
                this.cardstack.first.setCharacteristics();
            }
        });
    }

    goToSchedule(savedQuery: AlSavedQueryV2) {
        this.savedSearchScheduleForm.setTitle("Create Saved Search Schedule");
        this.savedSearchScheduleForm.openModal(this.setBaseSavedSearchSchedule(savedQuery.id));
    }

    /**
     * This function will handle the tracking for all Saved Searches related events
     *
     * @param eventData Object representing the available properties to be overwritten
     */
    public trackSavedSearchEvent(category: string = AlTrackingMetricEventCategory.SearchAction,
                            eventData: {action?: string, label: string, value?: any}): void {
        // Let's merge the incoming event data object into the default
        // one in order to overwrite what we need from the caller event
        let data: {[key: string]: any} = {
            ...{
                category: category,
                action: 'Saved Search Actions'
            },
            ...eventData
        };
        this.navigation.track(AlTrackingMetricEventName.UsageTrackingEvent, data);
    }

    setBaseSavedSearchSchedule(savedSearchId: string): ScheduledReportV2 {
        // Let's define a simple schedule saved search object structure
        // this will help us to set the saved search id for the schedule
        return {
            name: "",
            is_active: true,
            definition:{
                saved_query_id: savedSearchId
            },
            type:"search_v2"
        } as ScheduledReportV2;
    }
}
