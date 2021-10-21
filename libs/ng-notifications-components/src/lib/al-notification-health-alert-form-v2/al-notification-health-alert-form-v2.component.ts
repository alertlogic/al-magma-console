import {
    Component,
    OnInit,
    Input,
    ViewChild,
    forwardRef,
    Output,
    EventEmitter
} from '@angular/core';

import {
    AlExposureNotificationsClient,
    AssetFilter,
    Subscription
} from '@al/exposure-notifications';

import {
    AlBottomSheetComponent,
    AlBottomSheetHeaderOptions,
    AlNotification,
    AlNotificationPanelComponent,
    AlNotificationType,
    AlSelectItem,
    AlViewHelperComponent,
    AlWizardStepperComponent,
    WizardStep
} from '@al/ng-generic-components';

import {
    AIMSAccount,
    AlHeraldAccountSubscriptionPayloadV2,
    AlHeraldAccountSubscriptionV2,
    AlHeraldClientV2,
    AlHeraldSubscribersV2
} from '@al/herald';

import { AlGenericAlertDefinition, AlGenericAlertOptions, ALGestaltNotifications, CharacteristicsUtility } from '@al/gestalt';

import { OptionAlertFilter } from '../types';
import { AlDeploymentsClient, Deployment } from '@al/deployments';
import { AIMSClient, SQXSearchQuery } from '@al/core';
import { AlNotificationDictionariesUtility }  from '../services/al-notification-dictionaries-utility';
import { AlNotificationFormComponent } from '../al-notification-form/al-notification-form.component';
import { AssetFilterOption, AssetFilterUnpacker } from '../services/al-health-notification-utility';
import { AlIntegrationConnection } from '@al/connectors';


interface AlHealthAlertFormData {
    id?: string;
    subscriptionName: string;
    isActive: boolean;
    accounts: AIMSAccount[];
    escalated: boolean;
    exposureType: 'agent' | 'appliance' | 'collector' | '';
    selectedStatuses: AlSelectItem<{title: string, id: string, checked: boolean}>[];
    selectedAssets: AlSelectItem[];
    selectedAccounts?: AlSelectItem[];
    selectedFilters?: AlSelectItem[];
    subscribers?: AlHeraldSubscribersV2[];
    emailSubject?: string;
}

type HealthNotificationFilter = { [filterName: string]: string[] | AssetFilter[] };

type AlertFilter = 'agent_status' | 'appliance_status' | 'collector_status';

@Component({
    selector: 'al-notification-health-alert-form-v2',
    templateUrl: './al-notification-health-alert-form-v2.component.html',
    styleUrls: ['./al-notification-health-alert-form-v2.component.scss']
})
export class AlNotificationHealthAlertFormV2Component implements OnInit {

    @Input() accountId!: string;

    @Output() onCancel = new EventEmitter<void>();
    @Output() onSuccess = new EventEmitter<string>();
    @Output() onError = new EventEmitter<string>();
    @Output() onWizardStepSelected: EventEmitter<WizardStep> = new EventEmitter<WizardStep>();

    @ViewChild('alWizard', { static: false }) alWizard!: AlWizardStepperComponent;
    @ViewChild('alBottomSheet', { static: false}) alBottomSheet!: AlBottomSheetComponent;
    @ViewChild(forwardRef(() => AlNotificationFormComponent)) notificationForm!: AlNotificationFormComponent;
    @ViewChild(forwardRef(() => AlViewHelperComponent), {static:false}) viewHelper?: AlViewHelperComponent;
    @ViewChild("notificationPanel", { static: true } ) notificationPanel!: AlNotificationPanelComponent;

    loading: boolean = true;
    editMode: boolean = false;
    agentStatusOptions: AlSelectItem[] = [];
    applianceStatusOptions: AlSelectItem[] = [];
    collectorStatusOptions: AlSelectItem[] = [];
    assetsOptions: AlSelectItem[] = [];
    policyOptions: OptionAlertFilter[] = [];
    healthPolicySelected: OptionAlertFilter | null = null;
    governanceOptions: OptionAlertFilter[] = [];
    healthGovernanceSelected: OptionAlertFilter | null = null;

