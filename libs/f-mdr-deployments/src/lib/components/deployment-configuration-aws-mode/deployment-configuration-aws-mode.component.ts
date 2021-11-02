import {
    Component,
    EventEmitter,
    OnInit,
    Output,
} from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { 
    DeploymentButtonDescriptor, 
    DeploymentConfigurationNotificationMessage, 
    DeploymentHeaderDescriptor 
} from '../../types';

import { PolicyMeaningLearnMoreComponent } from '../../../shared/tutorials/policy-meaning-learn-more/policy-meaning-learn-more.component';

import { Deployment } from '@al/deployments';
import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';
import { ErrorResponsesDictionaryPipe } from '../../../../../pipes/utility-pipes.pipe';

@Component({
    selector: 'al-deployment-configuration-aws-mode',
    templateUrl: './deployment-configuration-aws-mode.component.html',
    styleUrls: ['./deployment-configuration-aws-mode.component.scss']
})
export class DeploymentConfigurationAwsModeComponent implements OnInit {

    @Output() onNotify: EventEmitter<DeploymentConfigurationNotificationMessage> = new EventEmitter();
    @Output() onSave: EventEmitter<void> = new EventEmitter();

    mode: "manual" | "readonly" | "automatic" | "guided" | "none";
    deployment: Deployment;
    stateForm: string;
    product: string = "";
    deploymentHeaderConfig = {
        title: 'Choose your Deployment Mode',
        buttons: DeploymentButtonDescriptor.import([
            {
                label: "SAVE & CONTINUE",
                color: "mat-primary",
                onClick: () => this.save()
            }
        ])
    };
    alDeploymentHeaderConfig: DeploymentHeaderDescriptor = new DeploymentHeaderDescriptor(this.deploymentHeaderConfig);

    constructor(protected dialog: MatDialog,
                protected deploymentsService: DeploymentsUtilityService) { }

    ngOnInit(): void {
        this.deployment = this.deploymentsService.getDeploymentOnTracking();
        this.mode = this.deployment.mode === 'none' || !this.deployment.mode  ? 'automatic' : this.deployment.mode;
        this.setStateForm();
        this.setButtonLabel();
    }

    isChecked(value: string): boolean {
        return this.mode === value;
    }

    save(): void {
        this.deployment.mode = this.mode;
        this.onSave.emit();
    }

    deploymentError(error: any): void {
        let text = ErrorResponsesDictionaryPipe.prototype.transform('deployments', 'default', 'default');
        if (error.hasOwnProperty('status') && error.hasOwnProperty('_body') && error.status === 400) {
            let body = JSON.parse(error._body);
            if (body.hasOwnProperty('message') && body.hasOwnProperty('status')) {
                text = ErrorResponsesDictionaryPipe.prototype.transform('deployments', error.status, body.status);
            }
        }
        this.onNotify.emit({text, type: 'error'});
    }

    openLearnMore(): void {
        this.dialog.open(PolicyMeaningLearnMoreComponent, {
            data: {}
        });
    }

    setStateForm(): void {
        this.stateForm = "add";
        if (this.deployment.id) {
            this.stateForm = "edit";
        }
    }

    setButtonLabel(): void {
        // if we are editing an existing deployment, then button labels should be different
        if(this.stateForm === "edit") {
            this.alDeploymentHeaderConfig.buttons[0].label = "SAVE";
        }
    }

}
