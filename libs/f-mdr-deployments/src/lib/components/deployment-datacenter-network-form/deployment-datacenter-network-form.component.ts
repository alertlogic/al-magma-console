 import { 
     from as observableFrom,
     forkJoin as observableForkJoin
} from 'rxjs';

import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import { 
    FormControl,
    FormGroup,
    Validators 
} from '@angular/forms';

import { Deployment } from '@al/deployments';
import {
    AlAssetManagerNetwork,
    AlAssetsManagerClient,
    AlAssetsManagerReportSummary,
    privateCidrExists,
    publicCidrExists,
    addPlublicCidr,
    addPrivateCidr,
    removePrivateCidr,
    removePublicCidr,
    newNetwork
} from '@al/assets-manager';

import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';
import { AlAssetsQueryClient, AssetQueryGeneralResponse } from '@al/assets-query';
import { cidrValidator } from '@al/ng-generic-components';
import { AlSession } from '@al/core';
import { OTISClient as OtisClient, TuningOption } from '@al/otis';

type OpenDialogEvent = {text: {header?: string, body?: string}, orphans: boolean};

@Component({
    selector: 'al-deployment-datacenter-network-form',
    templateUrl: './deployment-datacenter-network-form.component.html',
    styleUrls: ['./deployment-datacenter-network-form.component.scss']
})
export class DeploymentDatacenterNetworkFormComponent implements OnChanges, OnInit {

    public entityForm: FormGroup;
    public network: AlAssetManagerNetwork = newNetwork();
    public modifiedNetwork: AlAssetManagerNetwork = newNetwork();
    public deployment: Deployment;
    public otisSpanPort: TuningOption = {};
    public spanPortTooltipMessage = '';
    public selectedNetworkUuid: string;
    public actingAccountId: string;

    @Input() entityId: string = "";
    @Output() onLoading: EventEmitter<boolean> = new EventEmitter();
    @Output() isValid: EventEmitter<boolean> = new EventEmitter();
    @Output() onSuccess: EventEmitter<{type: string, message?: string}> = new EventEmitter();
    @Output() onFailed: EventEmitter<{type: string, error?: any} | string> = new EventEmitter();
    @Output() deletable: EventEmitter<boolean> = new EventEmitter();
    @Output() openDeleteDialog: EventEmitter<OpenDialogEvent> = new EventEmitter();

    constructor(
        protected deploymentsService: DeploymentsUtilityService) {
        this.actingAccountId = AlSession.getActingAccountId();
        this.entityForm = new FormGroup({
            name: new FormControl({ value: '', disabled: false }, Validators.required),
            spanPortEnabled: new FormControl({ value: false, disabled: false }),
            privateCIDRs: new FormControl({ value: '', disabled: false }),
            publicCIDRs: new FormControl({ value: '', disabled: false }),
            privateCIDRsValues: new FormControl({ value: [], disabled: false }, Validators.required),
            publicCIDRsValue: new FormControl({ value: [], disabled: false })
        });
        this.spanPortTooltipMessage = `Select this option only if your network
            equipment is configured to a port mirroring feature, such as SPAN.
            A SPAN configured network forwards your Network IDS traffic to Alert
            Logic appliances, which allows Alert Logic to analyze that traffic. `;
    }

