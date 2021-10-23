/**
 * DeploymentConfigurationAwsRoleComponent
 *
 * @author Julian David <jgalvis@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2018
 */
import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlLocatorService } from '@al/core';
import {
    BrainstemService,
    CredentialsInsightDescriptor,
    CredentialsInsightService,
    ErrorResponsesDictionaryPipe,
    InsightUtilityService,
} from '@components/technical-debt';
import { AlServiceIdentity } from 'ui-metadata';
import { CloudTrailComponent } from '../../../shared/tutorials/cloud-trail/cloud-trail.component';
import { AlConfirmComponent } from '@components/technical-debt';
import { DeploymentAdrInfoTutorialComponent } from '../tutorials/deployment-adr-info-tutorial/deployment-adr-info-tutorial.component';
import { AssetsUtilityService } from '../../../../../services';
import { AlViewHelperComponent } from '@al/ng-generic-components';
import { AlDeploymentsClient, Deployment } from '@al/deployments';
import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';

@Component({
    selector: 'al-deployment-configuration-aws-role',
    templateUrl: './deployment-configuration-aws-role.component.html',
    styleUrls: ['./deployment-configuration-aws-role.component.scss']
})
export class DeploymentConfigurationAwsRoleComponent implements OnInit, OnDestroy {

    @Input() accountId: string;

    @ViewChild('alViewHelper', { static: true } ) viewHelper: AlViewHelperComponent;
    @Output() afterSave: EventEmitter<any> = new EventEmitter();
    @Output() onCancelAction: EventEmitter<any> = new EventEmitter();

    public notificationsMessage = new EventEmitter();
    public entityForm: FormGroup;
    public deployment: Deployment;
    public cloudFormation: any = this._DeploymentsService.getCloudFormation();
    public textButton: string = "SAVE & CONTINUE";
    public hasFormChanges: boolean = false;
    public isBusy: boolean = false;
    public isSaveValid: boolean = true;
    public isCancelValid: boolean = false;

    /**
     * Contains an iam_role AWS credential record
     */
    public credential_discover_original: CredentialsInsightDescriptor;
    public credential_x_account_monitor_original: CredentialsInsightDescriptor;
    public credential_discover;
    public credential_x_account_monitor;
    public hasCloudTrails: boolean = false;
    public credentialsHandleStorage: any;
    public stateForm: string;

    /**
     * Unsaved Dialog
     */
    public expandableMenu;
    public headerBase;
    public eventTarget: Event;
    public headerBaseGetEvent;
    public expandableMenuGetEvent;
    //

    public formConfig: any = {
        arnPlaceholder: 'ARN',
        arnError: 'Invalid ARN',
    }

    constructor(protected router: Router,
        public dialog: MatDialog,
        protected brainstem: BrainstemService,
        protected _DeploymentsService: DeploymentsUtilityService,
        protected _CredentialsInsightService: CredentialsInsightService,
        protected assetsUtilityService: AssetsUtilityService,
        protected _InsightUtilityService: InsightUtilityService) { }

    ngOnInit() {
        this.deployment = this._DeploymentsService.getDeploymentOnTracking();
        this.initCredentials();
        let mustDefineInitCredentials = (tryNumber=0) => {
            this.initCredentials();
            if(tryNumber <= 6 && !this.credential_discover.secrets.arn){
                setTimeout(() => {
                    mustDefineInitCredentials(tryNumber+1);
                }, 500);
            }
        };
        if(!this.credential_discover.secrets.arn){
            this.isBusy = true;
            mustDefineInitCredentials();
            this.isBusy = false;
        }
        this.setStateForm();
        this.setFormValidations();
        this.showCloudTrailsForm();
        this.setButtonLabel();
        this.defineListenEvents();
    }

    ngOnDestroy() {
        // This element does exist in both navigations, but we make sure that it is in the document
        if(this.expandableMenu){
            this.expandableMenu.removeEventListener('click', this.expandableMenuGetEvent, true);
        }
        // this is because in beta-navigation the element does not exist. AL-ARCHIPELIGO17-HEADER
        if(this.headerBase){
            this.headerBase.removeEventListener('click', this.headerBaseGetEvent, true);
        } 
    }

    initCredentials() {
        let defaultObject = {secrets: {arn: undefined, type: undefined}, name: undefined}
        this.credential_discover_original = this._CredentialsInsightService.getCredentialOnTracking('discover');
        this.credential_x_account_monitor_original = this._CredentialsInsightService.getCredentialOnTracking('x-account-monitor');
        this.credential_discover = this.credential_discover_original ? JSON.parse(JSON.stringify(this.credential_discover_original)) : defaultObject;
        this.credential_x_account_monitor = this.credential_x_account_monitor_original ? JSON.parse(JSON.stringify(this.credential_x_account_monitor_original)) : defaultObject;
    }

    setStateForm() {
        this.stateForm = "add";
        if (this.deployment.id) {
            this.stateForm = "edit";
        }
    }

