
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import cloneDeep from 'lodash/cloneDeep';

import {
    PhoenixTopologySnapshot as Topology,
    TopologyNode
} from '@al/assets-query';

import {
    AlLocation,
    AlLocatorService
} from '@al/core';

import {
    Deployment,
    DeploymentCreateBody,
    DeploymentUpdateBody,
    ExcludedAsset,
    IncludedAsset
} from '@al/deployments';

import {
    findPolicy,
    parsePolicyName,
    Policy
} from '@al/policies';


type summaryCount = { [i: string]: { [i: string]: number } };

@Injectable()
export class DeploymentsUtilityService {

    static resource: string = "deployments";

    summaryHeaderData: any = {
        "vpc": 0,
        "subnet": 0,
        "host": 0,
        "rightBtn": true,
        "rightBtnText": "CONTINUE",
        "rightBtnDisabled": true,
        "deployment_mode": "",
        "hostsScannedClass": "scan-status-0",
        "deployments": [],
        "newExperience": true,
        "deploymentName": "",
        "rightButtonIconMaterial": "keyboard_arrow_right",
        "productName": ""
    };

    summaryHeaderDataCopy: any;
    cloudFormation: any = {
        "enableTemplate": false
    };
    cloudFormationCopy: any;


    private deployment: Deployment;
    private tree: Topology;

    constructor(private titleService: Title) { }

    getSummaryHederData() {
        return this.summaryHeaderDataCopy;
    }

    getCloudFormation() {
        return this.cloudFormationCopy;
    }

    setDeploymentName(name: string) {
        if (name) {
            this.summaryHeaderDataCopy.deploymentName = name;
        }
    }

    getDeploymentProduct(): string {
        let product: string;
        if (this.deployment.mode === 'automatic' || this.deployment.mode === 'guided') {
            product = "cloud_insight";
        }
        if (this.deployment.mode === 'none') {
            product = "cloud_insight_essentials";
        }
        if (this.deployment.cloud_defender.enabled) {
            product = "defender";
        }
        return product;
    }

    getDefenderDatacenterId(): string | null {
        let node = AlLocatorService.getNode(AlLocation.LegacyUI);
        if (!node) {
            return null;
        }
        return node.insightLocationId || null;
    }

    setDeploymentDefenderEnabled(enabled: boolean): void {
        this.deployment.cloud_defender.enabled = enabled;
        if (enabled) {
            this.deployment.cloud_defender.location_id = this.getDefenderDatacenterId() || '';
            this.deployment.mode = "automatic";
            this.deployment.scan = false;
        } else {
            this.deployment.cloud_defender.location_id = null;
            this.deployment.scan = true;
        }
    }

    setSummaryHeaderProductName(mode: string): void {
        switch (mode) {
            case 'none':
                this.summaryHeaderDataCopy.productName = "Cloud Insight Essentials";
                break;
            case 'automatic':
            case 'guided':
                this.summaryHeaderDataCopy.productName = "Cloud Insight";
                break;
            case 'defender':
                this.summaryHeaderDataCopy.productName = "Cloud Defender Support Deployment";
                break;
            default:
                break;
        }
    }

    setSummaryHeaderCount(coverage: any, allAssets: any): void {
        this.summaryHeaderDataCopy.vpc = coverage.hasOwnProperty('vpcsCount') ? coverage.vpcsCount : 0;
        this.summaryHeaderDataCopy.subnet = coverage.hasOwnProperty('subnetsCount') ? coverage.subnetsCount : 0;
        this.summaryHeaderDataCopy.host = coverage.hasOwnProperty('hostsCount') ? coverage.hostsCount : 0;
        this.summaryHeaderDataCopy.vpcTotal = allAssets.hasOwnProperty('vpcsCount') ? allAssets.vpcsCount : null;
        this.summaryHeaderDataCopy.subnetTotal = allAssets.hasOwnProperty('subnetsCount') ? allAssets.subnetsCount : null;
        this.summaryHeaderDataCopy.hostTotal = allAssets.hasOwnProperty('hostsCount') ? allAssets.hostsCount : null;
    }

    // ========DEPLOYMENTS REFERENCE TRACKING ==========
    startSummaryHeaderTracking(): void {
        this.summaryHeaderDataCopy = cloneDeep(this.summaryHeaderData);
    }

    startCloudFormationTracking(): void {
        this.cloudFormationCopy = cloneDeep(this.cloudFormation);
    }

    startDeploymentTracking(): void {
        this.deployment = DeploymentsUtilityService.createDeploymentBase();
    }

    getDeploymentOnTracking(): Deployment {
        return this.deployment;
    }

    setAssetsOnTracking(tree: Topology): void {
        this.tree = cloneDeep(tree);
    }

