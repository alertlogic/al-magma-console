
import cloneDeep  from 'lodash/cloneDeep';

import { 
    forkJoin as observableForkJoin,
    Observable,
    SubscriptionLike as ISubscription, 
    from as observableFrom 
} from 'rxjs';

import { 
    Component,
    OnInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    AfterViewInit,
    OnChanges 
} from '@angular/core';

import {
    AllExclusionsToSave,
    ExclusionsBlackouts,
    ExclusionsRulesDescriptor,
    ExclusionsRulesService,
    ExlusionsDetails,
    InsightUtilityService,
    ExclusionsAssets,
    AlUtilityService
} from '@components/technical-debt';

import { AlConfirmComponent } from '@components/technical-debt';

import { 
    PhoenixTopologySnapshot,
    AssetDescriptor,
    AlAssetsQueryClient,
    search as searchAssets
} from '@al/assets-query';

import { 
    AlPoliciesClient,
    parsePolicyName,
    Policy 
} from '@al/policies';

import { 
    Deployment,
    AlDeploymentsClient 
} from '@al/deployments';

import {
    ConfigAwsAndAzureDiscoveryAndTopologyOverviewTopologyBehaviors,
    ConfigAwsAndAzureScopeOfProtectionTopologyBehaviors,
    ConfigDatacenterScopeOfProtectionTopologyBehaviors,
    ConfigDatacenterTopologyOverviewTopologyBehaviors,
    ITopologyBehaviors
} from '@al/ng-visualizations-components';

import { AlNavigationService } from '@al/ng-navigation-components';

import { AlNotification } from '@al/ng-generic-components';

import { SourceScope } from '../../../../../types/sources.types';

import { AssetsUtilityService } from '../../../../../services';

import { MatDialog } from '@angular/material/dialog';

import { 
    AlProtectionBreakdownDescriptor,
    AlProtectionBreakdownGroupDescriptor 
} from '../../types';

import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';

import {
    DeploymentConfigurationNotificationMessage as NotificationMessage
} from '../../types';