    deploymentsDictionary: {[deploymentId: string]: Deployment} = {};
    subscriptionsDictionary: {[subscriptionId: string]: Subscription} = {};
    dictionaries = new AlNotificationDictionariesUtility();
    loadedDataByStep: {[number: number]: boolean} = { 0: false, 1: false, 2: false };

    public notificationsEmitterPopup: EventEmitter<AlNotification> = new EventEmitter<AlNotification>();
    public notificationPopup!: AlNotification;

    readonly headerOptions: AlBottomSheetHeaderOptions = {
        icon: 'announcement',
        title: 'Create a Health Notification',
        primaryAction: {
            text: 'Next',
            disabled: true,
        },
        secondaryAction: {
            text: 'Cancel',
            disabled: false,
        },
    };

    public readonly formData: AlHealthAlertFormData = {
        subscriptionName: "",
        isActive: true,
        accounts: [],
        escalated: true,
        exposureType: '',
        selectedStatuses: [],
        selectedAssets: [],
        id: ""
    };

    readonly notificationType: string = "health/alerts";

    constructor() {}

    ngOnInit(): void {}

    onPrimaryAction(): void {
        if (this.alWizard.stepIndex < 2) {
            this.editMode ? this.save() : this.stepForward();
        } else if (this.alWizard.stepIndex === 2) {
            this.save();
        }
    }

    onSecondaryAction(): void {
        this.flushNotifications();
        this.onCancel.emit();
        this.alBottomSheet.hide();
    }

    flushNotifications() {
        this.notificationPanel.flush();
    }

    scopeChanged(selection: AlSelectItem[]): void {
        this.formData.selectedAssets = selection;
    }

    statusChanged(selection: AlSelectItem[]): void {
        this.formData.selectedStatuses = selection;
        this.editMode ? this.validateAllSteps() : this.validateStep(1);
    }

    onSubscribersChanged() {
        this.editMode ? this.validateAllSteps() : this.validateStep(2);
    }

    async editAlertModal(subscription: AlHeraldAccountSubscriptionV2, entity?: AlGenericAlertDefinition) {
        this.loading = true;
        this.alBottomSheet.open();
        this.resetComponent();
        this.setTexts(subscription.notification_type, "edit" );
        this.editMode = true;
        if (this.headerOptions.primaryAction) {
            this.headerOptions.primaryAction.text = "Update";
        }
        this.formData.subscriptionName = subscription.name;
        this.formData.isActive = subscription.active;
        this.formData.id = subscription.id;
        await this.setHealthNotificationFilters();
        await this.setHealthNotificationPolicies();
        await this.setUsersAndAccountData();
        await this.setAllSubscriptions();
        this.setHealthNotificationFiltersToForm(subscription.filters);

        this.notificationForm.editUserCreator = '';
        if(entity && entity.properties.createdBy){
            this.notificationForm.editUserCreator = entity.properties.createdBy;
        }
        if(subscription.options) {
            this.notificationForm.setEmailSubject(subscription.options.email_subject);
        }
        if(subscription.subscribers) {
            this.notificationForm.setSubscribers(subscription.subscribers);
        }
        if(this.subscriptionsDictionary[subscription.id]) {
            const policyId = this.subscriptionsDictionary[subscription.id].notification_policy?.id;
            this.healthPolicySelected = this.policyOptions.filter(
                policy => policy.value === policyId
            )[0];
        }
        if (subscription.suppression_interval) {
            this.healthGovernanceSelected = this.governanceOptions.filter(option => {
                return option.value === subscription.suppression_interval+"";
            }).pop() ?? this.governanceOptions[0];
        }
        this.alWizard.steps = this.alWizard.steps.map(
            step => {
                step.complete = true;
                return step;
            }
        );
        this.validateAllSteps();
        this.loading = false;
    }

    async openAddAlertModal(): Promise<void> {
        this.setTexts(this.notificationType, "create" );
        this.loading = false;
        this.alBottomSheet.open();
        this.resetComponent();
        await this.setStepsOptionsData();
    }

    validateStep(stepIndex: number): void {
        switch (stepIndex) {
            case 0:
                this.validateFirstStep();
                break;
            case 1:
                this.validateSecondStep();
                break;
            case 2:
                this.validateThirdStep();
                break;
            default:
                break;
        }
    }

