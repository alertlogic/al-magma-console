import { from as observableFrom } from 'rxjs';

import { 
    Component,
    EventEmitter,
    Input, 
    OnInit,
    Output 
} from '@angular/core';

import { 
    FormControl, 
    FormGroup, 
    Validators 
} from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';

import {
    AlAssetManagerNetwork, 
    AlAssetsManagerClient,
    AlAssetsManagerReportSummary,
    AlAssetsManagerSubnet,
    newSubnet
} from '@al/assets-manager';

import { 
    AlAssetsQueryClient, 
    AssetQueryGeneralResponse, 
    AssetQueryResultItem, 
    AssetWriteDeclareAssetRelationship,
    AssetWriteDeclareAssetRequestBody 
} from '@al/assets-query';

import { AlSession } from '@al/core';
import { cidrValidator } from '@al/ng-generic-components';
import { Deployment } from '@al/deployments';
import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';


type OpenDialogEvent = {text: {header?: string, body?: string}, orphans: boolean};

@Component({
    selector: 'al-deployment-datacenter-subnet-form',
    templateUrl: './deployment-datacenter-subnet-form.component.html',
    styleUrls: ['./deployment-datacenter-subnet-form.component.scss']
})
export class DeploymentDatacenterSubnetFormComponent implements OnInit {

    entityForm: FormGroup;
    subnet: AlAssetsManagerSubnet = newSubnet();
    relationships: AssetWriteDeclareAssetRelationship;
    modifiedSubnet: AlAssetsManagerSubnet = newSubnet();
    subnetDelete: AlAssetsManagerSubnet = newSubnet();
    removeRelationship: AssetWriteDeclareAssetRequestBody;
    addRelationship: AssetWriteDeclareAssetRequestBody;
    currentSubnet: AlAssetsManagerSubnet = newSubnet();
    networks: AssetQueryResultItem[] = [];
    selectedNetwork: AssetQueryResultItem;
    networkOptions: {[i: string]: string}[] = [];
    deployment: Deployment;
    currentNetworkKey: string;
    subnetId: string;
    actingAccountId: string;

    _entityId: string;
    @Input() set entityId(value: string) {
        this._entityId = value;
        if (value) {
            this.getEntity();
        }
    };
    @Output() onLoading: EventEmitter<boolean> = new EventEmitter();
    @Output() isValid: EventEmitter<boolean> = new EventEmitter();
    @Output() onSuccess: EventEmitter<{type: string, message?: string}> = new EventEmitter();
    @Output() onFailed: EventEmitter<{type: string, error?: any} | string> = new EventEmitter();
    @Output() deletable: EventEmitter<boolean> = new EventEmitter();
    @Output() openDeleteDialog: EventEmitter<OpenDialogEvent> = new EventEmitter();

    constructor(
        protected deploymentsService: DeploymentsUtilityService,
        public dialog: MatDialog) {
        this.actingAccountId = AlSession.getActingAccountId();
        this.entityForm = new FormGroup({
            name: new FormControl({ value: '', disabled: false }, Validators.required),
            networkId: new FormControl({ value: '', disabled: false }, Validators.required),
            privateCIDRs: new FormControl({ value: '', disabled: false }, [Validators.required, cidrValidator()])
        });
    }

    ngOnInit(){
        this.deployment = this.deploymentsService.getDeploymentOnTracking();
        this.getLists();
        
        if (!this._entityId) {
            this.setDefaultSubnetData();
            this.isValid.emit(false);
        }

        this.entityForm.statusChanges.subscribe(e => {
            this.isValid.emit(e === 'VALID');
        });
    }

    cleanForm(): void {
        this.entityForm.get('name').setValue('');
        this.entityForm.get('networkId').setValue('');
        this.entityForm.get('privateCIDRs').setValue('');
        this.entityForm.controls['name'].markAsUntouched();
        this.entityForm.controls['networkId'].markAsUntouched();
        this.entityForm.controls['privateCIDRs'].markAsUntouched();
        this.subnet = newSubnet();
        this.entityForm.controls['networkId'].enable();
    }

    setCIDRs(): void {
        this.entityForm.get('privateCIDRs').setValue(this.subnet.cidr_block);
        this.entityForm.controls['privateCIDRs'].updateValueAndValidity();
        this.entityForm.controls['privateCIDRs'].markAsTouched();
    }

    setDefaultSubnetData(): void {
        this.subnet.subnet_name = '';
        this.subnet.cidr_block = '';
        this.subnet.network = '';
    }

    emitLoadingState(): void {
        this.onLoading.emit(false);
    }

