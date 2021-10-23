import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { NgNavigationModule } from '@al/ng-navigation-components';

import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { NgCardstackModule } from '@al/ng-cardstack-components';
import { NgGenericComponentsModule } from '@al/ng-generic-components';
import { TabViewModule } from 'primeng/tabview';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SlideMenuModule } from 'primeng/slidemenu';

/**
 * Components
 */
import { AlFilterByValuePipe } from './pipes';
import { ScanSchedulerUtilityService } from './services/scan-scheduler-utility.service';

import { DeploymentConfigurationComponent } from './components/deployment-configuration/deployment-configuration.component';
import { DeploymentsListADRComponent } from './components/deployment-list/deployment-list.component';
import { DeploymentAssetsManagerDeleteDialogComponent } from './components/deployment-assets-manager-delete-dialog/deployment-assets-manager-delete-dialog.component';
/*
import { DeploymentConfigurationAwsModeComponent } from './components/deployment-configuration-aws-mode/deployment-configuration-aws-mode.component';
import { DeploymentDiscoveryComponent } from './components/deployment-discovery/deployment-discovery.component';
import { DeploymentScopeProtectionComponent } from './components/deployment-scope-protection/deployment-scope-protection.component';
import { DeploymentProtectionOptionsComponent } from './components/deployment-protection-options/deployment-protection-options.component';
import { DeploymentApplicationLogsComponent } from './components/deployment-application-logs/deployment-application-logs.component';
import { DeploymentApplicationLogsCreateRuleFormComponent } from './components/deployment-application-logs-create-rule-form/deployment-application-logs-create-rule-form.component';
import { DeploymentApplicationLogsAddScopeRuleFormComponent } from './components/deployment-application-logs-add-scope-rule-form/deployment-application-logs-add-scope-rule-form.component';
import { DeploymentSettingUpRoleComponent } from './components/deployment-setting-up-role/deployment-setting-up-role.component';
import { DeploymentConfigurationAwsRoleComponent } from './components/deployment-configuration-aws-role/deployment-configuration-aws-role.component';
import { SourcesListComponent } from './components/assets/sources/sources-list/sources-list.component';
import { DeploymentExclusionsComponent } from './components/deployment-exclusions/deployment-exclusions.component';
import { DeploymentAzureRoleComponent } from './components/deployment-azure-role/deployment-azure-role.component';
import { DeploymentDatacenterNetworkFormComponent } from './components/deployment-datacenter-network-form/deployment-datacenter-network-form.component';
import { DeploymentInstallationInstructionsComponent } from './components/deployment-installation-instructions/deployment-installation-instructions.component';
import { DeploymentDatacenterSubnetFormComponent } from './components/deployment-datacenter-subnet-form/deployment-datacenter-subnet-form.component';
import { ApplicationLogCardComponent } from './components/application-log-card/application-log-card.component';
import { AlBlackCardComponent } from './components/al-black-card/al-black-card.component';
import { AlBoxesSelectorComponent } from './components/al-boxes-selector/al-boxes-selector.component';
import { AlDeploymentHeaderComponent } from './components/al-deployment-header/al-deployment-header.component';
import { AlDeploymentNameComponent } from './components/al-deployment-name/al-deployment-name.component';
import { AlExpandableMenuComponent, AlExpandableMenuFooterDirective } from './components/al-expandable-menu/al-expandable-menu.component';
import { AlTimeInputDeprecatedComponent } from './components/al-time-input-deprecated/al-time-input-deprecated.component';
import { AlTimeInputComponent } from './components/al-time-input/al-time-input.component';
import { AlProtectionBreakdownComponent } from './components/al-protection-breakdown/al-protection-breakdown.component';
import { DeploymentSystemLogsComponent } from './components/deployment-system-logs/deployment-system-logs.component';
import { SystemLogCardComponent } from './components/system-log-card/system-log-card.component';
import { DeploymentFimComponent } from './components/deployment-fim/deployment-fim.component';
import { DeploymentFimFormComponent } from './components/deployment-fim-form/deployment-fim-form.component';
import { DeploymentFimCardComponent } from './components/deployment-fim-card/deployment-fim-card.component';
import { DeploymentAdvancedSchedulingComponent } from './components/deployment-advanced-scheduling/deployment-advanced-scheduling.component';
import { DeploymentSystemLogsCreateRuleFormComponent } from './components/deployment-system-logs-create-rule-form/deployment-system-logs-create-rule-form.component';

import { AlAdvancedSchedulingFormComponent } from './components/al-advanced-scheduling-form/al-advanced-scheduling-form.component';
import { AlScanWindowComponent } from './components/al-scan-window/al-scan-window.component';
import { AlScanScopeIprangesCidrsComponent } from './components/al-scan-scope-ipranges-cidrs/al-scan-scope-ipranges-cidrs.component';
import { DeploymentFimBulkEditScopeFormComponent } from './components/deployment-fim-bulk-edit-scope-form/deployment-fim-bulk-edit-scope-form.component';
*/

