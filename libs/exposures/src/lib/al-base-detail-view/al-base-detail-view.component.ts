/**
 * AlBaseDetailViewComponent
 *
 * A base class implementation for our exposure and remediation item detail views
 *
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */
import {
    Component, ViewChild
} from '@angular/core';
import { AlNavigationService, AlUrlFilterService } from '@al/ng-navigation-components';
import { AssetDetail, Evidence, AlExposureConcludeComponent, AlExposureDisposeComponent, AffectedAssetDetails } from '@al/ng-asset-components';
import { AlFilterDescriptor, AlUiFilterValue, AlViewHelperComponent, TooltipConfig, AlTrackingMetricEventName, AlTrackingMetricEventCategory, AppInjector  } from '@al/ng-generic-components';
import { ExposureQueryResultItem, AlAssetsQueryClient, AssetTypeDictionary, ExposureVInstanceItem, HealthAssetDeployment, RemediationItemAsset, UndisposeRemediationsRequestBody } from '@al/assets-query';
import { FiltersUtilityService } from '../services';
import { AppConstants } from '../constants';
import { IconState } from '../types';
import { AlSubscriptionGroup } from '@al/core';

@Component({
    template: ''
})
export abstract class AlBaseDetailViewComponent {

    private itemsPerPage:number = 20;

    public cardStackFiltersConfig: AlFilterDescriptor = {
        filterValueIncrement: 10,
        filterValueLimit: 10,
        hideEmptyFilterValues: true,
        showToolTip: true,
        toolTipText: 'Exposure Instances',
        showHelpText:true,
        helpText: AppConstants.Characteritics.filterUserHelpText
    };
    public exposuresList: ExposureQueryResultItem[]=[];
    public exposureSelected: ExposureQueryResultItem;
    public exposuresListFiltered: ExposureQueryResultItem[]=[];
    public exposuresListFilteredSlice: ExposureQueryResultItem[]=[];

    public affectedAssets: AssetDetail[]= [];   // original assets hold
    public affectedAssetSelected: AssetDetail;
    public affectedAssetsFiltered: AssetDetail[]= [];   // filtered assets
    public affectedAssetsFilteredSlice: AssetDetail[]= [];  // filtered assets with slice

    public evidences: Evidence[]= [];
    public evidenceSelected: Evidence;
    public evidencesFiltered: Evidence[]= [];       // filtered assets
    public evidencesFilteredSlice: Evidence[]= [];  // filtered assets with slice

    public page: string;
    public accountId: string;
    public pageState: string;

    public actions: Array<{ icon: IconState, callback: Function, disable?: boolean, tooltip?: TooltipConfig }>;
    public selectedFilters: string[] = [];
    public selectedAssetfilters: string[] = [];

    public state = {
        showSelectAll: true,
        selectAll: false,
    };
    public allFutureAssetItem: AssetDetail = {
        name: 'All Future Assets',
        icon: "al al-asset",
        checked: false,
        tooltip:{
            showTooltip : true,
            tooltipText:'Select this option if you are disposing items and want all later assets that match the selected filters to be automatically disposed. Leave this option cleared if you are concluding items.'
        }
    };

    public showAllFutureAssets: boolean = false;
    public selectedAssetCount: number = 0;
    public affectedAssetDetail: AffectedAssetDetails = {
        selectedAssetCount: 0,
        allFutureAssetSelected: false,
    };

    public remediationItem: RemediationItemAsset;
    public restorationItemIds: string[] = [];
    public restoring = false;
    public readonly limitOfAssets:number = 1500; // Maximum Number of Assets
    public remediationItemAppliesToSpecificAssets = false;

    protected alNavigationService: AlNavigationService;
    protected alUrlFilterService: AlUrlFilterService;
    public filtersUtilityService: FiltersUtilityService;
    protected subscriptions = new AlSubscriptionGroup(null);

    @ViewChild("concludeAction") concludeAction: AlExposureConcludeComponent;
    @ViewChild("disposeAction") disposeAction: AlExposureDisposeComponent;
    @ViewChild('generalViewHelper') viewHelper: AlViewHelperComponent;

    constructor() {
      const injector = AppInjector.getInjector();
      this.alNavigationService = injector.get(AlNavigationService);
      this.alUrlFilterService = injector.get(AlUrlFilterService);
      this.filtersUtilityService = injector.get(FiltersUtilityService);
    }

