import cloneDeep from 'lodash/cloneDeep';

import {
    combineLatest,
    forkJoin as observableForkJoin
} from 'rxjs';

import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import {
    AlAssetsQueryClient,
    PhoenixTopologySnapshot as Topology
} from '@al/assets-query';

import { AlLocation, AlLocatorService, AlSession } from '@al/core';

import {
    AlDeploymentsClient,
    Deployment
} from '@al/deployments';

import {
    AlPoliciesClient,
    Policy
} from '@al/policies';

import {
    ThemisClient,
    ThemisRoleDocument
} from '@al/themis';

import { AlToastButtonDescriptor, AlToastMessage, AlToastService, AlViewHelperComponent } from '@al/ng-generic-components';

import {
    AlNavigationService
} from '@al/ng-navigation-components';

import {
    CredentialsInsightService,
    ErrorResponsesDictionaryPipe,
    ExclusionsRulesDescriptor,
    ExclusionsRulesService,
    ExclusionsRulesSnapshot,
    InsightUtilityService,
    SourceScope,
    SourceSnapshot,
    SourcesService,
} from '@components/technical-debt';

import {
    DeploymentSummaryCompactDescriptor,
    SummaryBlocks
} from '@components/technical-debt';

import { DeploymentsUtilityService, ThemisRoleUtilityService } from '../../services';

import {
    AlDeploymentName,
    ExpandableMenuDescritor,
    DeploymentConfigurationNotificationMessage as NotificationMessage,
    ExpandableMenuGroup
} from '../../types';

import { AlExpandableMenuComponent } from '../al-expandable-menu/al-expandable-menu.component';

import { MatDialog } from '@angular/material/dialog';

type ConfigurationStep =  "name" | "mode" | "set_role" | "role_arn" | "azure_role" |
                          "add_assets" | "discovery" |  "scope" | "scheduling" |
                          "application_logs" | "system_logs" | "fim_monitoring" |
                          "fim_exclusions" | "installation" | "log_sources" |
                          "topology" | "protection_options";

