import {
    forkJoin as observableForkJoin,
    from as observableFrom
} from 'rxjs';

import { SlideMenu } from 'primeng/slidemenu';
import { MenuItem, ConfirmationService } from 'primeng/api';

import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';

import { TitleCasePipe } from '@angular/common';

import {
    AlToastButtonDescriptor,
    AlToastMessage,
    AlToolbarContentConfig,
    eventHandlerWhenExitingFullScreen,
    fullScreen,
    AlSidebarConfig,
    AlSidebarComponent,
} from '@al/ng-generic-components';

import { AlNavigationService } from '@al/ng-navigation-components';

import { SourceScope } from '@al/sources';

import {
    AlAssetsQueryClient,
    AssetDescriptor,
    AssetQueryGeneralResponse,
    PhoenixTopologySnapshot as Topology,
    search as searchAssets
} from '@al/assets-query';

import {
    AlDeploymentsClient,
    Deployment
} from '@al/deployments';

import { DeploymentProgressComponent } from '../../../shared/deployments/deployment-progress/deployment-progress.component';

import {
    ConfigAwsAndAzureDiscoveryAndTopologyOverviewTopologyBehaviors as DiscoveryTopologyBehaviours,
    ConfigDatacenterAddAssetsTopologyBehaviors
} from '@al/ng-visualizations-components';

import { DnsNameFormComponent } from '../../../shared/deployments/dns-name-form/dns-name-form.component';

import { PublicIpFormComponent } from '../../../shared/deployments/public-ip-form/public-ip-form.component';

import {
    AlBlackCardDescriptor,
    DeploymentButtonDescriptor,
    DeploymentHeaderDescriptor
} from '../../types';

import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';
import { DeploymentDatacenterNetworkFormComponent } from '../deployment-datacenter-network-form/deployment-datacenter-network-form.component';
import { DeploymentDatacenterSubnetFormComponent } from '../deployment-datacenter-subnet-form/deployment-datacenter-subnet-form.component';
import { DeploymentAssetsManagerDeleteDialogComponent } from '../../../shared/deployments/deployment-assets-manager-delete-dialog/deployment-assets-manager-delete-dialog.component';


type OpenDeleteInternalDialogEvent = { text: { header?: string, body?: string }, orphans: boolean };

@Component({
    selector: 'al-deployment-discovery',
    templateUrl: './deployment-discovery.component.html',
    styleUrls: ['./deployment-discovery.component.scss']
})
export class DeploymentDiscoveryComponent implements OnInit, OnDestroy {

    @Output() onDiscovery: EventEmitter<{ [i: string]: number }> = new EventEmitter();
    @Output() discoveryFinished: EventEmitter<void> = new EventEmitter();
    @Output() discoveryInProgress: EventEmitter<void> = new EventEmitter();
    @Output() next: EventEmitter<any> = new EventEmitter();
    @Output() assetsAvailable: EventEmitter<boolean> = new EventEmitter();
    @Output() onDeploymentDiscoveryNotifications: EventEmitter<AlToastMessage> = new EventEmitter();

    @Input() scope?: SourceScope;

    @ViewChild('deploymentProgress')
    deploymentProgressComponent: DeploymentProgressComponent;
    @ViewChild("externalAssetsSidebar") 
    externalAssetsSidebar: AlSidebarComponent;
    @ViewChild("internalAssetsSidebar") 
    internalAssetsSidebar: AlSidebarComponent;
    @ViewChild('dnsNameForm')
    dnsNameFormComponent: DnsNameFormComponent;
    @ViewChild('publicIpForm')
    publicIpFormComponent: PublicIpFormComponent;
    @ViewChild('addMenu', { static: true })
    addMenu?: SlideMenu;
    @ViewChild('networkForm', { static: false })
    networkForm: DeploymentDatacenterNetworkFormComponent;
    @ViewChild('subnetForm', { static: false })
    subnetForm: DeploymentDatacenterSubnetFormComponent;
    @ViewChild('deleteInternalAssetDialog') 
    deleteInternalAssetDialog: DeploymentAssetsManagerDeleteDialogComponent;

    static AUTO_DISMISS_SUCCESS: number = 3000;
    static AUTO_DISMISS_ERROR: number = 5000;

