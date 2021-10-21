import {
    ALCargoV2,
    CargoReportDailyScheduleV2,
    CargoReportMonthlyScheduleV2,
    CargoReportWeeklyScheduleV2,
    ScheduledReportV2,
    SearchReportDefinitionV2,
    TableauReportDefinitionV2,
} from '@al/cargo';
import {
    AIMSClient,
    SQXQueryBuilder,
} from '@al/core';
import {
    AlGenericAlertOptions,
    ALGestaltNotifications,
    CharacteristicsUtility,
    AlGenericAlertDefinition,
} from '@al/gestalt';
import {
    AlHeraldAccountSubscriptionPayloadV2,
    AlHeraldClientV2,
    AlHeraldSubscriptionsQueryV2,
} from '@al/herald';
import {
    AlBottomSheetComponent,
    AlBottomSheetHeaderOptions,
    AlViewHelperComponent,
    AlSelectItem,
    DateRangeSelection,
} from '@al/ng-generic-components';
import { AlNavigationService } from '@al/ng-navigation-components';
import {
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { AlNotificationFormComponent } from '../al-notification-form/al-notification-form.component';
import { AlNotificationDictionariesUtility } from '../services/al-notification-dictionaries-utility';
import { AlIntegrationConnection } from '@al/connectors';
import { AlSuggestionsTemplateResponseV2, AlSuggestionsClientV2, AlCreateSavedQueryParamsV2, AlSavedQueryV2, AlUpdateSavedQueryParamsV2 } from '@al/suggestions';
import { AlScheduleReportFormComponent } from '../al-schedule-report-form/al-schedule-report-form.component';
import { v4 as uuidv4 } from 'uuid';

@Component({
    selector: 'al-notification-report-schedule-form',
    templateUrl: './al-notification-report-schedule-form.component.html',
    styleUrls: ['./al-notification-report-schedule-form.component.scss'],
})
export class AlNotificationReportScheduleFormComponent implements OnInit {

    @Input() public accountId:string = "";
    @Input() public isFim: boolean = true;
    // This one will be used to set the date time selector to a particular date range
    @Input() public dataFromDateRange?: DateRangeSelection;

    @Output() public onSuccess = new EventEmitter<string>();
    @Output() public onError = new EventEmitter<string>();
    @Output() public onCancel = new EventEmitter<void>();

    headerOptions: AlBottomSheetHeaderOptions  = {
        icon:  'date_range',
        title:  'Schedule a Report',
        primaryAction: {
            text: 'Save',
            disabled:  true,
        },
        secondaryAction:{
            text:  'Cancel',
            disabled:  false,
        },
    };

    @ViewChild("alBottomSheet", {static:false}) alBottomSheet!:AlBottomSheetComponent;

    @ViewChild(forwardRef(() => AlNotificationFormComponent), {static:true}) notificationForm!: AlNotificationFormComponent;
    @ViewChild(forwardRef(() => AlViewHelperComponent), {static:false}) viewHelper?: AlViewHelperComponent;
    @ViewChild("scheduleForm", { static: false }) scheduleForm!: AlScheduleReportFormComponent;

    // Monaco editor variables for saved search visualization
    public savedSearch?: AlSavedQueryV2;
    public editorOptions = {
        theme: 'emsqlTheme',
        language: 'emsql',
        automaticLayout: true,
        minimap: {
            enabled: false
        }
    };
    @ViewChild("editor") editor: any;
    public scheduleFormCalendarTimestamp: number = 0;

    public scheduleId:string = "";
    public loading:boolean = true;
    public editMode:boolean = false;
    public fimSearches:AlSelectItem<AlSuggestionsTemplateResponseV2>[] = [];
    public dictionaries = new AlNotificationDictionariesUtility();

    public tableauReportName: string = "";
    public reportName: string = "";
    public isActive: boolean = true;

    public frequencies?: string[] | false = [];
    public filters?: {
        [key: string]: string[];
    };
    public filtersSort?: string[] = [];

    public cadence!: { daily: CargoReportDailyScheduleV2; } | { weekly: CargoReportWeeklyScheduleV2; }
    | { monthly: CargoReportMonthlyScheduleV2; } | 'every_15_minutes';

    public scheduleReport?: ScheduledReportV2;
    public subscriptionEditReference?: AlHeraldAccountSubscriptionPayloadV2;
    public cadenceInitialSchedule?: 'once' | 'asap' | 'every_15_minutes' | 'hourly' | {
        daily?: CargoReportDailyScheduleV2;
        weekly?: CargoReportWeeklyScheduleV2;
        monthly?: CargoReportMonthlyScheduleV2;
    } = undefined;
    public scheduleFormData:'every_15_minutes' |
        { daily: CargoReportDailyScheduleV2 } |
        { weekly: CargoReportWeeklyScheduleV2 } |
        { monthly:CargoReportMonthlyScheduleV2 }  = 'every_15_minutes';
    public scheduleFormValid:boolean = false;

    public selectedTemplate:AlSuggestionsTemplateResponseV2 = {} as AlSuggestionsTemplateResponseV2;

    private notificationType:string = "tableau/notifications";

    constructor(
        private navigation: AlNavigationService
    ) { }

    ngOnInit() {
        this.resetComponent();
        if (this.isFim) {
            this.loadFimTemplates();
        }
    }

    /**
     * Reset the component.
     */
    public resetComponent() {
        this.scheduleId = "";
        this.loading = true;
        this.editMode = false;
        this.tableauReportName = "";
        this.reportName = "";
        this.isActive = true;
        this.cadenceInitialSchedule = undefined;
        if (this.headerOptions.primaryAction) {
            this.headerOptions.primaryAction.text = "Save";
            this.headerOptions.primaryAction.disabled = true;
        }
        if (this.notificationForm) {
            this.notificationForm.reset();
            this.notificationForm.formDescription = this.isFim?
                                                        "Alert Logic conducts a File Integrity Monitoring search on a schedule \
                                                        that you set and can send a notification when the search results are ready.":
                                                        "Alert Logic conducts the saved search on a schedule that you set and \
                                                        can send a notification when the search results are ready.";
            this.notificationForm.webhookPayloadFormat = this.dictionaries.getWebhookPayload('tableau/notifications');
            this.notificationForm.setIncludeAttachments(false);
        }
        if (this.scheduleForm) {
            this.scheduleForm.reset();
            // Let's set the date time selector to the range we have set if defined
            this.scheduleForm.dataFromDateRange = this.dataFromDateRange;
        }
    }

    /**
     * TODO: This could be improved using reactive forms, this
     * could be achieve when all controllers implement value accessor.
     */
    public validateForm() {
        this.reportName = this.reportName.trim();
        if (this.headerOptions.primaryAction) {
            this.headerOptions.primaryAction.disabled = (
                !this.notificationForm.hasSubscribersSelected()
                || this.reportName === ""
                || !this.notificationForm.hasEmailSubject()
                || (this.cadence === undefined ? !this.scheduleFormValid:!this.cadence)
            );
        }
    }

    /**
     * Handler when user changes the susbscribers.
     */
    public onSubscribersChanged() {
        if (!this.notificationForm.hasSubscribersSelected() && this.viewHelper) {
            this.viewHelper.cleanNotifications();
            this.viewHelper.notifyWarning(this.dictionaries.getNoSubscribersWarningMessage(), 3000);
        }
        this.validateForm();
    }

    /**
     * When user change cadence.
     */
    public onCadenceChanged(cadence:{
        daily: CargoReportDailyScheduleV2; } | { weekly: CargoReportWeeklyScheduleV2; }
        | { monthly: CargoReportMonthlyScheduleV2; } | 'every_15_minutes') {
        this.cadence = cadence;
        this.validateForm();
    }

    /**
     * When user change the Schedule Form.
     */
    public onScheduleFormChanged(schedule:'every_15_minutes' |
        { daily: CargoReportDailyScheduleV2 } | { weekly: CargoReportWeeklyScheduleV2 } | { monthly:CargoReportMonthlyScheduleV2 } ) {
        this.scheduleFormData = schedule;
        // Setting Up the Schedule scheduleFormData
        if (this.scheduleReport) {
            this.scheduleReport.schedule = this.scheduleFormData;
        }
        this.scheduleFormCalendarTimestamp = this.scheduleForm?.calendarTimestamp;
        this.validateForm();
    }

    /**
     * Validate the schedule Form.
     */
    public isScheduleFormValid(event:boolean) {
        this.scheduleFormValid = event;
        this.validateForm();
    }

    /**
     * Display and notify if an error occur
     */
    public showErrorMessage (message:string) {
        this.onError.emit(message);
        this.loading = false;
        if (this.viewHelper) {
            this.viewHelper.notifyError(message, 5000);
        }
    }

    /**
     * Update logic for the report schedule.
     */
    public updateReportSchedule() {
        if (this.scheduleReport) {
            let subscriptionId:string = "";
            let reportScheduleId:string = "";
            let reportUpdatePayload:any;

            if (this.subscriptionEditReference && this.subscriptionEditReference.id) {
                subscriptionId = this.subscriptionEditReference.id;
            }
            if(this.scheduleReport && this.scheduleReport.id) {
                reportScheduleId = this.scheduleReport.id;
            }

            const subscriptionPayload: AlHeraldAccountSubscriptionPayloadV2 = this.prepareSubscriptionPayload();
            if(this.scheduleReport.type !== 'search_v2'){
                reportUpdatePayload = {
                    "name": this.reportName,
                    "schedule": this.cadence,
                    "is_active": this.isActive,
                } as ScheduledReportV2;
            }else if (this.scheduleReport.type === 'search_v2'){
                this.prepareSchedulePayload();
                reportUpdatePayload = this.prepareUpdateSchedulePayload();
            }

            ALCargoV2.updateSchedule(this.accountId, reportScheduleId, reportUpdatePayload).then(() => {
                if(this.scheduleReport && this.scheduleReport.type === 'search_v2' && this.isFim){
                    let updateSavedQueryParams: AlUpdateSavedQueryParamsV2 = { name: this.reportName + " (" + this.selectedTemplate.name + ")" };
                    AlSuggestionsClientV2.updateSavedQuery(this.accountId, (this.scheduleReport.definition as SearchReportDefinitionV2).saved_query_id, updateSavedQueryParams);
                }
                // Remove some attributes that are not need it during editing.
                /* TODO: fix this
                delete subscriptionPayload["class"];
                */
                // Lets define the list of requests we will do againt Herald for the edition process
                const heraldRequests = [AlHeraldClientV2.updateSubscription(this.accountId, subscriptionId, subscriptionPayload) as Promise<any>];
                const editedSubscribersList = this.notificationForm.getEditedSubscribers();
                // If we do not have any new or removed subscriber then we should not make
                // the additional request to Herald bulk update
                if (editedSubscribersList.length > 0) {
                    heraldRequests.push(AlHeraldClientV2.batchUpdateSubscriptions(this.accountId, subscriptionId, editedSubscribersList));
                }

                return Promise.all(heraldRequests).then(
                    () => {
                        this.onSuccess.emit(`"${this.reportName}" schedule was updated successfully.`);
                        this.loading = false;
                        this.resetComponent();
                        this.alBottomSheet.hide();
                    },
                    (error) => {
                        console.error(error);
                        this.showErrorMessage("We are sorry, there was an internal error updating the report notification.");
                    }
                );
            }, (error) => {
                console.error(error);
                this.showErrorMessage("We are sorry, there was an internal error updating the scheduled report.");
            });
        }
    }

    /**
     * When the user click on save button.
     */
    public async save() {
        this.validateForm();
        this.loading = true;

        const subscriptionPayload: AlHeraldAccountSubscriptionPayloadV2 = this.prepareSubscriptionPayload();

        if (this.scheduleReport) {
            if (this.scheduleReport.type !== 'search_v2'){
                this.scheduleReport.schedule = this.cadence;
                (this.scheduleReport.definition as TableauReportDefinitionV2).format = 'pdf';
            } else if(this.scheduleReport.type === 'search_v2' && !this.editMode) {
                // We do only create the saved query when trying to schedule a FIM report
                if (this.isFim) {
                    let savedQueryParams:AlCreateSavedQueryParamsV2 = {
                        name: this.reportName + " (" + this.selectedTemplate.name + ")",
                        group_id: null,
                        search_request: this.selectedTemplate.search_request,
                        template: {
                            id: this.selectedTemplate.id,
                            account_id: this.selectedTemplate.account_id
                        }
                    };

                    try {
                        let savedQuery:AlSavedQueryV2 = await AlSuggestionsClientV2.createSavedQuery(this.accountId, savedQueryParams);
                        (<SearchReportDefinitionV2>this.scheduleReport.definition).saved_query_id = savedQuery.id;
                    } catch (error) {
                        if (error.data && error.data.errors && error.data.errors.length > 0) {
                            error.data.errors.forEach((e:{attribute: string; error_text: string, error_type: string, value: string}) =>
                                this.showErrorMessage(e.error_text ?? "We are sorry, there was an internal error scheduling the report.")
                            );
                        }
                        // If we are creating a FIM report and the saved search
                        // creation fails we should not continue with the process
                        return;
                    }
                }
            }
            // Now let's handle the scheduling saving process (managing subscription)
            if (this.editMode) {
                this.updateReportSchedule();
            } else {
                if(this.scheduleReport.type === 'search_v2') {
                    this.prepareScheduleDefinitionTimeRange();
                }
                this.prepareSchedulePayload();
                // Let's only add the subscribers to the payload on creation
                subscriptionPayload.subscribers = this.notificationForm.getSubscribers();

                let cargoPromise: Promise<string|any>;

                // let's generate the random uuid to become the scheduleId reference for run-once
                // executions as we are not creating a schedule at all we need this emulation action
                const scheduleId = uuidv4().toUpperCase();
                // Let's check if we are trying to schedule an execution that will run only once
                // in order to create only an execution record instead of a schedule itself
                if (this.scheduleReport.schedule === 'once' || this.scheduleReport.schedule === 'asap') {
                    this.scheduleReport.id = scheduleId;
                    let executionRecord: any = {
                        name: this.scheduleReport.name,
                        type: "search_v2",
                        definition: this.scheduleReport.definition,
                        schedule_id: scheduleId,
                        notify_behavior: this.scheduleReport.notify_behavior,
                        delete_empty_result: this.scheduleReport.delete_empty_result,
                    };
                    if (this.scheduleReport.schedule  === 'once') {
                        if (!this.scheduleFormCalendarTimestamp) {
                            this.showErrorMessage("We are sorry, you need to enter the execution date and time.");
                            return;
                        }
                        executionRecord['scheduled_time'] = this.scheduleFormCalendarTimestamp;
                    }
                    cargoPromise = ALCargoV2.createExecutionRecord(this.accountId, executionRecord);
                } else {
                    cargoPromise = ALCargoV2.createSchedule(this.accountId, this.scheduleReport);
                }

                cargoPromise.then((reportScheduleId) => {
                    // If the returned reportScheduleId is an object with the run_once property then
                    // it means we did create an execution record and not an schedule ifself
                    reportScheduleId = (reportScheduleId?.run_once)? scheduleId: reportScheduleId;
                    // We depend on the report to be schedule first before call create a subscription.
                    subscriptionPayload.external_id = reportScheduleId;

                    // Add the schedule id as a filter
                    const builder = new SQXQueryBuilder();
                    const where = builder.where().equals( "notification.schedule_id", reportScheduleId);
                    const filterQuery = where.toJson();
                    subscriptionPayload.filters = filterQuery;

                    // Create a herald subscription.
                    AlHeraldClientV2.createSubscription(this.accountId, subscriptionPayload).then(() => {
                        this.onSuccess.emit(`"${this.reportName}" schedule was created successfully.`);
                        this.loading = false;
                        this.resetComponent();
                        this.alBottomSheet.hide();
                    }, (error) => {
                        ALCargoV2.deleteSchedule(this.accountId, reportScheduleId).then(() => {
                            console.error("Report schedule has been deleted.");
                        });
                        console.error(error);
                        this.showErrorMessage("We are sorry, there was an internal error creating the report notification.");
                    });
                }, (error) => {
                    console.error(error);
                    this.showErrorMessage("We are sorry, there was an internal error scheduling the report.");
                });
            }
        }
    }

    /**
     * When user clicks on cancel button.
     */
    public cancel() {
        this.resetComponent();
        this.alBottomSheet.hide();
        this.onCancel.emit();
    }

    /**
     * Set´s the active flag.
     */
    setReportActive = (active:boolean|undefined) => {
        this.isActive = active ? active: false;
    }

    /**
     * Set´s the al bottom sheet title
     * @param title The al bottom sheet title
     */
    setTitle = ( title: string ) => {
        this.headerOptions.title = title;
    }

    /**
     * Helper method to transform cadence intro frequency.
     */
    getFrequencyFromCadence(cadence: "every_15_minutes" | {
        daily?: CargoReportDailyScheduleV2 | undefined;
        weekly?: CargoReportWeeklyScheduleV2 | undefined;
        monthly?: CargoReportMonthlyScheduleV2 | undefined;
    } | undefined) : string[] | false {
        if (cadence) {
            let frequencies:string[] | false = [];
            if (cadence === 'every_15_minutes') {
                frequencies.push('every_15_minutes');
            } else if ('daily' in cadence) {
                frequencies.push('daily');
            } else if ('weekly' in cadence) {
                frequencies.push('weekly');
            } else if ('monthly' in cadence) {
                frequencies.push('monthly');
            }
            return frequencies;
        }
        return false;
    }

    /**
     * Open the report schedule modal in edit mode.
     */
    editModal( scheduleReport: ScheduledReportV2, frequencies?: string[] | false, entity?: AlGenericAlertDefinition, filtersSort?:string[]){
        this.resetComponent();
        this.scheduleReport = scheduleReport;
        this.editMode = true;
        if (this.headerOptions.primaryAction) {
            this.headerOptions.primaryAction.text = "Update";
        }
        this.loading = true;

        this.notificationForm.editUserCreator = '';
        if(entity && entity.properties.createdBy){
            this.notificationForm.editUserCreator = entity.properties.createdBy;
        }
        if (scheduleReport.type !== 'search_v2') {
            this.frequencies = frequencies;
            this.scheduleReport = scheduleReport;
            this.setBasicFormReportData(scheduleReport, (scheduleReport.definition as TableauReportDefinitionV2).filter_values, filtersSort );
            this.cadenceInitialSchedule = scheduleReport.schedule;
            this.notificationType = 'tableau/notifications';
        } else if (scheduleReport.type === 'search_v2') {
            this.reportName = scheduleReport.name;
            this.isActive = scheduleReport.is_active === undefined ? true : scheduleReport.is_active;
            this.notificationForm.setNotifyBehavior(scheduleReport.notify_behavior as string);
            this.setSavedSearchOrFimTemplate((scheduleReport.definition as SearchReportDefinitionV2).saved_query_id);
            this.notificationType = 'search/notifications';
            if(this.scheduleReport && this.scheduleReport.schedule && this.scheduleForm){
                this.scheduleForm.setSchedule(this.scheduleReport.schedule);
            }
        }
        let queryParms:AlHeraldSubscriptionsQueryV2 = {
            external_id : scheduleReport.id,
            include_subscribers: true,
        };
        // Grab the report subscription notification using the report scheduled id
        AlHeraldClientV2.getAllSubscriptionsByAccount(this.accountId, queryParms).then((response:AlHeraldAccountSubscriptionPayloadV2[]) => {
            // There should be just one subscription with this id.
            this.subscriptionEditReference = response[0];
            // We need to set the email subject from the subscription being edited
            if (this.subscriptionEditReference.options) {
                this.notificationForm.setEmailSubject(this.subscriptionEditReference.options.email_subject);
                this.notificationForm.setIncludeAttachments(this.subscriptionEditReference.options.include_attachments ? this.subscriptionEditReference.options.include_attachments : false );
            }
            this.getUsersAndAccountInformationFromGestalt();
        }, (error) => {
            console.error(error);
            this.showErrorMessage("We are sorry, an internal error ocurred retrieving schedule report notification.");
        });

        this.alBottomSheet.open();
    }

    /**
     * Process the incident alert options received from gestalt.
     */
    processIncidentAlertOptions = async (incidentsAlertOptions:AlGenericAlertOptions, type: string) => {
        const accountsIds:string[] = await AIMSClient.getAccountsIdsByRelationship(this.accountId, 'managing');
        this.notificationForm.users = await AIMSClient.getUsersFromAccounts(accountsIds);
        this.notificationForm.users = CharacteristicsUtility.sortValueDescriptorList(this.notificationForm.users,'name');
        if (this.notificationForm) {
            this.notificationForm.setSelectableUsers(this.notificationForm.users);

            let integrations:AlIntegrationConnection[] = [];
            if (incidentsAlertOptions.connections) {
                integrations = incidentsAlertOptions.connections.filter(connection => connection.payload_type === type) as AlIntegrationConnection[];
            }
            this.notificationForm.setSelectableIntegrations(integrations);
            if (this.subscriptionEditReference && this.subscriptionEditReference.subscribers && this.editMode) {
                this.notificationForm.setSubscribers(this.subscriptionEditReference.subscribers);
            }
            if (this.subscriptionEditReference && this.subscriptionEditReference.options
                && this.subscriptionEditReference.options.include_attachments !== undefined) {
                if( this.editMode ) {
                    this.notificationForm.setIncludeAttachments(this.subscriptionEditReference.options.include_attachments);
                } else {
                    this.notificationForm.setIncludeAttachments(false);
                }
            }
            this.validateForm();
        }
    }

    /**
     * Set basic form data using report schedule referece.
     */
    setBasicFormReportData(scheduleReportRef: ScheduledReportV2, filtersToShow?: {[key: string]: string[]}, filtersSort?: string[]) {
        if (scheduleReportRef.definition) {
            this.filters = filtersToShow;
        }
        this.filtersSort = filtersSort;
        this.reportName = scheduleReportRef.name;
        this.isActive = scheduleReportRef.is_active === undefined ? true : scheduleReportRef.is_active;
    }

    /**
     * Gets the susbcribers information for this from from gestalt.
     */
    getUsersAndAccountInformationFromGestalt(){
        ALGestaltNotifications.getGenericAlertOptions(this.accountId, 'scheduled_report').then(
            async (incidentsAlertOptions:AlGenericAlertOptions) => {
                await this.processIncidentAlertOptions(incidentsAlertOptions, 'scheduled_report');
                this.loading = false;
            },
            (error) => {
                console.error(error);
                this.onError.emit('We are sorry, there was an internal error retrieving options data.');
                this.loading = false;
                this.alBottomSheet.hide();
            },
        );
    }

    /**
     * Open the Create Report Schedule modal screen.
     */
    openModal(scheduleTableauReport?: ScheduledReportV2,
        frequencies?: string[] | false,
        filtersToShow?: {[key: string]: string[]},
        filtersSort?:string[]) {

        this.resetComponent();
        this.frequencies = frequencies;
        this.loading = true;
        // Are we receiving data from tableau integration?
        if (scheduleTableauReport) {
            this.scheduleReport = scheduleTableauReport;
            this.notificationForm.reset();
            if (this.scheduleForm.formattedSchedule !== 'once'  && this.scheduleForm.formattedSchedule !== 'asap') {
                this.scheduleReport.schedule = this.scheduleForm.formattedSchedule as 'every_15_minutes' | {
                    daily?: CargoReportDailyScheduleV2;
                    weekly?: CargoReportWeeklyScheduleV2;
                    monthly?: CargoReportMonthlyScheduleV2;
                };
            }
            this.setBasicFormReportData(this.scheduleReport, filtersToShow, filtersSort);
            if( this.scheduleReport.type === 'search_v2' ) {
                if (this.isFim) {
                    this.selectedTemplate = this.fimSearches[0].value;
                    this.headerOptions.title = 'Schedule a File Integrity Monitoring Search';
                } else {
                    this.setSavedSearchOrFimTemplate((this.scheduleReport.definition as SearchReportDefinitionV2).saved_query_id);
                }
                this.notificationType = 'search/notifications';
            }
        }
        if(this.scheduleReport && this.notificationType){
             // Let's set the email subject on create only
            this.dictionaries.getEmailSubjectTemplate(this.notificationType).then(emailSubject => {
                this.notificationForm.setEmailSubject(emailSubject);
            });
        }
        this.alBottomSheet.open();
        this.getUsersAndAccountInformationFromGestalt();
    }

    async loadFimTemplates(){
        this.fimSearches = [];
        const getTemplatesParams:{[i:string]:string|boolean } = {
            deleted: false,
            data_type: "fimdata"
        };
        let fimTemplates:AlSuggestionsTemplateResponseV2[] = await AlSuggestionsClientV2.getQueryTemplates( this.accountId, getTemplatesParams );
        if( fimTemplates ){
            fimTemplates.forEach( ( template:AlSuggestionsTemplateResponseV2 ) => {
                this.fimSearches.push( {
                    label: template.name,
                    value: template
                });
            });
        }
    }

    async setSavedSearchOrFimTemplate(savedQueryId:string) {
        let savedQuery = await AlSuggestionsClientV2.getSavedQuery(this.accountId, savedQueryId);
        if (this.isFim) {
            if (savedQuery.template) {
                this.fimSearches.map((templateSelect:AlSelectItem) => {
                    let template = templateSelect.value as AlSuggestionsTemplateResponseV2;
                    if(template.id === savedQuery.template!.id){
                        this.selectedTemplate = template;
                    }
                });
            } else {
                this.fimSearches.map((templateSelect:AlSelectItem) => {
                    let template = templateSelect.value as AlSuggestionsTemplateResponseV2;
                    if(template.search_request === savedQuery.search_request as string){
                        this.selectedTemplate = template;
                    }
                });
            }
        } else {
            this.savedSearch = savedQuery;
        }
    }

    prepareSchedulePayload(){
        if(this.scheduleReport){
            this.scheduleReport.is_active = this.isActive;
            this.scheduleReport.name = this.reportName;
            this.scheduleReport.notify_behavior = this.notificationForm.notifyBehavior;
            if(this.scheduleReport.type === "search_v2"){
                this.scheduleReport.delete_empty_result = this.notificationForm.notifyBehavior === 'ifnotempty' ? true : false;
            }
        }
    }

    prepareUpdateSchedulePayload():ScheduledReportV2 {
        let schedulePayload: ScheduledReportV2 = {} as ScheduledReportV2;
        if(this.scheduleReport){
            this.prepareScheduleDefinitionTimeRange();
            schedulePayload = {
                name: this.scheduleReport.name,
                definition: this.scheduleReport.definition,
                is_active: this.isActive,
                notify_behavior: this.notificationForm.notifyBehavior,
                delete_empty_result: this.notificationForm.notifyBehavior === 'ifnotempty' ? true : false,
                schedule: this.scheduleReport.schedule
            };
        }
        return schedulePayload;
    }

    prepareSubscriptionPayload():AlHeraldAccountSubscriptionPayloadV2{
        const subscriptionPayload: AlHeraldAccountSubscriptionPayloadV2 = {
            name: this.reportName,
            class: "schedule",
            active: this.isActive,
            options: {
                email_subject: this.notificationForm.getEmailSubject(),
                include_attachments: this.notificationForm.allowAttachments()
            },
            notification_type: this.notificationType
        };
        return subscriptionPayload;
    }

    prepareScheduleDefinitionTimeRange(): void {
        if (this.scheduleReport) {
            (this.scheduleReport.definition as SearchReportDefinitionV2).timerange = {
                ...( this.scheduleReport.schedule!.hasOwnProperty("every_6_hours") && { hours: 6 } ),
                ...( this.scheduleReport.schedule!.hasOwnProperty("every_12_hours") && { hours: 12 } ),
                ...( this.scheduleReport.schedule!.hasOwnProperty("daily") && { hours:24 } ),
                ...( this.scheduleReport.schedule!.hasOwnProperty("weekly") && { days:7 } ),
                ...( this.scheduleReport.schedule!.hasOwnProperty("monthly") && { days:30 } ),
                // Saved Searches frequencies
                ...( this.scheduleReport.schedule === 'once' && this.getTimeframeFromScheduleForm() ),
                ...( this.scheduleReport.schedule === 'asap' && this.getTimeframeFromScheduleForm() ),
                ...( this.scheduleReport.schedule === 'every_15_minutes' && { hours:1 } ),
                ...( this.scheduleReport.schedule === 'hourly' && { hours:1 } ),
            };
        }
    }

    public onMonacoEditorInit(editor: any) {
        this.editor = editor;
        this.editor.updateOptions({ readOnly: true });
    }

    editInSearch = () => {
        const savedSearchId: string = (this.scheduleReport?.definition as SearchReportDefinitionV2).saved_query_id;
        const relativeUrl: string = `/#/search/expert/${this.accountId}?editSearchId=${savedSearchId}`;
        this.navigation.navigate.byLocation('cd17:search', relativeUrl);
    }

    getTimeframeFromScheduleForm(): { hours: number } | { days: number } | {start_ts: number, end_ts: number} {
        // Let's handle the fixed time range including start and end boundaries
        if (this.scheduleForm.timeFrame.timeRange) {
            return {
                start_ts: this.scheduleForm.timeFrame.timeRange.start,
                end_ts: this.scheduleForm.timeFrame.timeRange.end || Date.now()
            };
        } else {
            const hours = (this.scheduleForm.timeFrame.timeFrame || 0) / 3600;
            return hours < 24 ? { hours: (hours || 1) } : { days: hours/24 };
        }
    }
}