    /**
     * Restore Remediation Items from Details Page
     * @param accountId string
     * @param remediationItemId string
     * @param page Exposures or Remediations
     */
    restoreRemediationItem() {
        this.restoring = true;
        this.actions[0].disable = true;


        if(this.remediationItem.applies_to_specific_assets) {
            // means its an older type remediation-item
            let deleteRemediationItemsParams = {};
            if(this.restorationItemIds.length > 0) {
                deleteRemediationItemsParams = {
                    remediation_item_ids: this.restorationItemIds.join()
                };
            } else {

                if(this.remediationItem.audit_id) {
                    deleteRemediationItemsParams = {
                        audit_ids: this.remediationItem.audit_id,
                        ...(this.remediationItem.vulnerability_id && {vulnerability_ids: this.remediationItem.vulnerability_id}),
                        ...(this.remediationItem.remediation_id && {remediation_ids: this.remediationItem.remediation_id})
                    };
                } else {
                    deleteRemediationItemsParams = {
                        remediation_item_ids: this.remediationItem.item_ids.join()
                    };
                }
            }
            AlAssetsQueryClient.undisposeRemediations( this.accountId, deleteRemediationItemsParams ).then(() => {
                this.restoring = false;
                this.actions[0].disable = false;
                this.alNavigationService.navigate.byNgRoute( [ 'exposure-management', this.page, this.pageState, this.accountId ] );

            });

        } else {
            let undisposeOperationParams: UndisposeRemediationsRequestBody = {};

            if(this.remediationItem.audit_id) {
                undisposeOperationParams = {
                    audit_ids: [this.remediationItem.audit_id],
                    ...(this.selectedAssetfilters.length > 0 && {filters: this.selectedAssetfilters}),
                    ...(this.remediationItem.vulnerability_id && {vulnerability_ids: [this.remediationItem.vulnerability_id]}),
                    ...(this.remediationItem.remediation_id && {remediation_ids: [this.remediationItem.remediation_id]})
                };

            } else {
                undisposeOperationParams = {
                    remediation_item_ids: this.remediationItem.item_ids
                };
            }
            AlAssetsQueryClient.undisposeRemediationItems( this.accountId, undisposeOperationParams ).then(() => {
                this.restoring = false;
                this.actions[0].disable = false;
                this.alNavigationService.navigate.byNgRoute( [ 'exposure-management', this.page, this.pageState, this.accountId ] );
            });
        }

    }

    filterExposures = (exposure:ExposureQueryResultItem): boolean => {
        if (this.affectedAssetSelected && !this.affectedAssetSelected.parentExposures.hasOwnProperty( exposure.vulnerability_id )){
            return false;
        }

        if (this.evidenceSelected && this.evidenceSelected.exposureId !== exposure.vulnerability_id) {
            return false;
        }
        return true;
    }

    filterAssets = (asset: AssetDetail): boolean => {
        if (this.exposureSelected && !asset.parentExposures.hasOwnProperty(this.exposureSelected.vulnerability_id)){
            return false;
        }

        if (this.evidenceSelected && this.evidenceSelected.assetKey !== asset.key) {
            return false;
        }
        return true;
    }

    filterEvidence = (evidence: Evidence): boolean => {
        if (this.exposureSelected && evidence.exposureId !== this.exposureSelected.vulnerability_id){
            return false;
        }

        if (this.affectedAssetSelected && this.affectedAssetSelected.key !== evidence.assetKey) {
            return false;
        }
        return true;
    }

