/**
 * DeploymentAzureRoleComponent
 *
 * @author Carlos Orozco <carlos.orozco@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2018
 */
import {
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlLocatorService } from '@al/core';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { AxiosResponse } from 'axios';

import { AlConfirmComponent } from '@components/technical-debt';
import {
    AzureAdClientDescriptor,
    AzureExplorerCredentialDescriptor,
    AzureExplorerService,
    BrainstemService,
    CredentialsAzureService,
    CredentialsInsightDescriptor,
    CredentialsInsightService,
    ErrorResponsesDictionaryPipe,
    InsightUtilityService,
} from '@components/technical-debt';
import { AlServiceIdentity } from 'ui-metadata';

import { AzureTutorialComponent } from '../../../shared/tutorials/azure-tutorial/azure-tutorial.component';
import { AssetsUtilityService } from '../../../../../services';
import { AlViewHelperComponent } from '@al/ng-generic-components';
import { DeploymentHeaderDescriptor } from '../../types';
import { AlDeploymentsClient, Deployment } from '@al/deployments';
import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';

@Component({
    selector: 'al-deployment-azure-role',
    templateUrl: './deployment-azure-role.component.html',
    styleUrls: ['./deployment-azure-role.component.scss']
})
export class DeploymentAzureRoleComponent implements OnInit, OnDestroy {

    @Output() onSaved: EventEmitter<any> = new EventEmitter();

    /** Notifications */
    @ViewChild('alViewHelper', { static: true } ) viewHelper: AlViewHelperComponent;
    static AUTO_DISMISS_SUCCESS: number = 3000; // We should to get this values from a global config, isn't? ¯\_(ツ)_/¯
    static AUTO_DISMISS_ERROR: number = 8000; // We should to get this values from a global config, isn't? ¯\_(ツ)_/¯

    public formConfig: any = {
        requiredError: 'This is required.'
    }
    public textButton: string = "SAVE";

    /**
     * Subscriptions
     */
    private routeSubscription: ISubscription;

    /**
     * Unsaved Dialog
     */
    public expandableMenu;
    public headerBase;
    public eventTarget: Event;
    public headerBaseGetEvent;
    public expandableMenuGetEvent;
    //

    public deploymentHeaderConfig: any = {
        title: 'Access to Azure Subscription'
    };
    public alDeploymentHeaderConfig: DeploymentHeaderDescriptor = new DeploymentHeaderDescriptor(this.deploymentHeaderConfig);
    public azureForm: FormGroup;

    public deployment: Deployment;
    public azure_credential: CredentialsInsightDescriptor;
    public isCredential: boolean;
    public azure_credential_original: CredentialsInsightDescriptor;

    public azureCredentials: AzureExplorerCredentialDescriptor;
    public currentCredential: AzureAdClientDescriptor;
    public currentSubscriptionId: string;
    public newCredential: AzureAdClientDescriptor;

    public isBusy: boolean = false;
    public accountId: string;
    public deploymentId: string;
    public isProcessSaved: boolean = false;
    public previousclient_secret: string = "";
    private dialogRef: MatDialogRef<AzureTutorialComponent>;

    constructor(protected brainstem: BrainstemService,
        protected _InsightUtilityService: InsightUtilityService,
        protected _DeploymentsService: DeploymentsUtilityService,
        protected _CredentialsInsightService: CredentialsInsightService,
        protected _AzureExplorerService: AzureExplorerService,
        protected _CredentialsAzureService: CredentialsAzureService,
        protected route: ActivatedRoute,
        protected router: Router,
        protected assetsUtilityService: AssetsUtilityService,
        public dialog: MatDialog) { }

    ngOnInit() {
        this.deployment = this._DeploymentsService.getDeploymentOnTracking();
        this.azure_credential = this._CredentialsInsightService.getCredentialOnTracking('discover');
        this.isCredential = (this.deployment && this.azure_credential) ? true : false;
        this.azure_credential_original = this.isCredential ? JSON.parse(JSON.stringify(this.azure_credential)) : new CredentialsInsightDescriptor();

        this.azureCredentials = new AzureExplorerCredentialDescriptor();
        this.currentCredential = new AzureAdClientDescriptor();
        this.currentSubscriptionId = this.deployment.platform.id;
        this.newCredential = new AzureAdClientDescriptor();

        this.routeSubscription = this.route.params.subscribe(params => {
            this.accountId = params.hasOwnProperty("accountId") ? params["accountId"] : null;
            this.deploymentId = params.hasOwnProperty("id") ? params["id"] : null;
            this.setupFormValidations();
            if (this.deploymentId === 'new') {
                this.azure_credential = new CredentialsInsightDescriptor();
                this.azure_credential_original = new CredentialsInsightDescriptor();
                this.textButton = "SAVE AND CONTINUE";
            } else {
                this.setupInitialInfo();
                this.updateAzureDeploymentObject();
            }
        });

        this.defineListenEvents();

        let mustDefineInitialInfo = (tryNumber=0) => {
            this.setupInitialInfo();
            if(tryNumber <= 6 && (!this.azure_credential.secrets.ad_id || !this.azure_credential.secrets.client_id)){
                setTimeout(() => {
                    mustDefineInitialInfo(tryNumber+1);
                }, 500);
            }
        };
        if(!this.azure_credential.secrets.ad_id || !this.azure_credential.secrets.client_id){
            this.isBusy = true;
            mustDefineInitialInfo();
            this.isBusy = false;
        }
    }