    externalAssetsSideBarConfig: AlSidebarConfig = {
        expand: false,
        expandable: true,
        headerColor: "#535353",
        header: {
            title: 'unknown',
            icon: {
                name: 'ui-icon-info'
            },
            showClose: false,
            disableClose: false
        },
        enableButtonToolbar: true,
        primary: {
            text: 'Save',
            disabled: false
        },
        secondary: {
            text: 'Cancel',
            disabled: false
        },
        isloading: true,
        viewHelper: true,
        toolbarColor: "#FFFFFF"
    };
    internalAssetsSideBarConfig: AlSidebarConfig = {
        expand: false,
        expandable: true,
        headerColor: "#535353",
        header: {
            title: 'unknown',
            icon: {
                name: 'ui-icon-info'
            },
            showClose: false,
            disableClose: false
        },
        enableButtonToolbar: true,
        primary: {
            text: 'Save',
            disabled: false
        },
        secondary: {
            text: 'Cancel',
            disabled: false
        },
        isloading: true,
        viewHelper: true,
        toolbarColor: "#FFFFFF"
    };
    button: DeploymentButtonDescriptor = new DeploymentButtonDescriptor({
        label: "NEXT",
        color: "mat-primary",
        disabled: true,
        onClick: () => {
            this.goForward();
        }
    });

    menuItems: MenuItem[] = [];
    info: string = '';

    readonly menuItemsForExternalAssets: MenuItem[] = [
        {
            label: 'DNS Name',
            command: () => {
                this.openDnsForm();
            },
            icon: 'ui-icon-dns',
        },
        {
            label: 'External IP',
            command: () => {
                this.openIpForm();
            },
            icon: 'ui-icon-settings-ethernet'

        }
    ];
    readonly menuItemsForInternalAssets: MenuItem[] = [
        {
            label: 'Network',
            command: () => {
                this.openNetworkForm();
            },
            icon: 'al al-topology-network-1',
        },
        {
            label: 'Subnet',
            command: () => {
                this.openSubnetForm();
            },
            icon: 'al al-subnet'

        }
    ];
    readonly alDeploymentHeaderConfig: DeploymentHeaderDescriptor = new DeploymentHeaderDescriptor({
        title: 'Discovery',
        buttons: [this.button]
    });
    readonly toolbarConfig: AlToolbarContentConfig = {
        showSearch: true,
        search: { maxSearchLength: 80, textPlaceHolder: "search assets" },
    };

    hasTopologyFailed: boolean = false;
    topology: Topology;
    topologyBehaviors: DiscoveryTopologyBehaviours | ConfigDatacenterAddAssetsTopologyBehaviors = new DiscoveryTopologyBehaviours();
    topologySearchHits: AssetDescriptor[];
    stillDiscovering: boolean = false;
    isTopologyLoading: boolean = false;
    fullScreen: boolean = false;
    isRendering: boolean = true;
    externalAssetsActiveForm: 'ip' | 'dns' | null = null;
    internalAssetsActiveForm: 'subnet' | 'network' | null = null;
    data: AssetDescriptor | {} = {};
    allExtraAssets: AssetDescriptor[] = [];
    entityId: string;
    deployment: Deployment;
    complete: boolean = false;
    page: 'deployment-progress' | 'assets' | null = null;
    externalAssetDescriptors: AlBlackCardDescriptor[] = [];
    filteredExternalAssets: AlBlackCardDescriptor[] = [];
    private selectedTab: "internal-assets" | "external-assets" = "internal-assets";
    private stopPropagation: boolean = false;
    private readonly refreshWaitingTime: number = 5000;
    private readonly ipHeader = {
        icon: {
            name: "settings_ethernet",
        },
        title: "External IP",
        showClose: true,
        disableClose: false
    }
    private readonly dnsHeader = {
        icon: {
            name: "dns",
        },
        title: "DNS Name",
        showClose: true,
        disableClose: false
    }

    private readonly networkHeader = {
        icon: {
            cssClasses: 'al al-topology-network-1'
        },
        title: "Network",
        showClose: true,
        disableClose: false
    }
    private readonly subnetHeader = {
        icon: {
            cssClasses: 'al al-subnet'
        },
        title: "Subnet",
        showClose: true,
        disableClose: false
    }

    constructor(
        protected navigation: AlNavigationService,
        protected deploymentsUtilityService: DeploymentsUtilityService,
        private confirmationService: ConfirmationService,
        private titleCase: TitleCasePipe
    ) { }