   /**
    * Update the filter on slection of Asset/Evidence card
    * Also updated the backgropund color for asset cards and border color for evidence card on selection of evidence card
    */
    filterList = () => {

        this.exposuresListFiltered = this.exposuresList.filter(this.filterExposures);
        let filterAsset = this.affectedAssets.filter(this.filterAssets);

        this.affectedAssetsFiltered.map((affectedAsset) => {
            if (this.evidenceSelected) {
                if (this.affectedAssetSelected?.cardBackground === false) {
                    affectedAsset.cardBackground = false;
                } else {
                    affectedAsset.cardBackground = ((this.affectedAssetSelected?.cardBackground && affectedAsset.uniqueKey === this.affectedAssetSelected.uniqueKey) || (affectedAsset.uniqueKey === filterAsset[0].uniqueKey)) ? true : false;
                }
            } else {
                affectedAsset.cardBackground = false;
            }
        });
        this.evidencesFiltered.map((evidenceFilter) => {
            if (this.affectedAssetSelected?.cardBackground === false) {
                evidenceFilter.cardBorder = false;
                this.evidenceSelected = null;
            } else {
                evidenceFilter.cardBorder = (this.evidenceSelected && (this.evidenceSelected?.key === evidenceFilter.key)) ? true : false;
            }
        });

        this.evidencesFiltered = this.evidences.filter(this.filterEvidence);
        this.initialPagination();
    }

    initialPagination(){

        let assetLimit = this.itemsPerPage;
        let exposureLimit = this.itemsPerPage;
        let evidenceLimit = this.itemsPerPage;


        if (this.affectedAssetSelected) {
            assetLimit = Math.max(this.affectedAssetsFiltered.indexOf(this.affectedAssetSelected) + 1, this.itemsPerPage);
        }

        if (this.exposureSelected) {
            exposureLimit = Math.max(this.exposuresListFiltered.indexOf(this.exposureSelected) + 1, this.itemsPerPage);
        }

        if (this.evidenceSelected) {
            evidenceLimit = Math.max(this.evidencesFiltered.indexOf(this.evidenceSelected) + 1, this.itemsPerPage);
        }


        this.exposuresListFilteredSlice = this.exposuresListFiltered.slice(0, exposureLimit);
        this.affectedAssetsFilteredSlice = this.affectedAssetsFiltered.slice(0, assetLimit);
        this.evidencesFilteredSlice = this.evidencesFiltered.slice(0, evidenceLimit);
    }

    toggleAsset(asset:any){

        if (this.affectedAssetSelected !== asset) {
            this.affectedAssetSelected = asset;
        } else {
            this.affectedAssetSelected = null;
        }
        this.filterList();
    }

    toggleEvidence(evidence:any){

        if ( this.evidenceSelected !== evidence ) {
            this.evidenceSelected = evidence;
        } else {
            this.evidenceSelected = null;
        }
        this.filterList();
    }


    seeMoreAssets(){
        const assetsLength = this.affectedAssetsFilteredSlice.length;
        const incValue = Math.min(this.affectedAssetsFiltered.length - assetsLength, this.itemsPerPage);
        this.affectedAssetsFilteredSlice.splice(assetsLength,0,
            ...this.affectedAssetsFiltered.slice(assetsLength, assetsLength + incValue));
    }
    onRemediationActionSuccess() {
        const queryParams =  this.filtersUtilityService.clearCurrentFilterQueryParams();
        this.alNavigationService.navigate.byNgRoute( [ 'exposure-management', this.page, this.pageState, this.accountId ], {queryParams: queryParams} );
    }


    seeMoreEvidence(){
        const evidenceLength = this.evidencesFilteredSlice.length;
        const incValue = Math.min(this.evidencesFiltered.length - evidenceLength, this.itemsPerPage);
        this.evidencesFilteredSlice.splice(this.evidencesFilteredSlice.length,0,
            ...this.evidencesFiltered.slice(evidenceLength, evidenceLength + incValue));
    }

    seeMoreExposures(){
        const exposuresLength = this.exposuresListFilteredSlice.length;
        const incValue = Math.min(this.exposuresListFiltered.length - exposuresLength, this.itemsPerPage);
        this.exposuresListFilteredSlice.splice(this.exposuresListFilteredSlice.length,0,
            ...this.exposuresListFiltered.slice(exposuresLength, exposuresLength + incValue));
    }

    getAffectedAssets(exposuresQueryResults: ExposureQueryResultItem[], vulnerability_id?: string): {assets: AssetDetail[], evidences: Evidence[]} {
        let assets:AssetDetail[] = [];
        let assetDictionary: { [k: string]: any } = {};
        let evidences: Evidence[] = [];
        let evidenceDictionary = {};

        exposuresQueryResults.forEach(expQueryResult => {
            if(expQueryResult.exposures){
                expQueryResult.exposures.forEach(exp => {
                    this.getExposureAssets(assets, assetDictionary, exp.vinstances, vulnerability_id ? vulnerability_id : exp.vulnerability_id);
                    this.getEvidenceDetails(exp, evidences, evidenceDictionary);
                });
            } else {
                this.getExposureAssets(assets, assetDictionary, expQueryResult.vinstances, vulnerability_id);
                this.getEvidenceDetails(expQueryResult, evidences, evidenceDictionary);
            }
        });
        return {
            assets,
            evidences
        };
    }