    getAssetsOnTracking(): Topology {
        return this.tree;
    }

    startAssetsTracking(): void {
        this.tree = new Topology();
    }

    destroyAssetsOnTracking(): void {
        this.tree = null;
    }


    // ===================================

    setDeploymentOnTracking(deployment: Deployment): void {
        // deployment Object
        this.deployment.version = deployment.hasOwnProperty('version') ? deployment.version : null;
        this.deployment.mode = deployment.hasOwnProperty('mode') ? deployment.mode : 'none';
        this.deployment.discover = deployment.hasOwnProperty('discover') ? deployment.discover : null;
        this.deployment.account_id = deployment.hasOwnProperty('account_id') ? deployment.account_id : null;
        this.deployment.name = deployment.hasOwnProperty('name') ? deployment.name : "";
        this.deployment.enabled = deployment.hasOwnProperty('enabled') ? deployment.enabled : null;
        this.deployment.credentials = deployment.hasOwnProperty('credentials') ? deployment.credentials : null;
        this.deployment.id = deployment.hasOwnProperty('id') ? deployment.id : null;
        this.deployment.scan = deployment.hasOwnProperty('scan') ? deployment.scan : null;
        this.deployment.created = deployment.hasOwnProperty('created') ? deployment.created : null;
        this.deployment.modified = deployment.hasOwnProperty('modified') ? deployment.modified : null;

        if (deployment.hasOwnProperty('platform')) {
            this.deployment.platform.type = deployment.platform.hasOwnProperty('type') ? deployment.platform.type : "aws";
            this.deployment.platform.id = deployment.platform.hasOwnProperty('id') ? deployment.platform.id : null;
            if (deployment.platform.hasOwnProperty('monitor')) {
                this.deployment.platform.monitor.enabled = deployment.platform.monitor.hasOwnProperty('enabled') ? deployment.platform.monitor.enabled : true;
                this.deployment.platform.monitor.ct_install_region = deployment.platform.monitor.hasOwnProperty('ct_install_region') ? deployment.platform.monitor.ct_install_region : "us-east-1";
            }
        }

        if (deployment.hasOwnProperty('cloud_defender')) {
            this.deployment.cloud_defender.enabled = deployment.cloud_defender.hasOwnProperty('enabled') ? deployment.cloud_defender.enabled : false;
            this.deployment.cloud_defender.location_id = deployment.cloud_defender.hasOwnProperty('location_id') ? deployment.cloud_defender.location_id : "";
        }

        if (deployment.hasOwnProperty('status')) {
            this.deployment.status.status = deployment.status.hasOwnProperty('status') ? deployment.status.status : null;
            this.deployment.status.timestamp = deployment.status.hasOwnProperty('timestamp') ? deployment.status.timestamp : null;
        }

        // Summary Header object
        if (this.summaryHeaderDataCopy) {
            this.summaryHeaderDataCopy.deploymentName = deployment.name;
            this.summaryHeaderDataCopy.deployment_mode = deployment.mode;
        }
    }

    destroyDeploymentOnTracking(): void {
        this.deployment = null;
    }

    destroySummaryHeaderOnTracking(): void {
        this.summaryHeaderDataCopy = null;
    }

    destroyCloudFormationOnTracking(): void {
        this.cloudFormationCopy = null;
    }

    setScopeOfNodes(nodes: TopologyNode[], deployment: Deployment, policies: Policy[]): void {
        nodes.forEach((node: TopologyNode) => {
            if (node.flavor !== '') {
                const selectedPolicy: Policy = findPolicy(policies, 'name', node.flavor);
                if (selectedPolicy && this.shouldInclude(node)) {
                    const includeItem: IncludedAsset =
                    {
                        type: node.type as "deployment" | "region" | "vpc" | "subnet",
                        key: node.key
                    };

                    includeItem.policy = { id: selectedPolicy.id };
                    deployment.scope.include.push(includeItem);
                } else if (this.shouldExclude(node)) {
                    const excludeItem: ExcludedAsset =
                    {
                        type: node.type as "region" | "vpc" | "subnet",
                        key: node.key
                    };
                    deployment.scope.exclude.push(excludeItem);
                }
            } else {
                console.warn(`Empty policy for ${node.type} with asset key ${node.key}`);
            }
        });
    }

    setScopeScopeOfProtection(topology: Topology,
                              policies: Policy[],
                              deployment: Deployment): Deployment {
        deployment.scope.include = [];
        deployment.scope.exclude = [];
        const isCloudDeployment: boolean = deployment.platform.type !== 'datacenter';
        if (!isCloudDeployment) {
            this.setScopeOfNodes(topology.subnets, deployment, policies);
        }
        this.setScopeOfNodes(topology.vpcs, deployment, policies);
        if (isCloudDeployment) {
            this.setScopeOfNodes(topology.regions, deployment, policies);
        }
        return deployment;
    }