    ngOnInit(){
        this.otisSpanPort = {};
        this.deployment = this.deploymentsService.getDeploymentOnTracking();
        if (!this.entityId) {
            this.emitLoadingState();
            this.isValid.emit(false);
        }

        this.entityForm.statusChanges.subscribe(e => {
            this.isValid.emit(e === 'VALID');
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        // Make sure we are getting the right deployment reference.
        if (!this.deployment) {
            this.deployment = this.deploymentsService.getDeploymentOnTracking();
        }
        // Have we selected a new network?
        if (changes.entityId.currentValue) {
            // Bring the data of that network or subnet.
            this.getEntity();
        }
    }

    validateCIDR(formField: string) {
        if (this.entityForm.get(formField).value) {
            this.entityForm.get(formField).setValidators([cidrValidator()]);
            this.entityForm.get(formField).updateValueAndValidity();
        }

        if (!this.entityForm.get(formField).value) {
            this.entityForm.get(formField).setValidators([]);
            this.entityForm.get(formField).updateValueAndValidity();
        }
    }

    cleanForm() {
        this.entityForm.get('name').setValue('');
        this.entityForm.get('spanPortEnabled').setValue(false);
        this.entityForm.get('privateCIDRs').setValue('');
        this.entityForm.get('publicCIDRs').setValue('');
        this.entityForm.get('privateCIDRsValues').setValue([]);
        this.entityForm.get('publicCIDRsValue').setValue([]);
        this.entityForm.controls['name'].markAsUntouched();
        this.network = newNetwork();
    }

    emitLoadingState() {
        this.onLoading.emit(false);
    }

    setCIDRs() {
        this.entityForm.get('privateCIDRsValues').setValue(this.network.cidr_ranges);
        this.entityForm.get('publicCIDRsValue').setValue(this.network.public_cidr_ranges);
    }

    addPrivateCIDR(): void {
        const range: string = this.entityForm.get('privateCIDRs').value;

        const shouldAdd: boolean =
            !privateCidrExists(this.network, range) &&
            this.entityForm.get('privateCIDRs').valid &&
            this.entityForm.get('privateCIDRs').value

        if (shouldAdd) {
            this.network = addPrivateCidr(this.network, range);
            this.entityForm.get('privateCIDRs').setValue('');
            this.setCIDRs();
            this.validateCIDR('privateCIDRs');
        }
    }

    addPublicCIDR(): void {
        const range = this.entityForm.get('publicCIDRs').value;

        const shouldAdd: boolean =
            !publicCidrExists(this.network, range) &&
            this.entityForm.get('publicCIDRs').valid &&
            this.entityForm.get('publicCIDRs').value;

        if (shouldAdd) {
            this.network = addPlublicCidr(this.network, range)
            this.entityForm.get('publicCIDRs').setValue('');
            this.setCIDRs();
            this.validateCIDR('publicCIDRs');
        }
    }

    removePrivateCIDR(range: string): void {
        this.network = removePrivateCidr(this.network, range);
        this.setCIDRs();
    }

    removePublicCIDR(range: string): void {
        this.network = removePublicCidr(this.network, range);
        this.setCIDRs();
    }

    save() {
        if (this.entityForm.valid) {
            if (!this.entityId) {
                this.createNetwork();
            } else {
                this.updateNetwork();
            }
        }
    }

    createNetwork(): void {
        this.network.network_name = this.entityForm.get('name').value;
        this.network.span_port_enabled = this.entityForm.get('spanPortEnabled').value;
        observableFrom(AlAssetsManagerClient
            .createNetwork(this.deployment.account_id,
                this.deployment.id, this.getCreateNetworkPayload()))
            .subscribe(() => this.onSuccess.emit({type: "createdNetwork"}),
                error => this.onFailed.emit({ type: 'createdNetwork', error }));
    }

    updateNetwork(): void {
        if (this.entityId) {
            observableFrom(AlAssetsManagerClient
                .modifyNetwork(this.deployment.account_id,
                    this.deployment.id, this.selectedNetworkUuid,
                    this.getUpdateNetworkPayload()))
                .subscribe(() => this.onSuccess.emit({type: 'modifiedNetwork'}),
                    error => {
                        if (error.status === 304) {
                            this.onSuccess.emit({type: 'modifiedNetwork'});
                        } else {
                            this.onFailed.emit({ type: 'modifiedNetwork', error });
                        }
                    });
        }
    }

    getEntity() {
        if (this.entityId && this.deployment) {
            const assetsQuerytSearchParams = { 'asset_types': 'v:vpc', 'v.key': this.entityId };
            const otisV3Params = { 'name': 'span_port_enabled', 'scope.deployment_id': this.deployment.id, 'scope.vpc_key': this.entityId };
            observableForkJoin([
                AlAssetsQueryClient.getDeploymentAssets(this.deployment.account_id, this.deployment.id, assetsQuerytSearchParams),
                OtisClient.listOptions(this.deployment.account_id, otisV3Params)
            ]).subscribe(([assets, otisPorts] : [AssetQueryGeneralResponse, TuningOption[]]) => {

                if (Array.isArray(assets.assets) && assets.assets.length > 0 ) {
                    this.selectedNetworkUuid = assets.assets[0][0] && assets.assets[0][0]['network_uuid'] ? assets.assets[0][0]['network_uuid'] : '';
                    if (otisPorts.length > 0) {
                        this.otisSpanPort = otisPorts[0];
                    } else {
                        this.otisSpanPort = {};
                    }
                    this.network.span_port_enabled = !!this.otisSpanPort?.value;
                    this.entityForm.get('spanPortEnabled').setValue(this.network.span_port_enabled);
                    this.setNetwork( assets.assets[0][0] as AlAssetManagerNetwork);
                    this.setNetworkForm(assets.assets[0][0] as AlAssetManagerNetwork);
                    this.emitLoadingState();
                }
            }, error => {
                this.emitLoadingState();
                this.onFailed.emit('getNetwork');
            });
        }
    }


    deleteNetwork(): void {
        if (this.entityId) {
            observableFrom(
                AlAssetsManagerClient
                    .deleteNetwork(this.deployment.account_id, this.deployment.id, this.selectedNetworkUuid)
                ).subscribe(() => this.onSuccess
                                      .emit({type: 'deletedNetwork',
                                             message: `"${this.network.network_name}" was deleted successfully.`}),
                    error => this.onFailed.emit({ type: 'deletedNetwork', error }));
        }
    }

    delete(): void {
        observableFrom(
             AlAssetsManagerClient
                .getReportSummary(this.actingAccountId,
                    this.deployment.id,
                    { asset_type: 'vpc', asset_key: this.entityId }))
            .subscribe((reportSummary: AlAssetsManagerReportSummary) => {
                const hasAgentsOrAppliances: boolean = reportSummary?.agent_count > 0 || reportSummary?.appliance_count > 0;
                const networkName =  this.network.network_name?? 'Unknown';
                const header: string =  `Delete "${networkName}" network`;
                if (hasAgentsOrAppliances) {
                    const body = this.getDeleteMessageContent(reportSummary);
                    this.openDeleteDialog.emit({text: { body, header }, orphans: true});
                } else {
                    const body = `Are you sure you want to delete "${networkName}" ?.`;
                   
                    this.openDeleteDialog.emit({text: {body, header}, orphans: false});
                }
            },
            error => this.onFailed.emit({ type: 'deletedNetwork', error }));
    }

    setNetwork(vpc: AlAssetManagerNetwork) {
        this.deletable.emit(true);
        this.network.network_name = vpc.network_name;
        this.network.cidr_ranges = vpc.cidr_ranges;
        this.network.public_cidr_ranges = vpc.public_cidr_ranges;
    }

    setNetworkForm(vpc: AlAssetManagerNetwork) {
        this.entityForm.get('name').setValue(vpc.network_name);
        this.setCIDRs();
        this.isValid.emit(true);
    }

    private getDeleteMessageContent(reportSummary: AlAssetsManagerReportSummary): string {
        let text = "";
        if (reportSummary?.agent_count  && reportSummary?.appliance_count) {
            text = `Deleting this network will cause ${reportSummary?.agent_count} 
                    agent(s) and ${reportSummary?.appliance_count} appliance(s) to become orphaned.
                    The affected orphaned agent(s) and appliance(s) will no longer be part of your protection scope and will reduce visibility into security threats.`;
        } else if (reportSummary?.agent_count) {
            text = `Deleting this network will cause ${reportSummary?.agent_count} agent(s) to become orphaned.
            The affected orphaned agent(s) will no longer be part of your protection scope and will reduce visibility into security threats.`;
        } else if (reportSummary?.appliance_count) {
            text = `Deleting this network will cause ${reportSummary?.appliance_count} appliance(s) to become orphaned.
                    The affected orphaned appliance(s) will no longer be part of your protection scope and will reduce visibility into security threats.`;
        }
        return text;
    }

    private getUpdateNetworkPayload(): AlAssetManagerNetwork {
        this.modifiedNetwork.network_name = this.entityForm.get('name').value;
        this.modifiedNetwork.span_port_enabled = this.entityForm.get('spanPortEnabled').value;
        this.modifiedNetwork.cidr_ranges = this.network.cidr_ranges;
        this.modifiedNetwork.public_cidr_ranges = this.network.public_cidr_ranges;
        delete this.modifiedNetwork.key;
        delete this.modifiedNetwork.network_uuid;
        return {
            network_name: this.modifiedNetwork.network_name,
            span_port_enabled: this.modifiedNetwork.span_port_enabled,
            ...(this.modifiedNetwork?.cidr_ranges?.length && { cidr_ranges: this.modifiedNetwork.cidr_ranges }),
            ...(this.modifiedNetwork?.public_cidr_ranges?.length && { public_cidr_ranges: this.modifiedNetwork.public_cidr_ranges }),
        } as AlAssetManagerNetwork;
    }

    private getCreateNetworkPayload(): AlAssetManagerNetwork {
        return {
            network_name: this.network.network_name,
            span_port_enabled: this.network.span_port_enabled,
            ...(this.network?.cidr_ranges?.length && { cidr_ranges: this.network.cidr_ranges }),
            ...(this.network?.public_cidr_ranges?.length && { public_cidr_ranges: this.network.public_cidr_ranges }),
        } as AlAssetManagerNetwork;
    }
}