    ngOnInit(): void {
        this.deployment = this.deploymentsUtilityService.getDeploymentOnTracking();
        this.page = this.deployment.platform.type === 'datacenter' ? 'assets' : 'deployment-progress';
        this.topologyBehaviors = this.deployment.platform.type === 'datacenter' ? new ConfigDatacenterAddAssetsTopologyBehaviors() : new DiscoveryTopologyBehaviours();
        this.setInfo();
        this.fetchData();
        eventHandlerWhenExitingFullScreen()(this);
    }

    ngOnDestroy(): void {
        this.stopPropagation = true;
    }

    openDeleteInternalAsset(type: 'network' | 'subnet', evt: OpenDeleteInternalDialogEvent): void {
        this.deleteInternalAssetDialog.open(type, evt.text.body, evt.text.header, !evt.orphans);
    }

    continueDeletionOfInternalAsset(): void {
        if (this.deleteInternalAssetDialog.getType() === 'network') {
            this.networkForm.deleteNetwork();
        } else if (this.deleteInternalAssetDialog.getType() === 'subnet') {
            this.subnetForm.deleteSubnet();
        }
    }

    search(text: string): void {
        if (this.selectedTab === 'internal-assets') {
            this.topologySearchHits = Object.values(searchAssets(this.topology, undefined, text, false));
        } else if (this.selectedTab === 'external-assets') {
            this.filterExternalAssets(text);
        }
    }

    clickTab({ index }: { index: number }): void {
        if (index === 1) {
            this.closeSideNav();
            this.selectedTab = 'external-assets';
            this.getExternalAssets();
        } else if (index === 0) {
            this.closeSideNav();
            this.selectedTab = 'internal-assets';
            this.alDeploymentHeaderConfig.title = this.deployment.platform.type === 'datacenter' ? 'Add Assets' : 'Discovery';
            this.getInternalAssets();
        }
    }

    onClickAdd(e: { event: MouseEvent }): void {
        this.addMenu.toggle(e.event);
    }

    moveOverlayElement(event) {
        const element = document.getElementsByClassName('deployment-discovery')[0];
        const overlayElement = document.getElementsByClassName('cdk-overlay-container')[0];
        if (overlayElement && fullScreen) {
            element.appendChild(overlayElement);
        } else if (!fullScreen) {
            const bodyElement = document.getElementsByTagName('body')[0];
            if (overlayElement) {
                bodyElement.appendChild(overlayElement);
            }
        }
    }

    onClickInternalAsset(asset: AssetDescriptor): void {
        if (this.deployment.platform.type === 'datacenter' && asset) {
            this.internalAssetsSidebar.config.primary.text = 'UPDATE';
            if (asset?.type === 'vpc') {
                this.editNetwork(asset);
            } else if (asset?.type === 'subnet') {
                this.editSubnet(asset);
            }
        } else {
            this.closeSideNav();
        }
    }

    onClickExternalAsset(event: AlBlackCardDescriptor): void {
        this.entityId = event.key;
        this.data = this.allExtraAssets.find(asset => asset.key === event.key);
        if (event.type) {
            this.externalAssetsActiveForm = event.type as 'ip' | 'dns';
            this.externalAssetsSidebar.config.isloading = false;
            this.setupExternalAssetsRightDrawer(event.type as 'ip' | 'dns', 'edit');
            this.externalAssetsSidebar.open();
        }
    }

    saveExternalAssets(): void {
        if (this.externalAssetsActiveForm === 'ip') {
            this.publicIpFormComponent.save();
        } else if (this.externalAssetsActiveForm === 'dns') {
            this.dnsNameFormComponent.save();
        }
    }

    saveInternalAssets(): void {
        if (this.internalAssetsActiveForm === 'network') {
            this.networkForm.save();
        } else if (this.internalAssetsActiveForm === 'subnet') {
            this.subnetForm.save();
        }
    }

    onLoading(isFormLoading: boolean): void {
        if (this.externalAssetsActiveForm) {
            this.externalAssetsSidebar.config.isloading = isFormLoading;
        } else if (this.internalAssetsActiveForm) {
            this.internalAssetsSidebar.config.isloading = isFormLoading;
        }
    }

