/**
 * Remediation Details Component
 *
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import {  ErrorService, FilterDefinitionsService } from '../../services';
import { AlUiFilter } from '@al/ng-generic-components';
import { AlAssetsQueryClient, ExposureQueryResultItem, RemediationItemAsset, RemediationItemsFilter } from '@al/assets-query';
import { AlActingAccountChangedEvent, AlSession } from '@al/core';
import { AppConstants } from '../../constants';
import { IconMisc } from '../../types';
import { AlVulnerabilitiesClient, Remediation } from '@al/vulnerabilities';
import { AlBaseDetailViewComponent } from '../../al-base-detail-view/al-base-detail-view.component';
import { AlDeploymentsClient } from '@al/deployments';

@Component({
    selector: 'remediation-detail',
    templateUrl: './remediation-detail.component.html',
    styleUrls: ['./remediation-detail.component.scss']
})
export class RemediationDetailComponent extends AlBaseDetailViewComponent implements OnInit, OnDestroy {

    public filters: AlUiFilter[] = [];
    public deploymentIds: string[] = [];
    public remediationIds: string[] = [];
    public titles: { upperTitle: string, mainTitle: string, lowerTitle: string };
    public loadingData: boolean = true;
    public firstLoadFinished: boolean = false;
    public remediation: Remediation;
    public leftPanelDescriptor: AppConstants.LeftPanelDetailDescriptor = new AppConstants.LeftPanelDetailDescriptor();
    public showZeroState: boolean = false;
    private remediationId: string;
    private itemId: string;
    private auditId: string;
    private deploymentId: string;

    constructor(
        protected filterDefinitionsService: FilterDefinitionsService,
        public errorService: ErrorService
    ) {
        super();
    }

    ngOnInit() {
        this.subscriptions.manage( AlSession.notifyStream.attach(AlActingAccountChangedEvent, () => {
                this.alNavigationService.navigate.byNgRoute( [ 'exposure-management', 'remediations/open', this.accountId ] );
            })
        );
        this.accountId = AlSession.getActingAccountId();
        this.pageState = this.alNavigationService.routeData.pageData.state;
        this.selectedFilters = this.filtersUtilityService.getSelectedFiltersFromQueryParam();
        this.page = 'remediations';
        this.remediationId = this.alNavigationService.routeParams.remediationId;
        this.itemId = this.alNavigationService.routeParams.itemId;
        this.auditId = this.alNavigationService.routeParams.auditId;
        if(!this.auditId) {
            this.deploymentId = this.alNavigationService.routeParams.deploymentId;
        }
        this.loadData();

    }

    ngOnDestroy() {
        this.subscriptions.cancelAll();
    }

    loadData() {
        this.loadingData = true;
        if (this.pageState === AppConstants.PageConstant.Open) {
            this.loadRemediationDetail();
        } else { // Concluded OR Disposed
            this.loadRemediationItemDetail();
        }
        this.setToDefault();
    }

    async loadRemediationDetail() {
        this.remediationIds = [];
        this.deploymentIds = [];
        await this.filtersUtilityService.preLoadAdditonalAssetData(false);
        const exposuresQueryParams = this.filtersUtilityService.prepareExposuresByIdQueryParams(this.remediationId, this.selectedFilters, false);
        Promise.all([
            AlVulnerabilitiesClient.getRemediation(this.remediationId),
            AlAssetsQueryClient.queryExposures(this.accountId, exposuresQueryParams),
            AlDeploymentsClient.listDeployments(this.accountId),
        ])
        .then(responses => {
            this.remediation = responses[0];
            const exposures = responses[1];
            const deployments = responses[2];
            if(exposures.remediations.rows === 0) {
                console.log('No result found for given exposure query params, sending back to remediations list');
                this.onRemediationActionSuccess();
                return;
            }
            const remdiationItem = exposures.remediations.assets[0];
            if(remdiationItem.remediation_id){
                this.remediationIds.push(remdiationItem.remediation_id);
            }
            if(remdiationItem.deployment_ids){
                this.deploymentIds = exposures.remediations.assets[0].deployment_ids;
            }
            if(remdiationItem.deployment_id){
                this.deploymentIds.push(remdiationItem.deployment_id);
            }
            this.filtersUtilityService.populateAdditionalAssetsFromRemediationFilters(exposures.filters);
            this.filtersUtilityService.createDeploymentDictionary(deployments);
            this.filters = this.filterDefinitionsService.setFilterData(exposures.filters, this.selectedFilters);
            this.setupHeaderDetails(remdiationItem);
            this.setLeftPanelData(this.remediation);
            this.setViewData([remdiationItem]);
            this.loadingData = false;
            this.firstLoadFinished = true;
        }).catch(
          err => {
              this.showZeroState = true;
              this.loadingData = false;
              console.error(`No details found for remediation id ${this.remediation.id}. Reason: ${err}`);
              let notificationText = this.errorService.getMessage('exposures', 'generic', 'error_400');
              this.viewHelper.notifyError(notificationText, 0, false);
          }
      );
    }

    async loadRemediationItemDetail() {
        const remediationItemByIdQueryParams = this.filtersUtilityService.prepareRemediationItemByIdQueryParam(this.pageState, true, this.itemId, this.auditId, this.remediationId, null, this.deploymentId);
        Promise.all([
            this.filtersUtilityService.preLoadAdditonalAssetData(false),
            AlAssetsQueryClient.queryRemediationItems(this.accountId, remediationItemByIdQueryParams)
        ]).then(responses => {
            const remediationItemQueryResponse = responses[1];
            const deployments = responses[0];
            this.remediationItem = remediationItemQueryResponse["remediation-items"].assets[0];
            AlVulnerabilitiesClient.getRemediation(this.remediationItem.remediation.remediation_id).then(remediation => {
                this.remediation = remediation;
                this.showAllFutureAssets = this.remediationItemAppliesToFutureAssets(this.remediationItem);
                this.remediationItemAppliesToSpecificAssets = this.remediationItemAppliesToSelectedAssets(this.remediationItem);
                this.filtersUtilityService.populateAdditionalAssetsFromRemediationFilters((<RemediationItemsFilter[]>remediationItemQueryResponse.filters));
                this.setupHeaderDetails(this.remediationItem.remediation);
                this.setLeftPanelData(this.remediation);
                this.setViewData(remediationItemQueryResponse["remediation-items"].assets);
                this.leftPanelDescriptor.readOnlyFilter = this.filterDefinitionsService.setReadOnlyFilter((<RemediationItemsFilter[]>remediationItemQueryResponse.filters), deployments, this.remediationItem);
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
          console.error(`No details found for remediation item id ${this.remediationItem.item_id}. Reason: ${err}`);
          let notificationText = this.errorService.getMessage('exposures', 'generic', 'error_400');
          this.viewHelper.notifyError(notificationText, 0, false);
      });;

    }
    // TODO - use a better type!
    setupHeaderDetails(exposure) {
        this.titles = {
            upperTitle: `${this.filtersUtilityService.humanizeCategoriesList(exposure.categories)} Remediation`,
            mainTitle: exposure.name,
            lowerTitle: ''
        };
        this.actions = this.getActionButtons();
    }


    /**
     * Set the data for left panel
     * @param vulnerability
     */
    setLeftPanelData(remediation: Remediation) {
        this.leftPanelDescriptor.simplePanel = {
            description: 'Apply or remove filters below to narrow the list of affected assets or find more assets with this same remediation.'
        };
        this.leftPanelDescriptor.header = {
            type: 'remediation',
            icon: IconMisc.iconBuild,
            title: remediation.name
        };
    }

    /**
     * Set´s the details card information.
     * @param remediation Remediation item
     */
    setViewData(remediationItems: ExposureQueryResultItem[]) {
        this.exposuresList = this.filtersUtilityService.getExposuresForRemediation(remediationItems[0]);
        this.exposuresListFiltered = this.exposuresList;
        this.seupDetailsViewCardItems(remediationItems);
    }

}
