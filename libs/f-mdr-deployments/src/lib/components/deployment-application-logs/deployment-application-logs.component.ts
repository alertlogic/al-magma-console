import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { AlApplication, AlApplicationConfigQuery, AlApplicationsClient, AlRule } from '@al/applications';
import { AIMSAPIClient, AIMSUserRecord } from '@components/technical-debt';
import { AlBottomSheetHeaderOptions,
         AlViewHelperComponent,
         AlToolbarContentConfig,
         AlContentToolbarComponent,
         AlFilterListPipe} from '@al/ng-generic-components';
import { DeploymentApplicationLogsCreateRuleFormComponent as CreateRuleFormComponent } from '../deployment-application-logs-create-rule-form/deployment-application-logs-create-rule-form.component';
import { from as observableFrom,
         forkJoin as observableForkJoin,
         Observable, of as observableOf } from 'rxjs';
import { ApplicationLogCardDescriptor as CardDescriptor, ApplicationLogCardDescriptor, RuleCreationMode } from '../../../../../types/application-log.types';
import { DeploymentApplicationLogsAddScopeRuleFormComponent as AddRuleFormComponent } from '../deployment-application-logs-add-scope-rule-form/deployment-application-logs-add-scope-rule-form.component';
import { catchError, map, share } from 'rxjs/operators';
import { AssetDescriptor, AssetsService } from '@components/technical-debt';
import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';
import { Deployment } from '@al/deployments';
import { ConfirmationService } from 'primeng/api';
import { AIMSUser, AIMSClient, AlSession } from '@al/core';

import {
    DeploymentConfigurationNotificationMessage as NotificationMessage
} from '../../types';

@Component({
    selector: 'al-deployment-application-logs',
    templateUrl: './deployment-application-logs.component.html',
    styleUrls: ['./deployment-application-logs.component.scss'],
    providers: [ConfirmationService]
})
export class DeploymentApplicationLogsComponent implements OnInit {

    @ViewChild('addRuleForm', { static: true } )
    addRuleForm: AddRuleFormComponent;

    @ViewChild('headerNavTool', { static: true } )
    headerNavTool: AlContentToolbarComponent;

    @Output() onNextAction: EventEmitter<never> = new EventEmitter();
    @Output() notify: EventEmitter<NotificationMessage> = new EventEmitter();
    @Input() onlyTagAssets = false;

    applications: AlApplication[] = [];
    rules: AlRule[] = [];
    fullList: Array<CardDescriptor> = [];
    filteredList: CardDescriptor[] = [];
    deployment: Deployment;
    loading = true;
    apiError = false;
    applicationsMap = {};
    showAddRuleDialog: boolean = false;
    allowedAssetTypes: string[];
    toolbarConfig: AlToolbarContentConfig = {
        showGroupBy: true,
        showSearch: true,
        search: {
            maxSearchLength: 40,
            textPlaceHolder: "search"
        },
        group: {
            options: [
                {
                    label: 'All Application Logs',
                    value: 'all'
                },
                {
                    label: 'Collecting Applications Logs',
                    value: 'enabled'
                }
            ]
        }
    }
    createRuleFormHeaderOptions: AlBottomSheetHeaderOptions = {
        icon: 'apps',
        title: '',
        collapsibleFromTitle: false,
        primaryAction: {
            text: 'Save',
            disabled: true,
        },
        secondaryAction: {
            text: 'Cancel',
            disabled: false
        }
    };
    addRuleFormHeaderOptions: AlBottomSheetHeaderOptions = {
        classIcon: 'al al-assets',
        iconStyle: { "font-size": "2.5em" },
        title: 'Manage Assets',
        collapsibleFromTitle: true,
        primaryAction: {
            text: ' Save ',
            disabled: false,
        },
        secondaryAction: {
            text: 'Cancel',
            disabled: false
        }
    };

    filteringBy: { filter: 'all' | 'enabled', search: string} = {filter: 'all', search: ''};

    assetsMap: { [i: string]: { [i: string]: AssetDescriptor } } = {};