/** Components */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild( FtrMdrDeploymentsModule.children ),
        NgNavigationModule,
        DialogModule,
        DropdownModule,
        NgCardstackModule,
        CheckboxModule,
        TooltipModule,
        NgGenericComponentsModule,
        TabViewModule,
        RadioButtonModule,
        InputSwitchModule,
        InputTextModule,
        ButtonModule,
        InputTextareaModule,
        ConfirmDialogModule,
        CalendarModule,
        SelectButtonModule,
        AutoCompleteModule,
        SlideMenuModule
    ],
    declarations: [
        DeploymentConfigurationComponent,
        DeploymentsListADRComponent,
        DeploymentAssetsManagerDeleteDialogComponent,
        /*
        DeploymentConfigurationAwsModeComponent,
        DeploymentDiscoveryComponent,
        DeploymentScopeProtectionComponent,
        DeploymentProtectionOptionsComponent,
        DeploymentApplicationLogsComponent,
        DeploymentApplicationLogsCreateRuleFormComponent,
        DeploymentFimFormComponent,
        DeploymentSettingUpRoleComponent,
        DeploymentConfigurationAwsRoleComponent,
        SourcesListComponent,
        DeploymentExclusionsComponent,
        DeploymentAzureRoleComponent,
        DeploymentDatacenterNetworkFormComponent,
        DeploymentInstallationInstructionsComponent,
        DeploymentDatacenterSubnetFormComponent,
        DeploymentSystemLogsComponent,
        SystemLogCardComponent,
        DeploymentSystemLogsCreateRuleFormComponent,
        ApplicationLogCardComponent,
        DeploymentApplicationLogsAddScopeRuleFormComponent,
        AlBlackCardComponent,
        AlBoxesSelectorComponent,
        AlDeploymentHeaderComponent,
        AlDeploymentNameComponent,
        AlExpandableMenuComponent,
        AlExpandableMenuFooterDirective,
        AlTimeInputDeprecatedComponent,
        AlTimeInputComponent,
        AlProtectionBreakdownComponent,
        DeploymentFimComponent,
        DeploymentFimBulkEditScopeFormComponent,
        DeploymentFimCardComponent,
        AlAdvancedSchedulingFormComponent,
        DeploymentAdvancedSchedulingComponent,
        AlFilterByValuePipe,
        AlScanWindowComponent,
        AlScanScopeIprangesCidrsComponent
        */
    ],
    providers: [AlFilterByValuePipe, ScanSchedulerUtilityService]
})
export class FtrMdrDeploymentsModule {
    public static children:Route[] = [
        {
            path: ':accountId',
            component: DeploymentsListADRComponent,
            data: {
                pageViewTitle: 'Configuration | Deployments'
            }
        },
        {
            path: 'aws/:accountId/:id',
            component: DeploymentConfigurationComponent,
            data: {
                pageViewTitle: 'Configuration | Deployments | AWS Deployment Configuration',
                configType: 'aws'
            }
        },
        {
            path: 'datacenter/:accountId/:id',
            component: DeploymentConfigurationComponent,
            data: {
                pageViewTitle: 'Configuration | Deployments | Datacenter Deployment Configuration',
                configType: 'datacenter'
            }
        },
        {
            path: 'azure/:accountId/:id',
            component: DeploymentConfigurationComponent,
            data: {
                pageViewTitle: 'Configuration | Deployments | Azure Deployment Configuration',
                configType: 'azure'
            }
        }
    ];
}