    showCloudTrailsForm() {
        if (this.deployment.id) {
            /**
             * Mode edit this validation show or not the cloud trails form
             */
            if (this.credential_x_account_monitor_original.secrets.arn) {
                this.addControlClouldTrails(true);
                this.hasCloudTrails = true;
            }
        }
    }

    setFormValidations() {
        this.entityForm = new FormGroup({
            arn: new FormControl(null, Validators.required),
            hasCloudTrails: new FormControl(false)
        });
    }

    addControlClouldTrails(cloudTrails: boolean) {
        if (cloudTrails) {
            this.entityForm.addControl("arn_monitor", new FormControl(null));
        } else {
            this.entityForm.removeControl("arn_monitor");
            this.credential_x_account_monitor.secrets.arn = undefined;

        }
        this.verifyChangesForm();
    }

    save() {
        this.saveCredential();
    }

    attachCredentialDeployment(credential: CredentialsInsightDescriptor, purpose: "discover" | "x-account-monitor") {
        this.deployment.credentials = this.deployment.credentials.filter(element => {
            return element.purpose !== purpose;
        });
        this.deployment.credentials.push({ id: credential.id, purpose: purpose });
    }

    credentialHaveChanged(oldCredential, newCredential, purpose): boolean {
        if (JSON.stringify(oldCredential.secrets) === JSON.stringify(newCredential.secrets)) {
            return false;
        }
        if (purpose === 'x-account-monitor' && !this.hasCloudTrails) {
            this.deployment.credentials = this.deployment.credentials.filter(element => {
                return element.purpose !== purpose;
            });
            return false;
        }
        return true;
    }

    storeCredential(index: number) {
        this._CredentialsInsightService.create(this.accountId, CredentialsInsightDescriptor.toJson(this.credentialsHandleStorage[index].data))
            .subscribe(credential => {
                this.attachCredentialDeployment(credential, this.credentialsHandleStorage[index].purpose);
                this.credentialsHandleStorage[index].created = true;
                this.saveDeployment();
            }, error => {
                this.error();
            });

    }

    saveCredential() {
        // Set Default Secret type
        let secretType: string = "aws_iam_role";
        this.credential_discover.secrets.type = secretType;
        this.credential_x_account_monitor.secrets.type = secretType;
        // Credentials purpose
        let purposeDiscovery: string = "discover";
        let purposeXAccountMonitor: string = "x-account-monitor";
        // Set credential name
        this.credential_discover.name = this.deployment.name + " - " + purposeDiscovery;
        this.credential_x_account_monitor.name = this.deployment.name + " - " + purposeXAccountMonitor;
        this.credentialsHandleStorage = [
            {
                purpose: 'discover',
                create: this.credentialHaveChanged(this.credential_discover_original, this.credential_discover, purposeDiscovery),
                created: false,
                data: this.credential_discover
            },
            {
                purpose: 'x-account-monitor',
                create: this.credentialHaveChanged(this.credential_x_account_monitor_original, this.credential_x_account_monitor, purposeXAccountMonitor),
                created: false,
                data: this.credential_x_account_monitor
            }
        ];

        let i = 0;
        for (let index = 0; index < this.credentialsHandleStorage.length; index++) {
            const element = this.credentialsHandleStorage[index];
            if (element.create) {
                this.storeCredential(index);
                i++;
            }
            if (this.credentialsHandleStorage.length - 1 === index && i === 0) {
                this.saveDeployment();
            }
        }
    }

    isCredentialOk() {
        if (this.credentialsHandleStorage[0].create && !this.credentialsHandleStorage[0].created) {
            return false;
        }
        if (this.credentialsHandleStorage[1].create && !this.credentialsHandleStorage[1].created) {
            return false;
        }
        return true;
    }

    saveDeployment() {
        if (!this.isCredentialOk()) {
            return;
        }
        if (this.stateForm === 'edit') {
            this.updateDeployment();
        } else {
            this.createDeployment();
        }
    }

    createDeployment() {
        this.isBusy = true;
        this.deployment.platform.id = this._InsightUtilityService.getAWSAccountFromARN(this.credential_discover.secrets.arn);
        this.deployment.id = undefined;
        this.deployment.account_id = undefined;
        let node = AlLocatorService.getNode(AlServiceIdentity.LegacyUI);
        this.deployment.cloud_defender.location_id = node.hasOwnProperty('insightLocationId') ? node.insightLocationId : '';
        AlDeploymentsClient.createDeployment(this.accountId, DeploymentsUtilityService.toJson(this.deployment))
            .then(deployment => {
                this._DeploymentsService.setDeploymentOnTracking(deployment);
                this.isBusy = false;
                this.afterSave.emit();
            }, error => {
                this.deploymentError(error);
            });
    }