    public validateAllSteps(): void {
        const validFirstStep: boolean = !!this.formData.exposureType && !!this.formData.subscriptionName;
        const validSecondStep: boolean = this.formData.selectedStatuses.length > 0;
        const validThirdStep: boolean = this.notificationForm.getSubscribers().length > 0;
        if (!validThirdStep) {
            if (this.viewHelper) {
                this.viewHelper.cleanNotifications();
                this.viewHelper.notifyWarning(this.dictionaries.getNoSubscribersWarningMessage(), 3000);
            }
        }
        this.privateSetPrimaryActionState(validFirstStep&&validSecondStep&&validThirdStep);
    }

    private setHealthNotificationFiltersToForm(filters: any) {
        if (filters && filters !== {} && filters.hasOwnProperty('and')) {
            const conditions: SQXSearchQuery = SQXSearchQuery.fromJson(filters);
            const agentStatusValues: string[] = this.getValuesFromConditions(conditions, "notification.agent_status");
            const applianceStatusValues: string[] = this.getValuesFromConditions(conditions, "notification.appliance_status");
            const collectorStatusValues: string[] = this.getValuesFromConditions(conditions, "notification.collector_status");
            const exposureTypesLengthMatrix: number[] = [agentStatusValues.length, applianceStatusValues.length, collectorStatusValues.length];
            if (exposureTypesLengthMatrix.filter(value => value > 0).length === 1) {
                if (agentStatusValues.length > 0) {
                    this.formData.exposureType = "agent";
                    this.formData.selectedStatuses = this.markAsCheckedOptions(this.agentStatusOptions, agentStatusValues);
                }
                if (applianceStatusValues.length > 0) {
                    this.formData.exposureType = "appliance";
                    this.formData.selectedStatuses = this.markAsCheckedOptions(this.applianceStatusOptions, applianceStatusValues);
                }
                if (collectorStatusValues.length > 0) {
                    this.formData.exposureType = "collector";
                    this.formData.selectedStatuses = this.markAsCheckedOptions(this.applianceStatusOptions, collectorStatusValues);
                }
            } else {
                console.error("Incompatible data from backend to display in UI form");
                const messageError: string = "Some of exposure types options do not match with the UI structure requirements " +
                "and will not be loaded nor able to be updated on this form. " +
                "These exposure types options will not modify but you will able to change the exposure type if needed";
                this.notificationPopup = new AlNotification(messageError, AlNotificationType.Information, 0, true, undefined, "DISMISS");
                this.notificationsEmitterPopup.emit(this.notificationPopup);
            }
            const unpacker = new AssetFilterUnpacker(filters['and']);
            const assets: AssetFilterOption[] = unpacker.extractAssets() as AssetFilterOption[];
            this.setAssetFilters(assets);
        }
    }

    private getValuesFromConditions(conditions: SQXSearchQuery, type: string): string[] {
        const statusCond = conditions.getPropertyCondition(type);
        let values: string [] = [];
        if (statusCond) {
            values = statusCond.getValues() as string[];
        }
        return values;
    }

    private setAssetFilters(assets: AssetFilterOption[]) {
        this.formData.selectedAssets = assets.map(
            asset => {
                const deploymentId: string = asset['asset.deployment_id'];
                const assetType: string = asset['asset.type'];
                let assetKey: string | undefined = asset['asset.key'];
                const assetsFiltered = this.assetsOptions.filter( assetItem => {
                    const assetInfo: string[] = assetItem.value.id.split("#");
                    let deploymentIdOption: string = assetInfo[0];
                    let assetTypeOption: string = assetInfo[1];
                    let assetKeyOption: string = assetInfo[2];
                    if (assetType === "deployment") {
                        return deploymentId === deploymentIdOption && assetType === assetTypeOption;
                    } else {
                        return deploymentId === deploymentIdOption && assetType === assetTypeOption && assetKey === assetKeyOption;
                    }
                });
                return assetsFiltered && assetsFiltered.length > 0 ? assetsFiltered[0] : {} as AlSelectItem<any>;
            }
        );
        this.formData.selectedAssets = this.formData.selectedAssets.filter(
            asset => Object.entries(asset).length > 0
        ).map(
            asset => {
                asset.value.checked = true;
                return asset.value;
            }
        );
    }

