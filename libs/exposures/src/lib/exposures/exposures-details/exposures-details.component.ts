import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FilterDefinitionsService, ErrorService } from '../../services';
import { AlUiFilter, AlViewHelperComponent } from '@al/ng-generic-components';
import { AlDeploymentsClient } from '@al/deployments';
import { AlAssetsQueryClient, ExposureQueryResultItem, RemediationItemAsset, RemediationItemsFilter } from '@al/assets-query';
import { IconBase, IconSeverity } from '../../types/icons.types';
import { AppConstants } from '../../constants';
import { AlVulnerabilitiesClient, Vulnerability } from '@al/vulnerabilities';
import { AlBaseDetailViewComponent } from '../../al-base-detail-view/al-base-detail-view.component';
import { AlActingAccountChangedEvent, AlSession } from '@al/core';

@Component({
    selector: 'exposures-details',
    templateUrl: './exposures-details.component.html',
    styleUrls: ['./exposures-details.component.scss']
})
export class ExposuresDetailsComponent extends AlBaseDetailViewComponent implements OnInit, OnDestroy {

    public accountId: string;
    public deploymentId: string;
    public exposureId: string;
    public vulnerabilityId: string;
    public filters: AlUiFilter[] = [];
    public showZeroState: boolean = false;
    public loadingData: boolean = true;
    public firstLoadFinished: boolean = false;
    public vulnerabililty: Vulnerability;

    public exposure: ExposureQueryResultItem;
    public leftPanelDescriptor: AppConstants.LeftPanelDetailDescriptor = new AppConstants.LeftPanelDetailDescriptor();

    public loadingRemainder: boolean = false;
    public exposureRemainder = 0;

    public headerIcon: IconBase;
    public titles: { upperTitle: string, mainTitle: string, lowerTitle: string };
    public vulnerabilityIds: string[] = [];
    public deploymentIds: string[] = [];
    public threatScore:number;
    private auditId: string;
    private itemId: string;

    @ViewChild('generalViewHelper') viewHelper: AlViewHelperComponent;

    constructor(
        protected filterDefinitionsService: FilterDefinitionsService,
        public errorService: ErrorService,
    ) {
        super();
     }

    ngOnInit(): void {

        this.subscriptions.manage( AlSession.notifyStream.attach(AlActingAccountChangedEvent, () => {
                this.alNavigationService.navigate.byNgRoute( [ 'exposure-management', 'exposures/open', this.accountId ] );
            })
        );

        this.accountId = this.alNavigationService.routeParams.accountId;
        this.exposureId = this.alNavigationService.routeParams.exposureId;
        this.pageState = this.alNavigationService.routeData.pageData.state;
        this.page = 'exposures';
        this.vulnerabilityId = this.alNavigationService.routeParams.vulnerabilityId;
        this.auditId = this.alNavigationService.routeParams.auditId;
        if(!this.auditId) {
            this.deploymentId = this.alNavigationService.routeParams.deploymentId;
        }
        this.itemId = this.alNavigationService.routeParams.itemId;
        this.selectedFilters = this.filtersUtilityService.getSelectedFiltersFromQueryParam();
        this.loadData();

    }

    ngOnDestroy() {
        this.subscriptions.cancelAll();
    }


    private setupHeaderDetails(vulnerability: Vulnerability, exposure: ExposureQueryResultItem) {
        this.titles = {
            upperTitle: `${this.filtersUtilityService.humanizeCategoriesList(exposure.categories)} Exposure`,
            mainTitle: exposure.name,
            lowerTitle: ''
        };
        this.headerIcon = IconSeverity.getIconColorBySeverity(vulnerability.severity.toLowerCase());
        this.actions = this.getActionButtons();
    }


    loadData() {
        this.loadingData = true;
        if (this.pageState === AppConstants.PageConstant.Open) {
            this.loadExposureDetail();
        } else { // Concluded OR Disposed
            this.loadRemediationItemDetail();
        }

        this.setToDefault();
    }

    loadExposureDetail() {
        this.vulnerabilityIds = [];
        this.deploymentIds = [];
        const exposuresQueryParams = this.filtersUtilityService.prepareExposuresByIdQueryParams(this.exposureId, this.selectedFilters, true);
        Promise.all([
            AlVulnerabilitiesClient.getVulnerability(this.exposureId),
            AlAssetsQueryClient.queryExposures(this.accountId, exposuresQueryParams),
            AlDeploymentsClient.listDeployments(this.accountId),
        ]).then(responses => {
            const vulnerability: Vulnerability = responses[0];
            const exposure = responses[1].exposures.assets[0];
            const deployments = responses[2];

             if(exposure.deployment_ids){
                 this.deploymentIds = exposure.deployment_ids;
             }
             if(exposure.deployment_id){
                this.deploymentIds.push(exposure.deployment_id);
            }
             if(exposure.vulnerability_id){
                this.vulnerabilityIds.push(exposure.vulnerability_id);
             }
            this.filtersUtilityService.populateAdditionalAssetsFromRemediationFilters(responses[1].filters);
            this.filtersUtilityService.createDeploymentDictionary(deployments);
            this.filters = this.filterDefinitionsService.setFilterData(responses[1].filters, this.selectedFilters);
            this.setViewData(vulnerability, responses[1].exposures.assets);
            this.setupHeaderDetails(vulnerability, exposure);
            this.setLeftPanelData(vulnerability);
            this.setRemainder(vulnerability);
            this.loadingData = false;
            this.firstLoadFinished = true;
        }).catch(
            err => {
                this.showZeroState = true;
                this.loadingData = false;
                console.error(`No details found for  exposure id ${this.exposureId}. Reason: ${err}`);
                let notificationText = this.errorService.getMessage('exposures', 'generic', 'error_400');
                this.viewHelper.notifyError(notificationText, 0, false);
            }
        );
    }


