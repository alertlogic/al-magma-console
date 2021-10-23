import { Component, EventEmitter, ViewChild, ViewEncapsulation, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AlConfirmComponent, AlHeaderNavToolComponent } from '@components/technical-debt';
import { AlNavigationService } from '@al/ng-navigation-components';
import { AIMSAccount, AlSession, getJsonPath } from '@al/core';
import { AlNotification,AlNotificationPanelComponent,AlNotificationType, AlToastService, AlToastMessage } from '@al/ng-generic-components';
import { AlDeploymentsClient, Deployment } from '@al/deployments';
import { DeploymentsUtilityService } from '../../services/deployment-utility.service';
import { AlAssetsManagerClient, AlAssetsManagerReportSummary } from '@al/assets-manager';

import { from as observableFrom } from 'rxjs';
import { DeploymentAssetsManagerDeleteDialogComponent } from '../deployment-assets-manager-delete-dialog/deployment-assets-manager-delete-dialog.component';

@Component({
    selector: 'al-deployment-adr-list',
    templateUrl: './deployment-list.component.html',
    styleUrls: ['./deployment-list.component.scss'],
    providers: [DatePipe],
    encapsulation: ViewEncapsulation.None
})
export class DeploymentsListADRComponent implements OnInit {

    @ViewChild(AlNotificationPanelComponent, { static: true }) notificationPanel: AlNotificationPanelComponent;
    @ViewChild(AlHeaderNavToolComponent, { static: true }) alHeaderNavToolComponent: AlHeaderNavToolComponent;

    @ViewChild('dialog') dialog: DeploymentAssetsManagerDeleteDialogComponent;

    public userId: string;
    public accountId: string;
    public deploymentType: string;
    public deploymentId: string;
    public taskId: string;
    public deployments: any = [];
    public searchQuery: string = "";
    public orderBy: string = "type";
    public isLoading: boolean = false;
    public isAnyDefender: boolean = false;
    public isApiDown: boolean = false;
    public showFirstDeploymentText: boolean = false;
    public remediationsOrExposures: string = "Remediations";
    public entitlements = "assess|detect|respond|tmpro|lmpro";
    /**
     * Nav Tool config
     */
    public headerNavToolConf = {
        title: "Deployment",
        withIconTitle: false,
        iconTitle: {
            iconClass: 'material-icons',
            icon: 'add'
        },
        rowLeftPadding: '20px',
        enableSortBySelect: true,
        sortItems: [
            {
                caption: 'Type',
                name: 'type'
            },
            {
                caption: 'Alphabetical',
                name: 'alphabetical'
            },
            {
                caption: 'Most Recently Created',
                name: 'mostRecentlyCreated'
            }
        ],
        selectedSortName: 'type',
        isArchiveEnable: false,
        isSettingsEnable: false,
        textPlaceHolder: 'Type Search Terms',
        enableMultipleFilter: false,
        buttonPlusMenu: true,
        menuAddTitle: 'Add new deployment',
        menuAddItems: [
            {
                id: 'aws',
                description: 'Amazon Web Services',
                icon: 'al al-aws',
                badge: 'badge-aws'
            },
            {
                id: 'datacenter',
                description: 'Data Center',
                icon: 'al al-datacenter',
                badge: 'badge-datacenter'
            }
        ]
    };

    public zeroState: any = {
        topText: '',
        bottomText: '',
        icon: ''
    };

    /**
     * Notifications
     */
    static AUTO_DISMISS_SUCCESS: number = 3000;
    static AUTO_DISMISS_ERROR: number = 8000;
    public listNotifications = new EventEmitter();

    open: boolean = false;

    private deleteCandidate: Deployment;

    constructor(    protected route: ActivatedRoute,
                    protected router: Router,
                    protected _DeploymentsService: DeploymentsUtilityService,
                    protected navigation: AlNavigationService,
                    protected toastService: AlToastService,
                    protected datePipe: DatePipe) {
    }

    ngOnInit = () => {
        this.userId = AlSession.getUserId();
        this.getRouteParams();
        this.initializeComponent();
        this.navigation.events.attach('AlNavigationFrameChanged', this.onNavigationChanged);
    }

    onNavigationChanged = () => {
        this.showFirstDeploymentMessage();
    }

    accountChanged = ( event: AIMSAccount ) => {
        const defaultValue = 'type';
        this.alHeaderNavToolComponent.clearSearch();
        this.headerNavToolConf.selectedSortName = defaultValue;
        this.alHeaderNavToolComponent.config.selectedSortName = defaultValue;
        this.orderBy = defaultValue;
        this.alHeaderNavToolComponent.matSelect.writeValue(defaultValue);
    }