    private markAsCheckedOptions(statusOptions: AlSelectItem<any>[], values: string[]): AlSelectItem<any>[] {
        let options: AlSelectItem<any>[] = [];
        statusOptions.forEach(
            option => {
                if (values.includes(option.value?.id) && option.value.hasOwnProperty('checked')) {
                    option.value.checked = true;
                    options.push(option.value);
                }
            }
        );
        return options;
    }

    private validateFirstStep(): void {
        const isValid: boolean = !!this.formData.exposureType && !!this.formData.subscriptionName;
        this.privateSetPrimaryActionState(isValid);
    }

    private validateSecondStep(): void {
        const isValid: boolean = this.formData.selectedStatuses.length > 0;
        this.privateSetPrimaryActionState(isValid);
    }

    private validateThirdStep(): void {
        const isValid: boolean = this.notificationForm.getSubscribers().length > 0;
        this.privateSetPrimaryActionState(isValid);
        if (!isValid) {
            if (this.viewHelper) {
                this.viewHelper.cleanNotifications();
                this.viewHelper.notifyWarning(this.dictionaries.getNoSubscribersWarningMessage(), 3000);
            }
        }
    }

    private privateSetPrimaryActionState(isValid: boolean): void {
        if (this.headerOptions.primaryAction) {
            this.headerOptions.primaryAction.disabled = !isValid;
        }
    }

    private save() {
        this.loading = true;
        const subscriptionPayload: AlHeraldAccountSubscriptionPayloadV2 = this.prepareSubscriptionPayload();
        const exposureType: string = this.formData.exposureType;
        const selectedStatuses: AlSelectItem<{title: string; id: string; checked: boolean;}>[] = this.formData.selectedStatuses;
        let filters = {
            "and":[
                {"or":[
                        {"in":[{"source": "notification.agent_status"},(exposureType === 'agent'? selectedStatuses : []).map(item=>item.id)]
                        },
                        {"in":[{"source": "notification.appliance_status"},(exposureType === 'appliance'? selectedStatuses : []).map(item=>item.id)]
                        },
                        {"in":[{"source": "notification.collector_status"},(exposureType === 'collector'? selectedStatuses : []).map(item=>item.id)]
                        }
                    ]
                },
                {"in":[{ "source":"account.id" },[this.accountId]]},
                {"or": [{}]}
            ]
        };
        if (this.formData.selectedAssets.length > 0) {
            filters.and[2] = {"or": this.getAssetFilterObject(this.formData.selectedAssets)};
        } else {
            filters.and.pop();
        }
        switch (this.formData.exposureType) {
            case 'agent':
                if (filters.and[0].or && filters.and[0].or.length > 0) {
                    filters.and[0].or = [filters.and[0].or[0]];
                }
                break;
            case 'appliance':
                if (filters.and[0].or && filters.and[0].or.length > 0) {
                    filters.and[0].or = [filters.and[0].or[1]];
                }
                break;
            case 'collector':
                if (filters.and[0].or && filters.and[0].or.length > 0) {
                    filters.and[0].or = [filters.and[0].or[2]];
                }
                break;
            default:
                break;
        }
        // Let's only add the subscribers to the payload on creation
        if (!this.editMode) {
            subscriptionPayload.subscribers = this.notificationForm.getSubscribers();
        }
        subscriptionPayload.filters = filters;
        if (this.healthGovernanceSelected) {
            subscriptionPayload.suppression_interval = parseInt(this.healthGovernanceSelected.value, 10);
        }
        if(this.editMode) {
            // Remove some attributes that are not need it during editing.
            delete ( subscriptionPayload as any )["class"];     /* no no: can't delete non-optional interface properties! */

            let subscriptionBody: Subscription = <Subscription> {
                "subscription": subscriptionPayload,
                "notification_policy": {id: this.healthPolicySelected?.value}
            };
            const subscriptionId: string = this.formData.id ? this.formData.id : "";
            const heraldRequests = [AlExposureNotificationsClient.updateSubscription(this.accountId, subscriptionId, subscriptionBody)];
            const editedSubscribersList = this.notificationForm.getEditedSubscribers();

            // If we do not have any new or removed subscriber then we should not make
            // the additional request to Herald bulk update
            if (editedSubscribersList.length > 0) {
                heraldRequests.push(AlHeraldClientV2.batchUpdateSubscriptions(this.accountId, subscriptionId, editedSubscribersList));
            }

            Promise.all(heraldRequests).then(
                () => {
                    this.onSuccess.emit(`"${this.formData.subscriptionName}" notification was updated successfully.`);
                    this.loading = false;
                    this.resetComponent();
                    this.alBottomSheet.hide();
                }, error => {
                    this.showErrorMessage("Error updating the health subscription", error);
                }
            );
        } else {
            const healthPolicy = this.healthPolicySelected ? this.healthPolicySelected : null;
            let subscriptionBody: Subscription = <Subscription> {
                "subscription": subscriptionPayload,
                "notification_policy": null
            };
            if (healthPolicy) {
                subscriptionBody.notification_policy = { id: healthPolicy.value };
            }
            AlExposureNotificationsClient.createSubscription(this.accountId, subscriptionBody).then(() => {
                this.onSuccess.emit(`"${this.formData.subscriptionName}" notification was created successfully.`);
                this.loading = false;
                this.resetComponent();
                this.alBottomSheet.hide();
            }, error => {
                this.showErrorMessage("Error creating the health subscription", error);
            });
        }
    }