    getExposureAssets(assets:AssetDetail[], assetDictionary: { [k: string]: any }, vInstances: ExposureVInstanceItem[], vulnerability_id: string) {
        const assetsWithRemediationItems = 0;
        vInstances.forEach(vinstance => {
            const target = vinstance.target;
            const targetKey = `${target.deployment_id}${target.key}`;
            if (assetDictionary.hasOwnProperty(targetKey)) {
                assets[assetDictionary[targetKey]].parentExposures[vulnerability_id] = true;
            }
            else {
                const asset = this.getAssetFromVInstance(vinstance, vulnerability_id);
                assetDictionary[targetKey] = assets.length;
                assets.push(asset);
            }
        });
    }

    /**
     * Returns an Asset entity from a VInstance and Exposure Id
     * @param vinstance VInstance
     * @param exposureId string
     */
    getAssetFromVInstance(vinstance: ExposureVInstanceItem, exposureId: string): AssetDetail {
        const asset: AssetDetail = { parentExposures: {} };
        asset.parentExposures[exposureId] = true;

        if (vinstance.target) {
            const targetDetails = vinstance.target;
            asset.key = targetDetails.key;
            asset.name = targetDetails.name ? targetDetails.name : targetDetails.key;
            asset.type = targetDetails.type;
            asset.accountId = targetDetails.account_id;
            asset.deploymentId = targetDetails.deployment_id;
            asset.uniqueKey = `${targetDetails.deployment_id}${targetDetails.key}`;
        } else {
            console.warn(`No target details found for vinstance - ${vinstance.key}`);
        }

        let typeExtra = AssetTypeDictionary.getType(asset.type);

        if (typeExtra.type !== '_default' && typeExtra.icon) {
            asset.icon = typeExtra.icon;
            asset.iconMt = typeExtra.iconMt;
        } else {
            asset.icon = "fa fa-question-circle";
            asset.iconMt = "";
        }
        if(vinstance.remediation_item_id) {
            asset.remediationItemId = vinstance.remediation_item_id;
        }
        if(this.remediationItemAppliesToSpecificAssets) {
            asset.checked = true;
        }
        return asset;
    }

    getEvidenceDetails(exposure: ExposureQueryResultItem, evidences: Evidence[], evidenceDictionary) {
        exposure.vinstances.forEach(vinstance => {
            if (vinstance.hasOwnProperty('details')) {
                const target = vinstance.target;
                const targetKey = `${target.deployment_id}${vinstance.key}`;
                if (!evidenceDictionary.hasOwnProperty(targetKey)) {
                    evidenceDictionary[targetKey] = null;
                    evidences.push({
                        accountId: exposure.account_id,
                        key: targetKey,
                        assetKey: target.key,
                        exposureId: exposure.vulnerability_id,
                        evidence: vinstance.details
                    });
                }
                else {
                    console.warn('A duplicated evidence entry was found for - ' + targetKey);
                }
            }
        });
    }

    seupDetailsViewCardItems(exposures: ExposureQueryResultItem[]) {
        const assetsWithEvidence = this.getAffectedAssets(exposures, this.page === 'exposures' ? exposures[0].vulnerability_id: null);
        this.affectedAssets = assetsWithEvidence.assets;
        this.evidences = assetsWithEvidence.evidences;
        this.affectedAssetsFiltered = this.affectedAssets;
        this.evidencesFiltered = this.evidences;
        this.initialPagination();
    }

    loadData() {
        // override this method in both component
    }