    onValidating(isValid: boolean): void {
        if (this.externalAssetsActiveForm) {
            this.externalAssetsSidebar.config.primary.disabled = !isValid;
        } else if (this.internalAssetsActiveForm) {
            this.internalAssetsSidebar.config.primary.disabled = !isValid;
        }

    }

    onSuccess(event): void {
        this.emitSucessMessage(event);
        this.refreshAssets();
        this.closeSideNav();
    }

    onFailed(event): void {
        this.emitErrorMessage(event);
    }

    deletable(event: boolean) {
        if (this.internalAssetsSidebar.config?.ternary) {
            this.internalAssetsSidebar.config.ternary.disabled = !event;
        }
    }

    toggleFullScreen(event): void {
        const element = document.getElementsByClassName('discovery')[0];
        this.fullScreen = fullScreen(element, this.fullScreen);
        // Dirty hack to make materail2-beta element to work in fullscreen mode
        const overlayElement = document.getElementsByClassName('cdk-overlay-container')[0];
        if (overlayElement && this.fullScreen) {
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

    deleteExternalAsset(): void {
        if (this.externalAssetsActiveForm === 'dns') {
            this.dnsNameFormComponent.delete();
        } else if (this.externalAssetsActiveForm === 'ip') {
            this.publicIpFormComponent.delete();
        }
    }

    private showExternalAssetsConfirmationDialog = (): void => {
        let headerText: string = "Confirmation";
        let bodyText: string = "Are you sure you want to delete this ?"
        if (this.externalAssetsActiveForm === 'dns') {
            headerText = `Delete ${this?.dnsNameFormComponent?.data?.name ?? 'unknown'} ?`;
            bodyText = 'Are you sure you want to delete this DNS name from your assets ?';
        } else if (this.externalAssetsActiveForm === 'ip') {
            headerText = `Delete ${this?.publicIpFormComponent?.data?.name ?? 'unknown'} ?`;
            bodyText = 'Are you sure you want to delete this IP address from your assets ?';
        }

        this.confirmationService.confirm({
            message: bodyText,
            header: headerText,
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteExternalAsset();
            },
            reject: () => {
            }
        });
    }

    private deleteInternalAssetsCallback = (): void => {
        if (this.internalAssetsActiveForm === 'network') {
            this.networkForm.delete();
        } else if (this.internalAssetsActiveForm === 'subnet') {
            this.subnetForm.delete();
        }
    }

    private fetchData(): void {
        if (this.stopPropagation) {
            return;
        }
        this.isTopologyLoading = true;
        AlDeploymentsClient.getDeployment(this.deployment.account_id, this.deployment.id).then(
            deployment => {
                this.deployment = deployment;
                this.deploymentsUtilityService.setDeploymentOnTracking(deployment);
                this.getInternalAssets();
            },
            err => {
                this.hasTopologyFailed = true;
                this.isTopologyLoading = false;
                console.log('Error retrieving the deployment', err);
            }
        );
    }

    private checkDiscoveryProcess(): void {
        if (this.deployment.platform.type !== 'datacenter') {
            if (this.deployment.status.status === 'ok') {
                this.complete = true;
                this.alDeploymentHeaderConfig.buttons[0].disabled = false;
                if (!this.stillDiscovering) {
                    this.page = "assets";
                    return;
                }
                this.discoveryFinished.emit();
                this.deploymentProgressComponent.completeProgress();
            } else if (this.deployment.status.status === 'error') {
                this.page = "deployment-progress";
                this.discoveryFinished.emit();
                this.deploymentProgressComponent.completeProgress();
                let params = {
                    'asset_types': 'd:deployment',
                    'd.deployment_id': this.deployment.id,
                    'qfields': 'key'
                };
                observableFrom(
                    AlAssetsQueryClient.getAccountAssets(this.deployment.account_id, params)
                ).subscribe(
                    (response: AssetQueryGeneralResponse) => {
                        if (response.assets.length &&
                            response.assets[0]['length'] > 0 &&
                            response.assets[0][0].key) {
                        }
                    },
                    (error) => {
                        console.error(error);
                    },
                    () => {
                        const button: AlToastButtonDescriptor = {
                            key: 'go-to-exposures',
                            label: 'Go to Exposures'
                        }
                        const toastMessage: AlToastMessage = {
                            closable: true,
                            life: DeploymentDiscoveryComponent.AUTO_DISMISS_ERROR,
                            severity: 'error',
                            sticky: true,
                            data: {
                                buttons: [button],
                                message: `${this.deployment.status.message}`
                            }
                        };
                        this.onDeploymentDiscoveryNotifications.emit(toastMessage);

                    }
                )
            } else {
                if (!this.page) {
                    this.page = "deployment-progress";
                }
                this.stillDiscovering = true;
                this.discoveryInProgress.emit();
                setTimeout(() => {
                    this.fetchData();
                }, this.refreshWaitingTime);
            }
        }
    }

    private getInternalAssets(): void {
        this.isTopologyLoading = true;
        observableFrom(
            AlAssetsQueryClient.getConfigTopologySnapshot(this.deployment.account_id, this.deployment.id)
        ).subscribe((snapshot: Topology) => {
            this.deploymentsUtilityService.setAssetsOnTracking(snapshot);
            const deploymentType = this.deployment.platform.type;
            let assetTypes = ['region', 'vpc', 'subnet'];
            if (deploymentType === 'datacenter') {
                assetTypes = ['vpc', 'subnet'];
            }
            const summary = snapshot.getSummary(assetTypes);
            if (deploymentType !== 'datacenter' && summary.vpc && summary.vpc > 0 && this.deployment.status.status === 'ok') {
                this.alDeploymentHeaderConfig.buttons[0].disabled = false;
                this.assetsAvailable.emit(true);
            } else if (deploymentType !== 'datacenter') {
                this.alDeploymentHeaderConfig.buttons[0].disabled = true;
                this.assetsAvailable.emit(false);
            } else if (deploymentType === 'datacenter') {
                this.alDeploymentHeaderConfig.buttons[0].disabled = false;
                this.assetsAvailable.emit(true);
            }

            if (deploymentType !== 'datacenter') {
                this.onDiscovery.emit(summary);
                this.alDeploymentHeaderConfig.title = 'Discovery';
            } else {
                this.alDeploymentHeaderConfig.title = 'Add Assets';
            }

            this.setMenu();
            this.topology = snapshot;
            this.hasTopologyFailed = false;
            this.isTopologyLoading = false;

            this.checkDiscoveryProcess();
        }, err => {
            this.emitErrorMessageForCloudDeployment('loadAssets');
            this.hasTopologyFailed = true;
            this.isTopologyLoading = false;
            this.checkDiscoveryProcess();
            console.log('Error retrieving the topology tree', err);
        });
    }

    private setMenu(): void {
        if (this.selectedTab === 'external-assets') {
            this.menuItems = this.menuItemsForExternalAssets;
        } else if (this.selectedTab === 'internal-assets') {
            this.menuItems = this.menuItemsForInternalAssets;
        }
    }

    private goForward(): void {
        if (this.page === "deployment-progress") {
            this.page = "assets";
        }
        this.next.emit();
    }

    private openNetworkForm = (): void => {
        this.data = {};
        this.internalAssetsActiveForm = 'network';
        this.setupInternalAssetsRightDrawer('network', 'create');
       
        this.internalAssetsSidebar.open();
    }

    private openSubnetForm = (): void => {
        this.data = {};
        this.internalAssetsActiveForm = 'subnet';
        this.setupInternalAssetsRightDrawer('subnet', 'create');
        this.internalAssetsSidebar.open();
    }

    private openDnsForm = (): void => {
        this.data = {};
        this.externalAssetsActiveForm = 'dns';
        this.setupExternalAssetsRightDrawer('dns', 'create');
        this.externalAssetsSidebar.config.isloading = false;
        this.externalAssetsSidebar.open();
    }

    private openIpForm = (): void => {
        this.data = {};
        this.externalAssetsActiveForm = 'ip';
        this.setupExternalAssetsRightDrawer('ip', 'create');
        this.externalAssetsSidebar.config.isloading = false;
        this.externalAssetsSidebar.open();
    }

    private filterExternalAssets(filter: string = ''): void {
        if (filter) {
            this.filteredExternalAssets = this.externalAssetDescriptors.filter((asset) => {
                return asset.subtitle.includes(filter) || asset.title.includes(filter);
            });
        } else {
            this.filteredExternalAssets = this.externalAssetDescriptors.slice();
        }
    }

    private getExternalAssets(): void {
        observableForkJoin([
            AlAssetsQueryClient
                .getDeploymentAssets(this.deployment.account_id, this.deployment.id, { asset_types: 'external-dns-name' }),
            AlAssetsQueryClient
                .getDeploymentAssets(this.deployment.account_id, this.deployment.id, { asset_types: 'external-ip' })
        ])
            .subscribe(([dns, ips]: [AssetQueryGeneralResponse, AssetQueryGeneralResponse]) => {
                this.proccessExternalAssets(dns, ips);
                this.setMenu();
            }, error => {
                this.emitErrorMessageForCloudDeployment("loadExternalAssets");
                console.log('Error retrieving the External Assets', error);
            });
    }

    private proccessExternalAssets(dns: AssetQueryGeneralResponse, ips: AssetQueryGeneralResponse): void {
        this.allExtraAssets = [];
        dns.assets.forEach(element => {
            this.allExtraAssets.push(AssetDescriptor.import(element[0]));
        });
        ips.assets.forEach(element => {
            this.allExtraAssets.push(AssetDescriptor.import(element[0]));
        });
        this.externalAssetDescriptors = [];
        this.allExtraAssets.forEach((element) => {
            let blackCard: AlBlackCardDescriptor;
            if (element.type === 'external-dns-name') {
                blackCard = new AlBlackCardDescriptor().import(
                    {
                        iconClass: "",
                        iconMaterial: "dns",
                        title: element.name,
                        key: element.key,
                        subtitle: "",
                        type: 'dns'
                    });
            } else {
                blackCard = new AlBlackCardDescriptor().import(
                    {
                        iconClass: "material-icons",
                        iconMaterial: 'settings_ethernet',
                        title: element.name,
                        key: element.key,
                        subtitle: element.ipAddress,
                        type: 'ip'
                    })
            }
            this.externalAssetDescriptors.push(blackCard);
        });
        this.filterExternalAssets();
    }

    private setupExternalAssetsRightDrawer(item: 'ip' | 'dns', action: 'create' | 'edit'): void {
        this.externalAssetsSidebar.config.header = item === 'ip' ? this.ipHeader : this.dnsHeader;
        if (action === 'edit') {
            this.externalAssetsSidebar.config.ternary = {
                text: 'DELETE',
                disabled: false,
                callback: this.showExternalAssetsConfirmationDialog
            }
            this.externalAssetsSidebar.config.primary.text = 'UPDATE';
        } else {
            if (this.externalAssetsSidebar.config?.ternary) {
                delete this.externalAssetsSidebar.config.ternary
            }
            this.externalAssetsSidebar.config.primary.text = 'ADD';
        }
    }

    private setupInternalAssetsRightDrawer(item: 'network' | 'subnet', action: 'create' | 'edit'): void {
        this.internalAssetsSidebar.config.header = item === 'network' ? this.networkHeader : this.subnetHeader;
        if (action === 'edit') {
            this.internalAssetsSidebar.config.ternary = {
                text: 'DELETE',
                disabled: false,
                callback: this.deleteInternalAssetsCallback
            }
            this.internalAssetsSidebar.config.primary.text = 'UPDATE';
        } else {
            if (this.internalAssetsSidebar.config?.ternary) {
                delete this.internalAssetsSidebar.config.ternary
            }
            this.internalAssetsSidebar.config.primary.text = 'ADD';
        }
    }

    private setInfo(): void {
        if (this.deployment.platform.type === 'datacenter') {
            this.info = 'Add your assets by network, subnet, domain name, or IP address, to be scanned.';
        } else {
            this.info = 'Alert Logic discovered these assets in your account. You can also add external assets by domain name or IP address.';
        }
    }

    private editNetwork(asset: AssetDescriptor): void {
        this.internalAssetsActiveForm = 'network';
        this.entityId = asset.key;
        this.setupInternalAssetsRightDrawer('network', 'edit');
        this.internalAssetsSidebar.open();
        this.internalAssetsSidebar.config.isloading = false;

    }

    private editSubnet(asset: AssetDescriptor): void {
        this.internalAssetsActiveForm = 'subnet';
        this.entityId = asset.key;
        this.setupInternalAssetsRightDrawer('subnet', 'edit');
        this.internalAssetsSidebar.open();
        this.internalAssetsSidebar.config.isloading = false;

    }

    private emitErrorMessage(event) {
        if (this.deployment.platform.type === 'datacenter') {
            this.emitErrorMessageForDatacenterDeployment(event);
        } else {
            this.emitErrorMessageForCloudDeployment(event);
        }
    }

    private emitErrorMessageForDatacenterDeployment({ type: typeError, error: rawError }: { type: string, error: any }) {
        let message: string = "";
        switch (typeError) {
            case 'loadAssets':
                message = message ? message : "Internal error getting the Assets";
                break;
            case 'loadExternalAssets':
                message = message ? message : "Internal error getting the External Assets";
                break;
            case 'getNetwork':
                message = message ? message : "Internal error getting the Network";
                break;
            case 'deletedNetwork':
                message = this.titleCase.transform(rawError?.data?.text ?? rawError.data.toString());
                break;
            case 'modifiedNetwork':
                message = this.titleCase.transform(rawError?.data?.text ?? rawError.data.toString());
                break;
            case 'createdNetwork':
                message = this.titleCase.transform(rawError?.data?.text ?? rawError.data.toString());
                break;
            case 'deletedSubnet':
                message = this.titleCase.transform(rawError?.data?.text ?? rawError.data.toString());
                break;
            case 'modifiedSubnet':
                message = this.titleCase.transform(rawError?.data?.text ?? rawError.data.toString());
                break;
            case 'createdSubnet':
                message = this.titleCase.transform(rawError?.data?.text ?? rawError.data.toString());
                break;
            case 'getSubnet':
                message = message ? message : "Internal error getting the Subnet";
                break;
            case 'getNetworks':
                message = message ? message : "Internal error getting the Networks";
                break;
            case 'deletedDnsName':
                message = message ? message : "Internal error deleting the DNS Name";
                break;
            case 'modifiedDnsName':
                message = message ? message : "Internal error modifying the DNS Name";
                break;
            case 'createdDnsName':
                message = message ? message : "Internal error creating the DNS Name";
                break;
            case 'deletedPublicIp':
                message = message ? message : "Internal error deleting the Public IP";
                break;
            case 'modifiedPublicIp':
                message = message ? message : "Internal error modifying the Public IP";
                break;
            case 'createdPublicIp':
                message = message ? message : "Internal error creating the Public IP";
                break;
        }

        if (message) {
            this.internalAssetsSidebar.notifyError(message, DeploymentDiscoveryComponent.AUTO_DISMISS_ERROR);
        }
    }

    private emitErrorMessageForCloudDeployment(typeError: string, endpointMessage: string = ''): void {
        let message: string = "";
        const toastMessage: AlToastMessage = {
            closable: true,
            life: DeploymentDiscoveryComponent.AUTO_DISMISS_ERROR,
            severity: 'error',
            sticky: false,
            data: { message: '' }
        }
        switch (typeError) {
            case 'loadAssets':
                message = message ? message : "Internal error getting the Assets";
                toastMessage.data.message = message;
                this.onDeploymentDiscoveryNotifications.emit(toastMessage);
                break;
            case 'loadExternalAssets':
                message = message ? message : "Internal error getting the External Assets";
                toastMessage.data.message = message;
                this.onDeploymentDiscoveryNotifications.emit(toastMessage);
                break;
            case 'deletedDnsName':
                message = message ? message : "Internal error deleting the DNS Name";
                break;
            case 'modifiedDnsName':
                message = message ? message : "Internal error modifying the DNS Name";
                break;
            case 'createdDnsName':
                message = message ? message : "Internal error creating the DNS Name";
                break;
            case 'deletedPublicIp':
                message = message ? message : "Internal error deleting the External IP";
                break;
            case 'modifiedPublicIp':
                message = message ? message : "Internal error modifying the External IP";
                break;
            case 'createdPublicIp':
                message = message ? message : "Internal error creating the External IP";
                break;
            case 'error':
                message = endpointMessage ? endpointMessage : "Internal error discovering Assets";
                toastMessage.data.message = message;
                this.onDeploymentDiscoveryNotifications.emit(toastMessage);
                break;
        }
        if (message && message !== 'loadAssets' && message !== 'loadExternalAssets' && message !== 'error') {
            this.externalAssetsSidebar.notifyError(message, DeploymentDiscoveryComponent.AUTO_DISMISS_ERROR);
        }
    }

    private refreshAssets(): void {
        setTimeout(() => {
            if (this.selectedTab === 'external-assets') {
                this.getExternalAssets();
            } else if (this.selectedTab === 'internal-assets') {
                this.getInternalAssets();
                this.entityId = null;
            }
        }, this.refreshWaitingTime);
    }

    private emitSucessMessage(event): void {
        if (this.deployment.platform.type !== 'datacenter') {
            this.emitSuccessMessageForCloudDeployments(event);
        } else {
            this.emitSuccessMessageForDatacenterDeployments(event);
        }
    }

    private emitSuccessMessageForCloudDeployments(typeSuccess: string): void {
        let message: string = "";
        const toastMessage: AlToastMessage = {
            closable: true,
            life: DeploymentDiscoveryComponent.AUTO_DISMISS_SUCCESS,
            severity: 'success',
            sticky: false,
            data: { message: '' }
        }
        switch (typeSuccess) {
            case 'createdDnsName':
                message = message ? message : "The DNS Name was created successfully";
                break;
            case 'deletedDnsName':
                message = message ? message : "The DNS Name was deleted successfully";
                break;
            case 'modifiedDnsName':
                message = message ? message : "The DNS Name was modified successfully";
                break;
            case 'createdPublicIp':
                message = message ? message : "The External IP was created successfully";
                break;
            case 'deletedPublicIp':
                message = message ? message : "The External IP was deleted successfully";
                break;
            case 'modifiedPublicIp':
                message = message ? message : "The External IP was modified successfully";
                break;
        }
        if (message) {
            toastMessage.data.message = message;
            this.onDeploymentDiscoveryNotifications.emit(toastMessage)
        }
    }

    private emitSuccessMessageForDatacenterDeployments(event: { type: string, message?: string } | string) {
        let message: string = "";
        const toastMessage: AlToastMessage = {
            closable: true,
            life: DeploymentDiscoveryComponent.AUTO_DISMISS_SUCCESS,
            severity: 'success',
            sticky: false,
            data: { message: '' }
        }
        let messageType: string;
        if (typeof(event) !== 'string') {
            messageType = event.type;
        } else {
            messageType = event as string;
        }
        switch (messageType) {
            case 'createdNetwork':
                message = message ? message : "The network was created successfully";
                if (this.subnetForm) {
                    this.subnetForm.getLists();
                }
                break;
            case 'deletedNetwork':
                message = message ? message : "The network was deleted successfully";
                if (this.subnetForm) {
                    this.subnetForm.getLists();
                }
                break;
            case 'modifiedNetwork':
                message = message ? message : "The network was modified successfully";
                if (this.subnetForm) {
                    this.subnetForm.getLists();
                }
                break;
            case 'createdSubnet':
                message = message ? message : "The subnet was created successfully";
                break;
            case 'modifiedSubnet':
                message = message ? message : "The subnet was modified successfully";
                break;
            case 'deletedSubnet':
                message = message ? message : "The subnet was deleted successfully";
                break;
            case 'notChangesDetected':
                message = message ? message : "Not data changes detected";
                break;
            case 'createdDnsName':
                message = message ? message : "The DNS Name was created successfully";
                break;
            case 'deletedDnsName':
                message = message ? message : "The DNS Name was deleted successfully";
                break;
            case 'modifiedDnsName':
                message = message ? message : "The DNS Name was modified successfully";
                break;
            case 'createdPublicIp':
                message = message ? message : "The Public IP was created successfully";
                break;
            case 'deletedPublicIp':
                message = message ? message : "The Public IP was deleted successfully";
                break;
            case 'modifiedPublicIp':
                message = message ? message : "The Public IP was modified successfully";
                break;
        }
        if (typeof(event) !== 'string' && event.message) {
            message = event.message;
        }
        if (message) {
            toastMessage.data.message = message;
            this.onDeploymentDiscoveryNotifications.emit(toastMessage);
        }
    }

    private closeSideNav(): void {
        if (this.selectedTab === 'external-assets' && this?.externalAssetsSidebar) {
            this.externalAssetsSidebar.close();
            this.externalAssetsSidebar.config.primary.disabled = true;
            this.externalAssetsSidebar.config.isloading = false;
            this.externalAssetsActiveForm = null;
        } else if (this.selectedTab === 'internal-assets' && this?.internalAssetsSidebar) {
            this.internalAssetsSidebar.close();
            this.internalAssetsSidebar.config.primary.disabled = true;
            this.internalAssetsSidebar.config.isloading = false;
            this.internalAssetsActiveForm = null;
        }
    }


}