    private prepareSubscriptionPayload():AlHeraldAccountSubscriptionPayloadV2{
        const subscriptionPayload: AlHeraldAccountSubscriptionPayloadV2 = {
            name: this.formData.subscriptionName,
            class: "event",
            active: this.formData.isActive,
            options: {
                email_subject: this.notificationForm.getEmailSubject()
            },
            notification_type: this.notificationType
        };
        return subscriptionPayload;
    }

    private getAssetFilterObject(assetsSelected: AlSelectItem<{title: string, id: string, checked: boolean}>[]): {}[] {
        let assetFilters: {}[] = [];
        assetFilters = assetsSelected.map(
            asset => {
                if (asset.id) {
                    const assetCharacteristics: string[] = asset.id.split('#');
                    const deploymentId: string = assetCharacteristics[0];
                    const assetType: string = assetCharacteristics[1];
                    const assetKey: string = assetCharacteristics[2];
                    let filter = {
                        "and": [
                            {
                                "=": [
                                    {"source": "asset.deployment_id"},
                                    deploymentId
                                ]
                            },
                            {
                                "=":[
                                    {
                                        "source": "asset.type"
                                    },
                                    assetType
                                ]
                            }
                        ]
                    };
                    if (assetType !== "deployment") {
                        filter.and.push(
                            {
                                "=":[
                                    {"source": "asset.key"},
                                    assetKey
                                ]
                            }
                        );
                    }
                    return filter;
                } else {
                    return {};
                }
            }
        );
        return assetFilters;
    }

    private stepForward(): void {
        this.alWizard.stepForward();
        this.setStepsOptionsData();
        if (this.headerOptions.primaryAction) {
            this.headerOptions.primaryAction.disabled = true;
        }
        if (this.alWizard.stepIndex === 2 && this.headerOptions.primaryAction) {
            this.headerOptions.primaryAction.text = "SAVE";
        }
        this.validateAllSteps();
    }

    private resetComponent(): void {
        this.editMode = false;
        this.agentStatusOptions = [];
        this.applianceStatusOptions = [];
        this.collectorStatusOptions = [];
        this.assetsOptions = [];
        this.deploymentsDictionary = {};
        this.subscriptionsDictionary = {};
        this.formData.subscriptionName =  "";
        this.formData.selectedAssets  = [];
        this.formData.selectedStatuses = [];
        this.formData.isActive = true;
        this.formData.exposureType = "";
        this.loadedDataByStep = { 0: false, 1: false, 2: false };
        if (this.headerOptions.primaryAction) {
            this.headerOptions.primaryAction.text = "Next";
            this.headerOptions.primaryAction.disabled = true;
        }
        if (this.alWizard) {
            this.alWizard.reset();
        }
        if (this.notificationForm) {
            this.notificationForm.reset();
            this.notificationForm.setEmailSubject("");
        }
    }