@Component({
    selector: 'al-deployment-configuration',
    templateUrl: './deployment-configuration.component.html',
    styleUrls: ['./deployment-configuration.component.scss']
})
export class DeploymentConfigurationComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('alViewHelper', { static: true }) viewHelper: AlViewHelperComponent;
    @ViewChild('expandablemenu') alExpandableMenuComponent: AlExpandableMenuComponent;

    configType: 'aws' | 'azure' | 'datacenter' | null;
    userId: string;
    sidenavOpen: boolean = true;
    accountId: string | null = null;
    deploymentId: string | null = null;
    step: ConfigurationStep = "name";
    taskId: string | null = null;
    deployment: Deployment;
    source: SourceSnapshot;
    exclusionRules: Map<string, ExclusionsRulesDescriptor>;
    isBusy: boolean = false;
    coverage: any = {};
    assetsScope: SourceScope;
    summary: any;
    stateForm: 'add' | 'edit';
    isMessagePanelShown: boolean = false;
    deploymentNameConfig: AlDeploymentName = new AlDeploymentName();
    summaryHeaderConfig: DeploymentSummaryCompactDescriptor;
    product: string = "";
    showLogSourcesButton: boolean = false;
    emptyQParamStep: boolean = false;
    menu: ExpandableMenuDescritor =
        ExpandableMenuDescritor.import({selected: 'name', groups: []});
    steps: ConfigurationStep[];
    textButton: string = "SAVE AND CONTINUE";
    showScanDiscovery: boolean = false;

    readonly customTitle = ['Deployments'];
    readonly entitlements = "assess|detect|respond|tmpro|lmpro";

    private readonly errorNotificationTtl: number = 8000;
    private readonly successNotificationTtl: number = 2000;
    private routeParams: Params;
    private queryParams: Params;

    constructor(
        protected route: ActivatedRoute,
        protected deploymentsUtilityService: DeploymentsUtilityService,
        protected sourcesService: SourcesService,
        protected navigationService: AlNavigationService,
        protected credentialsInsightService: CredentialsInsightService,
        protected insightUtilityService: InsightUtilityService,
        protected exclusionsRulesService: ExclusionsRulesService,
        protected themisRoleUtilityService: ThemisRoleUtilityService,
        private cdr: ChangeDetectorRef,
        protected toastService: AlToastService,
        public dialog: MatDialog) { }

    ngOnInit(): void {
        this.toastService.getButtonEmitter('deployment-configuration').subscribe((button: AlToastButtonDescriptor) => {
            if (button.key === 'go-to-exposures') {
                this.goToExposures();
            }
        })
    }

    ngOnDestroy(): void {
        this.deploymentsUtilityService.destroySummaryHeaderOnTracking();
        this.deploymentsUtilityService.destroyDeploymentOnTracking();
        this.sourcesService.destroySourceOnTracking();
        this.deploymentsUtilityService.destroyAssetsOnTracking();
        this.credentialsInsightService.destroyCredentialOnTracking();
        this.themisRoleUtilityService.destroyThemisRoleOnTracking();
        this.exclusionsRulesService.destroyExclusionRuleOnTracking();
        this.deploymentsUtilityService.setCustomTitle(['Configuration']);
    }

    async ngAfterViewInit(): Promise<void> {
        await  AlSession.resolved();
        combineLatest([this.route.params, this.route.data, this.route.queryParamMap])
        .subscribe(([params, data, queryParams]: [Params, any, Params]) => {
            if (this.isFirstLoad()) {
                this.initialSetup(params, queryParams, data);
                this.cdr.detectChanges();
            }
        });
    }

    componentSetup(): void {
        // Route params input
        this.accountId = this.routeParams?.accountId ?? null;
        this.deploymentId = this.routeParams?.id ?? null;
        this.startTracking();
        this.setStateForm();
        this.start();
        // Query params input
        const step: string = <string>this.queryParams?.params?.step ?? '';
        this.emptyQParamStep = !!!step;

        this.goToInitialStep(step);
    }

    cancel(): void {
        switch (this.configType) {
            case 'aws':
                this.cancelAws();
                break;
            case 'azure':
                this.cancelAzure();
                break;
            case 'datacenter':
                console.error("Cannot cancel for datacenter");
                break;
        }
    }

    handleSaveEvent(): void {
        switch (this.configType) {
            case 'aws':
                this.saveAwsDeployent();
                break;
            case 'azure':
                this.saveAzureDeployment();
                break;
            case 'datacenter':
                this.saveDatacenterDeployment();
                break;
        }
    }

    next(step: ConfigurationStep | '' = ''): void {
        switch (this.configType) {
            case 'aws':
                this.awsNextStep(step);
                break;
            case 'azure':
                this.azureNextStep(step);
                break;
            case 'datacenter':
                this.datacenterNextStep(step);
                break;
        }
    }

    handleNotifications(message: NotificationMessage | AlToastMessage): void {
       if ((message as AlToastMessage)?.data) {
            this.notify(message as AlToastMessage);
       } else {
            message = message as NotificationMessage;
            this.notify(message.text, message.type);
       }
    }

    enablePrevSteps(step: string = 'installation'): void {
        this.alExpandableMenuComponent.api.openAll();
        this.alExpandableMenuComponent.api.enableItemsBefore(step);
    }

    disablePrevSteps(): void {
        if (this.configType !== 'datacenter') {
            this.alExpandableMenuComponent.api.disableItemsBefore('discovery');
        } else {
            this.alExpandableMenuComponent.api.disableItemsBefore('scope');
        }
    }

    exit(): void {
        this.navigationService
            .navigate.byNgRoute(['deployments-adr', this.accountId],
                { queryParams: { step: null } });
    }

    updateSummaryBlocks(summary: {[i: string]: number}): void {
        this.summaryHeaderConfig.summaryBlocks = [];
        if (this.configType !== 'datacenter') {
            this.summaryHeaderConfig
            .summaryBlocks.push(new SummaryBlocks()
                .import({
                    iconClass: "",
                    iconMaterial: "location_on",
                    label: "Regions",
                    quantity: summary['region']
                }));
        }
        this.summaryHeaderConfig
            .summaryBlocks.push(new SummaryBlocks()
                .import({
                    iconClass: this.getNetworkIconName(),
                    iconMaterial: "",
                    label: this.getVpcLabel(),
                    quantity: summary['vpc']
                }));
        this.summaryHeaderConfig
            .summaryBlocks.push(new SummaryBlocks()
                .import({
                    iconClass: "al al-subnet",
                    iconMaterial: "",
                    label: "Subnets",
                    quantity: summary['subnet']
                }));
    }

    handleSelectedItemMenu(stepItem): void {
        this.gotoStep(stepItem.itemKey);
    }

    changeToLogSurces(): void {
        this.alExpandableMenuComponent.api.setFakeStep('log_sources');
    }

    assetsAvailable(event): void {
        if (event) {
            this.alExpandableMenuComponent.api.openAll();
            this.alExpandableMenuComponent.api.enableItemsBefore('installation');
        } else {
            this.alExpandableMenuComponent.api.closeAll();
            this.alExpandableMenuComponent.api.disableItemsBefore('instalation');
            if (this.configType !== 'datacenter') {
                this.gotoStep('discovery');
            } else {
                this.gotoStep('add_assets');
            }

        }
    }

    onShowConfigLogSources(event): void {
        this.showLogSourcesButton = event;
    }

    gotoStep(step: ConfigurationStep): void {
        this.step = step;
        this.navigationService
            .navigate.byNgRoute(['.'],
                {
                    relativeTo: this.route,
                    queryParams: { step: step },
                    queryParamsHandling: "merge"
                });
        this.alExpandableMenuComponent.api.goto(step);
    }

    private setSteps(): void {
        let prefix: ConfigurationStep[] = ['name'];
        let suffix: ConfigurationStep[] = ["scope", "scheduling", "application_logs", "system_logs",
                                "fim_monitoring", "fim_exclusions", "installation",
                                "log_sources", "topology", "protection_options"];
        if (!this.isEntitled('siemless_log')) {
            suffix = suffix.filter(step => step !== 'application_logs' && step !== 'system_logs');
        }
        if (!this.isEntitled('detect|respond')) {
            suffix = suffix.filter(step => step !== 'fim_monitoring' && step !== 'fim_exclusions');
        }
        switch (this.configType) {
            case 'aws':
                prefix = prefix.concat(["mode", "set_role", "role_arn", "discovery"]);
                break;
            case 'azure':
                prefix = prefix.concat(["azure_role", "discovery"]);
                break;
            case 'datacenter':
                prefix = prefix.concat(["add_assets"]);
                break;
            default:
                prefix = [];
                console.error(`Invalid deployment type: ${this.configType}`)
                break;
        }
        this.steps = prefix.concat(suffix);
    }

    private setMenu(): void {
        let menuType: string;
        switch (this.configType) {
            case 'aws':
                menuType = 'AWS';
                break;
            case 'azure':
                menuType = 'Azure';
                break;
            case 'datacenter':
                menuType = 'Datacenter'
                break;
            default:
                console.error(`Invalid deployment type: ${this.configType}`)
                break;
        }
        const groups: ExpandableMenuGroup[] = this.navigationUtilityService.getMenuAwareness(menuType);
        this.menu = ExpandableMenuDescritor.import({
            selected: 'name',
            groups: this.filterMenuGroups(groups)
        });
    }

    private filterMenuGroups(groups: ExpandableMenuGroup[]): ExpandableMenuGroup[] {
        return groups
               .filter(group =>  group.items ?  group.items
                                                     .filter(item => this.existInSteps(item.key)).length > 0 : this.existInSteps(group.key));
    }

    private existInSteps = (key: string): boolean => !!this.steps.find(step => step === key);


    private initialSetup(params: Params, queryParams: Params, data: any): void {
        this.handleData(data);
        this.setSteps();
        this.setMenu();
        this.deployment = DeploymentsUtilityService.createDeploymentBase();
        this.userId = AlSession.getUserId();
        this.setupSummaryHeader();
        this.setupDeploymentName();
        this.routeParams = params;
        this.queryParams = queryParams;
        this.setShowScanDiscovery();
    }

    private setShowScanDiscovery(): void {
        if ( this.configType === 'datacenter' ) {
            this.showScanDiscovery = true;
        }
    }

    private handleData = (data: any): void => {
        this.configType = data?.configType ?? null;
    }

    private goToInitialStep(qParamStep: string): void {
        this.step = 'name';
        if (qParamStep &&
            this.alExpandableMenuComponent &&
            this.steps.find((item: string) => item === qParamStep)) {
            this.step = qParamStep as ConfigurationStep;
        }
        setTimeout( () => this.gotoStep(this.step));
    }

    private isFirstLoad(): boolean {
        return !(!!this.routeParams && !!this.queryParams);
    }

    private setupDeploymentName(): void {
        switch (this.configType) {
            case 'aws':
                this.deploymentNameConfig.label = "Amazon Web Services";
                this.deploymentNameConfig.iconClass = "al al-aws";
                this.deploymentNameConfig.deployType = "aws";
                break;
            case 'azure':
                this.deploymentNameConfig.label = "Microsoft Azure";
                this.deploymentNameConfig.iconClass = "al al-azure";
                this.deploymentNameConfig.deployType = "azure";
                break;
            case 'datacenter':
                this.deploymentNameConfig.label = "Data Center";
                this.deploymentNameConfig.iconClass = "al al-on-prem";
                this.deploymentNameConfig.deployType = "datacenter";
                break;
        }
    }

    private setupSummaryHeader() {
        this.summaryHeaderConfig = new DeploymentSummaryCompactDescriptor().import({
            lineColor: this.configType,
            infoBlocks: [
                {
                    infoBlockIconClass: "",
                    infoBlockIconMaterial: "",
                    infoBlockKey: "",
                    infoBlockLabelName: "",
                    infoBlockName: "",
                    infoBlockOptionDefaultKey: "",
                    infoBlockOptions: []
                }
            ],
            summaryBlocks: []
        });
    }

    private isEntitled(entitlements: string): boolean {
        return this.navigationService.evaluateEntitlementExpression(entitlements);
    }

    private handleDeploymentError(error): void {
        let text: string = ErrorResponsesDictionaryPipe.prototype.transform('deployments', 'default', 'default');
        if (error.hasOwnProperty('status') && error.hasOwnProperty('_body') && error.status === 400) {
            let body = JSON.parse(error._body);
            if (body.hasOwnProperty('message') && body.hasOwnProperty('status')) {
                text = ErrorResponsesDictionaryPipe.prototype.transform('deployments', error.status, body.status);
            }
        }
        this.notify(text, 'error');
    }

    private handleDeploymentEditSuccess(): void {
        const text: string = "Deployment was updated successfully";
        this.notify(text, 'error');
    }

    private cancelAws(): void {
        switch (this.step) {
            case "name":
            case "role_arn":
                this.exit();
                break;
            case "installation":
                this.exit();
                break;
        }
    }

    private cancelAzure(): void {
        switch (this.step) {
            case "name": break;
            case "role_arn":
                this.exit();
                break;
            case "installation":
                this.exit();
                break;
        }
    }

    private saveAwsDeployent(): void {
        switch (this.step) {
            case "name":
                this.saveDeploymentName();
                break;
            case "mode":
                this.afterSaveDeploymentMode();
                break;
            case "role_arn":
                this.afterSaveDeploymentRole();
                break;
        }
    }

    private saveAzureDeployment(): void {
        switch (this.step) {
            case 'name':
                this.saveDeploymentName();
                break;
            case 'azure_role':
                this.afterSaveDeploymentRole();
                break;
        }
    }

    private saveDatacenterDeployment(): void {
        switch (this.step) {
            case 'name':
                this.saveDeploymentName();
                break;
        }
    }

    private awsAddMode(): void {
        observableForkJoin([
            ThemisClient.getRole(this.accountId, 'aws', 'ci_essentials', 'latest'),
            ThemisClient.getRole(this.accountId, 'aws', 'ci_full', 'latest'),
            ThemisClient.getRole(this.accountId, 'aws', 'ci_x_account_ct', 'latest'),
            ThemisClient.getRole(this.accountId, 'aws', 'cd_full', 'latest'),
            ThemisClient.getRole(this.accountId, 'aws', 'ci_manual', 'latest')
        ]).subscribe(
            (responses: ThemisRoleDocument[]) => {
                responses.forEach(role => this.processThemisRole(role));
                this.isBusy = false;
            },
            error => {
                console.error(error);
                this.isBusy = false;
            }
        );
    }

    private editMode(): void {
        switch (this.configType) {
            case 'aws':
                this.awsEditMode();
                break;
            case 'azure':
                this.azureEditMode();
                break;
            case 'datacenter':
                this.datacenterEditMode();
                break;
        }
    }

    private datacenterEditMode(): void {
        observableForkJoin([
            AlDeploymentsClient.getDeployment(this.accountId, this.deploymentId),
            this.sourcesService.getSourcesSnapshot(this.accountId, this.deploymentId),
            AlAssetsQueryClient.getConfigTopologySnapshot(this.accountId, this.deploymentId),
            this.exclusionsRulesService.getAll(this.accountId, this.deploymentId),
            AlPoliciesClient.listPolicies(this.accountId)
        ])
    .subscribe(([
                    deployment,
                    sources,
                    topology,
                    exclusionRules,
                    policies
                ]) => {
            this.deploymentsUtilityService.setDeploymentOnTracking(deployment);
            this.deploymentsUtilityService.setCustomTitle(['Deployments', deployment.name]);
            this.summary = topology.getSummary(['region', 'vpc', 'subnet']);
            // Source
            this.processSource(sources);
             // Assets
            this.processAssets(topology);
            // Exclusions Rules
            this.processExclusionRule(exclusionRules);
            if (this.step === 'scope') {
                this.gotoStep('scope');
            }
            const deploymentBefore: Deployment = cloneDeep(deployment); // TODO;
            const tree = this.deploymentsUtilityService.getScopeOfProtection(topology, policies, deploymentBefore);
            const areEnPrPoliciesPresent = this.deploymentsUtilityService
                                                .verifyPresenceOfPolicies(tree,
                                                    ['enterprise', 'professional', 'lm professional']);
            this.showLogSourcesButton = areEnPrPoliciesPresent;
            this.enablePrevSteps();
            // Stop Loading
            this.isBusy = false;
        }, error => {
            // Stop Loading
            this.isBusy = false;
            if (error.url.indexOf('topology') !== -1 && (error.status === 500 || error.status === 503)) {
                this.gotoStep('discovery');
            } else {
                // Redirect to the list
                this.navigationService.navigate.byNgRoute(['deployments-adr', this.accountId]);
            }
        });
    }

    private azureEditMode(): void {
        observableForkJoin([
            AlDeploymentsClient.getDeployment(this.accountId, this.deploymentId),
            this.sourcesService.getSourcesSnapshot(this.accountId, this.deploymentId),
            AlAssetsQueryClient.getConfigTopologySnapshot(this.accountId, this.deploymentId),
            this.exclusionsRulesService.getAll(this.accountId, this.deploymentId),
            AlPoliciesClient.listPolicies(this.accountId)
        ])
            .subscribe(([
                            deployment,
                            sources,
                            topology,
                            exclusionRules,
                            policies
                        ]) => {
                this.deploymentsUtilityService.setDeploymentOnTracking(deployment);
                this.deploymentsUtilityService.setCustomTitle(['Deployments', deployment.name]);
                this.summary = topology.getSummary(['region', 'vpc', 'subnet']);
                // Assets
                this.processAssets(topology);
                // Source
                this.processSource(sources);
                // Exclusions Rules
                this.processExclusionRule(exclusionRules);
                this.isBusy = false;
                this.checkCredentials();
                const deploymentBefore: Deployment = cloneDeep(deployment);
                const tree = this.deploymentsUtilityService.getScopeOfProtection(topology, policies, deploymentBefore);
                const areEnPrPoliciesPresent = this.deploymentsUtilityService
                    .verifyPresenceOfPolicies(tree,
                        ['enterprise', 'professional', 'lm professional']);

                this.showLogSourcesButton = areEnPrPoliciesPresent;
                this.enablePrevSteps();
            }, error => {
                this.isBusy = false;
                if (error.url.indexOf('topology') !== -1 && (error.status === 500 || error.status === 503)) {
                    this.gotoStep('discovery');
                } else {
                    // Redirect to the list
                    this.navigationService.navigate.byNgRoute(['deployments-adr', this.accountId]);
                }
            });
    }

    private awsEditMode(): void {
        observableForkJoin([
            AlDeploymentsClient.getDeployment(this.accountId, this.deploymentId),
            this.sourcesService.getSourcesSnapshot(this.accountId, this.deploymentId),
            AlAssetsQueryClient.getConfigTopologySnapshot(this.accountId, this.deploymentId),
            ThemisClient.getRole(this.accountId, 'aws', 'ci_essentials', 'latest'),
            ThemisClient.getRole(this.accountId, 'aws', 'ci_full', 'latest'),
            ThemisClient.getRole(this.accountId, 'aws', 'ci_x_account_ct', 'latest'),
            ThemisClient.getRole(this.accountId, 'aws', 'cd_full', 'latest'),
            ThemisClient.getRole(this.accountId, 'aws', 'ci_manual', 'latest'),
            this.exclusionsRulesService.getAll(this.accountId, this.deploymentId),
            AlPoliciesClient.listPolicies(this.accountId)
        ])
            .subscribe(
                ([
                    deployment,
                    source,
                    topology,
                    themisRoleEssentials,
                    themisRoleCiFull,
                    themisRoleAccount,
                    themisRoleCdFull,
                    themisRoleCiManual,
                    exclusionsRules,
                    policies]) => {

                    this.summary = topology.getSummary(['region', 'vpc', 'subnet']);
                    // Deployment
                    this.processDeployment(deployment);
                    // Assets
                    this.processAssets(topology);
                    // Source
                    this.processSource(source);
                    // Role ci_essentials
                    this.processThemisRole(themisRoleEssentials);
                    // Role ci_full
                    this.processThemisRole(themisRoleCiFull);
                    // Role ci_x_account_ct
                    this.processThemisRole(themisRoleAccount);
                    // Role cd_full
                    this.processThemisRole(themisRoleCdFull);
                    // Role ci_manual
                    this.processThemisRole(themisRoleCiManual);
                    // Exclusions Rules
                    this.processExclusionRule(exclusionsRules);

                    // Stop Loading
                    this.isBusy = false;

                    const deploymentBefore: Deployment = cloneDeep(deployment);
                    const tree = this.deploymentsUtilityService.getScopeOfProtection(topology, policies, deploymentBefore);
                    const areEnPrPoliciesPresent = this.deploymentsUtilityService
                                                        .verifyPresenceOfPolicies(tree,
                                                            ['enterprise', 'professional', 'lm professional']);
                    this.showLogSourcesButton = areEnPrPoliciesPresent;
                    this.enablePrevSteps();
                }, error => {
                    // Stop Loading
                    this.isBusy = false;
                    if (error.url.indexOf('topology') !== -1 && (error.status === 500 || error.status === 503)) {
                        this.gotoStep('discovery');
                    } else {
                        // Redirect to the list
                        this.navigationService.navigate.byNgRoute(['deployments-adr', this.accountId]);
                    }
                });
    }

    private startTracking(): void {
        switch (this.configType) {
            case 'aws':
                this.startAwsTracking();
                break;
            case 'azure':
                this.startAzureTracking();
                break;
            case 'datacenter':
                this.startDatacenterTracking();
                break;
        }
    }

    private startDatacenterTracking(): void {
        this.deploymentsUtilityService.startSummaryHeaderTracking();
        this.deploymentsUtilityService.startDeploymentTracking();
        this.sourcesService.startSourceTracking();
        this.deploymentsUtilityService.startAssetsTracking();
        this.exclusionsRulesService.startExclusionRuleTracking();
        this.deployment = this.deploymentsUtilityService.getDeploymentOnTracking();
        this.source = this.sourcesService.getSourceOnTracking();
        this.exclusionRules = this.exclusionsRulesService.getExclusionRulesOnTracking();
    }

    private startAwsTracking(): void {
        this.themisRoleUtilityService.startThemisRoleTracking();
        this.deploymentsUtilityService.startDeploymentTracking();
        this.deploymentsUtilityService.startCloudFormationTracking();
        this.sourcesService.startSourceTracking();
        this.deploymentsUtilityService.startAssetsTracking();
        this.exclusionsRulesService.startExclusionRuleTracking();
        this.credentialsInsightService.startCredentialTracking();
        this.deployment = this.deploymentsUtilityService.getDeploymentOnTracking();
        this.source = this.sourcesService.getSourceOnTracking();
        this.exclusionRules = this.exclusionsRulesService.getExclusionRulesOnTracking();
        this.deploymentsUtilityService.setCustomTitle(['Deployments']);
    }

    private startAzureTracking(): void {
        this.credentialsInsightService.startCredentialTracking();
        this.deploymentsUtilityService.startSummaryHeaderTracking();
        this.deploymentsUtilityService.startDeploymentTracking();
        this.sourcesService.startSourceTracking();
        this.deploymentsUtilityService.startAssetsTracking();
        this.exclusionsRulesService.startExclusionRuleTracking();
        this.deployment = this.deploymentsUtilityService.getDeploymentOnTracking();
        this.source = this.sourcesService.getSourceOnTracking();
        this.exclusionRules = this.exclusionsRulesService.getExclusionRulesOnTracking();
        this.deployment.platform.type = "azure";
        this.deploymentsUtilityService.setCustomTitle(['Deployments']);
    }

    private afterSaveDeploymentRole(): void {
        if (this.configType !== 'datacenter') {
            const step: ConfigurationStep = this.alExpandableMenuComponent.api.whichNext();
            this.gotoStep(step);
            if (this.stateForm === "add") {
                this.navigationService
                    .navigate.byNgRoute(['deployments-adr', this.deployment.platform.type, this.accountId, this.deployment.id],
                                        { queryParams: { step } })
            }
        } else {
            console.error(`Cannot save role for deployment type ${this.configType}`);
        }
    }

    private getVpcLabel(): string {
        let vpcLabel: string = 'Networks';
        if (this.configType === 'aws') {
            vpcLabel = 'VPCs';
        } else if (this.configType === 'azure') {
            vpcLabel = 'VNets';
        }
        return vpcLabel;
    }

    private getNetworkIconName(): string {
        return  `al ${this.configType !== 'datacenter' ? 'al-vpc' : 'al-topology-network-1'}`;
    }

    private checkCredentials(): void {
        if (this.deployment.credentials.length > 0) {
            this.deployment.credentials.forEach(credential => {
                if (credential.hasOwnProperty('purpose')) {
                    this.getCredential(credential);
                }
            });
        }
    }

    private getCredential(credential): void {
        this.credentialsInsightService.getOne(this.accountId, credential.id)
            .subscribe(responseCredential => {
                this.credentialsInsightService.setCredentialOnTracking(responseCredential, credential['purpose']);
            });
    }

    private awsNextStep(step: ConfigurationStep | '' = ''): void {
        if (!step) {
            if (this.step === 'log_sources') {
                step = 'scheduling';
            } else {
                step = this.alExpandableMenuComponent.api.whichNext();
                if (this.deployment.mode === "automatic" && step === "protection_options") {
                    this.alExpandableMenuComponent.api.next();
                    step = this.alExpandableMenuComponent.api.whichNext();
                }
            }
        }
        this.gotoStep(step as ConfigurationStep);
    }

    private azureNextStep(step: ConfigurationStep | '' = ''): void {
        if (step === 'azure_role') {
            this.gotoStep('azure_role');
        } else if (this.step === "log_sources") {
            this.gotoStep('scheduling');
        } else if (step !== 'scope' && step !== 'protection_options') {
            const nextStep: ConfigurationStep = this.alExpandableMenuComponent.api.whichNext();
            this.gotoStep(nextStep);
        }
    }

    private datacenterNextStep(step: string = ''): void {
        if (this.step === "log_sources") {
            this.gotoStep('scheduling');
        } else if (step !== 'scope' && step !== 'protection_options') {
            const nextStep: ConfigurationStep = this.alExpandableMenuComponent.api.whichNext();
            this.gotoStep(nextStep);
        }
    }

    private setUpDatacenterDeployment(): void {
        this.deployment.platform.type = "datacenter";
        this.deployment.mode = "manual";
        this.openDatacenterTutorial();
        this.deploymentsUtilityService.setDeploymentOnTracking(this.deployment);
        this.isBusy = false;
    }

    private setUpAzureDeployment(): void {
        this.deployment.platform.type = "azure";
        this.deployment.mode = "manual";
        this.deploymentsUtilityService.setDeploymentOnTracking(this.deployment);
        this.isBusy = false;
    }

    private openDatacenterTutorial(): void {
        AlDeploymentsClient.listDeployments(this.accountId).then(
            deployments => {
                let hasDataCenterDeployment = deployments.some((deployment) => {
                    return deployment.platform.type === "datacenter";
                });
                if (!hasDataCenterDeployment) {
                    this.dialog.open(DeploymentDatacenterTutorialComponent, {
                        data: { skip: true }
                    });
                }
            },
            error => {
                console.error("Error trying to retrieve deployments");
            }
        );
    }

    private async updateDeployment(step: string): Promise<void> {
        let payload;
        if (step === 'name') {
            payload = DeploymentsUtilityService.toJsonEditName(this.deployment);
        } else if (step === 'mode') {
            payload = DeploymentsUtilityService.toJsonEditMode(this.deployment);
        }

        try {
            const deployment: Deployment = await AlDeploymentsClient
                .updateDeployment(this.accountId,
                    this.deploymentId,
                    payload);
            this.deploymentsUtilityService.setDeploymentOnTracking(deployment);
            this.handleDeploymentEditSuccess();
        } catch (error) {
            this.handleDeploymentError(error);
        }
    }

    private async createDatacenterDeployment(): Promise<void> {
        const node = AlLocatorService.getNode(AlLocation.LegacyUI);
        this.deployment.cloud_defender.location_id =  node?.insightLocationId ?? '';
        let payload = DeploymentsUtilityService.toJson(this.deployment);
        delete payload.credentials;
        delete payload.platform.id;
        delete payload.platform.monitor;
        delete payload.account_id;
        delete payload.id;
        try {
            const deployment: Deployment = await AlDeploymentsClient.createDeployment(this.accountId, payload);
            this.deploymentsUtilityService.setDeploymentOnTracking(deployment);
            this.step = 'add_assets';
            this.gotoStep(this.step);
            this.alExpandableMenuComponent.api.openAll();
            this.alExpandableMenuComponent.api.enableItemsBefore('installation');
            this.navigationService.navigate
                .byNgRoute(['deployments-adr', 'datacenter',  this.accountId, deployment.id],
                            { queryParams: { step: 'add_assets' }});
        } catch (error) {
            this.handleDeploymentError(error);
        }
    }

    private async saveDeploymentName(): Promise<void> {
        if (this.deployment.name) {
            if (this.stateForm === 'edit') {
                await this.updateDeployment('name');
            } else if (this.configType === 'datacenter') {
                this.createDatacenterDeployment();
            } else {
                const nextStep: ConfigurationStep = this.alExpandableMenuComponent.api.whichNext();
                this.gotoStep(nextStep);
            }
         }
    }

    private async afterSaveDeploymentMode(): Promise<void> {
        if (this.stateForm === 'edit') {
            await this.updateDeployment('mode');
        }  else {
            const nextStep: ConfigurationStep = this.alExpandableMenuComponent.api.whichNext();
            this.gotoStep(nextStep);
        }
    }

    private setStateForm(): void {
        this.stateForm = "add";
        this.textButton = "SAVE AND CONTINUE";
        if (this.deploymentId && this.deploymentId !== 'new') {
            this.textButton = 'SAVE';
            this.stateForm = "edit";
        }
    }

    private start(loading: boolean = true): void {
        this.isBusy = loading;
        if (this.stateForm === 'edit') {
            this.editMode();
        } else if (this.configType === 'aws') {
            this.awsAddMode();
        } else if (this.configType === 'datacenter') {
            this.setUpDatacenterDeployment();
        } else if (this.configType === 'azure') {
            this.setUpAzureDeployment();
        }
    }

    private processThemisRole(role: ThemisRoleDocument): void {
        if (role.hasOwnProperty('policy_document')) {
            this.themisRoleUtilityService.setThemisRoleOnTracking(role);
        }
    }

    private processExclusionRule(rules: ExclusionsRulesSnapshot): void {
        if (rules.rules.length > 0) {
            rules.rules.forEach(rule => {
                this.exclusionRules.set(rule.id, rule);
            });
        }
    }

    private processDeployment(deployment: Deployment): void {
        if (deployment?.mode === "automatic") {
            const protectionGroup = this.menu.groups.find(item => item.key === "protection");
            protectionGroup['items'] = protectionGroup['items'].filter(item => item.key !== "protection_options");
        }
        this.deploymentsUtilityService.setDeploymentOnTracking(deployment);
        this.deploymentsUtilityService.setCustomTitle(['Deployments', deployment.name]);

        this.checkCredentials();
        if (this.configType !== 'datacenter' && this.deployment.status.status !== 'new') {
            this.alExpandableMenuComponent.api.openAll();
            this.alExpandableMenuComponent.api.enableItemsBefore('installation');
        }
    }

    private processSource(source: SourceSnapshot): void {
        this.sourcesService.setSourceOnTracking(source);
        this.checkDeploymentStatus();
        // Get the Scope, it retrieve the assets covered
        this.assetsScope = this.source.getScope(this.deployment.platform.type);
    }

    private processAssets(topology: Topology): void {
        this.deploymentsUtilityService.setAssetsOnTracking(topology);
        this.coverage = topology.getCoverage(this.assetsScope,
            this.deployment.mode,
            this.deployment.platform.type);
        this.buildSummaryBlocks();
    }

    private buildSummaryBlocks(): void {
        this.summaryHeaderConfig.summaryBlocks = [];
        if (this.configType !== 'datacenter') {
            this.summaryHeaderConfig
            .summaryBlocks.push(new SummaryBlocks()
                .import({
                    iconClass: "",
                    iconMaterial: "location_on",
                    label: "Regions",
                    quantity: this.summary['region']
                }));
        }

        this.summaryHeaderConfig
            .summaryBlocks.push(new SummaryBlocks()
                .import({
                    iconClass: this.getNetworkIconName(),
                    iconMaterial: "",
                    label: this.getVpcLabel(),
                    quantity: this.summary['vpc']
                }));
        this.summaryHeaderConfig
            .summaryBlocks.push(new SummaryBlocks()
                .import({
                    iconClass: "al al-subnet",
                    iconMaterial: "",
                    label: "Subnets",
                    quantity: this.summary['subnet']
                }));
    }

     /**
    * checkDeploymentStatus in case the deployment is not ready to show
    * the graph and other stuff
    */
      private checkDeploymentStatus(): void {
        const status = this.insightUtilityService.nestedGet(this.deployment, "status.status", null);
        let scope = this.insightUtilityService.nestedGet(this.source.source, `config.${this.configType}.scope`, null);
        if (scope && scope.length === 0) {
            scope = null;
        }
        const networkCount: number = this.summary['vpc'];
        if (status === 'new') {
            if (this.configType === 'datacenter') {
                if (this.step === 'scope' && networkCount > 0) {
                    this.gotoStep('scope');
                } else {
                    this.gotoStep(this.step);
                }
            } else if (['aws', 'azure'].includes(this.configType)) {
                this.gotoStep('discovery');
            }
        } else if (this.emptyQParamStep && ['ok', 'error'].includes(status) && !scope) {
            this.gotoStep('scope');
        }
    }

    private notify(message: string | AlToastMessage, type?: 'error' | 'success'): void {
        let alToastMessage: AlToastMessage;
        let ttl: number = 0;
        if (type) {
            ttl = type === 'error' ? this.errorNotificationTtl : this.successNotificationTtl;
        }
        
        if (typeof message === 'string') {
            if (message) {
                alToastMessage = {
                    severity: type,
                    sticky: true,
                    closable: false,
                    life: ttl,
                    data: {
                        message,
                    },
                };
            }
        } else {
            alToastMessage = message;
        }
        this.toastService.showMessage('deployment-configuration', alToastMessage);
        if (ttl > 0) {
            setTimeout(() => this.toastService.clearMessages('deployment-configuration'), ttl)
        }
    }

    private goToExposures = (): void  => {
        this.navigationService.navigate.byNamedRoute("cd17:exposures:remediations-open",
        {
            accountId: this.deployment.account_id,
            deployment_id: this.deployment.id
        });
    }

}