    getRouteParams() {
        this.route.params.subscribe(params => {
            this.accountId = params.hasOwnProperty("accountId") ? params["accountId"] : null;
            this.deploymentId = params.hasOwnProperty("deploymentId") ? params["deploymentId"] : null;
            this.taskId = params.hasOwnProperty("taskId") ? params["taskId"] : null;
            if (this.accountId) {
                this.loadData();
            }
        });
    }

    initializeComponent() {
        this.headerNavToolConf.menuAddItems.push({
            id: 'azure',
            description: 'Microsoft Azure',
            icon: 'al al-azure',
            badge: 'badge-azure'
        });
        this.isAnyDefender = true;
        this.loadData();
    }

    loadData() {
        this.isLoading = true;
        this.isApiDown = false;
        this.deployments = [];
        this.getDeployments();
        this.setGeneralZeroState();
    }

    getDeployments() {
        AlDeploymentsClient.listDeployments(this.accountId).then((response: Deployment[]) => {
            this.deployments = response;
            this.isLoading = false;
            this.showFirstDeploymentMessage();
        }, error => {
            this.isLoading = false;
            this.setApiDownZeroState();
            this.handleError('load', error);
        });
    }

    showFirstDeploymentMessage() {
        if (this.showFirstDeploymentText) {
            this.notificationPanel.flush();
        }
        const experience = this.navigation.getExperience();
        if (experience === 'default') {
            this.remediationsOrExposures = "Remediations";
        } else {
            this.remediationsOrExposures = "Exposures";
        }
        if (localStorage && Array.isArray(this.deployments) && this.deployments.length === 1) {
            if (!localStorage.getItem('remedations-list-first-deployment')) {
                this.showFirstDeploymentText = true;
                this.listNotifications.emit(new AlNotification("", AlNotificationType.Information, 0, false, '', 'x'));
            }
        }
    }

    launchNotificationPanelButton() {
        if (localStorage) {
            if (!localStorage.getItem('remedations-list-first-deployment')) {
                localStorage.setItem('remedations-list-first-deployment', 'done');
                this.showFirstDeploymentText = false;
            }
            this.notificationPanel.flush();
        }
    }

    redirectRemediationsOrExposuresList() {
        const experience = this.navigation.getExperience();
        if (experience === 'default') {
            this.navigation.navigate.byNamedRoute("cd17:remediations:list", { accountId: this.accountId });
        } else {
            this.navigation.navigate.byNamedRoute("cd17:exposures:exposures-open", { accountId: this.accountId });
        }
        this.showFirstDeploymentText = false;
        localStorage.setItem('remedations-list-first-deployment', 'done');
    }

    doEdit(deployment: Deployment) {
        this._DeploymentsService.startDeploymentTracking();
        this._DeploymentsService.setDeploymentOnTracking(deployment);
        if (deployment.platform.type === 'aws') {
            this.navigation.navigate.byNgRoute(['/deployments-adr/aws/' + this.accountId + '/' + deployment.id],  { queryParams: {step: null} } );
        } else if (deployment.platform.type === 'datacenter') {
            this.navigation.navigate.byNgRoute(['/deployments-adr/datacenter/' + this.accountId + '/' + deployment.id], { queryParams: {step: null}} );
        } else if (deployment.platform.type === 'azure') {
            this.navigation.navigate.byNgRoute(['/deployments-adr/azure/' + this.accountId + '/' + deployment.id], { queryParams: {step: null}} );
        }
    }

    onSearch(value: string) {
        this.searchQuery = value;
    }

    onOrdering(item: any) {
        this.orderBy = item.name;
    }

    doDelete(deployment: Deployment){
      observableFrom(
                     AlAssetsManagerClient
                    .getReportSummary(AlSession.getActingAccountId(),
                          deployment.id, {}))
        .subscribe((reportSummary: AlAssetsManagerReportSummary) => {
            const hasAgentsOrAppliances: boolean = reportSummary?.agent_count > 0 || reportSummary?.appliance_count > 0;
            this.deleteCandidate = deployment;
            const deploymentName = deployment.name ?? 'Unknown';
            const header: string =  `Delete "${deploymentName}" deployment`;
            if (hasAgentsOrAppliances) {
                const body = this.getDeleteMessageContent(reportSummary);
                this.dialog.open('deployment', body, header, false);
            } else {
                const body = `Are you sure you want to delete "${deploymentName}" ?`;
                this.dialog.open('deployment', body, header, true);
            }
        },
        error => {
            this.deleteCandidate = null;
            console.error(error);
            this.handleError('delete', error);
            
        })
    }