@Component({
    selector: 'al-deployment-scope-protection',
    templateUrl: './deployment-scope-protection.component.html',
    styleUrls: ['./deployment-scope-protection.component.scss']
})
export class DeploymentScopeProtectionComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

    @Output() notify: EventEmitter<NotificationMessage> = new EventEmitter();
    @Output() onNextAction: EventEmitter<any> = new EventEmitter();
    @Output() onShowConfigLogSources: EventEmitter<any> = new EventEmitter();
    
    @Input() scope?: SourceScope;
    @Input() overview = false;

    public exclusionRules: Map<string, ExclusionsRulesDescriptor> = this._ExclusionsRulesService.getExclusionRulesOnTracking();
    public exclusionAssets: AllExclusionsToSave;
    public textButton: string = "SAVE & CONTINUE";
    public stateForm: string;
    public fullScreen = false;
    public isRendering = false;
    public deployment: Deployment;
    public expandableMenu: Element;
    public headerBase: Element;
    public navHeader: Element;
    public quaternaryMenu: Element;
    public eventTarget: Event;
    public headerBaseGetEvent;
    public expandableMenuGetEvent;
    public navHeaderGetEvent;
    public quaternaryMenuGetEvent;
    public hasTopologyChanges = false;
    public hasExclusionChanges = false;
    public openModal = false;
    public topology: PhoenixTopologySnapshot;
    public topologyBehaviors: ITopologyBehaviors = new ConfigAwsAndAzureScopeOfProtectionTopologyBehaviors();
    public topologySearchHits: Array<AssetDescriptor>;
    public policies: Policy[] = [];
    public isTopologyLoading: boolean = false;
    public titleCountProtected: string = "Protection Breakdown";
    public SearchPlaceHolder: string = "Search Assets";
    public alProtectionBreakdownConfig: AlProtectionBreakdownGroupDescriptor[] = [];
    public errorState: boolean = false;
    public isLmOrTmPro: boolean = false;

    private protectionLevels = [];
    private deploymentSubscription: ISubscription;
    private assetsSubscription: ISubscription;
    private nodeChanges = {};

    constructor(protected deploymentsUtilityService: DeploymentsUtilityService,
        protected _ExclusionsRulesService: ExclusionsRulesService,
        protected alUtilityService: AlUtilityService,
        protected _InsightUtilityService: InsightUtilityService,
        protected assetsUtilityService: AssetsUtilityService,
        protected dialog: MatDialog,
        protected alNavigation: AlNavigationService) {
        this.isLmOrTmPro = this.alNavigation.evaluateEntitlementExpression('lmpro|tmpro');
    }

    ngOnInit(): void {
        this.deployment = this.deploymentsUtilityService.getDeploymentOnTracking();
        this.setStateForm();
        this.setButtonLabel();
        observableForkJoin(
            [
                AlDeploymentsClient.getDeployment(this.deployment.account_id, this.deployment.id),
                AlPoliciesClient.listPolicies(this.deployment.account_id),
                this._ExclusionsRulesService.getAll(this.deployment.account_id, this.deployment.id)
            ]
        ).subscribe(
            ([deployment, policies, exclusionesRules]) => {
                this.deployment = deployment;
                // ENG-24221: filterout "Enterprise" policy
                policies = policies.filter(p => p.name !== 'Enterprise');
                this.policies = policies;
                this.exclusionRules.clear();
                if (exclusionesRules.rules.length > 0) {
                    exclusionesRules.rules.forEach(rule => {
                        this.exclusionRules.set(rule.id, rule);
                    });
                }
                this.protectionLevels = this.policies.map(p => parsePolicyName(p.name)).concat('unprotected');
                this.deploymentsUtilityService.setDeploymentOnTracking(deployment);
                this.getAssets();
                this.setBehaviours();
            }, error => {
                this.errorState = true;
                this.isTopologyLoading = false;
                console.error('unepxected error', error);
            }
        );
        this.alUtilityService.eventHandlerWhenExitingFullScreen()(this);
        this.hasTopologyChanges = false;
        this.hasExclusionChanges = false;
        this.nodeChanges = [];
    }

    ngOnChanges(): void {
    }

    ngOnDestroy(): void {
        this.removeMenuListeners();
        if (this.deploymentSubscription) {
            this.deploymentSubscription.unsubscribe();
        }
        if (this.assetsSubscription) {
            this.assetsSubscription.unsubscribe();
        }
    }

    ngAfterViewInit(): void {
        this.defineListenEvents();
        if (this.overview) {
            this.textButton = "NEXT";
        }
    }

    setStateForm(): void {
        this.stateForm = "add";
        if (this.deployment.id) {
            this.stateForm = "edit";
        }
    }

    getTextInformation(textButton): string {
        if (this.overview) {
            return `This topology diagram provides an overview of your scope of protection. 
                   You can see which assets are unprotected, and which assets we scan for 
                   essentials or professional.`;
        }
        let text = `The networks appear within its protected region. 
                    Set each network to "PROTECTED," or 
                    leave "UNPROTECTED" if you do not want a network scanned, and then click "${textButton}."`;
        if (!this.isLmOrTmPro) {
            switch (this.deployment.platform.type) {
                case "aws":
                    text = `You can define the scope of your protection per VPC basis.
                            Each VPC appears within its protected region.
                            Set each network in the region you want to scan for essentials or 
                            professional and then click "${textButton}"`;
                    break;
                case "azure":
                    text = `You can define the scope of your protection per VNET basis.
                            Each VNET appears within its protected region.
                            Set each VNET in the region you want to scan for
                            essentials, professional and then click "${textButton}"`
                    break;
                case "datacenter":
                    text = `You can define the scope of your protection per subnet basis.
                            Each subnet appears within its protected network.
                            Set each subnet in the network you want to scan for 
                            essentials or professional and then click "${textButton}"`;
                    break
            }
        }
        return text;
    }

    setButtonLabel() {
        if (this.stateForm === "edit") {
            this.textButton = "SAVE";
        }
    }

    private setBehaviours(): void {
        const isDatacenter = this.deployment.platform.type === 'datacenter';
        if (this.overview && !isDatacenter) {
            this.topologyBehaviors = new ConfigAwsAndAzureDiscoveryAndTopologyOverviewTopologyBehaviors();
        } else if (this.overview && isDatacenter) {
            this.topologyBehaviors = new ConfigDatacenterTopologyOverviewTopologyBehaviors();
        } else if (!isDatacenter) {
            this.topologyBehaviors = new ConfigAwsAndAzureScopeOfProtectionTopologyBehaviors();
        } else if (isDatacenter) {
            this.topologyBehaviors = new ConfigDatacenterScopeOfProtectionTopologyBehaviors();
        }
        this.topologyBehaviors.availableFlavors = ['unprotected'].concat(
            this.policies.map(policy => parsePolicyName(policy.name))
        );
    }

    private setProtectionBreakdownConfig(summary: { [i: string]: { [i: string]: number } }) {
        this.alProtectionBreakdownConfig = [];
        for (const [pLevel, countMap] of Object.entries(summary)) {
            let i = 0;
            const protectionBreakdown: AlProtectionBreakdownDescriptor[] = [];
            for (const [assetType, count] of Object.entries(countMap)) {
                protectionBreakdown.push(
                    AlProtectionBreakdownDescriptor
                        .setDescriptor({
                            label: this.getProtectionBreakdownAssetLabelName(assetType),
                            count,
                            showCount: true,
                            showLabel: true,
                            hideLeftSeparator: i !== 0,
                            iconClass: this.getProtectionBreakdownCssClass(pLevel, assetType)
                        })
                );
                i++;
            }
            this.alProtectionBreakdownConfig.push({
                groupId: pLevel,
                name: ['lm-professional', 'tm-professional'].includes(pLevel) ? 'PROTECTED' : pLevel.toUpperCase(),
                data: protectionBreakdown
            })
        }
    }

    private getProtectionBreakdownAssetLabelName(assetType: string): string {
        let label: string = '';
        const isVpc = assetType === 'vpc';
        if (this.deployment.platform.type === 'datacenter' && isVpc) {
            label = 'NETWORKS';
        } else if (this.deployment.platform.type === 'azure' && isVpc) {
            label = 'VNETS';
        } else if (this.deployment.platform.type === 'aws' && isVpc) {
            label = 'VPCS';
        } else {
            label = assetType.toUpperCase() + 'S';
        }
        return label;
    }

    private getProtectionBreakdownCssClass(pLevel: string, assetType: string): string {
        let color = '';
        let asset = '';

        switch (assetType) {
            case 'region':
                asset = 'al al-topology-region-1';
                break;
            case 'vpc':
                asset =
                    this.deployment.platform.type === 'datacenter' ? 'al al-network' : 'al al-topology-vpc-1'
                break;
            case 'subnet':
                asset = 'al al-subnet';
                break;
            default:
                asset = 'al al-asset';
                break;
        }

        switch (pLevel) {
            case 'essentials':
                color = 'essent';
                break;
            case 'professional':
                color = 'prof'
                break
            case 'enterprise':
                color = 'ent';
                break;
            case 'unprotected':
                color = 'unprotected';
                break;
            default:
                color = 'protected';
                break;
        }
        return `${asset} ${color}`;

    }

    save() {
        if (this.deployment.account_id && this.deployment.id) {
            const deploymentBefore: Deployment = cloneDeep(this.deployment);
            this.deployment = this.deploymentsUtilityService.setScopeScopeOfProtection(this.topology, this.policies, deploymentBefore) as Deployment;

            let deploymentRequest = AlDeploymentsClient.updateDeployment(this.deployment.account_id, this.deployment.id, DeploymentsUtilityService.toJsonEditScope(this.deployment));
            let requests: Array<any> = [deploymentRequest];

            let externalRequest: Observable<ExclusionsRulesDescriptor>;
            let internalRequest: Observable<ExclusionsRulesDescriptor>;
            let networkCreationRequests: Observable<ExclusionsRulesDescriptor>[] = [];
            let networkDeletionRequests: Observable<ExclusionsRulesDescriptor>[] = [];
            let internalAssetsPortsRequests: Observable<ExclusionsRulesDescriptor>[] = [];
            let externalAssetsPortsRequests: Observable<ExclusionsRulesDescriptor>[] = [];

            if (this.exclusionAssets) {
                externalRequest = this.saveExternalRule();
                internalRequest = this.saveInternalRule();
                networkCreationRequests = this.saveNetworksRule();
                networkDeletionRequests = this.deleteNetworksRule();

                internalAssetsPortsRequests = this.saveAssetsPorts('internal');
                externalAssetsPortsRequests = this.saveAssetsPorts('external');

                requests.push(externalRequest);
                requests.push(internalRequest);
                requests = requests.concat(networkCreationRequests);
                requests = requests.concat(networkDeletionRequests);
                requests = requests.concat(internalAssetsPortsRequests);
                requests = requests.concat(externalAssetsPortsRequests);
                this.exclusionAssets['ports_rules_deleted'].forEach(
                    key => {
                        const ruleId: string = key.split('#')[0];
                        const assetId: string = key.split('#')[1];
                        let ruleToDelete = this.exclusionRules.get(ruleId);
                        if (ruleToDelete && ruleToDelete.assets.length === 1 && ruleToDelete.assets[0].key === assetId) {
                            requests.push(
                                this._ExclusionsRulesService.deleteOne(this.deployment.account_id, this.deployment.id, ruleToDelete.id)
                            );
                        }
                        // This means that we need to remove the asset was removed and update the rule without that asset instead of delete the full rule
                        if (ruleToDelete && ruleToDelete.assets.length > 1) {
                            ruleToDelete.assets = ruleToDelete.assets.filter(assetRaw => assetRaw.key !== assetId);
                            requests.push(
                                this._ExclusionsRulesService.update(this.deployment.account_id, this.deployment.id, ruleToDelete.id, ruleToDelete)
                            );
                        }
                    }
                );
            }

            observableForkJoin(requests).subscribe(responses => {
                this.deploymentsUtilityService.setDeploymentOnTracking(responses[0]);
                if (this.exclusionAssets) {
                    let externalRule: ExclusionsRulesDescriptor = ExclusionsRulesDescriptor.import(responses[1]);
                    let internalRule: ExclusionsRulesDescriptor = ExclusionsRulesDescriptor.import(responses[2]);
                    this.exclusionRules.set(externalRule.id, externalRule);
                    this.exclusionRules.set(internalRule.id, internalRule);

                    let index = 3;

                    for (let current = index; index < current + networkCreationRequests.length; index++) {
                        let networkRule: ExclusionsRulesDescriptor = ExclusionsRulesDescriptor.import(responses[index]);
                        this.exclusionRules.set(networkRule.id, networkRule);
                    }
                    this.exclusionAssets['networks_deleted'].forEach(element => {
                        this.exclusionRules.delete(element);
                    });
                }
                const presenceVerified = this.deploymentsUtilityService.verifyPresenceOfPolicies(this.topology,
                    ['enterprise', 'professional', 'lm professional']);
                if (presenceVerified) {
                    this.onShowConfigLogSources.emit(true);
                } else {
                    this.onShowConfigLogSources.emit(false);
                }
                this.ngOnDestroy();
                this.ngOnInit();
                setTimeout(() => {
                    this.notify.emit({
                        type: 'success',
                        text: "The deployment scope was saved successfully"
                    });
                });

            }, error => {

                console.error("Unexpected error ", error);
                setTimeout(() => {
                    this.notify.emit({
                        type: 'error',
                        text: error?.message ?? 'Internal error while saving deployment scope'
                    });
                })
               
            });
        }
    }

    openExclusions() {
        this.openModal = true;
    }

    next() {
        this.onNextAction.emit();
    }

    closeExclusions(exclusions: AllExclusionsToSave) {
        this.openModal = false;
        this.exclusionAssets = exclusions;
        this.hasExclusionChanges = exclusions['changes'];
    }

    saveExternalRule(): Observable<ExclusionsRulesDescriptor> {
        let keyName = 'external_scanning_' + this.deployment.id;
        if (!this.exclusionRules.has(keyName)) {
            let externalRule = ExclusionsRulesDescriptor.import({
                id: keyName,
                name: 'external scanning exclusion',
                description: this.deployment.name + " exclusion",
                enabled: true,
                features: ['scan'],
                blackouts: [ExclusionsBlackouts.import({ resolution: 'permanent' })],
                assets: (this.exclusionAssets && this.exclusionAssets.hasOwnProperty('external_scanning')) ? this.exclusionAssets['external_scanning'] : null,
                details: [ExlusionsDetails.import({
                    feature: 'scan',
                    scan_type: 'external',
                    ports: []
                })]
            });
            return this._ExclusionsRulesService.create(this.deployment.account_id, this.deployment.id, externalRule);
        } else {
            let externalRule = this.exclusionRules.get(keyName);
            externalRule.blackouts = [ExclusionsBlackouts.import({ resolution: 'permanent' })];
            externalRule.assets = (this.exclusionAssets && this.exclusionAssets.hasOwnProperty('external_scanning')) ? this.exclusionAssets['external_scanning'] : null;
            return this._ExclusionsRulesService.update(this.deployment.account_id, this.deployment.id, externalRule.id, externalRule);
        }
    }

    saveInternalRule(): Observable<ExclusionsRulesDescriptor> {
        let keyName = 'internal_scanning_' + this.deployment.id;
        if (!this.exclusionRules.has(keyName)) {
            let internalRule = ExclusionsRulesDescriptor.import({
                id: keyName,
                name: 'internal scanning exclusion',
                description: this.deployment.name + " exclusion",
                enabled: true,
                features: ['scan'],
                blackouts: [ExclusionsBlackouts.import({ resolution: 'permanent' })],
                assets: (this.exclusionAssets && this.exclusionAssets.hasOwnProperty('internal_scanning')) ? this.exclusionAssets['internal_scanning'] : null,
                details: [ExlusionsDetails.import({
                    feature: 'scan',
                    scan_type: 'vulnerability',
                    ports: []
                })]
            });
            return this._ExclusionsRulesService.create(this.deployment.account_id, this.deployment.id, internalRule);
        } else {
            let internalRule = this.exclusionRules.get(keyName);
            internalRule.blackouts = [ExclusionsBlackouts.import({ resolution: 'permanent' })];
            internalRule.assets = (this.exclusionAssets && this.exclusionAssets.hasOwnProperty('internal_scanning')) ? this.exclusionAssets['internal_scanning'] : null;
            return this._ExclusionsRulesService.update(this.deployment.account_id, this.deployment.id, internalRule.id, internalRule);
        }
    }

    saveNetworksRule(): Array<Observable<ExclusionsRulesDescriptor>> {
        let exclusions: Array<Observable<ExclusionsRulesDescriptor>> = [];
        this.exclusionAssets['networks_ids'].forEach(network => {
            // Only the creation of networks is alowed
            if (!this.exclusionRules.has(network.id)) {
                let networkRule = ExclusionsRulesDescriptor.import({
                    name: 'network IDS exclusion',
                    description: this.deployment.name + ' network exclusion',
                    enabled: true,
                    features: ['ids'],
                    blackouts: [ExclusionsBlackouts.import({ resolution: 'permanent' })],
                    assets: [ExclusionsAssets.import({
                        type: 'asset',
                        asset_type: network['asset_type'],
                        key: network['networkKey']
                    })],
                    details: [ExlusionsDetails.import({
                        feature: 'ids',
                        proto: network['protocol'],
                        port: network['port'],
                        cidr: network['cidr']
                    })]
                });
                exclusions.push(this._ExclusionsRulesService.create(this.deployment.account_id, this.deployment.id, networkRule));
            }
        });
        return exclusions;
    }

    deleteNetworksRule(): Array<Observable<ExclusionsRulesDescriptor>> {
        let exclusions: Array<Observable<ExclusionsRulesDescriptor>> = [];

        this.exclusionAssets['networks_deleted'].forEach(network => {
            exclusions.push(this._ExclusionsRulesService.deleteOne(this.deployment.account_id, this.deployment.id, network));
        });

        return exclusions;
    }

    /**
     * Get the topology tree
     */
    getAssets() {
        this.isTopologyLoading = true;
        observableFrom(
            AlAssetsQueryClient.getConfigTopologySnapshot(this.deployment.account_id, this.deployment.id)
        )
        .subscribe(
            {
                next: (tree: PhoenixTopologySnapshot) => {
                    this.deploymentsUtilityService.setAssetsOnTracking(tree);
                    const deploymentBefore: Deployment = cloneDeep(this.deployment); // TODO;
                    this.topology = this.deploymentsUtilityService.getScopeOfProtection(tree, this.policies, deploymentBefore);
                    this.setScopeProtectionCount(this.topology);
                    this.isTopologyLoading = false;
                    this.errorState = false;
                },
                error: error => {
                    this.isTopologyLoading = false;
                    this.errorState = true;
                    // this.handleError('loadScope', error);
                    console.error(`Unexpected error: ${error}`);
                }
            }
        );
    }

    public onSearchedProtected(event) {
        this.topologySearchHits = Object.values(searchAssets(this.topology, undefined, event, false));
    }

    private setScopeProtectionCount(assets: PhoenixTopologySnapshot) {

        let typesToCount = this.deployment.platform.type !== 'datacenter' ? ['region', 'vpc'] : ['vpc', 'subnet'];

        let summaryCount = DeploymentsUtilityService
            .getSummaryAssetsCount(assets,
                typesToCount,
                this.protectionLevels);
        this.setProtectionBreakdownConfig(summaryCount);

    }

    onClickSelector = (asset: AssetDescriptor) => {
        this.setScopeProtectionCount(this.topology);
    }

    toggleFullScreen(event) {
        this.fullScreen = this.alUtilityService.fullScreen(document.getElementsByClassName('scope-setting')[0], this.fullScreen);
        this.alUtilityService.moveOverlayElement(this.fullScreen, 'scope-setting');
    }

    // When we upgrade our material version, this method should go away.
    moveOverlayElement(event) { // Dirty hack to make materail2-beta element to work in fullscreen mode
        this.alUtilityService.moveOverlayElement(this.fullScreen, 'scope-setting');
    }

    rendering(event) {
        this.isRendering = event;
    }

    onUnsavedChangesDetected(event) {
        this.nodeChanges[event.nodeKey] = event.changed;
        this.hasTopologyChanges = (() => {
            for (let key in this.nodeChanges) {
                if (this.nodeChanges[key]) {
                    return true;
                }
            }
            return false;
        })();
    }

    /**
     * Methods related with Unsaved Diaglog logic
     */

    defineListenEvents() {
        this.expandableMenu = document.getElementsByTagName('AL-EXPANDABLE-MENU')[0];
        this.headerBase = document.getElementsByTagName('AL-ARCHIPELIGO17-HEADER')[0]
            || document.getElementsByTagName('AL-ARCHIPELIGO19-APP-HEADER')[0];

        this.navHeader = document.getElementsByTagName('AL-ARCHIPELIGO19-NAV-HEADER')[0];
        this.quaternaryMenu = document.getElementsByTagName('AL-ARCHIPELIGO19-CONTENT-MENU')[0];

        if (this.expandableMenu) {
            this.expandableMenu
                .addEventListener('click',
                    this.expandableMenuGetEvent = event => this.listenEventUnsavedDialog("expandable-menu", event),
                    true);
        }
        if (this.headerBase) {
            this.headerBase
                .addEventListener('click',
                    this.headerBaseGetEvent = event => this.listenEventUnsavedDialog("header-base", event),
                    true);
        }

        if (this.navHeader) {
            this.navHeader
                .addEventListener('click',
                    this.navHeaderGetEvent = event => this.listenEventUnsavedDialog("nav-header", event),
                    true);
        }

        if (this.quaternaryMenu) {
            this.quaternaryMenu
                .addEventListener('click',
                    this.quaternaryMenuGetEvent = event => this.listenEventUnsavedDialog("quaternary-menu", event),
                    true);
        }
    }

    listenEventUnsavedDialog(section, event) {
        if (this.hasTopologyChanges || this.hasExclusionChanges) {
            event.preventDefault();
            if (this.assetsUtilityService.showDialogUnsavedData(section, event)) {
                this.eventTarget = event;
                this.showUnsavedDialog();
                event.stopPropagation();
            }
        }
    }

    showUnsavedDialog() {
        // Open the dialog
        let dialogRef = this.dialog.open(AlConfirmComponent, {
            width: '55%',
            data: {
                cancel: 'LEAVE WITHOUT SAVING',
                confirm: 'STAY HERE',
                data: { key: 'stayHere' },
                customTitle: 'deployment-steps-unsaved-data',
                customMessage: 'deployment-steps-unsaved-data'
            }
        });
        // Listen when the the modal confirm close
        dialogRef.afterClosed().subscribe(result => {
            /*  Only it redirects when the user click in the botton 'Leave without saving', because of styles,
                it's the cancel botton of the dialog */
            let key = this._InsightUtilityService.nestedGet(result, "key", null);
            if (key === 'cancel') {

                let target = this.assetsUtilityService.getTargetEventToDialogUnsavedData(this.eventTarget);
                this.removeMenuListeners();
                let event = new Event("click");
                target.dispatchEvent(event);
            }
        });
    }

    private removeMenuListeners() {
        if (this.expandableMenu) {
            this.expandableMenu.removeEventListener('click', this.expandableMenuGetEvent, true);
        }
        if (this.headerBase) {
            this.headerBase.removeEventListener('click', this.headerBaseGetEvent, true);
        }
        if (this.navHeader) {
            this.navHeader.removeEventListener('click', this.navHeaderGetEvent, true);
        }
        if (this.quaternaryMenu) {
            this.quaternaryMenu.removeEventListener('click', this.quaternaryMenuGetEvent, true);
        }
    }

    private saveAssetsPorts(scanType: 'internal' | 'external'): Observable<ExclusionsRulesDescriptor>[] {
        let exclusions: Array<Observable<ExclusionsRulesDescriptor>> = [];
        this.exclusionAssets[scanType + '_scanning_ports'].forEach(item => {
            if (this.exclusionRules.get(item.hasOwnProperty('ruleId') ? item.ruleId : "")) {
                let ruleToUpdate = this.exclusionRules.get(item.ruleId);
                if (ruleToUpdate.assets.length > 1) {
                    ruleToUpdate.assets = ruleToUpdate.assets.filter(assetRaw => assetRaw.key !== item.asset.key);
                    exclusions.push(
                        this._ExclusionsRulesService.create(this.deployment.account_id, this.deployment.id, this.getNewPortRule(scanType, item))
                    );
                    exclusions.push(
                        this._ExclusionsRulesService.update(this.deployment.account_id, this.deployment.id, ruleToUpdate.id, ruleToUpdate)
                    );
                } else if (ruleToUpdate.assets.length === 1) {
                    ruleToUpdate.details = item.details;
                    exclusions.push(
                        this._ExclusionsRulesService.update(this.deployment.account_id, this.deployment.id, ruleToUpdate.id, ruleToUpdate)
                    );
                }
            } else {
                exclusions.push(
                    this._ExclusionsRulesService.create(this.deployment.account_id, this.deployment.id, this.getNewPortRule(scanType, item))
                );
            }
        });
        return exclusions;
    }

    getNewPortRule(scanType: string, item: { asset: ExclusionsAssets, details: ExlusionsDetails[], ruleId: string }): ExclusionsRulesDescriptor {
        let newRule = ExclusionsRulesDescriptor.import({
            name: scanType + ' scanning ports exclusion',
            description: scanType.charAt(0).toUpperCase() + scanType.slice(1) + " Scan Exclusion for " + item.asset.key,
            enabled: true,
            features: ['scan'],
            blackouts: [ExclusionsBlackouts.import({ resolution: 'permanent' })],
            assets: [item.asset],
            details: item.details
        });
        return newRule;
    }

}