    getScopeOfProtection(topology: Topology,
                         policies: Policy[],
                         deployment: Deployment): Topology {
        const structuredScope = {
            include:
                { regions: [], vpcs: [], subnets: [] },
            exclude:
                { regions: [], vpcs: [], subnets: [] }
        };
        // Lets separate the regions from the vpcs and subnets.
        structuredScope.include.regions =
            deployment.scope.include.filter((item) => item.type === 'region');
        structuredScope.include.vpcs =
            deployment.scope.include.filter((item) => item.type === 'vpc');
        structuredScope.include.subnets =
            deployment.scope.include.filter((item) => item.type === 'subnet');
        structuredScope.exclude.regions =
            deployment.scope.exclude.filter((item) => item.type === 'region');
        structuredScope.exclude.vpcs =
            deployment.scope.exclude.filter((item) => item.type === 'vpc');
        structuredScope.exclude.subnets =
            deployment.scope.exclude.filter((item) => item.type === 'subnet');

        // Protected assets
        // Let's set the protection level of regions first.
        structuredScope.include.regions.forEach((item) => {
            const region: TopologyNode = topology.getByKey(item.key);
            if (region) {
                if (item.policy) {
                    const policy: Policy = findPolicy(policies, 'id', item.policy.id);
                    if (policy) {
                        region.flavor = parsePolicyName(policy.name);
                        region.children.forEach((vpc: TopologyNode) => {
                            vpc.flavor = region.flavor;
                        });
                    }
                }
            }
        });
        // now vpcs.
        structuredScope.include.vpcs.forEach((item) => {
            const vpc: TopologyNode = topology.getByKey(item.key);
            if (vpc) {
                if (item.policy) {
                    const policy: Policy = findPolicy(policies, 'id', item.policy.id);
                    if (policy) {
                        vpc.flavor = parsePolicyName(policy.name);
                        vpc.children.forEach((subnet: TopologyNode) => {
                            subnet.flavor = vpc.flavor;
                        });
                    }
                }
            }
        });

        // now subnets.
        structuredScope.include.subnets.forEach((item) => {
            const subnet: TopologyNode = topology.getByKey(item.key);
            if (subnet) {
                if (item.policy) {
                    const policy: Policy = findPolicy(policies, 'id', item.policy.id);
                    if (policy) {
                        subnet.flavor = parsePolicyName(policy.name);
                    }
                }
            }
        });

        // Unprotected assets

        // We first start unprotecting  the subnets here
        structuredScope.exclude.subnets.forEach((item) => {
            const subnet: TopologyNode = topology.getByKey(item.key);
            if (subnet) {
                subnet.flavor = 'unprotected';
            }
        });

        // now vpcs
        structuredScope.exclude.vpcs.forEach((item) => {
            const vpc: TopologyNode = topology.getByKey(item.key);
            if (vpc) {
                vpc.flavor = 'unprotected';
            }
        });
        // And regions .
        structuredScope.exclude.regions.forEach((item) => {
            const region: TopologyNode = topology.getByKey(item.key);
            if (region) {
                region.flavor = 'unprotected';
                region.children.forEach((vpc: TopologyNode) => {
                    vpc.flavor = vpc.flavor === '' ? 'unprotected' : vpc.flavor;
                });
            }
        });

        // If there were unamrked assets, we default to unprotecting them.
        topology.iterate(node => {
            node.flavor = node.flavor !== '' ? node.flavor : 'unprotected';
            return true;
        });
        return topology;
    }

    setCustomTitle(titles: string[]): void {
        this.titleService.setTitle(titles.join(" | "));
    }

    verifyPresenceOfPolicies = (tree: Topology, policies: string[] = []) : boolean => {
        let anwser = false;
        policies = policies.map(pol => pol.toLowerCase());
        tree.iterate((node) => {
            let policyInNode: string = DeploymentsUtilityService.parseNodeFlavor(node.flavor);
            if (policies.find(p => p === policyInNode)) {
                anwser = true;
                return false;
            }
            return true;
        });
        return anwser;
    }


    static parseNodeFlavor = (flavorValue: string): string => {
        return flavorValue.replace("-", " ");
    }

