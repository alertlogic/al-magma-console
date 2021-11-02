
import { from as observableFrom } from 'rxjs';

import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {
    AlTabsComponent,
    ConfigSelectableListConfigDescriptor,
    ConfigSelectableListDescriptor,
    ConfigSelectableSubItem,
    ModalCardDescriptor,
    TabsDescriptor
} from '@components/technical-debt';
import {
    AllExclusionsToSave,
    AssetDescriptor,
    AssetsService,
    AssetType,
    BlackoutsResolution,
    CidrType,
    ExclusionsAssets,
    ExclusionsRulesDescriptor,
    ExlusionsDetails,
    InsightUtilityService,
    Protocols,
    ScanType
} from '@components/technical-debt';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable } from "rxjs";
import { AlBlackCardDescriptor } from "../../types";
import {
    AlNotification,
    AlNotificationPanelComponent,
    AlNotificationType,
    AlSearchBarComponent,
    AlSelectItem
} from '@al/ng-generic-components';
import { Deployment } from '@al/deployments';
import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';
import { SelectItem } from 'primeng/api';
import { AlAssetsQueryClient } from '@al/assets-query';
import { throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import cloneDeep from 'lodash/cloneDeep';

class TagType {
    public key: string;
    public type: string;
    public value: string;
    public keyValue: string;

    public static import(rawData: any): TagType {
        let item = new TagType();

        item.key = rawData.hasOwnProperty('key') ? rawData.key : '';
        item.type = rawData.hasOwnProperty('type') ? rawData.type : '';
        item.value = rawData.hasOwnProperty('value') ? rawData.value : '';
        item.keyValue = rawData.hasOwnProperty('keyValue') ? rawData.keyValue : '';

        return item;
    }
}

@Component({
    selector: 'al-deployment-exclusions',
    templateUrl: './deployment-exclusions.component.html',
    styleUrls: ['./deployment-exclusions.component.scss']
})
export class DeploymentExclusionsComponent implements OnInit {

    @Input() initialExclusions: Map<string, ExclusionsRulesDescriptor>;
    @Output() onCloseExclusions: EventEmitter<Object> = new EventEmitter();
    @ViewChild(AlTabsComponent, {static: true}) alTabs: AlTabsComponent;
    @ViewChild('alSearchBar', {static: true}) alSearch: AlSearchBarComponent;
    @ViewChild("notificationExclusionsPanel") notificationPanel: AlNotificationPanelComponent;
    public notifications: EventEmitter<AlNotification> = new EventEmitter<AlNotification>();
    public notification: AlNotification;
    public deployment: Deployment;
    public deploymentKey: string;
    public selectedTab: 'external-scanning' | 'internal-scanning' | 'network-ids' = "external-scanning";
    public externalQuery: string = "";
    public internalQuery: string = "";
    public networkPlaceholder = "Search for an asset to add";
    public protocolSelected: string = "*";
    public portSelected: string = "*";
    public networkCIDR: string = "";
    public networkCIDRForm: FormGroup;
    public internalPortsForm: FormGroup;
    public externalPortsForm: FormGroup;
    public cidrFormConfig = {
        label: 'CIDR',
        labelError: 'Network CIDR has an invalid CIDR format.',
        emptyLabelError: 'Network CIDR could not be empty.',
        portLabel: 'Port(s)',
        portError: 'Invalid port format',
        portInfo: 'Format options include "443", "*", "1024:3305"'
    };
    public protocols: Array<any> = [
        {name: "*", id: "*"},
        {name: "TCP", id: "tcp"},
        {name: "UDP", id: "udp"},
        {name: "ICMP", id: "icmp"}
    ];
    // ******************* al-modal configs *******************
    public modalCard: ModalCardDescriptor = {
        cards: 1,
        width: "80%",
        height: "80%",
        closeable: true,
        open: false
    };
    // ******************* al-tabs configs *******************
    public exclusionsTabs: TabsDescriptor = new TabsDescriptor().import({
        tabs: [
            {title: "External Scanning", key: "external-scanning"},
            {title: "Internal Scanning", key: "internal-scanning"},
            {title: "Network IDS Whitelist", key: "network-ids"}
        ]
    });
    public multiSelectConfig: object = {
        placeholder: "Network(s)",
        items: [],
        selectedItems: '',
        labelToBind: "name",
        valueToBind: "key",
    };
    // *******************  al-config-selectable-list data *******************
    public externalAssets: Object = {};
    public internalAssets: Object = {};
    public tags: Object = {};
    public externalSelectableAvailable: Array<ConfigSelectableListDescriptor> = [];
    public externalSelectableExcluded: Array<ConfigSelectableListDescriptor> = [];
    public internalSelectableAvailable: Array<ConfigSelectableListDescriptor> = [];
    public internalSelectableExcluded: Array<ConfigSelectableListDescriptor> = [];
    public networksSelectableExcluded: Array<ConfigSelectableListDescriptor> = [];
    // ******************* al-config-selectable-list configs *******************
    public selectLeftConfig: ConfigSelectableListConfigDescriptor = ConfigSelectableListConfigDescriptor.import({
        zeroStateIcon: {
            alClass: 'al al-assets'
        },
        zeroStateMessage: "No assets were found.",
        height: '100%',
        actions: {
            label: "exclude",
            icon: {
                material: 'arrow_forward'
            },
            isRight: true
        },
        orderBy: 'title',
        orderUpward: true
    });
    public selectRightConfig: ConfigSelectableListConfigDescriptor = ConfigSelectableListConfigDescriptor.import({
        zeroStateIcon: {
            alClass: 'al al-assets'
        },
        zeroStateMessage: "No assets chosen yet.",
        height: '100%',
        actions: {
            label: "cancel",
            icon: {
                material: 'arrow_back'
            },
            isRight: false
        },
        orderBy: 'title',
        orderUpward: true
    });
    public selectRightPortsConfig: ConfigSelectableListConfigDescriptor = ConfigSelectableListConfigDescriptor.import({
        zeroStateIcon: {
            alClass: 'al al-assets'
        },
        zeroStateMessage: "No ports chosen yet.",
        height: '100%',
        actions: {
            label: "REMOVE",
            icon: {
                material: 'close'
            },
            isRight: false
        },
        orderBy: 'title',
        orderUpward: true
    });
    public networkSelectLeftConfig: ConfigSelectableListConfigDescriptor = ConfigSelectableListConfigDescriptor.import({
        zeroStateIcon: {
            alClass: 'al al-cidr'
        },
        zeroStateMessage: "No CIDRs chosen yet.",
        height: '100%',
        actions: {
            label: "Remove",
            icon: {
                material: 'cancel'
            },
            isRight: false
        }
    });
    assetsFromAPI: Array<any> = [];
    public externalAssetDescriptors: Array<AlBlackCardDescriptor> = [];
    public filteredExternalAssets: Array<AlBlackCardDescriptor> = [];
    public alTabsOutput: string = "";
    public typeToExclude: "assets" | "ports" | "tags" = "assets";
    public filteredAssetsList: AlSelectItem[] = [];
    public selectedInternalAssetsPorts: AlSelectItem[] = [];
    public selectedExternalAssetsPorts: AlSelectItem[] = [];
    public protocolOptionsList: SelectItem[] = [];
    public internalAssetsPortsExcluded: Array<ConfigSelectableListDescriptor> = [];
    public externalAssetsPortsExcluded: Array<ConfigSelectableListDescriptor> = [];
    private externalExcluded: Map<string, ConfigSelectableListDescriptor> = new Map<string, ConfigSelectableListDescriptor>();
    private internalAssetExcluded: Map<string, ConfigSelectableListDescriptor> = new Map<string, ConfigSelectableListDescriptor>();
    private internalTagExcluded: Map<string, ConfigSelectableListDescriptor> = new Map<string, ConfigSelectableListDescriptor>();
    private initialNetworks: Array<CidrType> = [];
    private networksExcluded: Map<string, CidrType> = new Map<string, CidrType>();
    private internalAssetsPortsExcludedMap: Map<string, ConfigSelectableListDescriptor> = new Map<string, ConfigSelectableListDescriptor>();
    private externalAssetsPortsExcludedMap: Map<string, ConfigSelectableListDescriptor> = new Map<string, ConfigSelectableListDescriptor>();
    private updatedRuleAssestIds: string[] = [];
    private rulesByRuleAssetIdToDelete: string[] = [];
    private unknownExclusionRulesIds: string[] = [];

    public exclusionSnapShot:{[key:string]: Array<ConfigSelectableListDescriptor>} = {};

    constructor(protected deploymentsService: DeploymentsUtilityService,
                protected insightUtilityService: InsightUtilityService,
                protected assetsService: AssetsService) {
    }

    @Input()
    set open(open: boolean) {
        if (open) {
            this.openModal(open);
        }
    }

    ngOnInit() {
        this.deployment = this.deploymentsService.getDeploymentOnTracking();
        this.setupForm();
        this.alTabs.goTab(1);
    }

    openModal(open) {
        this.clearData();
        this.modalCard.open = open;
        this.alTabs.goTab(0);
        this.loadInitialData();
    }

    changeTab(tab: any) {
        this.selectedTab = tab.hasOwnProperty('key') ? tab.key : "external-scanning";
        this.typeToExclude = 'assets';
        this.flushNotifications();
        if (this.selectedTab === 'external-scanning') {
            this.loadAssetsConfigs();
            this.loadExternalSelectableAssets();
        } else if (this.selectedTab === 'internal-scanning') {
            this.loadAssetsConfigs();
            this.loadInternalSelectableAssets();
        }
    }

    setupForm() {
        this.setupProtocolOptionsList();
        this.networkCIDRForm = new FormGroup({
            mode: new FormControl()
        });
        this.internalPortsForm = new FormGroup({
            portsInput: new FormControl(""),
            protocol: new FormControl("udp")
        });
        this.externalPortsForm = new FormGroup({
            portsInput: new FormControl(""),
            protocol: new FormControl("udp")
        });
        this.addFormControl();
    }

    addFormControl() {
        let cidr: FormControl = new FormControl(null, [Validators.required, this.insightUtilityService.cidrValidator()]);
        let ports: FormControl = new FormControl('*', [this.insightUtilityService.portsValidator]);
        this.networkCIDRForm.addControl('cidr', cidr);
        this.networkCIDRForm.addControl('ports', ports);
        this.internalPortsForm.get('portsInput').setValidators(() => this.insightUtilityService.portsValidator(this.internalPortsForm.get('portsInput') as FormControl, true));
        this.externalPortsForm.get('portsInput').setValidators(() => this.insightUtilityService.portsValidator(this.externalPortsForm.get('portsInput') as FormControl, true));
    }

    forcedAsterisk(event) {
        if ((this.networkCIDRForm.get('ports').value as string).trim() === '') {
            this.portSelected = '*'
        }
    }

    parseAssetToSelectable(asset: AssetDescriptor): ConfigSelectableListDescriptor {
        if (asset) {
            let iconClass = 'al al-shrug';
            let iconMaterial = null;
            let vpcType = undefined;
            if (asset['type'] === 'host') {
                iconClass = 'al al-host';
            } else if (asset['type'] === 'subnet') {
                iconClass = 'al al-subnet';
            } else if (asset['type'] === 'vpc') {
                if (this.deployment.platform.type === 'aws') {
                    iconClass = 'al al-topology-vpc-1';
                    vpcType = 'vpc';
                } else if (this.deployment.platform.type === 'datacenter') {
                    iconClass = 'al al-topology-network-1';
                    vpcType = 'network'
                } else if (this.deployment.platform.type === 'azure') {
                    iconClass = 'al al-topology-vpc-1';
                    vpcType = 'vnet'
                }
            } else if (asset['type'] === 'region') {
                iconClass = 'al al-topology-region-1';
            } else if (asset['type'] === 'external-dns-name') {
                iconMaterial = 'dns';
            } else if (asset['type'] === 'external-ip') {
                iconMaterial = 'settings_ethernet';
            }
            let assetTitleTxt = asset.name || asset.key;
            if (this.deployment.platform.type !== 'azure') {
                if (asset.type === 'subnet') {
                    if (asset.properties.hasOwnProperty('subnet_id')) {
                        assetTitleTxt = `${assetTitleTxt} - ( ${asset.properties['subnet_id']} )`;
                    } else if (asset.properties.hasOwnProperty('cidr_block')) {
                        assetTitleTxt = `${assetTitleTxt} - ( ${asset.properties['cidr_block']} )`;
                    }
                } else if (asset.type === 'host') {
                    if (asset.properties.hasOwnProperty('instance_id')) {
                        assetTitleTxt = `${assetTitleTxt} - ( ${asset.properties['instance_id']} )`;
                    } else if (asset.properties.hasOwnProperty('local_ipv4')) {
                        if (Array.isArray(asset.properties['local_ipv4'])) {
                            assetTitleTxt = `${assetTitleTxt} - ( ${asset.properties['local_ipv4'].join()} )`;
                        } else if (typeof asset.properties['local_ipv4'] === "string") {
                            assetTitleTxt = `${assetTitleTxt} - ( ${asset.properties['local_ipv4']} )`;
                        }
                    }
                } else if (asset.type === 'vpc') {
                    if (asset.properties.hasOwnProperty('vpc_id')) {
                        assetTitleTxt = `${assetTitleTxt} - ( ${asset.properties['vpc_id']} )`;
                    } else if (asset.properties.hasOwnProperty('cidr_ranges')) {
                        if (Array.isArray(asset.properties['cidr_ranges'])) {
                            assetTitleTxt = `${assetTitleTxt} - ( ${asset.properties['cidr_ranges'].join()} )`;
                        } else if (typeof asset.properties['cidr_ranges'] === "string") {
                            assetTitleTxt = `${assetTitleTxt} - ( ${asset.properties['cidr_ranges']} )`;
                        }
                    }
                }
            }
            return ConfigSelectableListDescriptor.import(
                {
                    key: asset.key,
                    title: assetTitleTxt,
                    icon: iconMaterial ? {
                        material: iconMaterial
                    } : {
                        alClass: iconClass
                    },
                    type: vpcType ? vpcType : asset.type,
                    parentId: null
                }
            );
        }
    }

    parseTagToSelectable(tag: TagType): ConfigSelectableListDescriptor {
        if (tag) {
            return ConfigSelectableListDescriptor.import(
                {
                    key: tag['keyValue'],
                    title: tag['key'] + ' : ' + tag['value'],
                    icon: {
                        material: 'label'
                    },
                    type: 'tag'
                }
            )
        }
    }

    parseCidrToSelectable(cidr: CidrType): ConfigSelectableListDescriptor {
        if (cidr) {
            let protocol = this.protocols.filter(p => p.id === cidr.protocol)[0];
            let protocolLabel = protocol ? protocol.name : 'All';
            protocolLabel = cidr.protocol === "*" ? "All Protocols" : protocolLabel + " Protocol";

            let portLabel: string = cidr.port === '*' ? 'All Ports' : (cidr.port !== '*' && cidr.port.indexOf(':') !== -1) ?
                'Ports ' + cidr.port : 'Port ' + cidr.port;
            let title;
            if (cidr.networkKey === this.deploymentKey) {
                title = "All networks"
            } else if (this.internalAssets[cidr.networkKey]) {
                title = this.internalAssets[cidr.networkKey].name
            } else {
                title = 'undefined'
            }

            return ConfigSelectableListDescriptor.import(
                {
                    key: cidr.id === '' ?
                        this.multiSelectConfig['selectedItems'] + '/' + cidr.protocol + '/' + cidr.cidr + '/' + cidr.port :
                        cidr.id,

                    title: title,
                    labels: [protocolLabel, cidr.cidr, portLabel],
                    icon: {
                        alClass: 'al al-topology-network-1'
                    },
                    textAlign: 'center'
                }
            );
        }
    }

    parseExclusionToAssetSelectable(exclusion: ExclusionsAssets, isExternal: boolean): ConfigSelectableListDescriptor {
        let asset;
        if (isExternal) {
            asset = this.externalAssets[exclusion['key']];
        } else {
            asset = this.internalAssets[exclusion['key']];

        }
        return this.parseAssetToSelectable(asset);
    }

    parseExclusionToTagSelectable(exclusion: ExclusionsAssets): ConfigSelectableListDescriptor {
        let tag = this.tags[exclusion['key'] + ':' + exclusion['value']];
        return this.parseTagToSelectable(tag);
    }

    parseExclusionToCidrSelectable(exclusion: ExclusionsAssets, protocol: string, port: string, id: string, cidr: string): ConfigSelectableListDescriptor {
        let networkCidr = CidrType.import(
            {
                id: id,
                protocol: protocol,
                cidr: cidr,
                port: port,
                networkKey: exclusion['key']
            }
        );
        return this.parseCidrToSelectable(networkCidr);
    }

    loadInitialData() {
        forkJoin([
            this.getInternalTags(),
            this.getExternalAssets(),
        ].concat(this.getInternalAssets())).subscribe(responses => {
            if (responses[5]['assets']) {
                responses[5]['assets'].forEach(asset => {
                    this.deploymentKey = asset[0]['key'];
                });
            }
            this.multiSelectConfig['items'] = [{name: "All networks", key: this.deploymentKey}];
            this.multiSelectConfig['selectedItems'] = this.deploymentKey;

            this.loadInternalTags(responses[0]);
            this.loadExternalAssets(responses[1]);
            this.loadInternalAssets(responses[2], responses[3], responses[4]);

            this.loadInitialExclusions();

            this.loadExternalSelectableAssets();
            this.loadInternalSelectableAssets();
            this.cloneExclusionVariables();

        }, error => {
            console.log('Error retrieving the data', error)
        });
    }

    // Creating Snapshot variables for verify changes.
    cloneExclusionVariables() {
        this.exclusionSnapShot[ "internalSelectableExcluded"  ] = cloneDeep(this.internalSelectableExcluded);
        this.exclusionSnapShot[ "externalSelectableExcluded"  ] = cloneDeep(this.externalSelectableExcluded);
        this.exclusionSnapShot[ "externalAssetsPortsExcluded" ] = cloneDeep(this.externalAssetsPortsExcluded);
        this.exclusionSnapShot[ "internalAssetsPortsExcluded" ] = cloneDeep(this.internalAssetsPortsExcluded);
        this.exclusionSnapShot[ "networksSelectableExcluded"  ] = cloneDeep(this.networksSelectableExcluded);
    }

    clearData() {
        this.internalPortsForm.get('portsInput').reset();
        this.externalPortsForm.get('portsInput').reset();
        this.selectedInternalAssetsPorts = [];
        this.selectedExternalAssetsPorts = [];
        this.externalAssets = {};
        this.internalAssets = {};
        this.tags = {};

        this.externalExcluded.clear()

        this.externalSelectableAvailable = [];
        this.externalSelectableExcluded = [];

        this.internalAssetExcluded.clear();
        this.internalTagExcluded.clear();

        this.internalSelectableAvailable = [];
        this.internalSelectableExcluded = [];

        this.initialNetworks = [];
        this.networksExcluded.clear();
        this.networksSelectableExcluded = [];
    }

    getInternalAssets(): Array<Observable<any>> {
       return ['vpc', 'subnet', 'host', 'deployment'].map(assetType => {
                return  observableFrom(AlAssetsQueryClient.getDeploymentAssets(this.deployment.account_id,
                                                this.deployment.id,
                                                {"asset_types": assetType}));
            });
    }

    getExternalAssets(): Observable<any> {
        return forkJoin([
            this.assetsService.byType('external-dns-name', undefined, this.deployment.id),
            this.assetsService.byType('external-ip', undefined, this.deployment.id)
        ]);
    }

    getInternalTags(): Observable<any> {
        return  observableFrom(
            AlAssetsQueryClient
            .getDeploymentAssets(this.deployment.account_id,
                                 this.deployment.id,
                                 {"asset_types": "tag", "qfields": "tag_key,tag_value" })
        );
    }

    loadExternalAssets(groupOfAssets) {
        this.externalSelectableAvailable = [];
        groupOfAssets.forEach(assets => {
            assets.assets.forEach(asset => {
                asset = asset[0];
                if (asset['key'] && asset['name'] && asset['type']) {
                    this.externalAssets[asset['key']] = AssetDescriptor.import(asset);
                }

            });
        });
    }

    loadInternalAssets(groupOfAssets1, groupOfAssets2, groupOfAssets3) {
        this.internalAssets = {};
        if (groupOfAssets1['assets']) {
            groupOfAssets1['assets'].forEach(assets => {
                assets.forEach(asset => {
                    this.internalAssets[asset['key']] = AssetDescriptor.import(asset);
                    const network = {
                        name: asset.name ? asset.name : asset.key,
                        key: asset.key
                    }
                    this.multiSelectConfig['items'].push(network);
                });
            });
        }
        if (groupOfAssets2['assets']) {
            groupOfAssets2['assets'].forEach(assets => {
                assets.forEach(asset => {
                    this.internalAssets[asset['key']] = AssetDescriptor.import(asset);
                });
            });
        }
        if (groupOfAssets3['assets']) {
            groupOfAssets3['assets'].forEach(assets => {
                assets.forEach(asset => {
                    this.internalAssets[asset['key']] = AssetDescriptor.import(asset);
                });
            });
        }
    }

    loadInternalTags(tags) {
        this.tags = {};
        if (tags['assets']) {
            tags['assets'].forEach(tag => {
                tag = tag[0];
                this.tags[tag['tag_key'] + ':' + tag['tag_value']] = TagType.import(
                    {
                        key: tag['tag_key'],
                        value: tag['tag_value'],
                        type: tag['type'],
                        keyValue: tag['tag_key'] + ':' + tag['tag_value']
                    });
            });
        }
    }

    loadExternalSelectableAssets() {
        this.externalSelectableAvailable = [];
        for (let key in this.externalAssets) {
            if (!this.externalExcluded.get(key)) {
                this.externalSelectableAvailable.push(this.parseAssetToSelectable(this.externalAssets[key]));
            }
        }
    }

    loadInternalSelectableAssets() {
        this.internalSelectableAvailable = [];
        for (let key in this.internalAssets) {
            if (!this.internalAssetExcluded.get(key)) {
                this.internalSelectableAvailable.push(this.parseAssetToSelectable(this.internalAssets[key]));
            }
        }
    }

    loadInternalSelectableTags() {
        this.internalSelectableAvailable = [];
        for (let key in this.tags) {
            if (!this.internalTagExcluded.get(key)) {
                this.internalSelectableAvailable.push(this.parseTagToSelectable(this.tags[key]));
            }
        }
    }

    loadInitialExclusions() {
        let externalExclusions: ExclusionsRulesDescriptor = this.initialExclusions.get('external_scanning_' + this.deployment.id);
        let internalExclusions: ExclusionsRulesDescriptor = this.initialExclusions.get('internal_scanning_' + this.deployment.id);
        let networksExclusions: Array<ExclusionsRulesDescriptor> = Array.from(this.initialExclusions.values())
            .filter(
                exclusion => exclusion.features.filter(feature => feature === 'ids').length);

        this.loadAssetsPortsExclusions(ScanType.vulnerability, this.internalAssets, this.internalAssetsPortsExcluded, this.internalAssetsPortsExcludedMap);
        this.loadAssetsPortsExclusions(ScanType.external, this.externalAssets, this.externalAssetsPortsExcluded, this.externalAssetsPortsExcludedMap);

        if (externalExclusions) {
            externalExclusions.assets.forEach(asset => {
                if (asset.type === 'asset') {
                    let selectable = this.parseExclusionToAssetSelectable(asset, true);
                    if (selectable) {
                        this.externalExcluded.set(asset['key'], selectable);
                    }
                }
            });
        }
        if (internalExclusions) {
            internalExclusions.assets.forEach(asset => {
                if (asset.type === 'asset') {
                    let selectable = this.parseExclusionToAssetSelectable(asset, false);
                    if (selectable) {
                        this.internalAssetExcluded.set(asset['key'], selectable);
                    }
                } else if (asset.type === 'tag') {
                    let selectable = this.parseExclusionToTagSelectable(asset);
                    if (selectable) {
                        this.internalTagExcluded.set(asset['key'] + ':' + asset['value'], selectable);
                    }
                }
            });
        }
        if (networksExclusions) {
            networksExclusions.forEach(exclusion => {
                let feature = exclusion.details.filter(detail => detail.feature === 'ids')[0];
                let protocol = feature ? feature.proto : '*';
                let port = feature ? feature.port : '*';
                let cidrValue = feature ? feature.cidr : '*';
                exclusion.assets.forEach(asset => {
                    let cidr = CidrType.import({
                        id: exclusion.id,
                        protocol: protocol,
                        port: port,
                        cidr: cidrValue,
                        networkKey: asset['key']
                    });
                    this.initialNetworks.push(cidr);
                    this.networksExcluded.set(exclusion['id'], cidr);
                    let selectable = this.parseExclusionToCidrSelectable(asset, protocol, port, exclusion.id, cidrValue);
                    if (selectable) {
                        this.networksSelectableExcluded.push(selectable);
                    }
                });
            });
        }

        this.externalSelectableExcluded = Array.from(this.externalExcluded.values());
        this.internalSelectableExcluded = Array.from(this.internalAssetExcluded.values())
            .concat(Array.from(this.internalTagExcluded.values()));
    }

    isPortExclusionRule(rule: ExclusionsRulesDescriptor): boolean {
        let isPortExclusionRule: boolean = true;

        // Conditions for be a port exclusion rule
        if (rule.blackouts.length === 1 && rule.blackouts[0].resolution === BlackoutsResolution.permanent &&
            rule.features.length === 1 && rule.features[0] === "scan" && rule.details.length > 0) {
            rule.details.forEach(detail => {
                if (!(detail.feature === "scan" && (detail.scan_type === ScanType.vulnerability || detail.scan_type === ScanType.external) &&
                    detail.ports.length > 0)) {
                    isPortExclusionRule = false;
                }
            });
            let scanTypes: ScanType[] = rule.details.map(detail => detail.scan_type);
            const firstScanType: string = scanTypes.length > 0 ? scanTypes[0] : null;
            if (firstScanType) {
                isPortExclusionRule = isPortExclusionRule && !scanTypes.some(scanType => firstScanType !== scanType);
            }
        } else {
            isPortExclusionRule = false;
        }

        return isPortExclusionRule;
    }

    exportExclusions(): Object {
        let exclusions: AllExclusionsToSave = {
            external_scanning: [],
            internal_scanning: [],
            internal_scanning_ports: [],
            external_scanning_ports: [],
            networks_ids: [],
            ports_rules_deleted: [],
            networks_deleted: [],
            changes: false
        };

        this.externalExcluded.forEach((element, key) => {
            exclusions['external_scanning'].push(
                ExclusionsAssets.import(
                    {
                        type: 'asset',
                        key: element.key,
                        asset_type: element.type
                    }
                )
            )
        });

        this.internalAssetExcluded.forEach((element, key) => {
            exclusions['internal_scanning'].push(
                ExclusionsAssets.import(
                    {
                        type: 'asset',
                        key: element.key,
                        asset_type: element.type
                    }
                )
            );
        });

        this.internalAssetsPortsExcludedMap.forEach((item, key) => {
            if (this.updatedRuleAssestIds.includes(key)) {
                const internalDetails: ExlusionsDetails[] = this.getDetailsForPorts(item, 'vulnerability');
                exclusions['internal_scanning_ports'].push(
                    {
                        asset: ExclusionsAssets.import(
                            {
                                type: 'asset',
                                key: item.key,
                                asset_type: item.type
                            }
                        ),
                        details: internalDetails,
                        ruleId: item.parentId
                    }
                );
            }
        });

        this.externalAssetsPortsExcludedMap.forEach((item, key) => {
            if (this.updatedRuleAssestIds.includes(key)) {
                const externalDetails: ExlusionsDetails[] = this.getDetailsForPorts(item, 'external');
                exclusions['external_scanning_ports'].push(
                    {
                        asset: ExclusionsAssets.import(
                            {
                                type: 'asset',
                                key: item.key,
                                asset_type: item.type
                            }
                        ),
                        details: externalDetails,
                        ruleId: item.parentId,
                    }
                );
            }
        });

        exclusions['ports_rules_deleted'] = this.rulesByRuleAssetIdToDelete;

        this.internalTagExcluded.forEach((element, key) => {
            let tag = this.tags[key];
            exclusions['internal_scanning'].push(
                ExclusionsAssets.import(
                    {
                        type: 'tag',
                        key: tag.key,
                        value: tag.value,
                    }
                )
            );
        });

        this.networksExcluded.forEach((element, key) => {
            exclusions['networks_ids'].push(element);
        });

        this.initialNetworks.forEach(element => {
            if (!this.networksExcluded.has(element.id)) {
                exclusions['networks_deleted'].push(element.id);
            }
        });


         // This block is necessary to check if there was a change in the exclusions
        this.exclusionVaraiblesValidator(exclusions);

        return exclusions;
    }

    /**
     * Validator for changes in Exclusion varaibles.
     * @param exclusions list of exclusions.
     */
    exclusionVaraiblesValidator(exclusions:AllExclusionsToSave) {
        ['internalSelectableExcluded',
         'externalSelectableExcluded',
         'externalAssetsPortsExcluded',
         'internalAssetsPortsExcluded',
         'networksSelectableExcluded'].forEach( exclusionProperty => {
            if( !exclusions['changes'] ) {
                if( this.exclusionSnapShot[exclusionProperty].length === this[exclusionProperty].length ){
                    for( let exclusionPropertyItem of  this[exclusionProperty] ) {
                        let exclusionFoundElement:ConfigSelectableListDescriptor = this.exclusionSnapShot[exclusionProperty].find(
                            exclusionPropertyItemClone => exclusionPropertyItemClone.key === exclusionPropertyItem.key );
                        if( exclusionFoundElement ) {
                            if( exclusionFoundElement.key !== exclusionPropertyItem.key  ) {
                                exclusions['changes'] = true;
                                break;
                            }
                        } else {
                            exclusions['changes'] = true;
                            break;
                        }
                    }
                } else {
                    exclusions['changes'] = true;
                }
            }
         });
    };

    moveElement(
        fromSelect: Array<ConfigSelectableListDescriptor>,
        toSelect: Array<ConfigSelectableListDescriptor>,
        element: any,
        section: string,
        filter: boolean = false,
        fromMap: Map<string, ConfigSelectableListDescriptor> = null,
        toMap: Map<string, ConfigSelectableListDescriptor> = null,
    ) {
        if (filter) {
            let regex;
            if (section === "external-scanning") {
                regex = new RegExp(`${this.externalQuery}`, "i");
            } else if (section === "internal-scanning") {
                regex = new RegExp(`${this.internalQuery}`, "i");
            }
            if (element.title.match(regex)) {
                toSelect.unshift(element);
                if (toMap) {
                    toMap.set(element.key, element);
                }
            }
        } else {
            toSelect.unshift(element);
            if (toMap) {
                toMap.set(element.key, element);
            }
        }
        this.removeElement(fromSelect, element, fromMap);
    }

    removeElement(
        fromSelectable: Array<ConfigSelectableListDescriptor>,
        element: any,
        fromMap: Map<string, ConfigSelectableListDescriptor> = null) {
        for (var i = 0; i < fromSelectable.length; i++) {
            if (fromSelectable[i].key === element.key) {
                fromSelectable.splice(i, 1);
            }
        }

        if (fromMap) {
            fromMap.delete(element.key);
        }
    }

    searchFilters(section: string, query: string) {
        if (section === "external-scanning") {
            if (query !== null) {
                this.externalQuery = query;
            }
            this.externalSelectableAvailable = [];
            for (let key in this.externalAssets) {
                if (this.externalAssets[key].name.toLowerCase().match(this.externalQuery.toLowerCase()) && !this.externalExcluded.get(key)) {
                    this.externalSelectableAvailable.push(this.parseAssetToSelectable(this.externalAssets[key]));
                }
            }
            if (!this.externalSelectableAvailable.length) {
                this.selectLeftConfig.zeroStateMessage = 'No matches found';
            } else {
                this.loadAssetsConfigs();
            }
        } else if (section === "internal-scanning") {
            if (query !== null) {
                this.internalQuery = query;
            }
            if (this.typeToExclude === 'assets') {
                this.internalSelectableAvailable = [];
                for (let key in this.internalAssets) {
                    if (this.internalAssets[key].name.toLowerCase().match(this.internalQuery.toLowerCase()) && !this.internalAssetExcluded.get(key)) {
                        this.internalSelectableAvailable.push(this.parseAssetToSelectable(this.internalAssets[key]));
                    }
                }
                if (!this.internalSelectableAvailable) {
                    this.selectLeftConfig.zeroStateMessage = 'No matches found';
                } else {
                    this.loadAssetsConfigs();
                }
            } else if (this.typeToExclude === 'tags') {
                this.internalSelectableAvailable = [];
                for (let key in this.tags) {
                    if (this.tags[key].keyValue.toLowerCase().match(this.internalQuery.toLowerCase()) && !this.internalTagExcluded.get(key)) {
                        this.internalSelectableAvailable.push(this.parseTagToSelectable(this.tags[key]));
                    }
                }
                if (!this.internalSelectableAvailable) {
                    this.selectLeftConfig.zeroStateMessage = 'No matches found';
                } else {
                    this.loadTagsConfig();
                }
            }
        }
    }

    onTypeToExcludeButton(typeToExclude: "assets" | "ports" | "tags") {
        this.flushNotifications();
        if (typeToExclude === this.typeToExclude) {
            return null;
        }
        this.typeToExclude = typeToExclude;
        if (this.selectedTab === 'internal-scanning') {
            switch (typeToExclude) {
                case 'assets':
                    setTimeout(() => {
                        this.alSearch.clear();
                    });
                    this.networkPlaceholder = "Search for an asset to add";
                    this.loadInternalSelectableAssets();
                    this.loadAssetsConfigs();
                    break;
                case 'ports':
                    this.loadInternalSelectableAssets();
                    let assetsToExcludeUsingPorts = this.internalSelectableAvailable.filter(asset => asset.type !== 'tag');
                    this.filteredAssetsList = assetsToExcludeUsingPorts.map(
                        asset => <AlSelectItem>{
                            title: asset.title,
                            icon: asset.icon.material ? asset.icon.material : asset.icon.alClass,
                            isMaterialIcon: asset.icon.material !== "",
                            value: {
                                title: asset.title,
                                icon: asset.icon.material ? asset.icon.material : asset.icon.alClass,
                                isMaterialIcon: asset.icon.material !== "",
                                label: asset.type,
                                assetKey: asset.key,
                                type: asset.type
                            }
                        }
                    );
                    this.showIncompatibilityMessage();
                    break;
                case 'tags':
                    setTimeout(() => {
                        this.alSearch.clear();
                    });
                    let platform: string = "AWS";
                    if (this.deployment.platform.type === 'azure') {
                        platform = 'Azure';
                    }
                    this.networkPlaceholder = "Search for an " + platform + " tag to exclude";
                    this.loadInternalSelectableTags();
                    this.loadTagsConfig();
                    break;
                default:
                    break;
            }
        }
        if (this.selectedTab === 'external-scanning') {
            switch (typeToExclude) {
                case 'assets':

                    break;
                case 'ports':
                    this.loadExternalSelectableAssets();
                    this.filteredAssetsList = this.externalSelectableAvailable.map(
                        asset => <AlSelectItem>{
                            title: asset.title,
                            icon: asset.icon.material ? asset.icon.material : asset.icon.alClass,
                            isMaterialIcon: asset.icon.material !== "",
                            value: {
                                title: asset.title,
                                icon: asset.icon.material ? asset.icon.material : asset.icon.alClass,
                                isMaterialIcon: asset.icon.material !== "",
                                label: asset.type,
                                assetKey: asset.key,
                                type: asset.type
                            }
                        }
                    );
                    this.showIncompatibilityMessage();
                    break;
                default:
                    break;
            }
        }
    }

    onAssetSelected(selectedAssets: AlSelectItem[]) {
        if (this.selectedTab === "internal-scanning") {
            this.selectedInternalAssetsPorts = selectedAssets;
        } else if (this.selectedTab === "external-scanning") {
            this.selectedExternalAssetsPorts = selectedAssets;
        }
    }

    excludeNetwork() {
        if (this.networkCIDR && this.portSelected && this.protocolSelected) {
            let cidr = CidrType.import(
                {
                    protocol: this.protocolSelected,
                    cidr: this.networkCIDR,
                    port: this.portSelected,
                    networkKey: this.multiSelectConfig['selectedItems'],
                    asset_type: this.multiSelectConfig['selectedItems'] === this.deploymentKey ? 'deployment' : 'vpc'
                }
            );

            let selectable = this.parseCidrToSelectable(cidr);
            this.networksSelectableExcluded.push(selectable);
            this.networksExcluded.set(selectable.key, cidr);

            this.networkCIDR = "";
            this.protocolSelected = "*";
            this.portSelected = "*";
            this.multiSelectConfig['selectedItems'] = this.deploymentKey;
            this.networkCIDRForm.markAsUntouched();
            this.networkCIDRForm.markAsPristine();

            this.networkCIDRForm.updateValueAndValidity();
        }
    }

    closeExclusions() {
        this.selectedTab = "external-scanning";
        this.onCloseExclusions.emit(this.exportExclusions());
        this.internalAssetsPortsExcluded = [];
        this.internalAssetsPortsExcludedMap = new Map<string, ConfigSelectableListDescriptor>();
        this.externalAssetsPortsExcluded = [];
        this.externalAssetsPortsExcludedMap = new Map<string, ConfigSelectableListDescriptor>();
        this.updatedRuleAssestIds = [];
        this.rulesByRuleAssetIdToDelete = [];
        this.unknownExclusionRulesIds = [];
    }

    loadAssetsConfigs() {
        this.selectLeftConfig.zeroStateMessage = 'No assets found.';
        this.selectRightConfig.zeroStateMessage = 'No assets chosen yet.';
        this.selectLeftConfig.zeroStateIcon.alClass = 'al al-assets';
        this.selectRightConfig.zeroStateIcon.alClass = 'al al-assets';
    }

    loadTagsConfig() {
        this.selectLeftConfig.zeroStateMessage = 'No tags found.';
        this.selectRightConfig.zeroStateMessage = 'No tags chosen yet.';
        this.selectLeftConfig.zeroStateIcon.alClass = 'al al-tag';
        this.selectRightConfig.zeroStateIcon.alClass = 'al al-tag';
    }

    addAssetsWithPorts() {
        let somethingAdded: boolean = false;
        let selectedAssetsPorts = this.selectedTab === 'internal-scanning' ? [...this.selectedInternalAssetsPorts] : [...this.selectedExternalAssetsPorts];
        selectedAssetsPorts.forEach(selectedAsset => {
            const ports: ConfigSelectableSubItem[] = this.getPorts(selectedAsset);
            let assetsPortMap: Map<string, ConfigSelectableListDescriptor> = this.selectedTab === "internal-scanning" ? this.internalAssetsPortsExcludedMap : this.externalAssetsPortsExcludedMap;
            let assetsPort: ConfigSelectableListDescriptor[] = this.selectedTab === "internal-scanning" ? this.internalAssetsPortsExcluded : this.externalAssetsPortsExcluded;
            let anyAssetAdded: boolean = false;
            let assetAddedKey: string = "";
            assetsPortMap.forEach((assetItem, key) => {
                if (assetItem.key === selectedAsset['assetKey'] && !anyAssetAdded) {
                    anyAssetAdded = true;
                    assetAddedKey = key;
                }
            });
            if (!anyAssetAdded) {
                somethingAdded = true;
                ports.forEach(portToAdd => {
                    portToAdd.parentId = "null" + "#" + selectedAsset['assetKey'];
                });
                const assetPortsExcludedItem = this.getExcludedItem(selectedAsset, ports);
                if (!this.updatedRuleAssestIds.includes("null" + "#" + assetPortsExcludedItem.key)) {
                    this.updatedRuleAssestIds.push("null" + "#" + assetPortsExcludedItem.key);
                }
                assetsPortMap.set("null" + "#" + assetPortsExcludedItem.key, assetPortsExcludedItem);
                assetsPort.push(assetPortsExcludedItem);
            } else {
                const existingSelectedAsset: ConfigSelectableListDescriptor = assetsPortMap.get(assetAddedKey);
                ports.forEach(portToAdd => {
                    const duplicatedPort: ConfigSelectableSubItem[] = this.getPortDuplicated(portToAdd, existingSelectedAsset.subItems);
                    if (duplicatedPort.length === 0) {
                        existingSelectedAsset.subItems.push(portToAdd);
                        somethingAdded = true;
                    }
                });
                const rule = this.initialExclusions.get(existingSelectedAsset.parentId);
                const pairKey: string = "null" + "#" + selectedAsset['assetKey'];
                if (rule && rule.assets.length > 1) {
                    existingSelectedAsset.subItems.forEach(subItem => {
                        subItem.parentId = pairKey;
                    });
                    if (!this.updatedRuleAssestIds.includes(pairKey)) {
                        this.updatedRuleAssestIds.push(pairKey);
                    }
                    assetsPortMap.set(pairKey, existingSelectedAsset);
                } else if (somethingAdded) {
                    if (!this.updatedRuleAssestIds.includes(assetAddedKey)) {
                        this.updatedRuleAssestIds.push(assetAddedKey);
                    }
                }
            }
        });
        if (somethingAdded) {
            let portsForm = this.selectedTab === "internal-scanning" ? this.internalPortsForm : this.externalPortsForm;
            portsForm.get('portsInput').reset();
        }
    }

    removePortAndAsset(item: ConfigSelectableListDescriptor) {
        let assetsPortMap: Map<string, ConfigSelectableListDescriptor> = this.selectedTab === "internal-scanning" ? this.internalAssetsPortsExcludedMap : this.externalAssetsPortsExcludedMap;
        let assetsPort: ConfigSelectableListDescriptor[] = this.selectedTab === "internal-scanning" ? this.internalAssetsPortsExcluded : this.externalAssetsPortsExcluded;
        let selectedAssetsPorts: AlSelectItem<any>[] = this.selectedTab === "internal-scanning" ? this.selectedInternalAssetsPorts : this.selectedExternalAssetsPorts;
        assetsPort = assetsPort.filter(asset => {
            if (asset.key === item.key) {
                if (asset.parentId !== item.parentId) {
                    return true;
                } else {
                    assetsPortMap.delete(item.parentId + "#" + item.key);
                    return false;
                }
            }
            return true;
        });
        selectedAssetsPorts = selectedAssetsPorts.filter(asset => asset['assetKey'] !== item.key);
        if (this.selectedTab === 'internal-scanning') {
            this.internalAssetsPortsExcludedMap = assetsPortMap;
            this.internalAssetsPortsExcluded = assetsPort;
        }
        if (this.selectedTab === 'external-scanning') {
            this.externalAssetsPortsExcludedMap = assetsPortMap;
            this.externalAssetsPortsExcluded = assetsPort;
        }
        if (item.parentId && !this.rulesByRuleAssetIdToDelete.includes(item.parentId + "#" + item.key)) {
            this.rulesByRuleAssetIdToDelete.push(item.parentId + "#" + item.key);
        }
    }

    removePortFromAsset(subItem: ConfigSelectableSubItem) {
        let assetPortItem = null;
        if (this.selectedTab === 'internal-scanning') {
            assetPortItem = this.internalAssetsPortsExcludedMap.get(subItem.parentId);
        }
        if (this.selectedTab === 'external-scanning') {
            assetPortItem = this.externalAssetsPortsExcludedMap.get(subItem.parentId);
        }
        assetPortItem.subItems = assetPortItem.subItems.filter(item => {
            if (item.id === subItem.id) {
                return (item.type !== subItem.type);
            }
            return true;
        });
        if (subItem.parentId && !this.updatedRuleAssestIds.includes(subItem.parentId)) {
            this.updatedRuleAssestIds.push(subItem.parentId);
        }
    }

    getPortFormat(port: string): string | number {
        return port.includes(':') || port.includes('-') ? port : parseInt(port, 10);
    }

    getKeyPortDetails(subItem: ConfigSelectableSubItem): string {
        const type: string = (typeof this.getPortFormat(subItem.id) === 'string') ? 'range' : 'single';
        return (subItem.type as Protocols) + "#" + type;
    }

    flushNotifications() {
        this.notificationPanel.flush();
    }

    private showIncompatibilityMessage() {
        let scanType: ScanType.external | ScanType.vulnerability = this.selectedTab === 'internal-scanning' ? ScanType.vulnerability : ScanType.external;
        const showMessage = this.unknownExclusionRulesIds.some(ruleId => this.initialExclusions.get(ruleId).details.some(detail => detail.scan_type === scanType));
        if (this.unknownExclusionRulesIds.length > 0 && showMessage) {
            console.log("Following exclusion rules IDs are not able to show in the UI: ", this.unknownExclusionRulesIds);
            const messageError: string = "Port exclusions have been configured using the Alert Logic API that are incompatible with this " +
                "page and cannot be displayed. You cannot change incompatible port exclusions on this page, " +
                "but you can add more. Contact Alert Logic Support or use the API to resolve any incompatible port exclusions.";
            this.notification = new AlNotification(messageError, AlNotificationType.Information, 0, true, null, "DISMISS");
            this.notifications.emit(this.notification);
        }
    }

    private setupProtocolOptionsList() {
        this.protocolOptionsList = [
            <SelectItem>{
                label: "UDP",
                value: "udp"
            },
            <SelectItem>{
                label: "TCP",
                value: "tcp"
            },
            <SelectItem>{
                label: "ICMP",
                value: "icmp"
            },
            <SelectItem>{
                label: "*",
                value: "*"
            },
        ];
    }

    private loadAssetsPortsExclusions(scanType: ScanType.vulnerability | ScanType.external,
                                      assets: Object, arrayPorts: ConfigSelectableListDescriptor[], arrayPortsMap: Map<string, ConfigSelectableListDescriptor>) {

        let anyCidr: boolean = false;
        this.initialExclusions.forEach((rule, index) => {
            anyCidr = false;
            if (this.isPortExclusionRule(rule)) {
                if (Array.isArray(rule.assets) && rule.assets.length > 0) {
                    const scanTypeRule: ScanType = rule.details.map(detail => detail.scan_type).pop();
                    if (scanTypeRule === scanType) {
                        const typesOfAssets: AssetType[] = rule.assets.map(asset => asset.type);
                        anyCidr = typesOfAssets.some(type => type === AssetType.cidr);
                        if (anyCidr) {
                            if (!this.unknownExclusionRulesIds.includes(rule.id)) {
                                this.unknownExclusionRulesIds.push(rule.id);
                            }
                        }
                        rule.assets.forEach(rawAsset => {
                            let asset = assets[rawAsset.key];
                            if (asset) {
                                if (!arrayPortsMap.get(rule.id + "#" + rawAsset.key)) {
                                    let selectableItem = this.parseAssetToSelectable(asset);
                                    selectableItem['parentId'] = rule.id;
                                    rule.details.forEach(detail => {
                                        detail.ports.forEach(port => {
                                            selectableItem.subItems.push(
                                                ConfigSelectableSubItem.import(
                                                    {
                                                        id: port + "",
                                                        parentId: rule.id + "#" + rawAsset.key,
                                                        title: detail.proto.toUpperCase() + " Protocol",
                                                        details: "Port " + port,
                                                        icon: {
                                                            material: "close"
                                                        },
                                                        type: detail.proto as Protocols
                                                    }
                                                )
                                            );
                                        });
                                    });
                                    arrayPortsMap.set(rule.id + "#" + rawAsset.key, selectableItem);
                                    arrayPorts.push(selectableItem);
                                }
                            }
                        });
                    }
                }
            }
        });
    }

    private getPortDuplicated(portToAdd: ConfigSelectableSubItem, existingPorts: ConfigSelectableSubItem[]): ConfigSelectableSubItem[] {

        return existingPorts.filter(existingPort => {
            if (portToAdd.id.includes(':') || portToAdd.id.includes('-')) {
                const port1: string = portToAdd.id.split(portToAdd.id.includes(':') ? ':' : '-')[0];
                const port2: string = portToAdd.id.split(portToAdd.id.includes(':') ? ':' : '-')[1];
                const port1ToCompare: string = existingPort.id.split(existingPort.id.includes(':') ? ':' : '-')[0];
                const port2ToCompare: string = existingPort.id.split(existingPort.id.includes(':') ? ':' : '-')[1];
                if (port1 === port1ToCompare && port2 === port2ToCompare) {
                    return portToAdd.type === existingPort.type;
                }
                return false;
            } else {
                if (portToAdd.id === existingPort.id) {
                    return portToAdd.type === existingPort.type;
                }
                return false;
            }
        });

    }

    private getPorts(selectedAsset: AlSelectItem<any>): ConfigSelectableSubItem[] {
        let portsForm = this.selectedTab === "internal-scanning" ? this.internalPortsForm : this.externalPortsForm;
        if (portsForm.get('portsInput').valid) {
            let value: string = portsForm.get('portsInput').value;
            return value.split(',').map(port => port.trim()).map(
                port => ConfigSelectableSubItem.import(
                    {
                        id: port,
                        parentId: selectedAsset['assetKey'],
                        title: (portsForm.get('protocol').value as string).toUpperCase() + " Protocol",
                        details: "Port " + port,
                        icon: {
                            material: "close"
                        },
                        type: portsForm.get('protocol').value as Protocols
                    }
                )
            );
        }
        return [];
    }

    private getExcludedItem(selectedAsset: AlSelectItem<any>, ports: ConfigSelectableSubItem[]) {
        return ConfigSelectableListDescriptor.import(
            {
                key: selectedAsset['assetKey'],
                title: selectedAsset.title,
                icon: selectedAsset.isMaterialIcon ? {
                    material: selectedAsset.icon
                } : {
                    alClass: selectedAsset.icon
                },
                type: selectedAsset['type'],
                subItems: ports,
                parentId: null
            }
        );
    }

    private getDetailsForPorts(item: ConfigSelectableListDescriptor, scanType: 'vulnerability' | 'external'): ExlusionsDetails[] {
        let detailsMap: Map<string, ExlusionsDetails> = new Map<string, ExlusionsDetails>();
        item.subItems.forEach(subItem => {
            if (!detailsMap.get(this.getKeyPortDetails(subItem))) {
                detailsMap.set(this.getKeyPortDetails(subItem), ExlusionsDetails.import({
                    feature: 'scan',
                    scan_type: scanType,
                    ports: [this.getPortFormat(subItem.id)], // For single ports according to API it must be number, but if it is a range must be string
                    proto: subItem.type
                }));
            } else {
                detailsMap.get(this.getKeyPortDetails(subItem)).ports.push(this.getPortFormat(subItem.id));
                detailsMap.get(this.getKeyPortDetails(subItem)).proto = subItem.type as Protocols;
            }
        });
        let details: ExlusionsDetails[] = [];
        detailsMap.forEach(exclusionDetails => {
            details.push(exclusionDetails);
        });
        return details;
    }

}
