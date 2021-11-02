
import cloneDeep from 'lodash/cloneDeep';

import {
    mergeMap
} from 'rxjs/operators';

import {
    Observable,
    forkJoin as observableForkJoin,
    of as observableOf,
    from as observableFrom,
    pipe
} from 'rxjs';

import {
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import {
    PhoenixTopologySnapshot as Topology,
    AlAssetsQueryClient,
    TopologyNode,
    AssetTypeDictionary,
    search as searchAssets
} from '@al/assets-query';

import {
    Deployment,
    AlDeploymentsClient
} from '@al/deployments';

import {
    OTISClient as OtisClient,
    TuningOption,
    TuningOptionScope,
    TuningOptionValue
} from '@al/otis'

import {
    ConfigAwsAndAzureProtectionOptionsTopologyBehaviors,
    ConfigDatacenterProtectionOptionsTopologyBehaviors,
    ITopologyBehaviors
} from '@al/ng-visualizations-components';

import {
    AlConfirmComponent,
    AlRightDrawerComponent,
    TabsDescriptor
} from '@components/technical-debt';

import {
    AlUtilityService,
    InsightUtilityService
} from '@components/technical-debt';

import { AssetsUtilityService } from '../../../../../services';

import { DeploymentTopologyComponent } from '../../../shared/deployments/deployment-topology/deployment-topology.component';

import {
    AlProtectionBreakdownDescriptor,
    AlProtectionBreakdownGroupDescriptor
} from '../../types';

import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';

import {
    DeploymentConfigurationNotificationMessage as NotificationMessage
} from '../../types';

type OtisRequestPayload = { [i: string]: string | TuningOption };

type DialogAfterCloseOperation = TuningOption | { node_key: string } | void;

@Component({
    selector: 'al-deployment-protection-options',
    templateUrl: './deployment-protection-options.component.html',
    styleUrls: ['./deployment-protection-options.component.scss']
})
export class DeploymentProtectionOptionsComponent implements OnInit, OnDestroy {

    @Output() notify: EventEmitter<NotificationMessage> = new EventEmitter();

    @ViewChild(AlRightDrawerComponent) rightDrawer: AlRightDrawerComponent;
    @ViewChild(DeploymentTopologyComponent) topologyView: DeploymentTopologyComponent;

    isBusy: boolean = false;
    rightDrawerData: {[i: string]:  {[i: string]: string}[] } = {};
    rightDrawerDataKeys: string[] = [];
    isTopologyLoading: boolean = false;
    errorState: boolean = false;
    fullScreen = false;
    isRendering = true;
    deployment: Deployment;
    selector: string = "peer"; // peer, link or list
    expandableMenu: Element;
    headerBase: Element;
    navHeader: Element;
    quaternaryMenu: Element;
    eventTarget: Event;
    headerBaseGetEvent;
    expandableMenuGetEvent;
    navHeaderGetEvent;
    quaternaryMenuGetEvent;
    hasTopologyChanges = false;
    topology: Topology;
    topologyBehaviors: ITopologyBehaviors = new ConfigAwsAndAzureProtectionOptionsTopologyBehaviors();
    topologySearchHits: Array<TopologyNode>;
    configTabs: TabsDescriptor = new TabsDescriptor().import({
        search: false,
        tabs: [
            { title: "Cross-Network Protection ", key: "" }
        ]
    });
    // data of header count of scope protection
    titleCountProtected: string = "Cross-Network Protection Breakdown (by VPC)";
    SearchPlaceHolder: string = "Search Assets";
    withouProtectionItem = AlProtectionBreakdownDescriptor
        .setDescriptor({
            count: 0,
            showCount: true,
            label: "None",
            showLabel: true,
            hideLeftSeparator: true,
            iconClass: "fa fa-circle gray-color",
            hideItem: false
        });
    protectedByItem = AlProtectionBreakdownDescriptor
        .setDescriptor({
            count: 0,
            showCount: true,
            label: "Protected by another network",
            showLabel: true,
            hideLeftSeparator: false,
            iconClass: "fa fa-circle smoke-blue-color",
            hideItem: false
        });
    protectingItem = AlProtectionBreakdownDescriptor
        .setDescriptor({
            count: 0,
            showCount: true,
            label: "Protecting other networks",
            showLabel: true,
            hideLeftSeparator: false,
            iconClass: "fa fa-circle smoke-blue-color",
            hideItem: false
        });
    alProtectionBreakdownConfig: AlProtectionBreakdownGroupDescriptor[] = [];
    selectedNode: TopologyNode;

    private listOfAvailableVPCs: TopologyNode[] = [];
    private listOfAvailableRegions: TopologyNode[] = [];
    private listOfAvailableDeployments: Deployment[];
    private copyOfInitialListOfAvaiblableVPCs: TopologyNode[] = [];
    private nodeChanges: { [i: string]: boolean } = {};
    private vpcPeeringOptions: TuningOption[];
    private deploymentNamesMap: { [i: string]: string } = {};
    private nodesDataBefore: Topology;

    constructor(protected deploymentsUtilityService: DeploymentsUtilityService,
        protected alUtilityService: AlUtilityService,
        protected assetsUtilityService: AssetsUtilityService,
        protected insightUtilityService: InsightUtilityService,
        protected dialog: MatDialog) { }

    ngOnInit(): void {
        this.deployment = this.deploymentsUtilityService.getDeploymentOnTracking();
        this.getAvailableDeployments(this.deployment.account_id).
            pipe(
                mergeMap((deployments: Deployment[]) => {
                    this.listOfAvailableDeployments = deployments;
                    return observableForkJoin(
                        [
                            observableFrom(this.getAvailableVpcs()),
                            observableFrom(this.getAvailableRegions()),
                            this.getVpcPeeringOptionValues(),
                        ]
                    )
                })
            )
            .subscribe(
                ([vpcs, regions, options]: [TopologyNode[], TopologyNode[], TuningOption[]]) => {
                    this.setDeploymentNamesMap();
                    this.deployment = this.listOfAvailableDeployments.find(dep => dep.id === this.deployment.id);
                    this.vpcPeeringOptions = this.filterOptions(options);
                    this.listOfAvailableRegions = regions;
                    this.listOfAvailableVPCs = vpcs;
                    this.deploymentsUtilityService.setDeploymentOnTracking(this.deployment);
                    this.setTopologyData();
                    if (this.deployment.platform.type === "datacenter") {
                        this.topologyBehaviors = new ConfigDatacenterProtectionOptionsTopologyBehaviors();
                    }
                    this.topologyBehaviors.availableAssets = this.listOfAvailableVPCs;
                    this.copyOfInitialListOfAvaiblableVPCs = cloneDeep(this.listOfAvailableVPCs);
                    if (this.rightDrawer) {
                        this.rightDrawer.close();
                    }
                }, error => {
                    const text = this.getErrorMessage('loadData', error);
                    this.errorState = true;
                    this.isTopologyLoading = false;
                    console.error('Unexpected error: ', error);
                    this.notify.emit({
                        type: 'error',
                        text
                    })
                }
            );
        this.alUtilityService.eventHandlerWhenExitingFullScreen()(this);
        this.defineListenEvents();
    }

    ngOnDestroy(): void {
        this.topology = null;
        this.removeMenuListeners();
    }


    save(): void {
        this.removeMenuListeners();
        const requestsObs = this.issueRequests();
        observableForkJoin(requestsObs)
            .subscribe(
                {
                    next: responses => {
                        this.hasTopologyChanges = false;
                        this.ngOnDestroy();
                        this.ngOnInit();
                        const text = this.getSuccessMessage('saveData');
                        this.notify.emit({
                            text,
                            type: 'success',
                        });
                    },
                    error: error => {
                        console.error(`Unexpected error: ${error}`);
                        const text = this.getErrorMessage('saveData', error);
                        this.notify.emit({
                            text,
                            type: 'error'
                        })
                    }
                }
            );

    }

    toggleFullScreen(event): void {
        const element = document.getElementsByClassName('options')[0];
        const overlayElement = document.getElementsByClassName('cdk-overlay-container')[0];
        this.fullScreen = this.alUtilityService.fullScreen(element, this.fullScreen);
        if (overlayElement && this.fullScreen) { // Dirty hack to make materail2-beta element to work in fullscreen mode
            element.appendChild(overlayElement);
        } else if (!this.fullScreen) {
            const bodyElement = document.getElementsByTagName('body')[0];
            if (overlayElement) {
                bodyElement.appendChild(overlayElement);
            }
        }
    }
    rendering(event): void {
        this.isRendering = event;
    }

    /**
     * Methods related with Unsaved Diaglog logic
     */
    onUnsavedChangesDetected(event): void {
        this.setProtectionOptionsCount(this.topology);
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

    defineListenEvents(): void {
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

    listenEventUnsavedDialog(section, event): void {
        if (this.hasTopologyChanges) {
            event.preventDefault();
            if (this.assetsUtilityService.showDialogUnsavedData(section, event)) {
                this.eventTarget = event;
                this.showUnsavedDialog();
                event.stopPropagation();
            }
        }
    }

    showUnsavedDialog(): void {
        // Open the dialog
        let dialogRef = this.dialog.open(AlConfirmComponent, {
            width: '55%',
            data: {
                cancel: 'LEAVE WITHOUT SAVING',
                confirm: 'STAY HERE',
                data: { key: 'stayHere' },
                customTitle: 'unsave-peering',
                customMessage: 'unsave-peering'
            }
        });
        // Listen when the the modal confirm close
        dialogRef.afterClosed().subscribe(result => {
            /*  Only it redirects when the user click in the botton 'Leave without saving', because of styles,
                it's the cancel botton of the dialog */
            let key = this.insightUtilityService.nestedGet(result, "key", null);
            if (key === 'cancel') {
                let target = this.assetsUtilityService.getTargetEventToDialogUnsavedData(this.eventTarget);
                this.removeMenuListeners();
                let event = new Event("click");
                target.dispatchEvent(event);
            }
        });
    }

    onInfoForm(node: TopologyNode): void {
        this.selectedNode = node;
        this.rightDrawer.rightDrawerTitle = node.name;
        this.rightDrawer.expanded = false;
        this.rightDrawer.action = 'info';
        this.rightDrawer.defaultIcon = 'al al-topology-vpc-1';
        this.rightDrawerData = {};
        const getItem = (n: TopologyNode, deploymentId: string): {[i: string]: string} => {
            const item: {[i: string]: string} = {};
            if (n.type === 'region') {
                item['name'] = `all networks under ${AssetTypeDictionary.getType(n.type).renderName(n)} `;
                item['icon'] = 'al al-topology-region-1';
            } else if (n.type === 'vpc') {
                item['name'] = `${n.name}`;
                item['icon'] = 'al al-topology-vpc-1';
            }
            item['deploymentName'] = this.deploymentNamesMap[deploymentId];
            return item;
        }
        node.peeredFrom.forEach((n: TopologyNode) => {
            const deploymentId = n.deploymentId
            const item = getItem(n, deploymentId);
            if (!this.rightDrawerData.hasOwnProperty(deploymentId)) {
                this.rightDrawerData[deploymentId] = [item];
            } else {
                const ari = this.rightDrawerData[deploymentId];
                const itemName = item['name'];
                const flag = ari.find(elem => elem['name'] === itemName);
                if (!flag) {
                    this.rightDrawerData[deploymentId].push(item);
                }
            }
        });
        this.rightDrawerDataKeys = Object.keys(this.rightDrawerData);
        this.rightDrawer.open();
        this.isBusy = false;
    }

    closeSideNav(): void {
        this.rightDrawer.action = null;
        this.rightDrawer.isDisabledSubmitButton = true;
        this.isBusy = false;
        this.rightDrawer.closeOnly();
    }

    onSearchedProtected(event): void {
        this.topologySearchHits = Object.values(searchAssets(this.topology, undefined, event, false));
    }

    onClickSelectorUnlink(event): void {
        // Open the dialog
        let dialogRef = this.dialog.open(AlConfirmComponent, {
            width: '55%',
            data: {
                cancel: 'CANCEL',
                confirm: "DELETE",
                data: { key: 'delete', node: event.node },
                customTitle: 'deployment-steps-delete-vpc-peering',
                customMessage: 'deployment-steps-delete-vpc-peering'
            }
        });
        const observable: Observable<DialogAfterCloseOperation> = this.dialogAfterClosedOperations(dialogRef);
        this.dialogAfterClosedSubs(observable);
    }

    onClickSelectorList(event) {
        this.onInfoForm(event.node);
    }

    onClickNode(node: TopologyNode): void {
        this.rightDrawer.close();
        if (node && node.flavor === '') {
            const behaviours: ITopologyBehaviors = cloneDeep(this.topologyBehaviors);
            behaviours.availableAssets = this.copyOfInitialListOfAvaiblableVPCs;
            if (node.type === 'region' && node.children.length > 0) {
                /**
                * Only display the vpcs different from the ones under the region
                * the user selected i.e those with different key except if the deployment ID is different
                */
                behaviours.availableAssets =
                    behaviours
                        .availableAssets
                        .filter((asset: TopologyNode) => node
                            .children
                            .find(child => (child.key === asset.key &&
                                child.deploymentId === asset.deploymentId)) ? false : true);

            } else if (node.type === 'vpc') {
                /**
                * Only display the vpcs different from the one the user selected
                * i.e those with different key except if the deployment ID is different
                */
                behaviours.availableAssets =
                    behaviours
                        .availableAssets
                        .filter((asset: TopologyNode) => (node.key === asset.key &&
                            node.deploymentId === asset.deploymentId) ? false : true);
            }
            this.topologyBehaviors = behaviours;
        }
    }

    private setDeploymentNamesMap(): void {
        this.listOfAvailableDeployments.forEach(dep => {
            this.deploymentNamesMap[dep.id] = dep.name;
        });
    }

    private getAvailableDeployments(accountId: string): Observable<Deployment[]> {
        return observableFrom(AlDeploymentsClient.listDeployments(accountId));
    }

    private filterOptions(options: TuningOption[]): TuningOption[] {

        options = options.filter(option => {
            return option.scope.deployment_id === this.deployment.id ||
                option.value['deployment_id'] === this.deployment.id
        });

        return options;
    }

    private getCachedVpcPeeringOption = (scope: TuningOptionScope, value: TuningOptionValue): TuningOption => {
        const res: TuningOption = this.vpcPeeringOptions
            .find(opt => ((scope['vpc_key'] === opt['scope']['vpc_key'] && scope['deployment_id'] === opt['scope']['deployment_id'])
                || (scope['region_key'] === opt['scope']['region_key'] && scope['deployment_id'] === opt['scope']['deployment_id']))
                && (value['vpc_key'] === opt['value']['vpc_key'] && value['deployment_id'] === opt['value']['deployment_id']));
        return res;
    }

    private issueRequests(): Observable<TuningOption | void>[] {
        try {
            let aggregatedInputs = [];
            this.topology.iterate(node => {
                const key: string = node.key;
                const nodeBefore = this.nodesDataBefore.getByKey(key);
                const nodeAfter = this.topology.getByKey(key);
                if (nodeAfter.flavor !== 'peered'// let's just build the request body using the
                    && nodeAfter.flavor !== '') {  // assets flagged as 'peering'
                    const inputs: OtisRequestPayload[] = this.nodesToRequestInput(nodeBefore, nodeAfter);
                    if (inputs.length > 0) {
                        aggregatedInputs = aggregatedInputs.concat(inputs);
                    }
                }
                return true
            })

            const requestsObs: Observable<TuningOption | void>[] = [];
            const accountId = this.deployment.account_id;
            aggregatedInputs.forEach(input => {
                const httpVerb: string = input['http_verb'];
                const option: TuningOptionValue | TuningOption = input['option'];
                switch (httpVerb) {
                    case 'post':
                        requestsObs
                            .push(observableFrom(
                                OtisClient.createOption(accountId, option as TuningOption)
                            )
                            );
                        break;
                    case 'put':
                        const objectIdToUpdate: string = option['id'];
                        delete option['id'];
                        requestsObs.push(
                            observableFrom(
                                OtisClient.updateOptionValue(accountId, objectIdToUpdate, option as TuningOptionValue)
                            )
                        );
                        break;
                    case 'delete':
                        const objectIdToDelete: string = input['id'];
                        requestsObs.push(
                            observableFrom(
                                OtisClient.deleteOption(accountId, objectIdToDelete)
                            )
                        );
                        break;
                }
            });
            return requestsObs;
        } catch (error) {
            throw new Error(error);
        }
    }

    private nodesToRequestInput = (node1: TopologyNode, node2: TopologyNode): OtisRequestPayload[] => {
        const inputs: OtisRequestPayload[] = [];
        if (node1.flavor !== node2.flavor) { // If this node's flavor has changed
            const option: TuningOption = { 'scope': {}, 'value': {}, 'name': 'cross_network_protection' };
            if (node2.flavor === 'peering') { // If this node is peering now
                if (node2.type === 'region') { // Protect all vpcs under the region
                    option['scope'] = {
                        'region_key': node2.key,
                        'deployment_id': node2.properties['deployment_id']
                    };
                    const vpcKey = !node2.peeredTo ? node2.children[0].peeredTo.key : node2.peeredTo.key;
                    const deploymentId = !node2.peeredTo ? node2.children[0].peeredTo.properties['deployment_id'] : node2.peeredTo.properties['deployment_id'];
                    option['value'] = {
                        'vpc_key': vpcKey,
                        'deployment_id': deploymentId
                    };
                } else if ((node2.type === 'vpc' && !node2.parent) || (node2.type === 'vpc' && !node2.parent.peeredTo)
                    || (node2.type === 'vpc' && node2.parent.peeredTo
                        && node2.parent.peeredTo.key !== node2.peeredTo.key)) { // Protect this vpc only it if doesn't share the same target as its parent region
                    option['scope'] = {
                        'vpc_key': node2.key,
                        'deployment_id': node2.properties['deployment_id']
                    };
                    option['value'] = {
                        'vpc_key': node2.peeredTo.key,
                        'deployment_id': node2.peeredTo.properties['deployment_id']
                    };
                }
                if (Object.keys(option.scope).length > 0 && Object.keys(option.value).length > 0) {
                    inputs.push({ 'http_verb': 'post', 'option': option });
                }
            }
        } else if (node1.flavor === node2.flavor
            && node1.flavor === 'peering') { // If the nodes's flavor hasn't changed from peering
            if ((node1.peeredTo && node2.peeredTo && node1.peeredTo.key !== node2.peeredTo.key) // If the targetted vpc has changed
                || (!node1.peeredTo && node2.peeredTo)) {  // Or if the target is new
                const option = { 'scope': {}, 'value': {}, 'name': 'cross_network_protection' };
                option['scope'] = {
                    'vpc_key': node2.key,
                    'deployment_id': node2.properties['deployment_id']
                };
                option['value'] = {
                    'vpc_key': node2.peeredTo.key,
                    'deployment_id': node2.peeredTo.properties['deployment_id']
                };
                const scope = {
                    'vpc_key': node1.key,
                    'deployment_id': node1.peeredTo.properties['deployment_id']
                };
                const value = {
                    'vpc_key': node1.peeredTo.key,
                    'deployment_id': node1.peeredTo.properties['deployment_id']
                };
                const cachedOption = this.getCachedVpcPeeringOption(scope, value);
                option['id'] = cachedOption['id'];
                inputs.push({ 'http_verb': 'put', 'option': option });
            } else if (node1.peeredTo && !node2.peeredTo) { // If there is no taget now
                const option = { 'scope': {}, 'value': {}, 'name': 'cross_network_protection' };
                option['scope'] = {
                    'vpc_key': node2.key,
                    'deployment_id': node2.properties['deployment_id']
                };
                option['value'] = {
                    'vpc_key': node2.peeredTo.key,
                    'deployment_id': node2.peeredTo.properties['deployment_id']
                };
                inputs.push({ 'http_verb': 'post', 'option': option });
            }
        }
        return inputs
    };


    private async getAvailableVpcs(): Promise<TopologyNode[]>  {

       const promises: Promise<TopologyNode[]>[] = this.listOfAvailableDeployments.map(async (deployment): Promise<TopologyNode[]> => {
            if (deployment.mode !== 'automatic') {
                const response =
                    await AlAssetsQueryClient
                        .getDeploymentAssets(deployment.account_id, deployment.id, { asset_types: 'vpc' });
                
                const assets = Array.prototype.concat.apply([], response.assets);
                return assets.map(asset => {
                    const node = TopologyNode.import(asset);
                    node.deploymentName = deployment?.name ?? 'Unknown';
                    return node;
                });
            } else {
                return [] as TopologyNode[];
            }
        });
        const responses: TopologyNode[][] = await Promise.all(promises);
        return Array.prototype.concat.apply([], responses);
    }

    private async getAvailableRegions():  Promise<TopologyNode[]> {
        const promises: Promise<TopologyNode[]>[] = this.listOfAvailableDeployments.map(async (deployment): Promise<TopologyNode[]> => {
            if (deployment.platform.type !== 'datacenter') {
                const response =
                    await AlAssetsQueryClient
                        .getDeploymentAssets(deployment.account_id, deployment.id, { asset_types: 'region' });
                
                const assets = Array.prototype.concat.apply([], response.assets);
                return assets.map(asset => TopologyNode.import(asset)) as TopologyNode[];
            } else {
                return [] as TopologyNode[];
            }
        });
        const responses: TopologyNode[][] = await Promise.all(promises);
        return Array.prototype.concat.apply([], responses);
    }

    private getVpcPeeringOptionValues(): Observable<TuningOption[]> {
        return observableFrom(
            OtisClient.listOptions(this.deployment.account_id, { name: 'cross_network_protection' })
        );
    }

    private removeMenuListeners(): void {
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

    /**
     * Get the topology tree
     */
    private setTopologyData(): void {
        this.isTopologyLoading = true;
        observableFrom(
            AlAssetsQueryClient
                .getConfigTopologySnapshot(this.deployment.account_id, this.deployment.id)
        ).subscribe(
            {
                next: (tree: Topology) => {
                    this.deploymentsUtilityService.setAssetsOnTracking(tree);
                    this.topology = this.mergeNodesAndOptions(tree);
                    if (this.topology) {
                        this.setProtectionOptionsCount(tree);
                        this.setTitleCountText();
                        this.isTopologyLoading = false;
                        this.errorState = false;
                        this.nodesDataBefore = cloneDeep(this.topology)
                    } else {
                        this.isTopologyLoading = false;
                        this.errorState = true;
                    }
                },
                error: error => {
                    this.errorState = true;
                    this.isTopologyLoading = false;
                    console.error(`Unexpected error: ${error}`); // Probably need to add a error state
                }

            });
    }

    private createUnknownNode(key: string, deploymentId: string): TopologyNode {
        let node = new TopologyNode();
        node.name = 'Unknown Asset';
        node.key = key;
        node.deploymentName = 'Unknown Deployment';
        node.deploymentId = deploymentId;
        node.properties['deployment_id'] = deploymentId;
        return node;
    }

    private mergeNodesAndOptions(tree: Topology): Topology {
        try {
            this.vpcPeeringOptions.forEach(row => {
                let peeredToVpc: TopologyNode;
                if (row.value.hasOwnProperty('vpc_key') && row.value['vpc_key'] !== '') { // The targeted vpc
                    if (row.value['deployment_id'] === this.deployment.id) {
                        peeredToVpc = tree.getByKey(row.value['vpc_key']); // if vpc exists in the current tree
                        peeredToVpc = peeredToVpc ? peeredToVpc : this.createUnknownNode(row.value['vpc_key'], row.value['deployment_id']);
                        peeredToVpc.flavor = 'peered';
                    } else { // if vpc is not present in current tree, get it from the list of vpcs
                        peeredToVpc = this.listOfAvailableVPCs.find(asset => asset.key === row.value['vpc_key'] && asset.deploymentId === row.value['deployment_id']);
                        peeredToVpc = peeredToVpc ? peeredToVpc : this.createUnknownNode(row.value['vpc_key'], row.value['deployment_id']);
                    }
                }
                if (row.scope.hasOwnProperty('region_key') && row.scope.region_key !== '') { // The scoped region
                    let region: TopologyNode;
                    if (row.scope.deployment_id === this.deployment.id) {
                        region = tree.getByKey(row.scope.region_key);
                        region.flavor = 'peering';
                        region.peeredTo = peeredToVpc;
                        region.children.forEach(child => {
                            if (peeredToVpc && peeredToVpc.key !== child.key) {
                                child.flavor = region.flavor;
                                child.peeredTo = peeredToVpc;
                                peeredToVpc.peeredFrom.push(child);
                            }
                        });
                    } else {
                        region = this.listOfAvailableRegions.find(asset => asset.key === row.scope.region_key && asset.deploymentId === row.scope.deployment_id);
                        peeredToVpc.peeredFrom.push(region);
                    }
                } else if (row.scope.hasOwnProperty('vpc_key') && row.scope.vpc_key !== '') { // The scoped vpc
                    let vpc: TopologyNode;
                    if (row.scope.deployment_id === this.deployment.id) {
                        vpc = tree.getByKey(row.scope.vpc_key);
                        vpc = vpc ? vpc : this.createUnknownNode(row.value['vpc_key'], row.value['deployment_id']);
                        vpc.flavor = 'peering';
                        vpc.flavor = vpc.properties['deployment_id'] === this.deployment.id ? 'peering' : '';
                        if (peeredToVpc) {
                            vpc.peeredTo = peeredToVpc;
                            peeredToVpc.peeredFrom.push(vpc);
                        }
                    } else {
                        vpc = this.listOfAvailableVPCs.find(asset => asset.key === row.scope.vpc_key && asset.deploymentId === row.scope.deployment_id);
                        vpc = vpc ? vpc : this.createUnknownNode(row.value['vpc_key'], row.value['deployment_id']);
                        vpc.flavor = 'peering';
                        if (peeredToVpc) {
                            vpc.peeredTo = peeredToVpc;
                            peeredToVpc.peeredFrom.push(vpc);
                        }
                    }
                }
            });
        } catch (error) {
            console.error(`Unexpected error: ${error}`);
            const text = this.getErrorMessage('error', error)
            this.notify.emit({
                text,
                type: 'error'
            })
            return null;
        }
        return tree;
    }

    private setProtectionOptionsCount(assets: Topology): void {

        let typesToCount = this.deployment.platform.type !== 'datacenter' ? ['region', 'vpc'] : ['vpc', 'subnet'];

        let summaryCount = DeploymentsUtilityService
            .getSummaryAssetsCount(assets,
                typesToCount,
                ['peered', 'peering', 'unprotected']);
        this.setProtectionBreakdownConfig(summaryCount);

    }

    private setProtectionBreakdownConfig(summary: { [i: string]: { [i: string]: number } }): void {
        this.alProtectionBreakdownConfig = [];
        for (const [flavor, countMap] of Object.entries(summary)) {
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
                            iconClass: this.getProtectionBreakdownCssClass(flavor, assetType)
                        })
                );
                i++;
            }
            let name = 'UNPROTECTED';
            if (flavor === 'peering') {
                name = 'PROTECTED';
            } else if (flavor === 'peered') {
                name = 'PROTECTING';
            }
            this.alProtectionBreakdownConfig.push({
                groupId: flavor,
                data: protectionBreakdown,
                name
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

    private getProtectionBreakdownCssClass(flavor: string, assetType: string): string {
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
        let color = 'cnp-protect'
        if (flavor === 'unprotected') {
            color = 'unprotected';
        }
        return `${asset} ${color}`;
    }


    private setTitleCountText(): void {
        if (this.deployment.platform.type === 'aws') {
            this.titleCountProtected = "Cross-Network Protection Breakdown (by VPC)";
        } else if (this.deployment.platform.type === 'azure') {
            this.titleCountProtected = "Cross-Network Protection Breakdown (by VNET)";
        } else if (this.deployment.platform.type === 'datacenter') {
            this.titleCountProtected = "Cross-Network Protection Breakdown (by Network)";
        }
    }

    private getErrorMessage(errorType: string, error): string {
        const reason = error.hasOwnProperty('status') ? this.insightUtilityService.nestedGet(error, "message", null) : '';
        let message: string = "";
        switch (errorType) {
            case 'loadData':
                message = message ? message : "Internal error getting the data";
                break;
            case 'saveData':
                message = message ? message : "Internal error saving the  data";
                break;
        }

        if (error.hasOwnProperty('status') && error.status !== 500 && reason) {
            message = reason;
        }

        return message;
    }

    private getSuccessMessage(successType: string): string {
        let message: string = "";
        switch (successType) {
            case 'saveData':
                message = message ? message : "Deployment's protection options saved succesfully.";
                break;
        }

        return message;
    }


    private isConnectionSaved = (node: TopologyNode): boolean => {
        const scope = { 'deployment_id': null };
        const value = { 'vpc_key': null, 'deployment_id': null };
        if (node.type === 'region') {
            scope['region_key'] = node.key;
        } else if (node.type === 'vpc') {
            scope['vpc_key'] = node.key;
        }
        scope['deployment_id'] = node.properties['deployment_id'];
        value['vpc_key'] = node.peeredTo.key;
        value['deployment_id'] = node.peeredTo.properties['deployment_id'];
        const res = this.getCachedVpcPeeringOption(scope, value);
        return res ? true : false;
    }

    private dialogAfterClosedOperations(dialogRef): Observable<DialogAfterCloseOperation> {
        return dialogRef.afterClosed().pipe(
            mergeMap(result => {
                let observable: Observable<DialogAfterCloseOperation> = observableOf({});
                if (result['key'] !== 'cancel' && result['key'] !== 'close') {
                    let scope: TuningOptionScope = {};
                    let value: TuningOptionValue = {};
                    const accountId = this.deployment.account_id;
                    const nodeToUnlink: TopologyNode = result['node'];
                    const existingOption = this.isConnectionSaved(nodeToUnlink);
                    if (existingOption) {
                        if (nodeToUnlink.type === 'vpc' // Unlinking vpc under a unprotected region
                            && nodeToUnlink.parent && nodeToUnlink.parent.flavor !== 'peering') {
                            scope = {
                                'vpc_key': nodeToUnlink.key,
                                'deployment_id': nodeToUnlink.properties['deployment_id']
                            }
                            value = {
                                'vpc_key': nodeToUnlink.peeredTo.key,
                                'deployment_id': nodeToUnlink.peeredTo.properties['deployment_id']
                            }
                            const cachedOption: TuningOption = this.getCachedVpcPeeringOption(scope, value);

                            observable =
                                observableFrom(
                                    OtisClient.deleteOption(accountId, cachedOption.id)
                                )


                        } else if (nodeToUnlink.type === 'vpc'
                            && nodeToUnlink.parent  // Unlinking vpc under a protected region
                            && nodeToUnlink.parent.flavor === 'peering') {
                            scope = {
                                'vpc_key': nodeToUnlink.key,
                                'deployment_id': nodeToUnlink.properties['deployment_id']
                            }
                            value = scope as TuningOptionValue; // When adding an exclusion under a protected region
                            // We peer the vpc to itself.
                            const option: TuningOption =
                            {
                                'scope': scope,
                                'value': value,
                                'name': 'cross_network_protection'
                            };
                            observable =
                                observableFrom(
                                    OtisClient.createOption(accountId, option)
                                );
                        } else if (nodeToUnlink.type === 'region') { // Unlinkig protected region
                            scope = {
                                'region_key': nodeToUnlink.key,
                                'deployment_id': nodeToUnlink.properties['deployment_id']
                            }
                            value = {
                                'vpc_key': nodeToUnlink.peeredTo.key,
                                'deployment_id': nodeToUnlink.peeredTo.properties['deployment_id']
                            }
                            const cachedOption: TuningOption = this.getCachedVpcPeeringOption(scope, value);
                            observable =
                                observableFrom(
                                    OtisClient.deleteOption(accountId, cachedOption.id)
                                );
                        } else if (nodeToUnlink.type === 'vpc' && !nodeToUnlink.parent) {
                            scope = {
                                'vpc_key': nodeToUnlink.key,
                                'deployment_id': nodeToUnlink.properties['deployment_id']
                            }
                            value = {
                                'vpc_key': nodeToUnlink.peeredTo.key,
                                'deployment_id': nodeToUnlink.peeredTo.properties['deployment_id']
                            }
                            const cachedOption: TuningOption = this.getCachedVpcPeeringOption(scope, value);
                            observable =
                                observableFrom(
                                    OtisClient.deleteOption(accountId, cachedOption.id)
                                )
                        }
                    } else {
                        observable = observableOf({ 'node_key': nodeToUnlink.key });
                    }
                }
                return observable;

            })
        )

    }

    private dialogAfterClosedSubs(observable: Observable<DialogAfterCloseOperation>): void {
        observable.subscribe({
            next: (response: DialogAfterCloseOperation) => {
                if (response && response['node_key']) {
                    const nodeKey = response['node_key'];
                    const node: TopologyNode = this.topology.getByKey(nodeKey);
                    if (node.type === 'region') {
                        node.flavor = '';
                        const peeredToNode: TopologyNode = this.topology.getByKey(node.peeredTo.key);
                        if (peeredToNode) {
                            peeredToNode.peeredFrom = peeredToNode
                                .peeredFrom.filter(n => n.key !== node.key);
                            if (peeredToNode.peeredFrom.length === 0) {
                                peeredToNode.flavor = '';
                            }
                        }
                        node.peeredTo = null;
                        node.children.forEach(child => { child.flavor = ''; child.peeredTo = null });
                    } else if (node.type === 'vpc') {
                        node.flavor = '';
                        const peeredToNode: TopologyNode = this.topology.getByKey(node.peeredTo.key);
                        if (peeredToNode) {
                            peeredToNode.peeredFrom = peeredToNode
                                .peeredFrom.filter(n => n.key !== node.key);
                            if (peeredToNode.peeredFrom.length === 0) {
                                peeredToNode.flavor = '';
                            }
                        }
                        node.peeredTo = null;
                    }
                    this.topologyView.forceCanvasReload(this.topology);
                    this.setProtectionOptionsCount(this.topology);
                } else {
                    this.ngOnDestroy();
                    this.ngOnInit();
                    const text = this.getSuccessMessage('saveData');
                    this.notify.emit({
                        text,
                        type: 'success'
                    });
                }
            },
            error: error => {
                console.error("Unexpected error: ", error);
                const text = this.getErrorMessage('saveData', error);
                this.notify.emit({
                    text,
                    type: 'error'
                });
            }
        });
    }
}