    private async setStepsOptionsData(): Promise<void> {
        const stepIndex: number = this.alWizard?.stepIndex;
        this.loading = true;
        if (stepIndex === 1 && !this.loadedDataByStep[1]) {
            await this.setHealthNotificationFilters();
            this.loadedDataByStep[1] = true;
        }
        if (stepIndex === 2 && !this.loadedDataByStep[2]) {
            await this.setHealthNotificationPolicies();
            await this.setUsersAndAccountData();
            this.loadedDataByStep[2] = true;
        }
        if (stepIndex === 0  && !this.loadedDataByStep[0]) {
            await this.setAllSubscriptions();
            this.loadedDataByStep[0] = true;
        }
        this.loading = false;
    }

    private async setAllSubscriptions(): Promise<void> {
        let subscriptions: Subscription[] = [];
        try {
            subscriptions = await AlExposureNotificationsClient.getSubscriptions(this.accountId);
            subscriptions.forEach(subscription => {
                if (subscription.subscription.hasOwnProperty('id') && subscription.subscription.id) {
                    this.subscriptionsDictionary[subscription.subscription.id] = subscription;
                }
            });
        } catch (error) {
            console.error(error);
            this.showErrorMessage("We are sorry, there was an internal error retrieving options data from gestalt", error);
        }
    }

    private async setUsersAndAccountData(): Promise<void> {
        try {
            let incidentsAlertOptions:AlGenericAlertOptions =
                await ALGestaltNotifications.getGenericAlertOptions(this.accountId, 'incident');

            await this.processIncidentAlertOptions(incidentsAlertOptions, 'health');
        } catch (error) {
            console.error(error);
            this.showErrorMessage("We are sorry, there was an internal error retrieving options data from gestalt", error);
            this.alBottomSheet.hide();
        }
    }

    private async processIncidentAlertOptions(incidentsAlertOptions:AlGenericAlertOptions, type: string): Promise<void> {
        const accountsIds:string[] = await AIMSClient.getAccountsIdsByRelationship(this.accountId, 'managing');
        this.notificationForm.users = await AIMSClient.getUsersFromAccounts(accountsIds);
        this.notificationForm.users = CharacteristicsUtility.sortValueDescriptorList(this.notificationForm.users,'name');
        if(incidentsAlertOptions.accounts){
            this.formData.accounts = incidentsAlertOptions.accounts;
        }
        if (this.notificationForm) {
            this.notificationForm.setSelectableUsers(this.notificationForm.users);
            let integrations: AlIntegrationConnection[] = [];

            if (incidentsAlertOptions.connections) {
                integrations = incidentsAlertOptions.connections.filter(connection => connection.payload_type === type) as AlIntegrationConnection[];
            }
            this.notificationForm.setSelectableIntegrations(integrations);
        }
    }

    private async setHealthNotificationPolicies(): Promise<void> {
        let healthPolicyOptions: OptionAlertFilter[] = [];
        let policies = [];
        try {
            policies =  await AlExposureNotificationsClient.getNotificationPolicies(this.accountId);
            policies.sort((a,b)=> a.schedule.delay - b.schedule.delay);
            if (policies && Array.isArray(policies)) {
                healthPolicyOptions = policies.map(
                    policy => {
                        return {
                            title: policy.name,
                            value: policy.id
                        } as OptionAlertFilter;
                    }
                );
                // Governance options
                this.governanceOptions = policies.map(
                    policy => {
                        return {
                            title: policy.name,
                            value: this.transformMiliSecsToMins(policy.schedule.delay)
                        } as OptionAlertFilter;
                    }
                );
                if (this.governanceOptions.length > 0) {
                    this.healthGovernanceSelected = this.governanceOptions[0];
                }
            }
        } catch (error) {
            console.error(error);
            this.showErrorMessage("Error getting notification policies", error);
        }
        this.setHealthPolicyOptions(healthPolicyOptions);
    }

    private async setHealthNotificationFilters(): Promise<void> {
        let notificationFilters: HealthNotificationFilter[] = [];
        try {
            notificationFilters =
                await AlExposureNotificationsClient.getNotificationRules(this.accountId);
        } catch (error) {
            console.error(error);
            this.showErrorMessage("Error getting the Notifications Filters", error);
        }
        this.agentStatusOptions = this.getStatusOptions("agent_status", notificationFilters);
        this.applianceStatusOptions = this.getStatusOptions("appliance_status", notificationFilters);
        this.collectorStatusOptions = this.getStatusOptions("collector_status", notificationFilters);

        await this.setDeploymentsDictionary();
        this.setAllAssetFilters(notificationFilters);
    }