    setSubnetData(): void {
        this.subnet.subnet_name = this.entityForm.get('name').value;
        this.subnet.cidr_block = this.entityForm.get('privateCIDRs').value;
        this.subnet.network = this.entityForm.get('networkId').value['network_uuid'];
    }

    save(): void {
        if (this.entityForm.valid) {
            if (!this._entityId) {
                this.setSubnetData();
                this.createSubnet();
            } else {
                this.updateSubnet();
            }
        }
    }

    createSubnet(): void {
        observableFrom(AlAssetsManagerClient
            .createSubnet(this.deployment.account_id,
                this.deployment.id,
                this.subnet.network,
                this.getCreateSubnetPayload()))
            .subscribe((_) => this.onSuccess.emit({type: 'createdSubnet'}),
                error => this.onFailed.emit({ type: 'createdSubnet', error }))
    }

    updateSubnet(): void {
        if (this._entityId) {
            if (this.hasSubnetChanged()) {
                const network = this.entityForm.get('networkId').value;
                observableFrom(AlAssetsManagerClient
                    .modifySubnet(this.deployment.account_id,
                        this.deployment.id,
                        network, this.subnetId, this.getUpdateSubnetPayload()))
                    .subscribe((_) => this.onSuccess.emit({type: 'modifiedSubnet'}),
                        error => {
                            if (error.status === 304) {
                                this.onSuccess.emit({type: 'modifiedSubnet'});
                            } else {
                                this.onFailed.emit({ type: 'modifiedSubnet', error });
                            }
                        });
            } else {
                if (!this.hasNetworkChanged()) {
                    this.onSuccess.emit({ type: 'notChangesDetected'});
                }
            }
        }
    }

    getLists(): void {
        const searchParamsVpc = { 'asset_types': 'v:vpc' };
        observableFrom(
            AlAssetsQueryClient.getDeploymentAssets(this.deployment.account_id, this.deployment.id, searchParamsVpc)
        )
        .subscribe((responses: AssetQueryGeneralResponse) => {
            this.emitLoadingState();
            this.networks = responses.assets.map(x => x[0]);
        }, () => {
            this.emitLoadingState();
            this.onFailed.emit('getNetworks');
        });
    }

    getEntity(): void {
        // necesary because this function is executed before onInit() at first load,
        // and we need deployment data already set before execute this function
        this.deployment = this.deploymentsService.getDeploymentOnTracking();
        if (this._entityId) {
            const searchParams = { 'asset_types': 'v:vpc,s:subnet', 's.key': this._entityId };
            observableFrom(
                AlAssetsQueryClient.getDeploymentAssets(this.deployment.account_id, this.deployment.id, searchParams)
            ).subscribe((assets) => {
                this.processVpcSubnet(assets);
                this.emitLoadingState();
            }, () => {
                this.emitLoadingState();
                this.onFailed.emit('getSubnet');
            });
        }
    }


    processVpcSubnet(assets): void {
        if (assets?.assets?.length) {
            assets.assets[0].forEach(asset => {
                if (asset.type === 'vpc') {
                    this.setNetworkForm(asset as AlAssetManagerNetwork);
                } else if (asset.type === 'subnet') {
                    const key = asset?.key ?? null;
                    this.subnetId = asset.subnet_uuid;
                    this.setSubnet(asset as AlAssetsManagerSubnet, key);
                    this.setSubnetForm(asset as AlAssetsManagerSubnet);
                }
            });
        }
    }

    currentPayloadUpdateSubnet(subnet: AlAssetsManagerSubnet): void {
        this.currentSubnet.subnet_name = subnet.subnet_name;
        this.currentSubnet.cidr_block = subnet.cidr_block;
        this.currentSubnet.network = subnet.network;
    }

    deleteSubnet(): void {
        if (this._entityId) {
            this.entityForm.controls['networkId'].enable();
            const networkId: string = this.entityForm.controls['networkId'].value;
            this.entityForm.controls['networkId'].disable();
            observableFrom(
                AlAssetsManagerClient
                            .deleteSubnet(this.deployment.account_id, this.deployment.id, networkId, this.subnetId)
                ).subscribe(() => this.onSuccess
                                      .emit({type: 'deletedSubnet',
                                             message: `"${this.subnet.subnet_name}" was successfully deleted.`}),
                            error => this.onFailed.emit({ type: 'deletedSubnet', error }));
        }
    }