    continueDeletion(): void {
        observableFrom(
            AlDeploymentsClient.deleteDeployment(this.accountId, this.deleteCandidate.id)
        ).subscribe(() => this.handleSuccessOperation('delete', `"${this.deleteCandidate.name}" was deleted successfully.`),
                    error => this.handleError('delete', error),
                    () => this.deleteCandidate = null);
    }

    closeDialog(): void {
        this.deleteCandidate = null;
    }

    onCreateForm(event) {
        if (event !== undefined) {
            switch (event.id) {
                case 'azure': {
                    this.navigation.navigate.byNgRoute(['/deployments-adr/azure/' + this.accountId + '/new'], { queryParamsHandling: 'merge' } );
                    break;
                }
                case 'aws': {
                    this.navigation.navigate.byNgRoute(['/deployments-adr/aws/' + this.accountId + '/new'], { queryParamsHandling: 'merge' } );
                    break;
                }
                case 'datacenter': {
                    this.navigation.navigate.byNgRoute(['/deployments-adr/datacenter/' + this.accountId + '/new'], { queryParamsHandling: 'merge' } );
                    break;
                }
                default: {
                    console.error('This is not a valid option');
                    break;
                }
            }
        }
    }

    handleSuccessOperation(typeSuccess: string, customMessage?: string) {
        let message: string = "";
        switch (typeSuccess) {
            case 'delete':
                message = "The Deployment was deleted successfully";
                break;
            case 'create':
                message = "The Deployment was created successfully";
                break;
            case 'update':
                message = "The Deployment was updated successfully";
                break;
        }
        if (customMessage) {
            message = customMessage;
        }
        this.emitNotificationsValues('success', message);
        this.loadData();
    }

    handleError(typeError: string, error: any) {
        let reason_text: string = getJsonPath(error, "data.reason_text", null);
        let message: string = "";
        switch (typeError) {
            case "load":
                message = reason_text ? reason_text : "An internal error getting the Deployment list";
                break;
            case "delete":
                message = reason_text ? reason_text : "An internal error deleting the deployment";
                break;
        }
        this.isLoading = false;
        this.emitNotificationsValues('error', message);
    }

    emitNotificationsValues(typeAlertMessage: string, message: string) {
        const toastMessage: AlToastMessage = {
            sticky: true,
            closable: false,
            data: {
                message,
            },
        }
        let ttl: number = 0;
        switch (typeAlertMessage) {
            case 'success':
                this.showFirstDeploymentText = false;
                toastMessage.severity = 'success';
                ttl =  DeploymentsListADRComponent.AUTO_DISMISS_SUCCESS;
                break;
            case 'error':
                this.showFirstDeploymentText = false;
                toastMessage.severity = 'error';
                ttl = DeploymentsListADRComponent.AUTO_DISMISS_ERROR;
                break;
        }
        this.toastService.showMessage('deployments-list', toastMessage);
        setTimeout(() => this.toastService.clearMessages('deployments-list'), ttl);
    }

    setGeneralZeroState() {
        this.zeroState.topText = 'You have no deployments.';
        this.zeroState.bottomText = 'Click "ADD A DEPLOYMENT" to create a deployment that specifies the assets you want to monitor.<br/>\
                     All deployments you create appear on this page.';
        this.zeroState.icon = 'language';
    }

    setApiDownZeroState() {
        this.isApiDown = true;
        this.zeroState.topText = 'Unable to fulfill request';
        this.zeroState.bottomText = 'Sorry, we are unable to process your request at this time.';
        this.zeroState.icon = 'report_problem';
    }

    reload() {
        this.ngOnInit();
    }

    private getDeleteMessageContent(reportSummary: AlAssetsManagerReportSummary): string {
        let text = "";
        if (reportSummary?.agent_count  && reportSummary?.appliance_count) {
            text = `Deleting this deployment will cause ${reportSummary?.agent_count} 
                    agent(s) and ${reportSummary?.appliance_count} appliance(s) to become orphaned.
                    The affected orphaned agent(s) and appliance(s) will no longer be part of your protection scope and will reduce visibility into security threats.`;
        } else if (reportSummary?.agent_count) {
            text = `Deleting this deployment will cause ${reportSummary?.agent_count} agent(s) to become orphaned.
            The affected orphaned agent(s) will no longer be part of your protection scope and will reduce visibility into security threats.`;
        } else if (reportSummary?.appliance_count) {
            text = `Deleting this deployment will cause ${reportSummary?.appliance_count} appliance(s) to become orphaned.
                    The affected orphaned appliance(s) will no longer be part of your protection scope and will reduce visibility into security threats.`;
        }
        return text;
    }
}
