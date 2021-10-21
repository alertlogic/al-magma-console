import {
    AlCoralClientV2,
    AlCorrelationRuleV2,
} from '@al/aecoral';
import {
    AIMSAccount,
    AIMSClient,
    SQXQueryBuilder,
    SQXSearchQuery,
} from '@al/core';
import {
    AlGenericAlertOptions,
    ALGestaltNotifications,
    AlThreatLevel,
    CharacteristicsUtility,
    AlGenericAlertDefinition,
} from '@al/gestalt';
import {
    AlHeraldAccountSubscriptionPayloadV2,
    AlHeraldAccountSubscriptionV2,
    AlHeraldClientV2,
    AlHeraldSubscribersV2,
} from '@al/herald';
import {
    AlBottomSheetComponent,
    AlBottomSheetHeaderOptions,
    AlSelectItem,
    AlViewHelperComponent,
} from '@al/ng-generic-components';
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

interface AlIncidentAlertFormData {
    incidentAlertName: string;
    alertIsActive: boolean;
    accounts: Array<AIMSAccount>;
    filters: Array<AlThreatLevel> | undefined;
    escalated: boolean;
    selectedAccounts?: Array<AlSelectItem>;
    selectedFilters?: Array<AlSelectItem>;
    subscribers?: AlHeraldSubscribersV2[];
    emailSubject?: string;
}

@Component({
    selector: 'al-notification-incident-alert-form',
    templateUrl: './al-notification-incident-alert-form.component.html',
    styleUrls: ['./al-notification-incident-alert-form.component.scss'],
})
export class AlNotificationIncidentAlertFormComponent implements OnInit {

    @Input() public accountId:string = "";
    @Input() public filtersTitle: string = "Threat Levels";
    @Input() public filtersPlaceholder: string = "Filter(s)";

    @Output() public onSuccess = new EventEmitter<string>();
    @Output() public onError = new EventEmitter<string>();
    // Let's handle on close event emitting true if from CLOSE button false otherwhise
    @Output() public onClose = new EventEmitter<boolean>();

    headerOptions: AlBottomSheetHeaderOptions  = {
        icon:  'announcement',
        title:  'Create an Alert',
        primaryAction: {
            text: 'Save',
            disabled:  true,
        },
        secondaryAction:{
            text:  'Cancel',
            disabled:  false,
        },
    };

    @ViewChild("alBottomSheet", {static:true}) alBottomSheet!:AlBottomSheetComponent;

    @ViewChild(forwardRef(() => AlNotificationFormComponent), {static:true}) notificationForm!: AlNotificationFormComponent;
    @ViewChild(forwardRef(() => AlViewHelperComponent), {static:false}) viewHelper?: AlViewHelperComponent;

    public allSelectableAccounts:Array<AlSelectItem> = [];
    public selectedAccounts:Array<AlSelectItem> = [];

    public allSelectableFilters:Array<AlSelectItem> = [];
    public selectedFilters:Array<AlSelectItem> = [];

    public correlationRule?: AlCorrelationRuleV2;

    public subscriptionID:string = "";
    public loading:boolean = true;
    public editMode:boolean = false;
    public isCorrelationFiltered:boolean = false;
    public formDescription: string = "";
    public accountDetails: string = "";
    public criteriaLabel: string = "";

    public dictionaries = new AlNotificationDictionariesUtility();
    public form: AlIncidentAlertFormData = {
        incidentAlertName: "",
        alertIsActive: true,
        accounts: [],
        filters: [],
        escalated: true
    };

    public dataSnapshot: AlIncidentAlertFormData = {
        accounts : [],
        filters: [],
        incidentAlertName: "",
        alertIsActive: false,
        selectedAccounts: [],
        selectedFilters: [],
        subscribers: [],
        emailSubject: "",
        escalated: true
    };

    ngOnInit() {
        this.resetComponent();
    }