    delete(): void {
        observableFrom(
            AlAssetsManagerClient
                .getReportSummary(this.actingAccountId,
                    this.deployment.id,
                    { asset_type: 'subnet', asset_key: this._entityId })
            ).subscribe((reportSummary: AlAssetsManagerReportSummary) => {
                const hasAgentsOrAppliances: boolean = reportSummary?.agent_count > 0 || reportSummary?.appliance_count > 0;
                const subnetName = this.subnet.subnet_name ?? 'Unknown';
                const header: string =  `Delete "${subnetName}" subnet`;
                if (hasAgentsOrAppliances) {
                    const body = this.getDeleteMessageContent(reportSummary);
                    this.openDeleteDialog.emit({text: { body, header }, orphans: true});
                } else {
                    const body = `Are you sure you want to delete "${subnetName}" ?`;
                    this.openDeleteDialog.emit({text: {body, header}, orphans: false});
                }
            },
            error => this.onFailed.emit({ type: 'deletedSubnet', error }))
    }

    hasSubnetChanged(): boolean {
        this.modifiedSubnet.subnet_name = this.entityForm.get('name').value;
        this.modifiedSubnet.cidr_block = this.entityForm.get('privateCIDRs').value;
        return this.modifiedSubnet.subnet_name !== this.currentSubnet.subnet_name ||
            this.modifiedSubnet.cidr_block !== this.currentSubnet.cidr_block
    }

    hasNetworkChanged(): boolean {
        return (this.entityForm.get('networkId').value !== this.currentNetworkKey) ? true : false;
    }

    setSubnet(subnet: AlAssetsManagerSubnet, key: string): void {
        this.subnet.subnet_name = subnet.subnet_name;
        this.subnet.cidr_block = subnet.cidr_block;
        this.formEnabled(key !== null && !key.endsWith('/subnet/default'));
        this.deletable.emit(key !== null && !key.endsWith('/subnet/default'));
    }

    setSubnetForm(subnet: AlAssetsManagerSubnet): void {
        this.entityForm.get('name').setValue(subnet.subnet_name);
        this.currentPayloadUpdateSubnet(subnet);
        this.setCIDRs();
        this.isValid.emit(true);
        this.entityForm.controls['name'].updateValueAndValidity();
        this.entityForm.controls['name'].markAsTouched();
    }

    setNetworkForm(vpc: AlAssetManagerNetwork): void {
        this.entityForm.get('networkId').setValue(vpc.network_uuid);
        this.currentNetworkKey = vpc.key;
        this.entityForm.controls['networkId'].updateValueAndValidity();
        this.entityForm.controls['networkId'].markAsTouched();
        this.entityForm.controls['networkId'].disable();
    }

    formEnabled(enabled: boolean): void {
        if (enabled) {
            this.entityForm.get('name').enable();
            this.entityForm.get('privateCIDRs').enable();
        } else {
            this.entityForm.get('name').disable();
            this.entityForm.get('networkId').disable();
            this.entityForm.get('privateCIDRs').disable();
        }
    }

    private getDeleteMessageContent(reportSummary: AlAssetsManagerReportSummary): string {
        let text = "";
        if (reportSummary?.agent_count  && reportSummary?.appliance_count) {
            text = `Deleting this subnet will cause ${reportSummary?.agent_count} 
                    agent(s) and ${reportSummary?.appliance_count} appliance(s) to become orphaned.
                    The affected orphaned agent(s) and appliance(s) will no longer be part of your protection scope and will reduce visibility into security threats.`;
        } else if (reportSummary?.agent_count) {
            text = `Deleting this subnet will cause ${reportSummary?.agent_count} agent(s) to become orphaned.
            The affected orphaned agent(s) will no longer be part of your protection scope and will reduce visibility into security threats.`;
        } else if (reportSummary?.appliance_count) {
            text = `Deleting this subnet will cause ${reportSummary?.appliance_count} appliance(s) to become orphaned.
                    The affected orphaned appliance(s) will no longer be part of your protection scope and will reduce visibility into security threats.`;
        }
        return text;
    }

    private getUpdateSubnetPayload(): AlAssetsManagerSubnet {
        this.modifiedSubnet.subnet_name = this.entityForm.get('name').value;
        this.modifiedSubnet.cidr_block = this.entityForm.get('privateCIDRs').value;
        return {
            subnet_name: this.modifiedSubnet.subnet_name,
            cidr_block: this.modifiedSubnet.cidr_block,
        } as AlAssetsManagerSubnet;
    }

    private getCreateSubnetPayload(): AlAssetsManagerSubnet {
        return {
            subnet_name: this.subnet.subnet_name,
            cidr_block: this.subnet.cidr_block
        } as AlAssetsManagerSubnet
    }
}