    /**
     * This function load all data necessary for display Remediation Item details view
     */
    loadRemediationItemDetail() {
        const remediationItemByIdQueryParams = this.filtersUtilityService.prepareRemediationItemByIdQueryParam(this.pageState, true, this.itemId, this.auditId, null, this.vulnerabilityId, this.deploymentId);
        Promise.all([
            AlDeploymentsClient.listDeployments(this.accountId),
            AlAssetsQueryClient.queryRemediationItems(this.accountId, remediationItemByIdQueryParams)

        ]).then(responses => {
            const deployments = responses[0];
            const remediationItemResponse = responses[1];
            const remediationItem: RemediationItemAsset = remediationItemResponse['remediation-items'].assets[0];
            if(!this.vulnerabilityId) {
                this.vulnerabilityId = remediationItem['vulnerability_id'];
            }
            AlVulnerabilitiesClient.getVulnerability(this.vulnerabilityId).then(vulnerability => {
                const remediationItemFilters = (<RemediationItemsFilter[]>remediationItemResponse.filters);
                let exposure: ExposureQueryResultItem;
                if (remediationItem.exposures.length > 0) {
                    exposure = remediationItem.exposures[0];
                }
                this.showAllFutureAssets = this.remediationItemAppliesToFutureAssets(remediationItem);
                this.remediationItemAppliesToSpecificAssets = this.remediationItemAppliesToSelectedAssets(remediationItem);
                this.setViewData(vulnerability, remediationItemResponse['remediation-items'].assets, remediationItem);
                this.setupHeaderDetails(vulnerability, exposure);
                this.setLeftPanelData(vulnerability);
                this.filtersUtilityService.populateAdditionalAssetsFromRemediationFilters(remediationItemFilters);
                this.leftPanelDescriptor.readOnlyFilter = this.filterDefinitionsService.setReadOnlyFilter(remediationItemFilters, deployments, remediationItem);
                this.loadingData = false;
                this.firstLoadFinished = true;
                if(this.remediationItemAppliesToSpecificAssets) {
                    this.state.selectAll = true;
                    this.selectAllValues();
                }
            });

        }).catch(err => {
            this.showZeroState = true;
            this.loadingData = false;
            console.error(`No details found for  vulnerability id ${this.vulnerabilityId}. Reason: ${err}`);
            let notificationText = this.errorService.getMessage('exposures', 'generic', 'error_400');
            this.viewHelper.notifyError(notificationText, 0, false);
        });
    }

    /**
     * Set the data for left panel
     * @param vulnerability
     */
    setLeftPanelData(vulnerability: Vulnerability) {
        this.leftPanelDescriptor.simplePanel = {
            description: 'Apply or remove filters below to narrow the list of affected assets or find more assets with this same exposure.'
        };
        this.leftPanelDescriptor.header = {
            type: 'exposure',
            icon: IconSeverity.getIconBySeverity(vulnerability.severity.toLowerCase()),
            title: vulnerability.description
        };
    }

    /**
     * Set the value for vulnerability,exposure and remediationItem if exist to render detail information on page
     * @param vulnerability
     * @param exposure
     * @param remediationItem
     */
    setViewData(vulnerability: Vulnerability, exposures: ExposureQueryResultItem[], remediationItem?: RemediationItemAsset) {
        const exposure = exposures[0];
        this.vulnerabililty = vulnerability;
        this.vulnerabililty.severity = vulnerability.severity.toLowerCase();
        this.vulnerabililty.cvss_vector = exposure.threat_vector ? exposure.threat_vector: '';
        this.threatScore = exposure?.threat_score;
        this.exposure = exposure;
        if (remediationItem) {
            this.remediationItem = remediationItem;
        }
        this.seupDetailsViewCardItems(exposures);

    }

    /**
     * navigate to the Remediation Details page of an exposure
     */
    goToRemediation = () => {
        this.alNavigationService.navigate.byNgRoute([ 'exposure-management', 'remediations/open', this.accountId, this.vulnerabililty.remediation_id]);
    }

    /**
     * This function sets the value for this.exposureRemainder attribute
     */
    setRemainder(vulnerability: Vulnerability) {
        this.loadingRemainder = true;
        const exposuresQueryParams = this.filtersUtilityService.prepareExposuresByIdQueryParams(vulnerability.remediation_id, [], false);
        AlAssetsQueryClient.queryExposures(this.accountId, exposuresQueryParams).then(
            exposureResponse => {
                this.exposureRemainder = exposureResponse.remediations.assets.length - 1;
                this.loadingRemainder = false;
            }
        ).catch(err => {
            this.loadingRemainder = false;
            console.error(`No exposures found for remediation id ${vulnerability.remediation_id}. Reason: ${err}`);
        });
    }

}