    // default information to create a rule.
    item: ApplicationLogCardDescriptor = null;
    mode: RuleCreationMode = 'CREATE';
    toggleActivated: boolean = false;
    standAlone: boolean = true;
    showCreateRuleForm: boolean = false;

    private readonly primaryAccoundId: string = AlSession.getPrimaryAccountId();
    private readonly usersMap: { [i: string]: Observable<unknown> } = {};
    private readonly filterListPipe: AlFilterListPipe = new AlFilterListPipe();

    private readonly unknownUser: AIMSUser = {
        name: 'Unknown User',
        id: '0',
        email: 'user@unknown.com',
        account_id: '0',
        created: null,
        modified: null,
        linked_users: []
    };

    private readonly systemUser: AIMSUser = {
        name: 'System',
        id: 'system',
        email: 'user@system.com',
        account_id: 'system',
        created: null,
        modified: null,
        linked_users: []
    };

    constructor(protected deploymentsService: DeploymentsUtilityService,
                protected assetsService: AssetsService,
                protected aimsService: AIMSAPIClient,
                private confirmationService: ConfirmationService) {
        this.usersMap = { 'system': observableOf(this.systemUser)};
    }

    ngOnInit(): void {
        this.initialize();
    }

    initialize(): void {
        this.loading = true;
        this.fullList = [];
        this.deployment = this.deploymentsService.getDeploymentOnTracking();
        this.allowedAssetTypes =
            (this.onlyTagAssets) ? ['tag'] : ['region', 'vpc', 'subnet', 'tag'];
        this.getObservables()
            .subscribe(this.processResponses,
                       this.processError);
    }

    create(descriptor: CardDescriptor = null): void {
        if ( !descriptor ) {
            this.openCreateRuleForm(null, "CREATE", false, false);
        } else if ( descriptor.scope.length === 0 ) {
            this.openCreateRuleForm(descriptor, "CREATE", true, false);
        } else {
            this.openCreateRuleForm(descriptor, "EDIT", true, false);
        }
    }

    openCreateRuleForm(descriptor: CardDescriptor = null, mode: RuleCreationMode, toggleActivated: boolean, standAlone: boolean) {
        this.item = descriptor;
        this.mode = mode;
        this.toggleActivated = toggleActivated;
        this.standAlone = standAlone;
        this.showCreateRuleForm = true;
    }

    filter(filter: 'enabled' | 'all'): void {
        this.filteringBy.filter = filter;
        this.filteredList = this.fullList.filter(element => filter === 'enabled' ? element.enabled : true)
    }

    search(term: string) {
        this.filteringBy.search = term;
        this.filteredList =
            term? this.filterListPipe.transform(this.filteredList, term) : this.fullList.slice();

    }

    afterFormClosed(action: string): void {
        if(action === 'create_rule') {
            this.showCreateRuleForm = false;
        }
    }

    afterSubmit(rule: AlRule, action: string): void {
        this.initialize();
        if (rule) {
            this.handleSaveMessage('success');
        }
        if (action === 'create_rule_and_next') {
            this.showCreateRuleForm = false;
            this.addRuleForm.open(CardDescriptor.import(rule));
        }
        if(action === 'create_rule') {
            this.showCreateRuleForm = false;
        }
    }

    cardActionClick({ details, action }: { details: CardDescriptor, action: string }): void {
        if (action === "rules") {
            this.addRuleForm.open(details);
        } else if (action === "edit_log") {
            this.openCreateRuleForm(details, "EDIT", true, true);
        } else if (action === 'duplicate') {
            this.openCreateRuleForm(details, "DUPLICATE", true, true);
        } else if (action === 'delete') {
            this.handleDelete(details.rule.id);
        }
    }

    next(): void {
        this.onNextAction.emit();
    }