    /**
     * Reset the component.
     */
    public async resetComponent() {
        this.allSelectableAccounts = [];
        this.selectedAccounts = [];
        this.allSelectableFilters = [];
        this.selectedFilters = [];
        this.subscriptionID = "";
        this.loading = true;
        this.editMode = false;
        this.isCorrelationFiltered = false;
        this.form = {
            incidentAlertName: "",
            alertIsActive: true,
            accounts: [],
            filters: [],
            emailSubject: await this.dictionaries.getEmailSubjectTemplate('incidents/alerts'),
            webhookPayloadFormat: this.dictionaries.getWebhookPayload('incidents/alerts'),
            escalated: true,
        } as AlIncidentAlertFormData;
        this.correlationRule = undefined;
        if (this.headerOptions.primaryAction) {
            this.headerOptions.primaryAction.text = "Save";
        }
        if (this.notificationForm) {
            this.notificationForm.reset();
        }
    }

    /**
     * TODO: This could be improved using reactive forms, this
     * could be achieve when all controllers implement value accessor.
     */
    public validateForm() {
        this.form.incidentAlertName = this.form.incidentAlertName.trim();
        if (this.headerOptions.primaryAction) {
            this.headerOptions.primaryAction.disabled = (
                this.selectedAccounts.length <= 0
                || !this.notificationForm.hasSubscribersSelected()
                || (this.selectedFilters.length <= 0 && !this.form.escalated && this.correlationRule === undefined)
                || (this.selectedFilters.length <= 0 && !this.isCorrelationFiltered && this.correlationRule !== undefined )
                || !this.form.incidentAlertName
                || !this.notificationForm.hasEmailSubject()
                || (this.editMode && !this.hasFormChanged())
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

    public hasArrayChanged = <T>(array1:T[] | undefined, array2:T[] | undefined, keys:Array<keyof T>): boolean => {
        if (!array1 || !array2 || array1.length !== array2.length) return true;
        return array1.some((_, i) => keys.some(k => array1[i][k] !== array2[i][k]));
    }

    /**
     * When user select or changes filters
     */
    public onSelectedFilters(event:AlSelectItem[]) {
        this.validateForm();
    }

    /**
     * When user select or changes accounts
     */
    public onSelectedAccounts(event:AlSelectItem[]) {
        this.validateForm();
    }

    /**
     * Set´s the account seleted as default
     */
    public setAccountSelectedAsDefault() {
        this.setAccountsList([this.accountId as string]);
    }

    /**
     * When the user click on save button.
     */
    public save() {
        this.validateForm();

        let isAllCustomersSelected:boolean = false;
        let isManagedAccountsSelected:boolean = false;

        // Filter the 2 fake accounts of all customers and manage accounts.
        this.selectedAccounts = this.selectedAccounts.reduce((filtered:AlSelectItem[], account:AlSelectItem) => {
            if (account.value.id === this.dictionaries.getMyAccountsAndManagedFakeId()) {
                isAllCustomersSelected = true;
            } else if (account.value.id === this.dictionaries.getManagedAccountsFakeId()) {
                isManagedAccountsSelected = true;
            } else {
                filtered.push({
                                  title: account.value.name,
                                  value: account.value,
                              } as AlSelectItem);
            }
            return filtered;
        }, []);

        const accountList:string[] = this.getAccountList();
        const filters = this.getFilterList();

        const builder = new SQXQueryBuilder();
        const where = builder.where();

        if (this.isCorrelationFiltered && this.correlationRule) {
            where.equals( "notification.correlation_id", this.correlationRule.id + "");
        } else {
            if ( filters && filters.length>0) {
                where.in("notification.threat_level", filters);
            }
        }
        // We do only add the escalated property if we are saving an incident notification (non-correlated)
        if (this.form.escalated && !this.correlationRule) {
            where.equals("notification.escalated", true);
        }

        if ( isAllCustomersSelected ) {
            //  "All customers" essentially equals not filter on the account.id property
        } else if ( isManagedAccountsSelected ) {
            where.not().equals( "account.id", this.accountId );
        } else if ( accountList ) {
            where.in( "account.id", accountList );
        }

        console.log(`Notice: filter query = [${where.toQueryString()}]` );
        const filterQuery = where.toJson();

        const subscriptionPayload: AlHeraldAccountSubscriptionPayloadV2 = {
            name: this.form.incidentAlertName,
            class: "event",
            active: this.form.alertIsActive,
            options: {
                email_subject: this.notificationForm.getEmailSubject()
            },
            notification_type: "incidents/alerts",
            filters: filterQuery
        };

        // Let's only add the subscribers to the payload on creation
        if (!this.editMode) {
            subscriptionPayload.subscribers = this.notificationForm.getSubscribers();
        }

        // Lets add the external_id in case we are receiving the correlationRule
        if (this.correlationRule) {
            if (!this.editMode) {
                subscriptionPayload.external_id = this.correlationRule.id;
            }
            // And if we are trying to create an observation alert lets
            // re-set the correct notification_type
            if (this.correlationRule.output && this.correlationRule.output.visibility === "notification") {
                subscriptionPayload.notification_type = 'observations/notification';
            }
        }

        this.loading = true;

        if (this.editMode) {
            // Remove some attributes that are not need it during editing.
            /* TODO: don't do this 
            delete subscriptionPayload["class"];
            */
            // Lets define the list of requests we will do againt Herald for the edition process
            const heraldRequests = [AlHeraldClientV2.updateSubscription(this.accountId, this.subscriptionID, subscriptionPayload) as Promise<any>];
            const editedSubscribersList = this.notificationForm.getEditedSubscribers();
            // If we do not have any new or removed subscriber then we should not make
            // the additional request to Herald bulk update
            if (editedSubscribersList.length > 0) {
                heraldRequests.push(AlHeraldClientV2.batchUpdateSubscriptions(this.accountId, this.subscriptionID, editedSubscribersList));
            }

            Promise.all(heraldRequests).then(
                () => {
                    this.alBottomSheet.hide();
                    this.onSuccess.emit(`"${this.form.incidentAlertName}" notification was updated successfully.`);
                    this.loading = false;
                },
                (error) => {
                    console.error(error);
                    this.onError.emit("We are sorry, there was an internal error editing the incident alert.");
                    this.loading = false;
                    if (this.viewHelper) {
                        this.viewHelper.notifyError("We are sorry, there was an internal error editing the incident alert." , 5000);
                    }
                }
            );
        } else {
            AlHeraldClientV2.createSubscription(this.accountId, subscriptionPayload).then((response) => {
                this.alBottomSheet.hide();
                this.onSuccess.emit(`"${this.form.incidentAlertName}" notification was created successfully.`);
                this.loading = false;
            }, (error) => {
                console.error(error);
                this.onError.emit("We are sorry, there was an internal error creating the incident alert.");
                this.loading = false;
                if (this.viewHelper) {
                    this.viewHelper.notifyError("We are sorry, there was an internal error editing the incident alert.", 5000);
                }
            });
        }
    }

    /**
     * When user clicks on cancel button.
     */
    public cancel() {
        this.alBottomSheet.hide();
        this.onClose.emit(true);
    }

    /**
     * Get filter list.
     */
    getFilterList = ():string[] => {
        return this.selectedFilters.map((filter:AlSelectItem) => filter.value.caption);
    }

    /**
     * Get account list.
     */
    getAccountList = ():string[] => {
        return this.selectedAccounts.map((account:AlSelectItem) => account.value.id+"");
    }

    /**
     * Transform the list of accounts into selectable items.
     */
    transformAccountsToSelectableAccounts = () => {
        this.selectedAccounts = [];
        this.allSelectableAccounts = this.form.accounts.map((account:AIMSAccount) => {
            return {
                title: account.name,
                value: {
                    title: account.name,
                    value: account,
                } as AlSelectItem,
            } as AlSelectItem;
        });
        // Introduce two hardcoded "fake" accounts to the list of accounts, this allows
        // to implement all customers and manage accounts selection.
        if (this.form.accounts.length > 1) {
            // Introduce two hardcoded "fake" accounts to the list of accounts, this allows
            // to implement all customers and manage accounts selection.
            this.allSelectableAccounts.unshift({
                title: this.dictionaries.getTextMyAccountsAndManaged(),
                value: {
                    title: this.dictionaries.getTextMyAccountsAndManaged(),
                    value: this.dictionaries.getFakeMyAccountsAndManagedAccount(),
                } as AlSelectItem,
            } as AlSelectItem);
            this.allSelectableAccounts.unshift({
                title: this.dictionaries.getTextManagedAccounts(),
                value: {
                    title: this.dictionaries.getTextManagedAccounts(),
                    value: this.dictionaries.getFakeManagedAccount(),
                } as AlSelectItem,
            } as AlSelectItem);
        }
        if(this.allSelectableAccounts.length <= 1){
            this.accountDetails = "Send a notification for incidents created in my account that match the following criteria:";
        }
    }


    /**
     * Transform the list of filters into selectable items.
     */
    transformFiltersToSelectableFilters = () => {
        this.allSelectableFilters = [];
        this.selectedFilters = [];
        if (this.form.filters) {
            this.allSelectableFilters = this.form.filters.map((threatLevel:AlThreatLevel) => {
                const levelSubtitle = 'Threat Level';
                return {
                    title: threatLevel.caption,
                    subtitle: levelSubtitle,
                    value: {
                        title: threatLevel.caption,
                        subtitle: levelSubtitle,
                        value: threatLevel,
                    }
                } as AlSelectItem;
            });
        }
    }


    /**
     * Validates if the incident notification is filtered by a previously
     * created log correlation.
     */
    checkCorrelationFiltered(correlationRule?: AlCorrelationRuleV2): boolean {
        this.isCorrelationFiltered = false;
        if (correlationRule) {
            this.correlationRule = correlationRule;
            // TODO: Correlations should come in the future from Iris, temporal static integration.
            // Preselected correlation filtered option with readonly option active.
            const correlationOption: AlSelectItem = {
                title: this.correlationRule.name,
                value: {
                    title: this.correlationRule.name,
                    value: {
                        value: this.correlationRule.id,
                        caption: this.correlationRule.name,
                    } as AlThreatLevel,
                }
            };
            this.allSelectableFilters = [correlationOption];
            this.selectedFilters.unshift(correlationOption);
            this.isCorrelationFiltered = true;
        }
        return this.isCorrelationFiltered;
    }

    /**
     * Process the incident alert options received from gestalt.
     */
    processIncidentAlertOptions = async (incidentsAlertOptions:AlGenericAlertOptions, type: string, correlationRule?: AlCorrelationRuleV2) => {
        const accountsIds:string[] = await AIMSClient.getAccountsIdsByRelationship(this.accountId, 'managing');
        this.notificationForm.users = await AIMSClient.getUsersFromAccounts(accountsIds);
        this.notificationForm.users = CharacteristicsUtility.sortValueDescriptorList(this.notificationForm.users,'name');
        if(incidentsAlertOptions.accounts){
            this.form.accounts = incidentsAlertOptions.accounts;
        }
        this.transformAccountsToSelectableAccounts();

        if (this.notificationForm) {
            this.notificationForm.setSelectableUsers(this.notificationForm.users);

            let integrations: AlIntegrationConnection[] = [];

            if (incidentsAlertOptions.connections) {
                integrations = incidentsAlertOptions.connections.filter(connection => connection.payload_type === type) as AlIntegrationConnection[];
            }
            this.notificationForm.setSelectableIntegrations(integrations);
        }

        this.form.filters = incidentsAlertOptions.threatLevels;
        if (!this.checkCorrelationFiltered(correlationRule)) {
            this.transformFiltersToSelectableFilters();
        }
    }

    /**
     * Get the account from the current options.
     */
    getAccountById = (accountId:string): AIMSAccount => {
        if (accountId === this.dictionaries.getMyAccountsAndManagedFakeId()) {
            return this.dictionaries.getFakeMyAccountsAndManagedAccount();
        }
        if (accountId === this.dictionaries.getManagedAccountsFakeId()) {
            return this.dictionaries.getFakeManagedAccount();
        }

        return this.form.accounts.find((account:AIMSAccount) => account.id === accountId)
            ||  { id: accountId, name: `Account (${accountId})` } as AIMSAccount;
    }

    /**
     * Get the filter from the current options.
     */
    getFilterById = (filterId:string): AlThreatLevel => {
        const defaultFilter:AlThreatLevel = {
            value: filterId,
            caption: filterId
        };
        if (this.form.filters) {
            return this.form.filters.find((filter:AlThreatLevel) => filter.value === filterId)
            ||  defaultFilter;
        }
        return defaultFilter;
    }

    /**
     * Set the account list based on account IDs.
     */
    setAccountsList = (accounts:Array<string> ) => {
        this.selectedAccounts = [];
        if (accounts) {
            this.selectedAccounts = accounts.map((accountId:string) => {
                let account:AIMSAccount = this.getAccountById(accountId);
                return {
                    title: account.name,
                    value: account,
                } as AlSelectItem;
            });
        }
    }

    /**
     * Set the filters list based on filters IDs.
     */
    setFiltersList = (filters:Array<string> ) => {
        this.selectedFilters = [];
        if (filters) {
            this.selectedFilters = filters.map((filterId:string) => {
                let filterData:AlThreatLevel = this.getFilterById(filterId);
                return {
                    title: filterData.caption,
                    subtitle: 'Threat Level',
                    value: filterData,
                } as AlSelectItem;
            });
        }
    }

    /**
     * Set´s the scalated flag.
     */
    setEscalated = (escalated:boolean|undefined) => {
        this.form.escalated = escalated ? escalated: false;
    }

    /**
     * Set´s the al bottom sheet title
     * @param title The al bottom sheet title
     */
    setTexts = ( notificationType: string, action: "create" | "edit", isCorrelation: boolean = false ) => {

        // Lets set default values in here, which are going to be used for all notifications types, mostly
        let title = action.charAt(0).toUpperCase() + action.slice(1);
        this.criteriaLabel = "that match the following criteria";
        this.filtersTitle = isCorrelation? "Correlation Rule" : "Threat Levels";
        this.filtersPlaceholder = isCorrelation? "Correlation Name" : "Filter(s)";

        // Now we can switch between all notifications types and set their own properties if needed
        switch(notificationType) {
            case 'incidents/alerts':
                title = title + " an Incident Notification";
                this.formDescription = "Alert Logic sends you notifications when new or escalated incidents meet the criteria you set.";
                if (isCorrelation) {
                    this.formDescription = "Alert Logic generates an incident and can send a notification when log messages meet the correlation conditions you set.\
                                    Alert Logic does not review incidents generated by your custom correlation rules.";
                    this.criteriaLabel = "Send a notification when the following correlation triggers an incident";
                } else {
                    this.accountDetails = "Send a notification for incidents observed in the following account(s):";
                }
                break;
            case 'observations/notification':
                title = title + " an Observation Notification";
                this.formDescription = "Alert Logic sends you observation notifications when log messages meet the correlation conditions you set.\
                                Alert Logic does not review observations generated by your custom correlation rules.";
                this.criteriaLabel = "Send a notification when the following correlation triggers an observation";
                break;
            default:
                title = title + " an Alert Notification";
                this.formDescription = "Alert Logic sends you alert notifications when meet the criteria you set.";
                this.accountDetails = "Send a notification for alerts observed in the following account(s):";
                break;
        }
        this.headerOptions.title = title;
        // Let's handle the notification email subject based on the
        // notification type only on create action on edit this should
        // be the one coming from the subscription entity
        if (action === 'create') {
            this.dictionaries.getEmailSubjectTemplate(notificationType).then(emailSubject => {
                this.notificationForm.setEmailSubject(emailSubject);
            });
            this.notificationForm.webhookPayloadFormat = this.dictionaries.getWebhookPayload(notificationType);
        }
    }

    /**
     * Open the alert modal in edit mode.
     */
    async editAlertModal(subscription: AlHeraldAccountSubscriptionV2, correlationRule?: AlCorrelationRuleV2, entity?: AlGenericAlertDefinition) {
        await this.resetComponent();

        let type = 'incident';
        if (correlationRule && correlationRule.output && correlationRule.output.visibility === 'notification') {
            type = 'observation';
        }

        // We need to validate if the subscription type is an observation or an
        // incident alert with external id which means both come from correlations,
        // there is one particular caveat here and it is if in the future we have
        // incidents subscriptions coming from non-correlated entities then external
        // id may reference to a different service (need to think about this when bites)
        if (subscription.notification_type === 'observations/notification' ||
            subscription.notification_type === 'incidents/alerts') {
            if (!correlationRule && subscription.account_id && subscription.external_id) {
                correlationRule = await AlCoralClientV2.getCorrelationRule(subscription.account_id, subscription.external_id);
            }
        }

        this.setTexts(subscription.notification_type, "edit", correlationRule !== undefined);

        this.editMode = true;
        if (this.headerOptions.primaryAction) {
            this.headerOptions.primaryAction.text = "Update";
        }
        this.notificationForm.editUserCreator = '';
        if(entity && entity.properties.createdBy){
            this.notificationForm.editUserCreator = entity.properties.createdBy;
        }

        this.loading = true;
        this.alBottomSheet.open();

        ALGestaltNotifications.getGenericAlertOptions(this.accountId, 'incident').then(
            async (incidentsAlertOptions: AlGenericAlertOptions) => {
                await this.processIncidentAlertOptions(incidentsAlertOptions, type, correlationRule);

                this.subscriptionID = subscription.id;
                this.form.incidentAlertName = subscription.name;
                this.form.alertIsActive = subscription.active;
                if (subscription.options) {
                    this.notificationForm.setEmailSubject(subscription.options.email_subject);
                }
                if (subscription.subscribers) {
                    this.notificationForm.setSubscribers(subscription.subscribers);
                }
                if (subscription.filters) {
                    const conditions = SQXSearchQuery.fromJson(subscription.filters);
                    this.setAccountsList(this.dictionaries.getAccountsFromConditions(conditions));
                    // The correlations does not have filters
                    if (!correlationRule) {
                        this.setFiltersList(this.dictionaries.getFilterslistFromConditions(conditions));
                    }
                    this.setEscalated(this.dictionaries.getEscalatedFromConditions(conditions));
                }
                this.dataSnapshot = this.createDataSnapshot();
                this.validateForm();
                this.loading = false;
            },
            (error) => {
                console.error(error);
                this.onError.emit("We are sorry, there was an internal error retrieving options data.");
                this.loading = false;
                this.alBottomSheet.hide();
            },
        );
    }

    public createDataSnapshot(): AlIncidentAlertFormData {
        return {
            incidentAlertName: this.form.incidentAlertName,
            alertIsActive: this.form.alertIsActive,
            selectedAccounts: [...this.selectedAccounts],
            selectedFilters: [...this.selectedFilters],
            escalated:this.form.escalated,
            subscribers: [...this.notificationForm.getSubscribers()],
            emailSubject: this.notificationForm.getEmailSubject(),
        } as AlIncidentAlertFormData;
    }

    public hasFormChanged(): boolean {
        const accountsAndFilterKeys = ["title", "value"] as Array<keyof AlSelectItem>;
        const emailKeys = ["subscriber", "subscriber_type"] as Array<keyof AlHeraldSubscribersV2>;
        return (
            this.dataSnapshot.incidentAlertName !== this.form.incidentAlertName ||
            this.dataSnapshot.alertIsActive !== this.form.alertIsActive ||
            this.hasArrayChanged(this.dataSnapshot.selectedAccounts, this.selectedAccounts, accountsAndFilterKeys) ||
            this.hasArrayChanged(this.dataSnapshot.selectedFilters, this.selectedFilters, accountsAndFilterKeys) ||
            this.dataSnapshot.escalated !== this.form.escalated ||
            this.hasArrayChanged(this.dataSnapshot.subscribers, this.notificationForm.getSubscribers(), emailKeys) ||
            this.dataSnapshot.emailSubject !== this.notificationForm.getEmailSubject()
        );
    }

    /**
     * Open the Create Incidents Alert Screen.
     */
    openAddAlertModal(correlationRule?: AlCorrelationRuleV2) {
        this.resetComponent();

        let type = 'incident';

        // Lets set the notification and its particular title to be consistent
        let notificationType: string = "incidents/alerts";
        if (correlationRule && correlationRule.output && correlationRule.output.visibility === 'notification') {
            notificationType = 'observations/notification';
            type = 'observation';
        }
        this.setTexts(notificationType, "create", correlationRule !== undefined);

        this.loading = true;

        this.alBottomSheet.open();

        ALGestaltNotifications.getGenericAlertOptions(this.accountId, 'incident').then(
            async (incidentsAlertOptions:AlGenericAlertOptions) => {
                await this.processIncidentAlertOptions(incidentsAlertOptions, type, correlationRule);
                this.setAccountSelectedAsDefault();
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

}