    ngOnDestroy() {
        if(this.expandableMenu) {
            this.expandableMenu.removeEventListener('click', this.expandableMenuGetEvent, true);
        }
        if(this.headerBase) {
            this.headerBase.removeEventListener('click', this.headerBaseGetEvent, true);
        }
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }

    setupInitialInfo() {
        this.textButton = "SAVE";
        this.azureCredentials.subscription_id = this.deployment.platform.id;
        this.azureCredentials.credential.azure_ad_client.active_directory_id = this.azure_credential.secrets.ad_id;
        this.azureCredentials.credential.azure_ad_client.client_id = this.azure_credential.secrets.client_id;

        this.azureForm.get('subscription_id').setValue(this.deployment.platform.id);
        this.azureForm.get('active_directory_id').setValue(this.azure_credential.secrets.ad_id);
        this.azureForm.get('client_id').setValue(this.azure_credential.secrets.client_id);

        this.currentCredential.active_directory_id = this.azure_credential_original.secrets.ad_id;
        this.currentCredential.client_secret = this.azure_credential_original.secrets.client_secret;
        this.currentCredential.client_id = this.azure_credential_original.secrets.client_id;
    }

    updateAzureDeploymentObject() {
        AlDeploymentsClient.getDeployment(this.accountId, this.deploymentId).then(
            response => {
                this.deployment = response;
            },
            error => {
                this.handlerError(error, 'sources_azure', 'getDeployment');
            }
        );
    }

    setupFormValidations() {
        this.azureForm = new FormGroup(
            {
                subscription_id: new FormControl(null, [Validators.required, this._InsightUtilityService.trimValidator]),
                active_directory_id: new FormControl(null, [Validators.required, this._InsightUtilityService.trimValidator]),
                client_id: new FormControl(null, [Validators.required, this._InsightUtilityService.trimValidator]),
                client_secret: new FormControl(null, [Validators.required, this._InsightUtilityService.trimValidator])
            }
        );
        this.onChanges();
    }

    onChanges() {
        this.azureForm.statusChanges.subscribe(status => {
            if (status === 'VALID' && this.deploymentId !== 'new' && this.isProcessSaved && this.areThereChanges()) {
                this.isProcessSaved = false;
            }
        });
    }

    areThereChanges() {
        return ( this.azureForm.get('subscription_id').value !== this.deployment.platform.id ||
                 this.azureForm.get('active_directory_id').value !== this.azure_credential.secrets.ad_id ||
                 this.azureForm.get('client_id').value !== this.azure_credential.secrets.client_id ||
                 this.previousclient_secret !== this.azureForm.get('client_secret').value );
    }

    enableInputs() {
        this.azureForm.controls.subscription_id.enable();
        this.azureForm.controls.active_directory_id.enable();
        this.azureForm.controls.client_id.enable();
        this.azureForm.controls.client_secret.enable();
    }

    resetOriginalFormValues() {
        this.azureForm.controls['subscription_id'].setValue(this.deployment.platform.id);
        this.azureForm.controls['active_directory_id'].setValue(this.azure_credential.secrets.ad_id);
        this.azureForm.controls['client_id'].setValue(this.azure_credential.secrets.client_id);
        this.azureForm.controls['client_secret'].setValue('');
    }

    submit() {
        if (this.azureForm.valid) {
            this.isBusy = true;
            this.disableInputs();
            this.verifyCredentials();
        }
    }

    disableInputs() {
        this.azureForm.controls.subscription_id.disable();
        this.azureForm.controls.active_directory_id.disable();
        this.azureForm.controls.client_id.disable();
        this.azureForm.controls.client_secret.disable();
    }

    verifyCredentials() {
        this.azureCredentials.subscription_id = this.azureForm.get('subscription_id').value;
        this.azureCredentials.credential.azure_ad_client.active_directory_id = this.azureForm.get('active_directory_id').value;
        this.azureCredentials.credential.azure_ad_client.client_id = this.azureForm.get('client_id').value;
        this.azureCredentials.credential.azure_ad_client.client_secret = this.azureForm.get('client_secret').value;

        let credentialJson = AzureExplorerCredentialDescriptor.toJson(this.azureCredentials);
        this._AzureExplorerService.validateCredentials(credentialJson).subscribe(
            () => {
                this.createCredential();
            },
            error => {
                this.handlerError(error, 'azure_explorer', 'azure');
            }
        );
    }

