import { Component, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { AlToolbarContentConfig, AlToastService, AlBottomSheetHeaderOptions, AlToastMessage } from '@al/ng-generic-components';
import { ConfirmationService } from 'primeng/api';
import { AlBaseCardConfig, AlBaseCardItem, AlBaseCardFooterActions, AlBaseCardFooterActionEvent } from '@al/ng-cardstack-components';
import { SystemLogCard, PropertiesCard, GeneralPropertiesSystemLogCard, GeneralPropertiesEventLogCard, LogType, CardCollectEvent, SysLogTypes, UserInfoCache } from '../../types/system-log.types';
import { AlApplication, AlRule, AlApplicationsClient, AlAssetScopeItem, AlRulePayload, AlTagScopeItem } from '@al/applications';
import { BrainstemService, O3BaseComponent,  AssetsService, AssetDescriptor, AIMSAPIClient } from '@components/technical-debt';
import { ActivatedRoute } from '@angular/router';
import { AlHeaderNavToolConfig, AlHeaderNavToolComponent } from '@components/technical-debt/src/app/design';
import { SelectItem } from 'primeng/api';
import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';
import { Deployment } from '@al/deployments';
import { DeploymentApplicationLogsAddScopeRuleFormComponent as AddRuleFormComponent } from '../deployment-application-logs-add-scope-rule-form/deployment-application-logs-add-scope-rule-form.component';
import { ApplicationLogCardDescriptor as CardDescriptor } from '../../../../../types/application-log.types';
import { map } from 'rxjs/operators';
import { Observable, forkJoin as observableForkJoin } from 'rxjs';
import { cloneDeep } from 'lodash';

import {
    DeploymentConfigurationNotificationMessage as NotificationMessage
} from '../../types';

@Component({
    selector: 'al-deployment-system-logs',
    templateUrl: './deployment-system-logs.component.html',
    styleUrls: ['./deployment-system-logs.component.scss'],
    providers: [ConfirmationService]
})
export class DeploymentSystemLogsComponent extends O3BaseComponent {

    @Output() onNextAction: EventEmitter<never> = new EventEmitter();

    @Output() saveModal: EventEmitter<AlRule> = new EventEmitter();
    @Output() nextModal: EventEmitter<AlRule> = new EventEmitter();
    @Output() closeModal: EventEmitter<never> = new EventEmitter();
    @Output() notify: EventEmitter<NotificationMessage> = new EventEmitter();

    @ViewChild('addRuleForm')
    addRuleForm: AddRuleFormComponent;

    @ViewChild('headerNavTool')
    navTool: AlHeaderNavToolComponent;

    /** Confirmation dialog title */
    public deleteConfirmartionHeaderTitle: string = '';

    /** Modal properties */
    public showModalForm: boolean = false;
    public modalTitle: string;

    title = { page: '', header: ''};
    apiError = false;
    loading = true;

    termToSearch: string = '';

    // it allows to configure the type of syslog.
    // that the UI should have to handle by the filter
    // component
    syslogTypes: Array<SysLogTypes> = [
        {
            label: 'All System Logs',
            value: 'system',
            allTypes: true
        },
        {
            label: 'Linux System Logs',
            value: 'syslog',
            allTypes: false
        },
        {
            label: 'Windows Event Logs',
            value: 'eventlog',
            allTypes: false
        }
    ];

    public accountId: string;
    public isDefaultRule: boolean;
    public applicationSelectedId: string;
    public deployment: Deployment;
    public deploymentId: string;
    public deploymentName: string;
    public action:string;
    public allowedAssetTypes: string[] = ['tag', 'deployment', 'vpc', 'subnet'];
    public applicationSyslogId: string = "1";
    public applicationRemoteSyslogId: string = "remote-syslog";
    public applicationEventlogId: string = "2";
    public assetsMap: { [i: string]: { [i: string]: AssetDescriptor } } = {};

    private rawApplications: Array<AlApplication>;
    private rawRules: Array<AlRule>;

    private userInfoCache: Array<UserInfoCache> = [{userId: 'system', name: 'System'}];

    /**
     * All the cards filled from the backend according to
     * the applied filter
     */
    cards: Array<SystemLogCard> = [];

    /**
     * Filtered cards according to the search term
     */
    filteredCards: Array<SystemLogCard> = [];
    showModal = false;
    typeRule: string;
    rulePayload: AlRulePayload;
    ruleId: string;

    /**
     * Sort config
     */
    sortConfig: { options: Array<SelectItem>; selected: string; order: 'ASC' | 'DESC' } = {
        options: [
            {
                value: 'type',
                label: 'Sort by Type'
            },
            {
                value: 'name',
                label: 'Sort by Name'
            }
        ],
        selected: 'type',
        order: 'ASC'
    };

    /**
     * Nav Tool config
     */
    public headerNavToolConf: AlHeaderNavToolConfig = {
        title: "Add System Log",
        withIconTitle: false,
        iconTitle: {
            iconClass: 'material-icons',
            icon: 'add'
        },
        rowLeftPadding: '20px',
        enableSortBySelect: false,
        selectedSortName: 'type',
        isArchiveEnable: false,
        isSettingsEnable: false,
        textPlaceHolder: 'search',
        enableMultipleFilter: false,
        buttonPlusMenu: true,
        menuAddTitle: 'Duplicate System Log',
        menuAddItems: [
            {
                id: 'syslog',
                description: 'Linux System Log',
                icon: null,
                badge: null
            },
            {
                id: 'remote-syslog',
                description: 'Linux Remote System Log',
                icon: null,
                badge: null
            },
            {
                id: 'eventlog',
                description: 'Windows Event Log',
                icon: 'star',
                badge: '*'
            }
        ]
    };

    toolbarConfig: AlToolbarContentConfig = {
        showSelectAll: false,
        selectAll: false,
        showGroupBy: true,
        showSearch: false,
        search: {
            maxSearchLength: 40,
            textPlaceHolder: "search"
        },
        group: {
            options: this.syslogTypes.map(item => { return {label: item.label, value: item.value}}),
            selectedOption: 'system'
        }
    }

    public addRuleFormHeaderOptions: AlBottomSheetHeaderOptions = {
        classIcon: 'al al-assets',
        iconStyle: { "font-size": "2.5em" },
        title: 'Manage Assets',
        collapsibleFromTitle: false,
        primaryAction: {
            text: 'Save ',
            disabled: false,
        },
        secondaryAction: {
            text: 'Cancel',
            disabled: false
        }
    };

    public headerOptions: AlBottomSheetHeaderOptions  = {
        title:  '',
        iconStyle : {'font-size': '23px'},
        primaryAction: {
            text: 'Save',
            disabled:  true,
        },
        secondaryAction:{
            text:  'Cancel',
            disabled:  false
        }
    };

    generalBaseCardConfig: AlBaseCardConfig = {
        toggleable: true,
        checkable: false,
        hasIcon: true,
        toggleableButton: true
    };

    generalFooterActions: AlBaseCardFooterActions =  {
        right: [
            {
                icon: 'ui-icon-delete',
                text: 'DELETE',
                visible: false,
                event: 'delete'
            },
            {
                icon: 'ui-icon-content-copy',
                text: 'DUPLICATE',
                visible: true,
                event: 'duplicate'
            },
            {
                icon: 'al al-assets',
                text: 'ASSETS',
                visible: true,
                event: 'assets'
            },
            {
                icon: 'ui-icon-edit',
                text: 'EDIT',
                visible: true,
                event: 'edit'
            }
        ]
    }

    notificationMessages = {
        create: 'Your Application has been added to your list.',
        edit: 'Your changes have been saved.',
        duplicate: 'Your changes have been saved.',
        manageAssets: 'Your changes have been saved.'
    }

    titleLabelsForm = {
        'create': {
            'syslog': 'Add Linux System Log',
            'eventlog': 'Add Windows Event Log',
            'remote-syslog': 'Add Linux Remote System Log'
        },
        'edit': {
            'syslog': 'Edit Linux System Log',
            'eventlog': 'Edit Windows Event Log',
            'remote-syslog': 'Edit Linux Remote System Log'
        },
        'duplicate': {
            'syslog': 'Duplicate Linux System Log',
            'eventlog': 'Duplicate Windows Event Log',
            'remote-syslog': 'Duplicate Linux Remote System Log'
        }
    }

    constructor(
        protected brainstem: BrainstemService,
        protected route: ActivatedRoute,
        protected alToastService: AlToastService,
        protected assetsService: AssetsService,
        protected deploymentsService: DeploymentsUtilityService,
        private confirmationService: ConfirmationService,
        protected aimsService: AIMSAPIClient
    ) {
        super(brainstem);
        super.lifecycle({ init: this.onInit } );
    }

    onInit(): void {
        this.deployment = this.deploymentsService.getDeploymentOnTracking();
        this.deploymentId = this.deployment.id;
        this.deploymentName = this.deployment.name;
        observableForkJoin(this.calculateAssetsObservables()).subscribe(
            (assets) => {
                const assetsMap = {};
                assets.forEach((dictionary, index) => {
                    const type = this.allowedAssetTypes[index];
                    assetsMap[type] = dictionary;
                });
                this.assetsMap = assetsMap;
            }
        );
        this.route.params.subscribe(params => {
            this.accountId = params.hasOwnProperty("accountId") ? params["accountId"] : null;
            if (this.accountId) {
                this.getRemoteData().then(
                    (success) => {
                        this.populateCards();
                        this.filteredCards = this.cards;
                        this.applySortBy('name');
                        this.applySortBy();
                    }
                );
            }
        });
    }

    async getRemoteData(filter: string = 'system'): Promise<boolean> {
        this.cards = [];
        try {
            this.loading = true;
            const types = this.syslogTypes.filter(type => !type.allTypes).map(type => type.value );

            // get the backend data for applications
            this.rawApplications = await AlApplicationsClient.getAllApplications(this.accountId, { attributes: filter });

            // injects the type for applications
            this.rawApplications.forEach(app => {
                app.attributes.forEach(attr => {
                    if (types.includes(attr)) {
                        app.type = attr;
                    }
                })
            });

            // get the backend data for rules
            this.rawRules = await AlApplicationsClient.getAllRules(this.accountId, { attributes: filter }, this.deploymentId);

            // injects the type for rules
            this.rawRules.forEach(rule => {
                rule.attributes.forEach(attr => {
                    if (types.includes(attr)) {
                        rule.type = attr;
                    }
                })
            });
            this.loading = false;
            return true;
        } catch(error) {
            this.loading = false;
            this.apiError = true;
            return false;
        }
    }

    populateCards() {

        /**
         * iterate into rules to fill the cards
         */
        this.rawRules.forEach(rule => {
            const foundApp = this.rawApplications.find(app => {
                return app.id === rule.application_id;
            });
            switch (rule.type) {
                case 'syslog':
                    this.fillSyslogCard(rule, foundApp)
                    break;
                case 'eventlog':
                    this.fillEventlogCard(rule, foundApp)
                    break;
            }
        });
    }

    next(): void {
        this.onNextAction.emit();
    }

    filter(event: string): void {
        this.cards = [];
        this.getRemoteData(event).then(
            (success) => {
                this.populateCards();
                this.filteredCards = this.cards;
                this.applySortBy();
                this.applySearching();
            }
        );
    }

    onSearch(term: string) {
        this.termToSearch = term;
        this.applySearching();
    }

    private applySearching() {

        // Close all the cards
        this.cards.forEach(card => {
            card.data.expanded = false;
        });

        // filter the cards according to the term from the search box
        this.filteredCards = this.cards.filter(card => {
            return card.data.caption.toLowerCase().includes(this.termToSearch.toLowerCase());
        });

        // expand the card when there is one result.
        if (this.filteredCards.length === 1) {
            this.filteredCards[0].data.expanded = true;
        }
    }

    onOpenedForm(event) {
        this.rulePayload = {};
        if (event !== undefined) {
            this.action = "create";
            this.isDefaultRule = false;
            this.configureHeaderFormOptions(event.id, this.action);
            this.showModalForm = true;
        }
        this.headerNavToolConf['buttonPlusMenuToggle'] = false;
    }

    private configureHeaderFormOptions(typeRule: string, action: string){
        this.typeRule = typeRule;
        this.headerOptions.title = this.titleLabelsForm[action][typeRule];
        if (typeRule === 'syslog') {
            this.headerOptions.icon = '';
            this.headerOptions.classIcon = 'al al-linux icon';
            this.rulePayload.application_id = this.applicationSyslogId;
        } else if (typeRule === 'remote-syslog') {
            this.typeRule = 'syslog';
            this.headerOptions.classIcon = '';
            this.headerOptions.icon = 'dns';
            this.rulePayload.application_id = this.applicationRemoteSyslogId;
        } else if (typeRule === 'eventlog') {
            this.headerOptions.icon = '';
            this.headerOptions.classIcon = 'al al-windows icon';
            this.rulePayload.application_id = this.applicationEventlogId;
        }
    }

    cardAction(event: AlBaseCardFooterActionEvent) {
        this.action = event.name;
        this.ruleId = event.value.id;
        this.typeRule = (event.value.properties.type as string);
        this.isDefaultRule = (event.value.properties.default as boolean);

        if(event.name === 'edit' || event.name === 'duplicate') {
            this.rulePayload = {
                enabled: (event.value.properties.collect as boolean),
                name: event.value.caption,
                config: (event.value.properties.general as object)['config'],
                scope: (event.value.properties.scope as (AlAssetScopeItem | AlTagScopeItem)[])
            }
            const rule: AlRule = this.rawRules.find(item => item.id === this.ruleId);
            const typeRule = rule.application_id === 'remote-syslog' ? rule.application_id : this.typeRule;
            this.configureHeaderFormOptions(typeRule, event.name);
            this.showModalForm = true;
        } else if (event.name === 'assets') {
            const rule: AlRule = this.rawRules.find(item => item.id === this.ruleId);
            const assets: CardDescriptor = CardDescriptor.import(rule, this.assetsMap);
            this.addRuleForm.open(assets);
        } else if (event.name === 'delete') {
            this.onDeleteCorfimation(this.ruleId);
        }
    }

    cardCollectChange (event: CardCollectEvent) {
        AlApplicationsClient.updateRule(this.accountId, event.value.id, {
            name: event.value.caption,
            enabled: event.status,
            config: (event.value.properties.general as object)['config'],
            scope: (event.value.properties.scope as (AlAssetScopeItem | AlTagScopeItem)[])
        });
    }

    public onCloseModal(event: boolean) {
        this.showModalForm = !event;
    }

    public onSaveModal(saveSuccessful: boolean) {
        this.showModalForm = !event;
        if (saveSuccessful) {
            this.resetFilters();
            this.getRemoteData().then(
                (success) => {
                    this.populateCards();
                    this.filteredCards = this.cards;
                    this.applySortBy();
                }
            );
            this.notify.emit({
                type: 'success',
                text: this.notificationMessages[this.action]
            });
        }
    }

    fillEventlogCard(rule: AlRule, app: AlApplication = null) {

        const generalWindows: GeneralPropertiesEventLogCard = {
            created: {
                userId: rule ? rule.created.by : app.created.by,
                date: rule ? rule.created.at : app.created.at,
                user: rule ? 'Loading...' : 'System'
            },
            modified: {
                userId: rule ? rule.modified.by : app.modified.by,
                date: rule ? rule.modified.at : app.modified.at,
                user: rule ? 'Loading...' : 'System'
            },
            config:{
                eventlog: {
                    collect_from_discovered_streams: rule ? rule.config.eventlog.collect_from_discovered_streams : app.config.eventlog.collect_from_discovered_streams,
                    streams: rule ? rule.config.eventlog.streams : app.config.eventlog.streams
                }
            }
        };

        const properties: PropertiesCard = {
            type: rule ? rule.type as LogType : app.type as LogType,
            collect: rule && rule.enabled ? rule.enabled : false,
            default: (rule && rule.default) ? rule.default : false,
            scope: rule ? rule.scope : [],
            general: generalWindows,
        };
        const newCard: SystemLogCard = {
            data: {
                id: rule ? rule.id : '',
                caption: rule ? (rule.name ? rule.name : app.name) : app.name,
                expanded: false,
                checked: false,
                toptitle: 'User / ' + this.deploymentName,
                footerActions: cloneDeep(this.generalFooterActions) ,
                properties: cloneDeep(properties) as {[key: string]: any;}
            },
            config: cloneDeep(this.generalBaseCardConfig)
        };
        // enables the delete button for no default rules
        if (!newCard.data.properties.hasOwnProperty('default') || (newCard.data.properties.hasOwnProperty('default') && !newCard.data.properties.default)) {
            newCard.data.footerActions.right.find(action => action.event === 'delete').visible = true;
        }
        this.cards.push(newCard);
    }

    fillSyslogCard(rule: AlRule, app: AlApplication = null) {

        const generalLinux: GeneralPropertiesSystemLogCard = {
            created: {
                userId: rule ? rule.created.by : app.created.by,
                date: rule ? rule.created.at : app.created.at,
                user: rule ? 'Loading...' : 'System'
            },
            modified: {
                userId: rule ? rule.modified.by : app.modified.by,
                date: rule ? rule.modified.at : app.modified.at,
                user: rule ? 'Loading...' : 'System'
            },
            config: {
                syslog: {
                    agent_port: rule ? rule.config.syslog.agent_port : app.config.syslog.agent_port,
                    disk_limit: rule ? rule.config.syslog.disk_limit : app.config.syslog.disk_limit,
                    disk_cache_size: rule ? rule.config.syslog.disk_cache_size : app.config.syslog.disk_cache_size,
                    container_logs_enabled: rule ? rule.config.syslog.container_logs_enabled : app.config.syslog.container_logs_enabled,
                }
            }
        };

        const properties: PropertiesCard = {
            type: rule ? rule.type as LogType : app.type as LogType,
            collect: rule && rule.enabled ? rule.enabled : false,
            default: (rule && rule.default) ? rule.default : false,
            scope: rule ? rule.scope : [],
            general: generalLinux
        };
        const newCard: SystemLogCard = {
            data: {
                id: rule ? rule.id : '',
                caption: rule ? (rule.name ? rule.name : app.name) : app.name,
                expanded: false,
                checked: false,
                toptitle: 'User / ' + this.deploymentName,
                footerActions: cloneDeep(this.generalFooterActions),
                properties: cloneDeep(properties) as {[key: string]: any;}
            },
            config: cloneDeep(this.generalBaseCardConfig)
        }
        // enables the delete button for no default rules
        if (!newCard.data.properties.hasOwnProperty('default') || (newCard.data.properties.hasOwnProperty('default') && !newCard.data.properties.default)) {
            newCard.data.footerActions.right.find(action => action.event === 'delete').visible = true;
        }
        newCard.data.properties.applicationId = rule.application_id;
        this.cards.push(newCard);
    }

    async expand(event: AlBaseCardItem) {
        await this.getUserInfo(event.id, 'created');
        await this.getUserInfo(event.id, 'modified');
    }

    handleSortSelection(event: any) {
        this.sortConfig.selected = event.value;
        this.applySortBy();
    }

    handleSortDirection() {
        this.sortConfig.order = this.sortConfig.order === 'ASC' ? 'DESC' : 'ASC';
        this.applySortBy();
    }

    applySortBy(by: string = null) {
        by = by ? by : this.sortConfig.selected;
        this.filteredCards.sort((a, b) => {
            let fielda: string, fieldb: string;
            switch (by) {
                case 'name':
                    fielda = a.data.caption;
                    fieldb = b.data.caption;
                    break;
                case 'type':
                    fielda = a.data.properties.type as string;
                    fieldb = b.data.properties.type as string;
                    break;
            }
            if (this.sortConfig.order === 'ASC') {
                return fielda.localeCompare(fieldb);
            } else if (this.sortConfig.order === 'DESC') {
                return fieldb.localeCompare(fielda);
            } else {
                return 0;
            }
        });
    }

    resetFilters() {
        this.sortConfig.order = 'ASC';
        this.termToSearch = '';
        this.navTool.clearSearch();
        this.toolbarConfig.group.selectedOption = 'system';
    }

    async getUserInfo(ruleId: string, property: string) {

        const rule: SystemLogCard = this.cards.find(element => element.data.id === ruleId);
        const properties: PropertiesCard = rule.data.properties as unknown as PropertiesCard;
        let user: UserInfoCache = this.userInfoCache.find(userinfo => userinfo.userId === properties.general[property]['userId']);
        // verifies if the user is cached, else get info from the aims API
        if ( user ) {
            properties.general[property]['user'] = user.name;
        } else {
            try {
                const res = await this.aimsService.getUserByUserId(properties.general[property]['userId']).toPromise();
                this.userInfoCache.push({
                    userId: properties.general[property]['userId'],
                    name: res.name
                });
                properties.general[property]['user'] = res.name;
            } catch(error) {
                properties.general[property]['user'] = 'Unknown User'
            };
        }
    }

    private calculateAssetsObservables(): (Observable<{ [i: string]: AssetDescriptor }>)[] {
        let observables: Observable<{ [i: string]: AssetDescriptor }>[] = [];
        this.allowedAssetTypes.forEach((type: string) => {
            observables.push(
                this.assetsService
                    .byType(type, null, this.deployment.id)
                    .pipe(map(assetObjs => {
                        return assetObjs['assets'].reduce((assets: { [i: string]: AssetDescriptor }, ari) => {
                            const asset: AssetDescriptor = AssetDescriptor.import(ari[0]);
                            const key: string = (asset.type === 'tag') ? asset.properties['tag_value'] : asset.key
                            assets[key] = asset;
                            return assets;
                        }, {})
                    })));
        });
        return observables;
    }

    afterSubmitAssetsForm(rule: AlRule, action: string) {
        this.action = 'manageAssets';
        if (rule) {
            this.onSaveModal(true);
        }
    }

    onDeleteCorfimation(id: string) {
        const selectedRule = this.rawRules.find(rule => rule.id === id);
        this.deleteConfirmartionHeaderTitle = `Delete ${selectedRule.name}?`;
        let message = 'Are you sure you want to delete this System Log?';
        this.confirmationService.confirm({
            message,
            accept: async () => {
                const success = await this.deleteApplication(id);
                message = 'System Log was deleted successfully.';
                if (success) {
                    this.resetFilters();
                    this.getRemoteData().then(
                        (successRemote) => {
                            this.populateCards();
                            this.filteredCards = this.cards;
                            this.applySortBy();
                        }
                    );
                    this.notify.emit({
                        type: 'success',
                        text: message
                    });
                } else {
                    this.notify.emit({
                        type: 'error',
                        text: "Something went wrong. Refresh the page and try again."
                    });
                }
            },
        });
    }

    async deleteApplication(id: string): Promise<boolean> {
        try {
            await AlApplicationsClient.deleteRule(this.accountId, id);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

}