    getActionButtons() {
        let tooltipText ='Select at least one affected asset';
        if (this.pageState === AppConstants.PageConstant.Open) {
            return [
                {
                    icon: IconState.iconDispose,
                    callback: () => {
                        this.openDispose();
                    },
                    disable: true,
                    tooltip: {
                        showTooltip: true,
                        tooltipText: tooltipText
                    }
                },
                {
                    icon: IconState.iconConclude,
                    callback: () => {
                        this.openConclude();
                    },
                    disable: true,
                    tooltip: {
                        showTooltip: true,
                        tooltipText: tooltipText
                    }
                }
            ];
        } // Concluded OR Disposed
        return [
            {
                icon: IconState.iconRestore,
                callback: () => {
                    this.restoreRemediationItem();
                },
                disable: false,
                tooltip: {}
            }
        ];

    }
    /**
     * Open the form for conclude
     */
    openConclude = () => {
        this.concludeAction.rightDrawer.open();
    }

    /**
     * Open the form for dispose
     */
    openDispose = () => {
        this.disposeAction.rightDrawer.open();
    }


    /**
     * Set the selected filter and make a api call to load the data with selected filter
     * @param vDescriptor
     */
    public setActiveFilter(vDescriptor: AlUiFilterValue) {
        if (vDescriptor.activeFilter) {
            this.selectedFilters = (<string[]>this.filtersUtilityService.unSelectFilter(this.selectedFilters, vDescriptor.property,vDescriptor.value));
        }
        else {
            this.selectedFilters.push(vDescriptor.property + ":" + vDescriptor.value);
        }
        this.filtersUtilityService.updateFiltersInUrl(this.alUrlFilterService.fromSelectedFilters(this.selectedFilters));
        this.setHelpText();
        this.loadData();
    }


    /**
     * On click of clear filter set selected filter empty and make api call
     */
    public clearAllFilters() {
        this.selectedFilters = [];
        this.filtersUtilityService.updateFiltersInUrl(this.alUrlFilterService.fromSelectedFilters(this.selectedFilters));
        this.setHelpText();
        this.loadData();
    }

    public selectAllValues() {

        this.selectedAssetfilters = [];
        if (this.state.selectAll) {
            this.showAllFutureAssets = this.state.selectAll;
            this.selectedAssetCount = this.affectedAssetsFiltered.length;
        }
        else {
            this.selectedAssetCount = 0;
            this.allFutureAssetItem.checked = this.state.selectAll;
        }
        const affectedAssetsTemp = [...this.affectedAssetsFiltered];
        affectedAssetsTemp.map(affectedAssetsFilter => {
            affectedAssetsFilter.checked = this.state.selectAll;

        });
        this.affectedAssetsFiltered = [...affectedAssetsTemp];
        this.setAffectedAssetFilters(this.affectedAssetsFiltered);
        this.enableDisableActionButtons();

        if(this.pageState !== 'open') {
            this.restorationItemIds = this.state.selectAll ? [...this.remediationItem.item_ids] : [];
        }

    }

    public toggleAssetItemChecked(assetDetailsItem: AssetDetail) {

        if(this.allFutureAssetItem.checked && !assetDetailsItem.checked) {
            this.setAffectedAssetFilters(this.affectedAssetsFiltered);
        }
        if (this.state.selectAll) {
            this.state.selectAll = assetDetailsItem.checked;
            this.allFutureAssetItem.checked = assetDetailsItem.checked;
        }

        const affectedAssetsTemp = [...this.affectedAssetsFiltered];
        let newAffectedAssetCount = 0;
        affectedAssetsTemp.map(affectedAssetsFilter => {
            if (affectedAssetsFilter.uniqueKey === assetDetailsItem.uniqueKey) {
                affectedAssetsFilter.checked = assetDetailsItem.checked;
                newAffectedAssetCount = affectedAssetsFilter.checked ? this.selectedAssetCount + 1 : this.selectedAssetCount - 1;
            }
        });
        this.selectedAssetCount = newAffectedAssetCount;
        this.affectedAssetsFiltered = [...affectedAssetsTemp];
        this.setAffectedAssetFilters(assetDetailsItem);
        this.enableDisableActionButtons();
    }
    public toggleAllFutureAssetCheck(assetDetailsItem: AssetDetail) {
        this.selectedAssetfilters = [];
        if (assetDetailsItem.checked) {
            this.selectedAssetCount = this.affectedAssetsFiltered.length;
            this.state.selectAll = assetDetailsItem.checked;
        }

        const affectedAssetsTemp = [...this.affectedAssetsFiltered];
        affectedAssetsTemp.map(affetectedAsset => {
            affetectedAsset.checked = assetDetailsItem.checked ? assetDetailsItem.checked: affetectedAsset.checked;

        });
        this.affectedAssetsFiltered = [...affectedAssetsTemp];
        this.setAffectedAssetFilters(this.affectedAssetsFiltered, assetDetailsItem.checked);

        this.affectedAssetDetail.allFutureAssetSelected = assetDetailsItem.checked;
        this.enableDisableActionButtons();
         if(this.affectedAssetDetail.allFutureAssetSelected){
            this.actions[1].disable =true;
            this.actions[1].tooltip.showTooltip = true;
            this.actions[1].tooltip.tooltipText='Future assets cannot be concluded. Clear “All Future Assets” and try again.';
         }
        // Sending metrics to Google Analytics
        this.alNavigationService.track(AlTrackingMetricEventName.UsageTrackingEvent, {
            category: AlTrackingMetricEventCategory.ExposuresAction,
            action: 'Event Click',
            label: "Select All Future Assets on "+this.page+"/"+this.pageState+" Details Page"
        });

    }


