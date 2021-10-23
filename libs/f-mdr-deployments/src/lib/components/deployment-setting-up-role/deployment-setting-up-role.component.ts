/**
 * DeploymentSettingUpRoleComponent
 *
 * @author Mario payan <mario.payan@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2018
 */
import {
    Component,
    EventEmitter,
    Inject,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ThemisRoleDescriptor, ThemisRolesService } from '@components/technical-debt';
import { DeploymentButtonDescriptor, DeploymentHeaderDescriptor } from '../../types';
import { AlNavigationService } from '@al/ng-navigation-components';
import { Deployment } from '@al/deployments';
import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';
import { ThemisRoleDocument } from '@al/themis';
import { ThemisRoleUtilityService } from '../../../shared/services/themis-role-utility.service';

@Component({
    selector: 'al-deployment-setting-up-role',
    templateUrl: './deployment-setting-up-role.component.html',
    styleUrls: ['./deployment-setting-up-role.component.scss']
})
export class DeploymentSettingUpRoleComponent implements OnInit {

    @Output() next: EventEmitter<any> = new EventEmitter();

    public deployment: Deployment;
    public cloudFormation: any;
    public role_ci_essentials: ThemisRoleDocument;
    public role_ci_full: ThemisRoleDocument;
    public role_cd_full: ThemisRoleDocument;
    public role_ci_manual: ThemisRoleDocument;
    public policyObjectText: any;
    public awsAccountID: string;
    public externalID: string;
    public cloudformationUrl: string;
    public iamRolesUrl: string;

    public setupType: string = "";

    public button: DeploymentButtonDescriptor = new DeploymentButtonDescriptor({
        label: "Continue",
        color: "mat-primary",
        onClick: () => { this.goForward(); }
    })

    public alDeploymentHeaderConfig: DeploymentHeaderDescriptor = new DeploymentHeaderDescriptor({
        title: 'Setting up a Role',
        buttons: [this.button]
    });

    constructor(protected _DeploymentsService: DeploymentsUtilityService,
                protected _ThemisRoleUtilityService: ThemisRoleUtilityService,
                protected _NavigationService: AlNavigationService) { }

    ngOnInit() {
        this.deployment = this._DeploymentsService.getDeploymentOnTracking();
        this.cloudFormation = this._DeploymentsService.getCloudFormation();
        this.role_ci_essentials = this._ThemisRoleUtilityService.getThemisRoleOnTracking('ci_essentials');
        this.role_ci_full = this._ThemisRoleUtilityService.getThemisRoleOnTracking('ci_full');
        this.role_cd_full = this._ThemisRoleUtilityService.getThemisRoleOnTracking('cd_full');
        this.role_ci_manual = this._ThemisRoleUtilityService.getThemisRoleOnTracking('ci_manual');
        this.setRolePolicy();
        this.cloudFormation.enableTemplate = true;
    }

    setSetup(setupType) {
        if(setupType === "template"){
            this.cloudFormation.enableTemplate = true;
        } else {
            this.cloudFormation.enableTemplate = false;
        }
    }

    setRolePolicy() {
        let templateUrl: string = '';
        let stackName: string = "";
        let stackNamePartial: string = "alertlogic-iam-role";
        /**
         * CLOUD INSIGHT ESSENTIALS ROLE
         */
        if (this.deployment.mode === 'none') {
            templateUrl = this.role_ci_essentials.cft.s3_url;

            this.policyObjectText = this.role_ci_essentials.policy_document;
            this.awsAccountID = this.role_ci_essentials.aws_account_id;
            this.externalID = this.role_ci_essentials.external_id;
            stackName = stackNamePartial + '-' + this.role_ci_essentials.type.replace("_", "-") + '-' + this.role_ci_essentials.version;
        }
        /**
         * CLOUD INSIGHT ROLE
         */
        if (!this.deployment.cloud_defender.enabled && (this.deployment.mode === 'automatic' || this.deployment.mode === 'guided')) {
            templateUrl = this.role_ci_full.cft.s3_url;

            this.policyObjectText = this.role_ci_full.policy_document;
            this.awsAccountID = this.role_ci_full.aws_account_id;
            this.externalID = this.role_ci_full.external_id;
            stackName = stackNamePartial + '-' + this.role_ci_full.type.replace("_", "-") + '-' + this.role_ci_full.version;
        }
        /**
         * CLOUD DEFENDER ROLE
         */
        if (this.deployment.cloud_defender.enabled) {
            templateUrl = this.role_cd_full.cft.s3_url;

            this.policyObjectText = this.role_cd_full.policy_document;
            this.awsAccountID = this.role_cd_full.aws_account_id;
            this.externalID = this.role_cd_full.external_id;
            stackName = stackNamePartial + '-' + this.role_cd_full.type.replace("_", "-") + '-' + this.role_cd_full.version;
        }
        /**
         * CLOUD INSIGHT MANUAL MODE
         */
        if (this.deployment.mode === 'manual') {
            templateUrl = this.role_ci_manual.cft.s3_url;

            this.policyObjectText = this.role_ci_manual.policy_document;
            this.awsAccountID = this.role_ci_manual.aws_account_id;
            this.externalID = this.role_ci_manual.external_id;
            stackName = stackNamePartial + '-' + this.role_ci_manual.type.replace("_", "-") + '-' + this.role_ci_manual.version;
        }

        this.cloudformationUrl = "https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?templateURL=" + templateUrl + "&stackName=" + stackName + "&param_ExternalId=" + this.externalID;
        this.iamRolesUrl = "https://docs.alertlogic.com/prepare/aws-cross-account-role-setup.htm";
    }

    goExternalSite(site) {
        window.open(site, "_blank");
    }

    goForward(){
        this.next.emit();
    }

    public copyToClipboard(strOrJsonObj:object|string): void {
        if (typeof(strOrJsonObj) === 'object') { strOrJsonObj = JSON.stringify(strOrJsonObj, null, '\t'); }
        const el = document.createElement('textarea');
        el.value = strOrJsonObj;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
  };

}