    createCredential() {
        let azureCredential = CredentialsInsightDescriptor.toJson(CredentialsInsightDescriptor.import(
            {
                id: "",
                name: this.deployment.name + " credentials",
                secrets: {
                    type: "azure_ad_client",
                    ad_id: this.azureForm.get('active_directory_id').value.toUpperCase(),
                    client_id: this.azureForm.get('client_id').value,
                    client_secret: this.azureForm.get('client_secret').value
                }
            }
        ));
        this._CredentialsInsightService.create(this.accountId, azureCredential)
            .subscribe(
                response => {
                    this.deploymentId === 'new' ? this.createAzureDeployment(response) : this.updateAzureDeployment(response);
                },
                error => {
                    this.handlerError(error, 'sources_azure', 'credentials_merge');
                }
            );
    }

    createAzureDeployment(credential: CredentialsInsightDescriptor) {
        let azureDeploymentJson = this.setupAzureDeployment(credential);

        AlDeploymentsClient.createDeployment(this.accountId, azureDeploymentJson).then(
            (deployment) => {
                this.handleSuccess(deployment);
            }, error => {
                this.handlerError(error, 'sources_azure', 'sources_create');
            }
        );
    }

    updateAzureDeployment(credential: CredentialsInsightDescriptor) {
        this.deployment.credentials = [
            {
                id: credential.id,
                purpose: "discover"
            }
        ];
        AlDeploymentsClient.updateDeployment(this.accountId, this.deploymentId, DeploymentsUtilityService.toJsonEditRole(this.deployment)).then(
            deployment => {
                this.handleSuccess(deployment);
            }, error => {
                this.handlerError(error, 'sources_azure', 'sources_create');
            }
        );
    }

    setupAzureDeployment(credential: CredentialsInsightDescriptor) {
        let node: any = AlLocatorService.getNode(AlServiceIdentity.LegacyUI);
        this.deployment.credentials = [
            {
                id: credential.id,
                purpose: "discover"
            }
        ];
        this.deployment.platform.id = this.azureForm.get('subscription_id').value;
        this.deployment.cloud_defender.location_id = node.hasOwnProperty('insightLocationId') ? node.insightLocationId : '';
        // azure deployment for phoenix accounts should set defender flag as false
        this.deployment.cloud_defender.enabled = false;
        let azureDeploymentJson = DeploymentsUtilityService.toAzureDeploymentJson(this.deployment);
        return azureDeploymentJson;
    }

    handleSuccess(deployment: any) {
        this._DeploymentsService.setDeploymentOnTracking(deployment);
        this.isBusy = false;
        this.viewHelper.cleanNotifications();
        this.viewHelper.notifySuccess("Thank you! We are beginning network discovery.", DeploymentAzureRoleComponent.AUTO_DISMISS_SUCCESS);
        if (this.deploymentId === 'new') {
            setTimeout(() => {
                this.onSaved.emit();
            }, DeploymentAzureRoleComponent.AUTO_DISMISS_SUCCESS);
        } else {
            this.isProcessSaved = true;
            this.previousclient_secret = this.azureForm.get('client_secret').value;
            this.setUpPreviousValuesAsCurrent();
            this.enableInputs();
        }
    }

    setUpPreviousValuesAsCurrent() {
        this.deployment.platform.id = this.azureForm.get('subscription_id').value;
        this.azure_credential.secrets.ad_id = this.azureForm.get('active_directory_id').value;
        this.azure_credential.secrets.client_id = this.azureForm.get('client_id').value;
    }

    handlerError(error: AxiosResponse, service: string, actionType: string) {
        this.isBusy = false;
        this.enableInputs();
        let message = ErrorResponsesDictionaryPipe.prototype.transform(service, error.status, actionType);
        message = message ? message : ErrorResponsesDictionaryPipe.prototype.transform('deployments', 'default', 'default');
        this.viewHelper.cleanNotifications();
        this.viewHelper.notifyError(message, DeploymentAzureRoleComponent.AUTO_DISMISS_ERROR);
    }

    openTutorial() {
        if (!this.dialogRef) {
            this.dialogRef = this.dialog.open(AzureTutorialComponent, {
                data: {},
                closeOnNavigation: false
            });
            this.dialogRef.afterClosed().subscribe(() => {
                this.dialogRef = null;
            });
        }
    }

    /**
     * Methods related with Unsaved Diaglog logic
     */

    defineListenEvents() {
        this.expandableMenu = document.getElementsByTagName('AL-EXPANDABLE-MENU')[0];
        this.headerBase = document.getElementsByTagName('AL-ARCHIPELIGO17-HEADER')[0];
        if(this.expandableMenu) {
            this.expandableMenu.addEventListener('click', this.expandableMenuGetEvent = event => this.listenEventUnsavedDialog("expandable-menu", event), true);
        }
        if(this.headerBase){
            this.headerBase.addEventListener('click', this.headerBaseGetEvent = event => this.listenEventUnsavedDialog("header-base", event), true);
        }
    }

    listenEventUnsavedDialog(section, event) {
        if (this.azureForm.valid && !this.isProcessSaved) {
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
