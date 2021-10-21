import { AlCoralClientV2 } from '@al/aecoral';
import {
    ALCargoV2,
    ScheduledReportV2,
    TableauReportDefinitionV2,
    SearchReportDefinitionV2,
    CargoReportWeeklyScheduleV2,
    CargoReportMonthlyScheduleV2,
} from '@al/cargo';
import { AlCardstackItem, AlLocation, AlLocatorService } from '@al/core';
import {
    AlGenericAlertDefinition,
    ALGestaltNotifications,
    AlIncidentAlertProperties,
    AlScheduledReportProperties,
} from '@al/gestalt';
import { AlHeraldClientV2 } from '@al/herald';
import { AlSuggestionsClientV2 } from '@al/suggestions';
import {
    AlActionFooterButtons,
    AlBaseCardConfig,
    AlBaseCardFooterActionEvent,
    AlBaseCardFooterActions,
    AlBaseCardItem,
    AlCardstackComponent,
    alEditDeleteFooterActions,
} from '@al/ng-cardstack-components';
import {
    AlActionSnackbarElement,
    AlActionSnackbarEvent,
    AlToastMessage,
    AlToastService,
    AlUiFilterValue,
} from '@al/ng-generic-components';
import { AlNavigationService } from '@al/ng-navigation-components';
import {
    AfterViewInit,
    Component,
    Input,
    OnInit,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';
import {
    ConfirmationService,
    MenuItem,
} from 'primeng/api';
import { SlideMenu } from 'primeng/slidemenu';
import { combineLatest } from 'rxjs';
import { AlNotificationIncidentAlertFormComponent } from '../al-notification-incident-alert-form/al-notification-incident-alert-form.component';
import { AlNotificationHealthAlertFormComponent } from '../al-notification-health-alert-form/al-notification-health-alert-form.component';
import { AlNotificationReportScheduleFormComponent } from '../al-notification-report-schedule-form/al-notification-report-schedule-form.component';
import { AlNotificationCardstack } from '../types/notification-cardstack';
import { AlExposureNotificationsClient } from '@al/exposure-notifications';

interface ZeroStateConfig {
    icon: string;
    entityName: string;
    entityNamePlural: string;
    requiredAction: string;
    instructions: boolean;
}

@Component({
    selector: 'al-notifications-list',
    templateUrl: './al-notifications-list.component.html',
    styleUrls: ['./al-notifications-list.component.scss'],
})
export class AlNotificationsListComponent implements OnInit, AfterViewInit {

    // action snackbar variables
    public actionSnackbarText = '';
    public actionSnackbarVisible = false;
    public actionSnackbarButtons: AlActionSnackbarElement[] = [
        {
            event: "edit",
            icon: "edit",
            text: "EDIT",
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
        checkable: true,
        hasIcon: true
    };

    public zeroStateConfig: {
        [key: string]: ZeroStateConfig,
    } = {
        incident: {
            icon: 'announcement',
            entityName: 'incident notification',
            entityNamePlural: 'incident notifications',
            requiredAction: 'created any incident notifications',
            instructions: false,
        },
        scheduled_report: {
            icon: 'date_range',
            entityName: 'scheduled report',
            entityNamePlural: 'scheduled reports',
            requiredAction: 'report schedule',
            instructions: true,
        },
        manage_scheduled: {
            icon: 'date_range',
            entityName: 'report schedule',
            entityNamePlural: 'scheduled reports',
            requiredAction: 'scheduled a report',
            instructions: true,
        },
        manage_alerts: {
            icon: 'announcement',
            entityName: 'notification',
            entityNamePlural: 'notifications',
            requiredAction: 'created any notifications',
            instructions: false,
        },
        default: {
            icon: 'announcement',
            entityName: 'element',
            entityNamePlural: 'elements',
            requiredAction: 'created elements',
            instructions: false,
        }
    };

    public confirmDialogLabels:{acceptLabel:string,rejectLabel:string}={
        acceptLabel:"",
        rejectLabel:""
    };

    @Input() public viewName?: 'manage_scheduled' | 'manage_alerts' | 'scheduled_report' | 'incident' ;

    public alertNotificationCardstack!: AlNotificationCardstack;
    public accountId: string = "";
    public timeoutShowMsg: number = 5000;
    public currentSelection: Array<AlCardstackItem<AlGenericAlertDefinition, AlIncidentAlertProperties & AlScheduledReportProperties>> = [];
    public description: string = "";
    @ViewChild('reportCardExpanded', {static:false}) reportCardExpanded?: TemplateRef<unknown>;
    @ViewChildren('alCardstack') cardstack!: QueryList<AlCardstackComponent>;
    @ViewChild('createIncidentAlert', {static:false}) createIncidentAlert!: AlNotificationIncidentAlertFormComponent;
    @ViewChild('reportScheduleForm', {static:false}) reportScheduleForm!: AlNotificationReportScheduleFormComponent;
    @ViewChild('createHealthAlert', {static:false}) createHealthAlert!: AlNotificationHealthAlertFormComponent;

    public addMenuItems:MenuItem[] = [];

    @ViewChild('addMenu', {static:false}) addMenu?: SlideMenu;

    private alCardstack?: AlCardstackComponent;
    private isProduction: boolean = (AlLocatorService.getContext().environment === 'production');

    constructor(
        private alToastService: AlToastService,
        private confirmationService: ConfirmationService,
        private route: ActivatedRoute,
        private navigationService: AlNavigationService,
        private router: Router,
    ) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe(async (params) => {
            if (params.has('accountId')) {
                const accountId = params.get('accountId') as string;
                this.loadCardstack(accountId);
            } else {
                console.error('idk');
            }
        }, (e) => {
            console.error(e);
        });
    }

    async loadCardstack(accountId:string) {
        if (this.alCardstack) {
            this.alCardstack.clearState();
        }
        if (!this.alertNotificationCardstack) {
            this.alertNotificationCardstack = new AlNotificationCardstack(this.viewName);
        }
        this.alertNotificationCardstack.loading = true;
        this.closeActionSnackbar();
        this.currentSelection = [];


        try {
            this.accountId = accountId;
            await this.alertNotificationCardstack.setAccount(accountId);
        } catch ( e ) {
            this.alertNotificationCardstack.error = e;
        }

        this.reloadList();
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
                if (queryParam.has('search')) {
                    this.alCardstack.setInputTextFilter(queryParam.get('search') as string);
                    // clear out the query param
                    // search didnt have a 2 way upadate, so what was in the url was overwriting the search bar
                    this.router.navigate([], {
                        queryParams: {
                            search: null,
                        },
                        queryParamsHandling: 'merge'
                    });
                } else {
                    const idField = [
                        'id',
                        'subscription_id',
                        'scheduled_report_id'
                    ].find(idf => queryParam.has(idf));
                    if (idField) {
                        this.alCardstack.setInputTextFilter(`id=${queryParam.get(idField)}`);
                        const queryParams:{[i:string]:null} = {};
                        queryParams[idField] = null;
                        // clear out the query param
                        this.router.navigate([], {
                            queryParams,
                            queryParamsHandling: 'merge'
                        });
                    }
                }
            }
        }, (error) => console.log(error));
    }

    onDeleteItemConfirmation(item: AlGenericAlertDefinition | string[], hierarchyType: string, healthAlertIds?:string[]) {
        let message = '';
        let texts: {[key: string]:string};
        let header = '';
        if (Array.isArray(item)) {
            texts = this.getTextsByEntity(hierarchyType, true);
            header = texts.confirmDeleteTitle;
            const alertsRemoved: number = healthAlertIds ? item.length+healthAlertIds?.length : item.length;
            message = texts.confirmDeleteMultiple.replace('{0}', `${alertsRemoved}`);
        } else {
            texts = this.getTextsByEntity(hierarchyType);
            header = texts.confirmDeleteTitle;
            message = texts.confirmDeleteOne;
        }
        this.confirmDialogLabels = {
            acceptLabel: "Delete",
            rejectLabel: "Cancel"
        };
        this.confirmationService.confirm({
            message,
            header,
            acceptLabel: "Delete",
            rejectLabel: "Cancel",
            accept: async () => {
                try {
                    if (Array.isArray(item)) {
                        if (item.length > 0) {
                            await this.deleteAlerts(item, hierarchyType);
                        }
                        if (healthAlertIds && healthAlertIds.length > 0) {
                            const deleteHealthPromises: Promise<any>[] = healthAlertIds?.map( id => AlExposureNotificationsClient.deleteSubscriptionAndPolicy(this.accountId, id));
                            await Promise.all(deleteHealthPromises);
                        }
                        const healthAlertsRemoved: number = healthAlertIds? healthAlertIds.length : 0;
                        message = texts.successfulRemove.replace('{0}', `${item.length+healthAlertsRemoved}`);
                    } else {
                        if (healthAlertIds?.length === 1) {
                            await AlExposureNotificationsClient.deleteSubscriptionAndPolicy(this.accountId,healthAlertIds[0]);
                        } else {
                            let itemId: string = item.id;
                            if( item.type.group === 'scheduled' && item.properties.externalId) {
                                itemId = item.properties.externalId;
                            }
                            await this.deleteAlerts([itemId], hierarchyType);
                        }
                        message = texts.successfulRemove.replace('{0}',`"${item.caption}"`);
                    }
                    this.closeActionSnackbar();
                    this.cleanCache();
                    this.showMessage(message);
                    if (this.alCardstack) {
                        this.alCardstack.uncheckToolbarAllOption();
                    }
                } catch (error) {
                    console.error(error);
                    this.showGeneralErrorMessage("Something went wrong. Refresh the page and try again.");
                    this.actionSnackbarProcess();
                }
            },
        });
    }

    deleteAlerts(ids: string[], hierarchyType: string): Promise<boolean> {
        try {
            return this.alertNotificationCardstack.removeItems(ids, hierarchyType);
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
        this.alToastService.showMessage('notifications', alToastMessage);
        setTimeout(() => {
            this.alToastService.clearMessages('notifications');
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

    /**
     * On create incident alert success handler.
     */
    onCreateIncidentAlertSuccess = (message: string) => {
        if (!this.alCardstack) {
            throw new Error('alCardstack view must be defined');
        }
        this.showMessage(message);
        this.cleanCache();
    }

    /**
     * On create incident alert error handler.
     */
    onCreateIncidentAlertError = (message: string) => {
        this.showGeneralErrorMessage(message);
        this.reloadList();
    }

    /**
     * On create report schedule success handler.
     */
    onCreateReportScheduleSuccess = (message: string) => {
        this.showMessage(message);
        this.cleanCache();
    }

    /**
     * On create report schedule error handler.
     */
    onCreateReportScheduleError = (message: string) => {
        this.showGeneralErrorMessage(message);
        this.reloadList();
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
        const card = this.alertNotificationCardstack.cards.find(c=>c.id === item.id);
        if (card){
            card.checked = item.checked;
        }

        this.updateCurrentSelection(false);
        this.actionSnackbarProcess();
    }

    updateCurrentSelection(checked: boolean = false) {
        this.currentSelection = checked ? [...this.alertNotificationCardstack.cards] : this.alertNotificationCardstack.cards.filter((c) => c.checked);
    }

    actionSnackbarProcess() {
        if (this.currentSelection.length === 0) {
            this.closeActionSnackbar();
        } else {
            this.changeVisibleAlSnackbarButtons('edit', this.currentSelection.length === 1);
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
        const totalAlert = this.currentSelection.length;
        switch (event) {
            case 'edit':
                if (totalAlert > 1) {
                    throw new Error('Cannot edit multiple items');
                }
                this.editAlert(this.currentSelection[0].entity);
                break;
            case 'delete':
                const entity = this.currentSelection[0].entity;
                if (totalAlert === 1) {
                    this.onDeleteItemConfirmation(entity, entity.type.group, [entity.id]);
                } else if (totalAlert > 1) {

                    let ids : string[] = [];
                    let healthAlertIds : string[] = [];

                    if (entity.type.group === 'scheduled') {
                        let externalsId = this.currentSelection.map((alert) => alert.properties.externalId);
                        ids = externalsId.filter((element) => element !== undefined) as string[];
                    }
                    if (entity.type.group === 'alert') {
                        ids = this.currentSelection.filter(
                            alert => alert.entity.type.notificationType !== "health/alerts"
                        ).map((alert) => alert.entity.id);
                        healthAlertIds = this.currentSelection.filter(
                            alert => alert.entity.type.notificationType === "health/alerts"
                        ).map((alert) => alert.entity.id);
                    }
                    this.onDeleteItemConfirmation(ids, entity.type.group, healthAlertIds);
                }
                break;
            default:
                break;
        }
    }

    async editAlert(entity: AlGenericAlertDefinition) {
        if (entity.type.group === 'alert') {

            const heraldParams = { include_subscribers: true };
            let subscription = ( await AlHeraldClientV2.getSubscriptionByAccountAndSubscriptionId(this.accountId, entity.id, heraldParams) );
            if ( subscription ) {
                if(entity.type.notificationType === "health/alerts") {
                    this.createHealthAlert.editAlertModal(subscription,entity);
                } else {
                    this.createIncidentAlert.editAlertModal(subscription, undefined, entity);
                }
            } else {
                throw new Error(`Internal error: could not retrieve raw subscription with id '${entity.id}'`);
            }
        } else if (entity.type.group === 'scheduled') {
            let report:ScheduledReportV2;
            if (entity.properties.externalId) {
                 report = await ALCargoV2.getSchedule( this.accountId, entity.properties.externalId );
            }else {
                throw new Error(`Internal error: the entity schedule does not have an externalId, please check entity with id =  '${entity.id}'`);
            }
            if(entity.type.notificationType === 'tableau/notifications'){
                this.reportScheduleForm.setTitle("Edit a Report Schedule");
                if ( entity.properties.viewName ) {
                    report.type = entity.properties.viewName;
                    const reportDefinition = (report.definition as TableauReportDefinitionV2);
                    if (reportDefinition.filter_values) {
                        const reportType = { 'Report Type': [entity.properties.viewName] };
                        report.definition = reportDefinition;
                        report.definition.filter_values = {...report.definition.filter_values, ...reportType};
                    }
                }
                let frecuency: string[] = [];
                let filtersSort: string[] = this.alertNotificationCardstack.dictionaries.getBaseReportFiltersSort();
                if(entity.properties.viewId) {
                    if(this.alertNotificationCardstack.dictionaries.viewFrequencyDictionary.hasOwnProperty(entity.properties.viewId)){
                        frecuency = this.alertNotificationCardstack.dictionaries.viewFrequencyDictionary[entity.properties.viewId];
                    }
                    if(this.alertNotificationCardstack.dictionaries.viewFilterNames.hasOwnProperty(entity.properties.viewId)){
                        filtersSort = filtersSort.concat(this.alertNotificationCardstack.dictionaries.viewFilterNames[entity.properties.viewId]);
                    }
                }
                this.reportScheduleForm.editModal(report, frecuency, entity, filtersSort );
            } else if (entity.type.notificationType === 'search/notifications'){
                this.reportScheduleForm.setTitle("Edit a File Integrity Monitoring Search Schedule");
                this.reportScheduleForm.editModal(report, undefined, entity);
            }
        } else {
            throw new Error(`Internal error: cannot edit alert of group '${entity.type.group}' and type '${entity.type.notificationType}'` );
        }
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

    addButtonClicked(e:{event:MouseEvent}) {
        if (this.viewName === 'scheduled_report') {
            this.reportScheduleForm.setTitle("Create a Report Schedule");
            this.reportScheduleForm.openModal();
        } else if (this.viewName === 'manage_alerts' || this.viewName === 'manage_scheduled') {
            if (this.addMenu) {
                this.addMenu.toggle(e.event);
            }

        }
    }

    functionFooterActions = (item:  AlCardstackItem<AlGenericAlertDefinition, any>): AlBaseCardFooterActions => {
        let footerLeftActions: AlActionFooterButtons[] = [];
        switch (item.entity.type.group) {
            case 'alert':
                footerLeftActions = [
                    // {
                    //     event: 'view_incidents',
                    //     icon: 'open_in_browser',
                    //     visible: true,
                    //     text: 'VIEW INCIDENTS',
                    // }
                ];
                break;
            case 'scheduled':
                if ( item.entity.type.notificationType === 'tableau/notifications' ) {
                    footerLeftActions.push({
                        event: 'view_reports',
                        icon: 'ui-icon-insert-chart',
                        visible: true,
                        text: 'INTERACTIVE REPORT'
                    });
                    footerLeftActions.push({
                        event: 'view_artifacts',
                        icon: 'ui-icon-picture-as-pdf',
                        visible: true,
                        text: 'PAST REPORTS'
                    });
                } else if ( item.entity.type.notificationType === 'search/notifications' ) {
                    footerLeftActions.push({
                        event: 'view_search_artifacts',
                        icon: 'ui-icon-grid-on',
                        visible: true,
                        text: 'PAST SEARCHES'
                    });
                    /* We might add it back later, commenting for MVP
                    footerLeftActions.push({
                        event: 'view_search',
                        icon: 'ui-icon-pageview',
                        visible: true,
                        text: 'VIEW SEARCH'
                    }); */
                }
                break;
            default:
                break;
        }
        return {
            left: footerLeftActions,
            right: alEditDeleteFooterActions
        } as AlBaseCardFooterActions;
    }

    iconCardFunction = (item: AlCardstackItem<AlGenericAlertDefinition, any>): Object => {
        switch (item.entity.type.group) {
            case 'alert':
                if(item.entity.type.notificationType === 'observations/notification'){
                    return {name : 'pageview'};
                }
                return { name: 'announcement' };
            case 'scheduled':
                const cadence = !item.properties.cadenceName ? 'N/A' : item.properties.cadenceName[0].toUpperCase() + item.properties.cadenceName.substr(1).toLowerCase();
                return {
                    name: 'date_range',
                    text: cadence
                };
            default:
                return {};
        }
    }

    actionFooterEvent(event: AlBaseCardFooterActionEvent) {
        const alert = this.alertNotificationCardstack.cards.find((c) => c.id === event.value.id);
        if (!alert) {
            throw new Error('Alert not found');
        }
        switch (event.name) {
            case 'edit':
                this.editAlert(alert.entity);
                break;
            case 'delete':
                const alertId: string = alert.entity.id;
                const healthAlertId: string[] = alert.entity.type.notificationType === "health/alerts"?[alertId]:[];
                this.onDeleteItemConfirmation(alert.entity, alert.entity.type.group, healthAlertId);
                break;
            case 'view_incidents':
                this.showMessage('Coming soon...');
                this.closeActionSnackbar();
                break;
            case "view_reports":
                this.showReport(alert.entity);
                break;
            case "view_artifacts":
                this.showArtifact(alert.entity);
                break;
            case "view_search_artifacts":
                this.showSearchArtifact(alert.entity);
                break;
            default:
                break;
        }
    }

    async itemExpanded(item: AlCardstackItem<AlGenericAlertDefinition, any> & AlBaseCardItem) {
        if (item.entity.type.notificationType === 'tableau/notifications') {
            if (item.properties.artifactCount === undefined || item.properties.artifactCount < 0) {
                ALCargoV2.countExecutionRecords(this.accountId + "", item.properties.externalId).then((count: number) => {
                    if (item.properties) {
                        item.properties.artifactCount = count;
                        if (item.footerActions && item.footerActions.left) {
                            const index = item.footerActions.left.findIndex(e => e.event === "view_artifacts");
                            item.footerActions.left[index].text = `PAST REPORTS (${count})`;
                        }
                    }
                });
            }
        }else if (item.entity.type.notificationType === 'observations/notification' ||
            item.entity.type.notificationType === 'incidents/alerts'){
                if ( item.properties.accountId && item.properties.externalId ) {
                    item.properties.correlation = await AlCoralClientV2.getCorrelationRule(item.properties.accountId,item.properties.externalId);
                }
        }else if (item.id && item.properties.accountId && item.entity.type.notificationType === 'search/notifications'){
            if (item.properties.artifactCount === undefined || item.properties.artifactCount < 0) {
                ALCargoV2.countExecutionRecords(this.accountId + "", item.properties.externalId).then((count: number) => {
                    if (item.properties) {
                        item.properties.artifactCount = count;
                        if (item.footerActions && item.footerActions.left) {
                            const index = item.footerActions.left.findIndex(e => e.event === "view_search_artifacts");
                            item.footerActions.left[index].text = `PAST SEARCHES (${count})`;
                        }
                    }
                });
            }
            const report:ScheduledReportV2 = await ALCargoV2.getSchedule( this.accountId, item.properties.externalId );
            let definition:SearchReportDefinitionV2 = report.definition as SearchReportDefinitionV2;
            item.properties.search = await AlSuggestionsClientV2.getSavedQuery(item.properties.accountId, definition.saved_query_id);
            item.properties.searchFilters = { 'FIM Search Template': [item.properties.search.name] };
            item.properties.searchFiltersSort = ['FIM Search Template'];
            item.properties.format = 'csv'; // forced format for now.
            if(item.properties.schedule && item.properties.schedule.weekly){
                let schedule = item.properties.schedule.weekly as CargoReportWeeklyScheduleV2;
                item.properties.dayOfTheWeek = schedule.day;
            }
            if(item.properties.schedule && item.properties.schedule.monthly){
                let schedule = item.properties.schedule.monthly as CargoReportMonthlyScheduleV2;
                item.properties.dayOfTheMonth = schedule.day;
            }
        }
    }

    showReport(entity: AlGenericAlertDefinition) {
        if (entity.properties.embedUrl && entity.properties.workbookSubMenu) {
            const relativeUrl: string = '/#/dashboard/'+this.accountId+"/"+entity.properties.workbookSubMenu+'/'+entity.properties.embedUrl;
            this.navigationService.navigate.byLocation(AlLocation.IntelligenceUI, relativeUrl, {}, { target: "_blank" });
        } else {
            console.error("Error trying to show the report ", entity);
        }
    }

    showArtifact(entity: AlGenericAlertDefinition) {
        if ( entity.properties.externalId ) {
            this.navigationService.navigate.byLocation(
                AlLocation.IntelligenceUI,
                '/#/artifacts/'+this.accountId,
                {scheduleId: entity.properties.externalId},
                { target: "_blank" }
            );
        } else {
            this.showMessage("That item doesn't seem to be associated with a scheduled report." );
        }
    }

    goToCorrelations = () => {
        this.confirmDialogLabels = {
            acceptLabel: "TAKE ME TO CORRELATIONS",
            rejectLabel: "CANCEL",
        };

        this.confirmationService.confirm({
            header: "Leave this page and go to the Correlations tab on the Search page",
            message: 'Add a notification to an existing observation correlation in the list, or create the correlation for which you want to be notified.',
            acceptLabel: "TAKE ME TO CORRELATIONS",
            rejectLabel: "CANCEL",
            accept: async () => {
                this.navigationService.navigate.byNamedRoute('cd17:search:correlations');
            },
        });
    }

    goToReports = () => {
        this.confirmDialogLabels = {
            acceptLabel: "TAKE ME TO REPORTS",
            rejectLabel: "CANCEL",
        };
        this.confirmationService.confirm({
            header: "Leave this page and go to the Reports page",
            message: 'To schedule a report, you must access the report you want to schedule and set up the report criteria.',
            acceptLabel: "TAKE ME TO REPORTS",
            rejectLabel: "CANCEL",
            accept: async () => {
                this.navigationService.navigate.byNamedRoute('cd17:intelligence');
            },
        });
     }

    showSearchArtifact(entity: AlGenericAlertDefinition) {
        if ( entity.properties.externalId ) {
            this.navigationService.navigate.byLocation(
                AlLocation.SearchUI,
                '/#/downloads/'+this.accountId,
                { scheduleId: entity.properties.externalId },
                { target: "_blank" }
            );
        } else {
            this.showMessage("That item doesn't seem to be associated with a scheduled search." );
        }
    }

    setConfigAlCard() {
        if (this.viewName === 'manage_alerts') {
            this.addMenuItems = [
                { label: 'Add Notification', disabled: true, icon: 'pi pi-plus' },
                {
                    label: 'Observation',
                    command: () => {
                        this.goToCorrelations();
                    },
                    disabled: false
                },
                {
                    label: 'Incident',
                    command: () => {
                        this.createIncidentAlert.openAddAlertModal();
                    },
                },
                {
                    label:"Health",
                    command: () => {
                        this.createHealthAlert.openAddAlertModal();
                    },
                    visible: this.navigationService.isExperienceAvailable('health#notifications')
                }
            ];
        }
        if (this.viewName === 'manage_scheduled') {
            this.addMenuItems = [
                { label: 'Add Schedule', disabled: true, icon: 'pi pi-plus' },
                {
                    label: 'Schedule Report',
                    command: () => {
                        this.goToReports();
                    },
                },
                {
                    label: 'Schedule a FIM Search',
                    visible: this.navigationService.evaluateEntitlementExpression(`detect|respond`),
                    disabled: false,
                    command: async () => {
                        this.reportScheduleForm.setTitle("Create a Search Schedule");
                        const reportMock = {
                            name: "",
                            is_active: true,
                            definition:{
                                saved_query_id: ""
                            },
                            type:"search_v2"
                        } as ScheduledReportV2;
                        this.reportScheduleForm.openModal(reportMock);
                    }
                }
            ];
        }
    }

    getTextsByEntity(hierarchyType:string, multiple: boolean = false): {[key: string]:string} {
        let deleteTitle = '';
        let remove = '';
        let successfulRemove = '';
        switch(hierarchyType) {
            case 'alert':
                if(multiple){
                    deleteTitle = 'Notifications';
                    remove = 'notifications';
                    successfulRemove = `{0} ${remove} were deleted successfully.`;
                }else{
                    deleteTitle = 'Notification';
                    remove = 'notification';
                    successfulRemove = `{0} ${remove} was deleted successfully.`;
                }
                break;
            case 'scheduled':
                if(multiple){
                    deleteTitle = 'Schedules';
                    remove = 'schedules';
                    successfulRemove = `{0} ${remove} were deleted successfully.`;
                }else{
                    deleteTitle = 'Schedule';
                    remove = 'schedule';
                    successfulRemove = `{0} ${remove} was deleted successfully.`;
                }
                break;
            default:
                break;
        }
        return {
            successfulRemove,
            confirmDeleteTitle: `Delete ${deleteTitle}?`,
            confirmDeleteOne: `Are you sure you want to delete this ${remove}?`,
            confirmDeleteMultiple: `Are you sure you want to delete {0} ${remove}?`
        };
    }

    reloadList():void {
        this.alertNotificationCardstack.start().then(() => {
            this.setConfigAlCard();
            this.alertNotificationCardstack.loading = false;
            if (this.cardstack.first) {
                this.cardstack.first.setCharacteristics();
            }
            // Remove this when we have GA for health Notification, this for showing deployment in the filters for right sidenav
            if (this.isProduction && this.alertNotificationCardstack && this.alertNotificationCardstack.characteristics) {
                this.alertNotificationCardstack.characteristics.filterableBy = this.alertNotificationCardstack.characteristics.filterableBy.filter(
                    filter => filter !== "deployments"
                );
                this.description = "Lists your notifications for incidents and correlation observations that alert you to potential threats in near real time.";
            }
        });
    }

    cleanCache():void {
        try {
            let gestaltViewName = this.viewName + "";
            ALGestaltNotifications.deleteNotificationsListCache(this.accountId, gestaltViewName).then(() => {
                this.reloadList();
            });
        } catch(error) {
            // Catch any error related to caches.delete Browser incompatibility.
            // and retry normal reload list.
            console.error(error);
            this.reloadList();
        }
    }

    alFilterChanged(filter: AlUiFilterValue):void {
        if(filter.valueKey === "health/alerts" && this.alertNotificationCardstack && this.alertNotificationCardstack.characteristics) {
            const filtersToExclude = ["accounts","integrations", "threatLevel", "escalated"];
            this.alertNotificationCardstack.characteristics.filterableBy = this.alertNotificationCardstack.characteristics.filterableBy.filter(
                filter => !filtersToExclude.includes(filter+"")
            );
            filtersToExclude.forEach( excludedfilter => {
                if (this.alertNotificationCardstack && this.alertNotificationCardstack.characteristics &&
                    !this.alertNotificationCardstack.characteristics.filterableBy.includes(excludedfilter) && filter.activeFilter === false) {
                    this.alertNotificationCardstack.characteristics.filterableBy.push(excludedfilter);
                }
            });
        }
    }

}
