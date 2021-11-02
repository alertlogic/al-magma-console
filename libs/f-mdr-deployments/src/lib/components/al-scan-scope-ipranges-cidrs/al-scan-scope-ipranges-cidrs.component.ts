import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { FormGroup, FormControl, FormArray, ValidationErrors } from '@angular/forms';

import { AlIPValidationResult,
         AlScanScopeItemIPRange,
         AlScanScopeItemCIDR,
         AlScanScopeItemIPAddress,
         AlScanSchedulerClientV2 } from '@al/scan-scheduler';
import { Deployment } from '@al/deployments';
import { AlSelectItem } from '@al/ng-generic-components';

@Component({
    selector: 'al-scan-scope-ipranges-cidrs',
    templateUrl: './al-scan-scope-ipranges-cidrs.component.html',
    styleUrls: ['./al-scan-scope-ipranges-cidrs.component.scss']
})
export class AlScanScopeIprangesCidrsComponent implements OnInit {

    @Input() deployment: Deployment;
    @Input() parentForm: FormArray;

    @Output() onError: EventEmitter<string> = new EventEmitter<string>();

    public iprangesCidrsForm: FormGroup;
    public selectedIprangesCidrsList: AlSelectItem[] = [];
    public specificIpsToScan: (AlScanScopeItemIPAddress | AlScanScopeItemIPRange | AlScanScopeItemCIDR)[] = [];

    constructor() { }

    ngOnInit() {
        this.setupForm();
        this.subscribeToValueChanges();
    }

    private setupForm() {
        this.selectedIprangesCidrsList = [];
        this.specificIpsToScan = [];
        this.iprangesCidrsForm = new FormGroup({
            iprangesCidrsInput: new FormControl("")
        });
    }

    addToScope() {
        const iprangesCidrsValue: string = this.iprangesCidrsForm.get('iprangesCidrsInput').value;
        const enteredIps: string[] = iprangesCidrsValue.replace(/\n/g, ",").split(",").map(w => w.trim()).filter(w => w !== '');
        this.handleIpsList(enteredIps);
    }

    private handleIpsList(ipsList: string[]) {
        if (ipsList.length > 0) {
            let validationResponse;
            AlScanSchedulerClientV2.validateIp(this.deployment.account_id, this.deployment.id, ipsList).then(
                response => {
                    validationResponse = response;
                    this.handleInvalidIps(validationResponse);
                    validationResponse.valid.forEach((validIp: AlScanScopeItemIPRange | AlScanScopeItemIPAddress | AlScanScopeItemCIDR) => {
                        let validIpValue: string = this.getIpValueFromType(validIp);
                        let isOutOfScope: boolean = validationResponse.out_of_scope.find(ipOutOfScope => validIpValue === this.getIpValueFromType(ipOutOfScope)) !== undefined;
                        // We will only add those valid items
                        // which are not out of scope
                        if (!isOutOfScope) {
                            const item: AlSelectItem = {
                                title: validIpValue,
                                value: validIp
                            };
                            // In order to avoid duplicated entries
                            const include: boolean = this.specificIpsToScan.find( ipToScan => this.getIpValueFromType(ipToScan) === validIpValue ) === undefined;
                            if (include) {
                                this.selectedIprangesCidrsList.push(item);
                                this.specificIpsToScan.push(validIp);
                            }
                        }
                    });
                    this.parentForm.get('specificIprangesCidrsToScan').setValue(this.specificIpsToScan);
                }
            ).catch(
                error => console.error("Error trying to validate the IPs/CIDRs List --> ", error)
            );
        }
    }

    handleIpTypesList(ipsToScan: (AlScanScopeItemCIDR | AlScanScopeItemIPRange | AlScanScopeItemIPAddress)[]) {
        let ipsList: string[] = [];
        this.specificIpsToScan = [];
        this.selectedIprangesCidrsList = [];
        ipsToScan.forEach(ipToScan => {
            ipsList.push(this.getIpValueFromType(ipToScan));
        });
        this.handleIpsList(ipsList);
    }

    private getIpValueFromType(ip: AlScanScopeItemIPRange | AlScanScopeItemIPAddress | AlScanScopeItemCIDR): string {
        return (ip.type === 'ip_range')? `${(ip as AlScanScopeItemIPRange).from_ip} - ${(ip as AlScanScopeItemIPRange).to_ip}`:
                                         (ip as AlScanScopeItemIPAddress|AlScanScopeItemCIDR).value;
    }

    selectionChanged(selectedOptions: AlSelectItem[]) {
        let specificAssetsToScan: (AlScanScopeItemIPAddress | AlScanScopeItemIPRange | AlScanScopeItemCIDR)[] = [];
        selectedOptions.forEach(option => {
            specificAssetsToScan.push(option.value);
        });
        this.parentForm.get('specificIprangesCidrsToScan').setValue(specificAssetsToScan);
    }

    private handleInvalidIps(ipsToScan: AlIPValidationResult) {
        let validationErrors: ValidationErrors = {
            invalidEntries: {
                errorMessages: []
            }
        };
        let invalidIps: string[] = [];
        if (ipsToScan.invalid.length > 0) {
            validationErrors.invalidEntries.errorMessages.push("Invalid IP or range entered");
            invalidIps = ipsToScan.invalid;
        }
        if (ipsToScan.out_of_scope.length > 0) {
            validationErrors.invalidEntries.errorMessages.push("Some IP(s) are not within the scope of protection. Either remove these entries \
                                                                or add them to the Scope of Protection page and try again.");
            const ipsOutOfScope: string[] = ipsToScan.out_of_scope.map(ip => this.getIpValueFromType(ip));
            invalidIps = invalidIps.concat(ipsOutOfScope);
        }
        this.iprangesCidrsForm.get('iprangesCidrsInput').setValue(invalidIps.join('\n'));
        if (invalidIps.length > 0) {
            validationErrors.invalidEntries.errorMessages.push("Correct or remove invalid entries to continue");
            this.iprangesCidrsForm.get("iprangesCidrsInput").setErrors(validationErrors);
        }
    }

    private subscribeToValueChanges() {
        // Let's check the changes on the textarea in order to validate if
        // there are any leftovers and disable the SAVE button accordingly
        this.iprangesCidrsForm.get("iprangesCidrsInput").valueChanges.subscribe(value => {
            let isValid: boolean = true;
            if (value.trim() !== '') {
                isValid = false;
            }
            // Now lets apply the new value and validity
            this.parentForm.get("isIprangesCidrsInputValid").setValue(isValid);
        });
    }

    cleanTextArea() {
        this.iprangesCidrsForm.get("iprangesCidrsInput").setValue("");
    }
}