    public setToDefault() {
        if (this.state.selectAll || this.allFutureAssetItem.checked || this.selectedAssetCount) {
            this.state.selectAll = false;
            this.allFutureAssetItem.checked = false;
            this.selectedAssetCount = 0;
            this.selectedAssetfilters = [];
            this.affectedAssetDetail.allFutureAssetSelected = false;
        }
         this.setHelpText();
    }

    public remediationItemAppliesToFutureAssets(remediationItem: RemediationItemAsset) {
        return remediationItem.applies_to_specific_assets === false || remediationItem.filter_match_mode === 'all';
    }

    public remediationItemAppliesToSelectedAssets(remediationItem: RemediationItemAsset) {
        return remediationItem.applies_to_specific_assets === true || remediationItem.filter_match_mode === 'any';
    }

    private enableDisableActionButtons() {
        this.affectedAssetDetail.selectedAssetCount = this.selectedAssetCount;
        this.actions.map((actionButton) => {
            if (this.allFutureAssetItem.checked || (this.selectedAssetCount > 0 && this.selectedAssetCount < this.limitOfAssets )) {
                actionButton.disable = false;
                actionButton.tooltip.showTooltip = false;
            }
            else {
                actionButton.disable = true;
                actionButton.tooltip.showTooltip = true;
                actionButton.tooltip.tooltipText = this.selectedAssetCount < this.limitOfAssets ? 'Select at least one affected asset':'Select up to 1,500 assets.';
            }
        });
        if(!this.viewHelper) {
            return;
        }
        if(this.selectedAssetfilters.length >= this.limitOfAssets) {
            this.viewHelper.notifyError('Dispose or conclude actions can be performed on only 1,500 assets at a time. Select the "All Future Assets" option (dispose actions only), select fewer assets, or update filters to narrow the list of affected assets.', 0, true);
        } else {
            this.viewHelper.cleanNotifications();
        }
    }

    private setAffectedAssetFilters(assetDetail:AssetDetail | AssetDetail[],allFutureAssets?:boolean) {

        if (allFutureAssets) {
            this.selectedAssetfilters = [...this.selectedFilters];
        }
        else if(Array.isArray(assetDetail)){
            if(this.state.selectAll) {
                assetDetail.map(detail => this.selectedAssetfilters.push(`${detail.type}:${detail.key}`));
            } else {
                this.selectedAssetfilters = [];
            }
        } else {
            if (assetDetail.checked) {
                this.selectedAssetfilters.push(`${assetDetail.type}:${assetDetail.key}`);
            }
            else if(this.selectedAssetfilters.length>0){
                this.filtersUtilityService.unSelectFilter(this.selectedAssetfilters, assetDetail.type, assetDetail.key);
            }
        }
    }

    setHelpText() {
        const state = this.alNavigationService.routeData.pageData.state;
        this.cardStackFiltersConfig.showHelpText = state === 'open'? true :false;
        const deploymentIdFilter = this.selectedFilters.find(filter => filter.includes('deployment_id'));
        this.cardStackFiltersConfig.showHelpText = deploymentIdFilter === undefined && state === 'open';
        this.cardStackFiltersConfig = { ...this.cardStackFiltersConfig };
    }

}