    updateDeployment() {
        this.isBusy = true;
        AlDeploymentsClient.updateDeployment(this.accountId, this.deployment.id, DeploymentsUtilityService.toJsonEditRole(this.deployment))
            .then(deployment => {
                this._DeploymentsService.setDeploymentOnTracking(deployment);
                this.success();
            }, error => {
                this.deploymentError(error);
            });
    }

    success() {
        this.isBusy = false;
        this.hasFormChanges = false;
        this.setNewValuesAsInitials();
        this.viewHelper.cleanNotifications();
        this.viewHelper.notifySuccess("Deployment Role has been saved.", 5000);
    }

    error() {
        this.viewHelper.cleanNotifications();
        this.viewHelper.notifyError(ErrorResponsesDictionaryPipe.prototype.transform('deployments', 'default', 'default'), 5000);
    }

    deploymentError(error) {
        let text = ErrorResponsesDictionaryPipe.prototype.transform('deployments', 'default', 'default');
        if ('status' in error && 'data' in error && error.status === 400) {
            const data = error.data;
            if ('message' in data && 'status' in data) {
                this.entityForm.controls.arn.setErrors({ "invalidCredentialArn": true });
                if (this.hasCloudTrails) {
                    this.entityForm.controls.arn_monitor.setErrors({ "invalidCredentialArnMonitor": true });
                }
                text = ErrorResponsesDictionaryPipe.prototype.transform('deployments', error.status, data.status);
            }
        }
        this.isBusy = false;
        this.viewHelper.cleanNotifications();
        this.viewHelper.notifyError(text, 5000);
    }

    showTutorial() {
        this.dialog.open(DeploymentAdrInfoTutorialComponent, {
            data: { skip: false }
        });
    }

    showTutorialCloudTrails() {
        this.dialog.open(CloudTrailComponent, {
            data: {}
        });
    }

    cancel() {
        this.entityForm.controls['arn'].setValue(this.credential_discover_original.secrets.arn);
        this.hasCloudTrails = this.credential_x_account_monitor_original.secrets.arn ? true : false;
        if (this.hasCloudTrails) {
            if (!this.entityForm.controls['arn_monitor']) {
                this.addControlClouldTrails(true);
            }

            this.credential_x_account_monitor.secrets.arn = this.credential_x_account_monitor_original.secrets.arn;
        } else if (this.entityForm.controls['arn_monitor']) {
            this.addControlClouldTrails(false);
        }
    }

    setButtonLabel() {
        if (this.stateForm === "edit") {
            this.textButton = "SAVE";
        }
    }

    verifyChangesForm() {
        this.hasFormChanges = false;
        if ((this.credential_discover.secrets.arn && this.credential_discover.secrets.arn.trim() !== this.credential_discover_original.secrets.arn) ||
            (!this.credential_discover.secrets.arn && this.credential_discover_original.secrets.arn) ||
            (this.credential_x_account_monitor.secrets.arn && this.credential_x_account_monitor.secrets.arn.trim() !== this.credential_x_account_monitor_original.secrets.arn) ||
            (!this.credential_x_account_monitor.secrets.arn && this.credential_x_account_monitor_original.secrets.arn) ||
            (this.hasCloudTrails && !this.credential_x_account_monitor_original.secrets.arn)) {
            this.hasFormChanges = true;
        }

        setTimeout(() => {
            this.isCancelValid = !this.hasFormChanges || this.isBusy;
            this.isSaveValid = !this.entityForm.valid || !this.hasFormChanges || this.isBusy;
        });
    }

    setNewValuesAsInitials() {
        this.credential_discover_original.secrets.arn = this.credential_discover.secrets.arn;
        this.credential_x_account_monitor_original.secrets.arn = this.credential_x_account_monitor.secrets.arn;
    }

    /**
     * Methods related with Unsaved Diaglog logic
     */

    defineListenEvents() {
        this.expandableMenu = document.getElementsByTagName('AL-EXPANDABLE-MENU')[0];
        this.headerBase = document.getElementsByTagName('AL-ARCHIPELIGO17-HEADER')[0];
        // This element does exist in both navigations, but we make sure that it is in the document
        if(this.expandableMenu) {
            this.expandableMenu.addEventListener('click', this.expandableMenuGetEvent = event => this.listenEventUnsavedDialog("expandable-menu", event), true);
        }
        // this is because in beta-navigation the element does not exist. AL-ARCHIPELIGO17-HEADER
        if(this.headerBase) {
            this.headerBase.addEventListener('click', this.headerBaseGetEvent = event => this.listenEventUnsavedDialog("header-base", event), true);
        }
        
    }

    listenEventUnsavedDialog(section, event) {
        if (!this.isSaveValid) {
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
                this.expandableMenu.removeEventListener('click', this.expandableMenuGetEvent, true);
                this.headerBase.removeEventListener('click', this.headerBaseGetEvent, true);
                let event = new Event("click");
                target.dispatchEvent(event);
            }
        });
    }
}