    private handleDelete(ruleId: string): void {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to perform this action?',
            accept: () => {
                observableFrom(AlApplicationsClient.deleteRule(this.deployment.account_id, ruleId))
                .subscribe(
                    () => {
                    this.handleSaveMessage('success');
                    this.initialize();
                },
                    (_) => this.handleSaveMessage('error', 'Cannot delete that item'))
            },
            reject: () => {
            }
        });
    }

    private processResponses = ([applications, rules, assets]:
        [AlApplication[], AlRule[], ({ [i: string]: AssetDescriptor })[]]): void => {
        if (assets) {
            this.storeAssets(assets);
        }
        this.applications = applications;
        this.rules = rules;
        this.applicationsMap = this.createApplicationDictionary(applications);
        this.mapRuleToCardDescriptor(rules);
        this.filter(this.filteringBy.filter);
        this.apiError = false;
        this.loading = false;
    }

    private processError = (error): void => {
        this.apiError = true;
        this.loading = false;
        this.filteredList = [];
        this.fullList = [];
        this.notify.emit({
            type: 'error',
            text: "An error occured while fetching the data"
        });
        console.error(error);
    }

    private fetchUser(rule: AlRule): void {
        if (!this.usersMap[rule.modified.by]) {
            this.usersMap[rule.modified.by] =
            observableFrom(AIMSClient.getUserDetails(this.primaryAccoundId, rule.modified.by))
            .pipe(share(),
                catchError(() => observableOf(this.unknownUser)));
        }
    }

    private storeAssets(assets: ({ [i: string]: AssetDescriptor })[]) : void {
        const assetsMap = {};
        assets.forEach((dictionary, index) => {
            const type = this.allowedAssetTypes[index];
            assetsMap[type] = dictionary;
        });
        this.assetsMap = assetsMap;
    }

    private mapRuleToCardDescriptor = (rules: AlRule[]): void =>  {
        rules.forEach((rule: AlRule) => {
            this.fetchUser(rule);
            const cardRuleDescriptor = CardDescriptor.import(rule, this.assetsMap);
            cardRuleDescriptor.applicationTypeName = this.applicationsMap[rule.application_id].name;
            this.fullList.push(cardRuleDescriptor);
        });
        this.filteredList = this.fullList.slice();
    }

    private getObservables(): Observable<[AlApplication[],
                                          AlRule[],
                                          ({ [i: string]: AssetDescriptor })[]]> {
        const qParams: AlApplicationConfigQuery = { attributes: 'ffc' };
        const allAppObs$: Observable<AlApplication[]> =
            observableFrom(AlApplicationsClient
                .getAllApplications(this.deployment.account_id, qParams));
        const allRulesObs$: Observable<AlRule[]> =
            observableFrom(AlApplicationsClient
                .getAllRules(this.deployment.account_id, qParams, this.deployment.id));
        let assetsMapObs$: Observable<({ [i: string]: AssetDescriptor })[]> = observableOf(null)
        if (this.shouldFetchAssets()) {
            assetsMapObs$ = observableForkJoin(this.calculateAssetsObservables());
        }

        return observableForkJoin([allAppObs$, allRulesObs$, assetsMapObs$]);
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

    private handleSaveMessage = (type: 'error' | 'success', reason?: string): void => {
        let text = "Changes to your application log have been saved";
        if (type === 'error') {
            text = reason ?? "An error occured while saving your changes";
        }
        this.notify.emit({
            text,
            type
        });
    }

    private createApplicationDictionary = (applicationsList: AlApplication[]): { [i: string]: AlApplication } => {
        let applicationsMap = {};
        applicationsList.forEach((application: AlApplication) => {
            applicationsMap[application.id] = application;
        });
        return applicationsMap;
    }

    private clearFilters(): void {
        this.headerNavTool.state.group.selectedOption = 'all';
        if (this.headerNavTool.alSearchBar) {
            this.headerNavTool.alSearchBar.clear();
        }
        this.filteringBy = { search: '', filter: 'all'};
    }

    private shouldFetchAssets(): boolean {
        for (let assetType of this.allowedAssetTypes) {
            if (!this.assetsMap[assetType]) {
                return true;
            }
        }
        return false;
    }
}