    static toJson(entity: Deployment) {
        let json = {
            credentials: entity.credentials,
            mode: entity.mode,
            discover: entity.discover,
            enabled: entity.enabled,
            scan: entity.scan,
            id: entity.id,
            name: entity.name,
            account_id: entity.account_id,
            cloud_defender: {
                enabled: entity.cloud_defender.enabled,
            },
            platform: {
                type: entity.platform.type,
                id: entity.platform.id,
                monitor: {
                    enabled: entity.platform.monitor.enabled
                }
            },
            scope: {
                include: entity.scope.include,
                exclude: entity.scope.exclude
            }
        };

        if (entity.cloud_defender.location_id) {
            json.cloud_defender['location_id'] = entity.cloud_defender.location_id;
        }

        if (entity.platform.monitor.enabled) {
            json.platform.monitor['ct_install_region'] = entity.platform.monitor.ct_install_region;
        }

        return json;
    }

    static toJsonEditRole(entity: Deployment) {

        let deploymentData: DeploymentUpdateBody = {
            name: entity.name,
            version: entity.version,
            credentials: entity.credentials
        };

        return deploymentData;
    }

    static toJsonEditName(entity: Deployment) {

        let deploymentData = {
            version: entity.version,
            name: entity.name
        };

        return deploymentData;
    }

    static toJsonEditScope(entity: Deployment) {
        let deploymentData = {
            version: entity.version,
            scope: entity.scope
        };
        return deploymentData;
    }

    static toJsonEditMode(entity: Deployment) {

        let deploymentData = {
            version: entity.version,
            mode: entity.mode
        };

        return deploymentData;
    }

    static toAzureDeploymentJson(entity: Deployment): DeploymentCreateBody {
        let json: DeploymentCreateBody = {
            // id: entity.id,
            name: entity.name,
            platform: {
                type: 'azure',
                id: entity.platform.id
            },
            mode: entity.mode ? entity.mode : "manual",
            enabled: true,
            discover: true,
            scan: true,
            scope: {
                include: entity.scope.include,
                exclude: entity.scope.exclude
            },
            cloud_defender: {
                enabled: entity.cloud_defender.enabled,
                location_id: entity.cloud_defender.location_id
            },
            credentials: entity.credentials
        };

        return json;

    }

    static getSummaryAssetsCount(tree: Topology,
                                assetTypesToCount: string[],
                                flavors = ['unprotected',
                                    'essentials',
                                    'professional',
                                    'lm-professional',
                                    'tm-professional',
                                    'enterprise']): summaryCount {
        const key: { [i: string]: number } = {};
        assetTypesToCount.forEach(type => key[type] = 0)
        let summary: summaryCount = {
            ...(flavors.includes('unprotected') && { 'unprotected': cloneDeep(key) }),
            ...(flavors.includes('essentials') && { 'essentials': cloneDeep(key) }),
            ...(flavors.includes('professional') && { 'professional': cloneDeep(key) }),
            ...(flavors.includes('lm-professional') && { 'lm-professional': cloneDeep(key) }),
            ...(flavors.includes('tm-professional') && { 'tm-professional': cloneDeep(key) }),
            ...(flavors.includes('enterprise') && { 'enterprise': cloneDeep(key) }),
            ...(flavors.includes('peered') && { 'peered': cloneDeep(key) }),
            ...(flavors.includes('peering') && { 'peering': cloneDeep(key) }),
        }
        tree.iterate(asset => {
            let flavor = asset.flavor || 'unprotected';
            if (assetTypesToCount.includes(asset.type)) {
                summary[flavor][asset.type]++;
            }
            return true;
        });

        return summary;
    }



    static createDeploymentBase(): Deployment {
        const deployment: Deployment = {
            "discover": true,
            "status": {
                "status": "new",
                "message": "",
                "timestamp": null
            },
            "cloud_defender": {
                "enabled": false,
                "location_id": ""
            },
            "enabled": true,
            "credentials": [
            ],
            "platform": {
                "type": "aws",
                "id": null,
                "monitor": {
                    "enabled": true,
                    "ct_install_region": "us-east-1"
                }
            },
            "created": null,
            "modified": null,
            "scan": true,
            "scope": {
                "include": [
                ],
                "exclude": [
                ]
            }
        };
        return deployment;
    }

    /**
     * Check if a node should be excluded explicitly
     * i.e the vpc is 'unprotected' while the parent has a level of protection (!== 'unprotected')
     * Regions are never explicitly excluded
     */
    private shouldExclude(node: TopologyNode): boolean {
        const check = () => node.flavor === 'unprotected' && node.parent.flavor !== 'unprotected';
        return node.parent ? check() : false;
    }

    /**
     * Check if a node should be included explicitly
     * i.e. if it has a level of protection (!== 'unprotected'), and the parent has different level of protection
     * Regions are always included explicitly
     */
    private shouldInclude(node: TopologyNode): boolean {
        const check = () => node.flavor !== 'unprotected' && node.parent.flavor !== node.flavor;
        return node.parent ? check() : true;
    }

}