    private async setDeploymentsDictionary(): Promise<void> {
        let deployments: Deployment[] = [];
        try {
           deployments = await AlDeploymentsClient.listDeployments(this.accountId);
        } catch (error) {
            console.error(error);
            this.showErrorMessage("Error getting deployments list", error);
        }
        deployments.forEach(deployment => {
            if(deployment.id){
                this.deploymentsDictionary[deployment.id] = deployment;
            }
        });
    }

    private getStatusOptions(alertFilter: AlertFilter,
                             notificationFilters: HealthNotificationFilter[]): AlSelectItem[] {
        let statusOptions: AlSelectItem[] = [];
        if (notificationFilters && Array.isArray(notificationFilters)) {
            notificationFilters.forEach(filter => {
                if (filter.hasOwnProperty(alertFilter) && Array.isArray(filter[alertFilter])) {
                    let filters: string[] = [];
                    filter[alertFilter].forEach((filter: string | AssetFilter) => {
                        if (typeof filter === "string") {
                            filters.push(filter);
                        }
                    });
                    statusOptions = filters.map(optionFilter => {
                        const title: string = optionFilter === 'collection' ? 'Not Collecting' : optionFilter.charAt(0).toUpperCase() + optionFilter.slice(1);
                        const value = {
                            title: title,
                            id: optionFilter,
                            checked: false,
                        };
                        return {
                            title,
                            value,
                            id: title,
                        } as AlSelectItem;
                    });
                }
            });
        }
        return statusOptions;
    }

    private setAllAssetFilters(notificationFilters: HealthNotificationFilter[]): void {
        if (notificationFilters && Array.isArray(notificationFilters)) {
            notificationFilters.forEach(filter => {
                if (filter.hasOwnProperty('assets') && Array.isArray(filter['assets'])) {
                    let assetFilters: AssetFilter[] = [];
                    filter['assets'].forEach( (filter: string | AssetFilter) => {
                        if (typeof filter !== "string") {
                            assetFilters.push(filter);
                        }
                    });
                    this.assetsOptions = assetFilters.map(optionFilter => {
                        const deploymentName: string = this.getDeploymentName(optionFilter.deployment_id+"");
                        const title: string =  `${ optionFilter.type }: ${ optionFilter.name } ( ${deploymentName} )`;
                        const value = {
                            title,
                            id: optionFilter.deployment_id + "#" + optionFilter.type + "#" + optionFilter.key,
                            checked: false,
                        };
                        return {
                            title,
                            value,
                            id: title,
                        } as AlSelectItem;
                    });
                }
            });
        }
    }

    private getDeploymentName(deploymentId: string): string {
        if (this.deploymentsDictionary[deploymentId] && this.deploymentsDictionary[deploymentId].name) {
            return this.deploymentsDictionary[deploymentId].name + " Deployment";
        }
        return deploymentId ? deploymentId : "N/A";
    }

    private  setTexts = async ( notificationType: string, action: "create" | "edit" ): Promise<void> => {
        // Lets set default values in here, which are going to be used for all notifications types, mostly
        let title = action.charAt(0).toUpperCase() + action.slice(1);
        this.headerOptions.title = title + " a Health Notification";

        // Let's handle the notification email subject based on the
        // notification type only on create action on edit this should
        // be the one coming from the subscription entity
        if (action === 'create' && this.notificationForm) {
            try {
                const emailSubject: string =  await this.dictionaries.getEmailSubjectTemplate(notificationType);
                this.notificationForm.setEmailSubject(emailSubject);
            } catch (error) {
                console.error(error);
                this.showErrorMessage("Error getting the Notifications Filters", error);
            }
        }
    }

    /**
     * Display and notify if an error occur
     */
    private showErrorMessage (message:string, error: any) {
        console.error(error);
        this.onError.emit(message);
        this.loading = false;
        if (this.viewHelper) {
            this.viewHelper.notifyError(message, 5000);
        }
    }

    private setHealthPolicyOptions(policyOptions: OptionAlertFilter[]) {
        this.policyOptions = policyOptions;
        if (policyOptions.length > 0) {
            this.healthPolicySelected = policyOptions[0];
        }
    }

    private transformMiliSecsToMins(number: number): string {
        return (number/60000)+"";
    }

}
