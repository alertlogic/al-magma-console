/**
 * AlBaseViewExposuresComponent
 *
 * This component consolidate a base for all different exposures cardstack views,
 * to centralize snackbar bulk selection operations across the multiple views.
 *
 * @author Gisler Garcés <ggarces@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */
import {
    Component,
    ViewChild,
    AfterViewInit
} from '@angular/core';
import {
    AlBaseCardItem,
    AlCardstackComponent
} from '@al/ng-cardstack-components';
import { AIMSUser, AlCabinet, AlCardstackItem, AlCardstackItemProperties, AlCardstackPropertyDescriptor, AlCardstackValueDescriptor } from '@al/core';
import {
    AlActionSnackbarElement,
    AlActionSnackbarEvent,
    AlToastMessage,
    AlUiFilterValue,
    AppInjector,
} from '@al/ng-generic-components';
import { FiltersUtilityService, FilterDefinitionsService } from '../services';
import { AlFileDownloadService } from '@al/ng-generic-components';
import { ExposureQueryResultItem, AlAssetsQueryClient, RemediationItemAsset, ExposureVInstanceItem, UndisposeRemediationsRequestBody } from '@al/assets-query';
import { AlSession, AlLocation } from '@al/core';
import { AlUrlFilterService, AlNavigationService, AlNavigateOptions } from '@al/ng-navigation-components';
import { ExposuresByRemediation, IZeroState } from '../types';

import { AppConstants } from '../constants';
import { AlExposureConcludeComponent, AlExposureDisposeComponent, AffectedAssetDetails } from '@al/ng-asset-components';
import { AlToastService, AlTrackingMetricEventName, AlTrackingMetricEventCategory } from '@al/ng-generic-components';

import { TutorialComponent } from '../tutorial/tutorial.component';
import { NavigationExtras } from '@angular/router';
import { AlDeploymentsClient, Deployment } from '@al/deployments';

@Component({
    template: ''
})
export abstract class AlBaseViewExposuresComponent implements AfterViewInit{

    public accountId: string;
    public allCardsChecked: boolean = false;
    public storage: AlCabinet = AlCabinet.persistent('o3-exposures.state');
    // Action snackbar variables
    public actionSnackbarText = '';
    public actionSnackbarVisible = false;
    public actionSnackbarButtons: AlActionSnackbarElement[] = [
        {
            event: "dispose",
            icon: "block",
            text: "DISPOSE",
            visible: true,
            type: 'button',
        },
        {
            event: "conclude",
            icon: "check",
            text: "CONCLUDE",
            visible: true,
            type: 'button',
        },
        {
            event: "restore",
            icon: "restore",
            text: "RESTORE",
            visible: false,
            type: 'button',
        },
        {
            event: "export",
            icon: "get_app",
            text: "EXPORT",
            visible: true,
            type: 'button',
        }
    ];
    public zeroState:IZeroState = {
        active: false,
        isAlertLogicIcon: false,
        icon: "warning",
        title: ``,
        description: ``,
        hasDeployments: false
    };

    // public dialogRef: MatDialogRef<TutorialComponent>;
    @ViewChild(AlCardstackComponent)
    public alCardstack!: AlCardstackComponent;
    public alDownloadCsvService: AlFileDownloadService = new AlFileDownloadService();
    private exportFileName: string = "exposures.csv";
    public currentSelection: Array<AlCardstackItem<any, AlCardstackItemProperties>> = [];
    public viewName: string;
    public selectedItemDeploymentIds: string[] = [];
    public selectedItemIds: string[] = [];
    public selectedItemAuditIds: string[] = [];
    public selectedItemVulnerabilityIds: string[] = [];
    public selectedItemRemediationIds: string[] = [];
    public selectedItemRemediationItemIds: string[] = [];
    public selectedFilters: string[] = [];
    public affectedAssetDetail: AffectedAssetDetails = {
        selectedAssetCount: 0,
        allFutureAssetSelected: false,
    };
    public actionInProgress = false;

    protected filterUtilityService: FiltersUtilityService;
    protected filterDefinitionsService: FilterDefinitionsService;
    protected alUrlFilterService: AlUrlFilterService;
    protected alNavigationService: AlNavigationService;
    protected alToastService: AlToastService;

    @ViewChild(AlExposureConcludeComponent) concludeAction: AlExposureConcludeComponent;
    @ViewChild(AlExposureDisposeComponent) disposeAction: AlExposureDisposeComponent;

    // protected dialog: MatDialog;
    constructor(

    ) {
        const injector = AppInjector.getInjector();
        this.filterUtilityService = injector.get(FiltersUtilityService);
        this.filterDefinitionsService = injector.get(FilterDefinitionsService);
        this.alUrlFilterService = injector.get(AlUrlFilterService);
        this.alNavigationService = injector.get(AlNavigationService);
        this.alToastService = injector.get(AlToastService);
    }

    /**
     * When the user selects another view.
     * @param viewName The view name.
     */
    public onViewChanged(viewName: string) {
        this.filterUtilityService.navigateToNamedRoute(viewName);
    }

    /**
     * When the user selects the sort by.
     * @param sortBy The sort by input.
     */
    public onSortBy( sortBy:string ) {
        let sortByLabel:string = "";
        switch (sortBy) {
            case 'threatiness':
                sortByLabel = "TRI score";
                break;
            case 'vinstances_count':
                sortByLabel = "Exposure Instances";
                break;
            case 'affected_asset_count':
                sortByLabel = "Affected Assets";
                break;
            case 'caption':
                sortByLabel = "Name";
                break;
            case 'cvss_score':
                sortByLabel = "Severity";
                break;
            case 'expiration_Date':
                sortByLabel = "Expiration Date";
                break;
        }

        this.alNavigationService.track(AlTrackingMetricEventName.UsageTrackingEvent, {
            category: AlTrackingMetricEventCategory.ExposuresAction,
            action: 'Event SortBy',
            label: "Sort By "+sortByLabel+" in "+(this.viewName === 'exposures' ? 'Exposures' : 'Remediation')+"/"+this.filterUtilityService.activeStateFilter.label
        });
    }

    /**
     * Hides the snackbard.
     */
    protected closeActionSnackbar() {
        this.actionSnackbarVisible = false;
        this.actionSnackbarText = '';
    }

    /**
     * Shows the snackbar with the specified text.
     * @param text The text to be displayed in the snackbar.
     */
    protected openActionSnackbar(text: string) {
        this.actionSnackbarVisible = true;
        this.actionSnackbarText = text;
    }

    /**
     * Updates the current selected cards.
     * @param checked If the card is checked.
     */
    protected updateCurrentSelection(checked: boolean = false) {
        this.currentSelection = checked ? [...this.alCardstack.view.filteredCards] : this.alCardstack.view.filteredCards.filter((c) => c.checked);
    }

    /**
     * Handles de update of the snackbar after each selection.
     */
    protected actionSnackbarProccess() {
        if(this.filterUtilityService.activeStateFilter.label === 'Open') {
            this.actionSnackbarButtons[0].visible = true;
            this.actionSnackbarButtons[1].visible = true;
            this.actionSnackbarButtons[2].visible = false;
        } else {
            this.actionSnackbarButtons[0].visible = false;
            this.actionSnackbarButtons[1].visible = false;
            this.actionSnackbarButtons[2].visible = true;
        }
        if (this.currentSelection.length > 0) {
            this.openActionSnackbar(`${this.currentSelection.length} Selected`);
        } else {
            this.closeActionSnackbar();
        }
    }

    /**
     * Handles when all card are being selected.
     * @param checked The checked toggle value.
     */
    public changeAllSelection(checked: boolean = false) {
        if (!this.alCardstack) {
            throw new Error('alCardstack view must be defined');
        }
        this.allCardsChecked = checked;
        this.updateCurrentSelection(checked);
        this.alCardstack.updateCheckState();
        this.actionSnackbarProccess();
    }

    /**
     * When a single card is being selected.
     * @param item The selected card item.
     */
    public changeSimpleSelection(item: AlBaseCardItem) {
        if (!item.checked && this.alCardstack) {
            this.alCardstack.uncheckToolbarAllOption();
        }
        for (let i = 0; i < this.alCardstack.view.filteredCards.length; i++) {
            const card = this.alCardstack.view.filteredCards[i];
            if (item.id === card.id) {
                card.checked = item.checked;
                break;
            }
        }
        this.updateCurrentSelection(false);
        this.actionSnackbarProccess();
    }

    public onClearAllFilters() {
        this.closeActionSnackbar();
        this.toggelHelpText(true);
        this.alCardstack.alContentToolbar.alSearchBar.clear();
    }

    /**
     * Handles the snack bar action events.
     * @param event The event related to the action.
     */
    async actionSnackbarEvent(event: AlActionSnackbarEvent) {
        switch (event) {
            case 'export':
                this.downloadFile(await this.exportData());
                this.alNavigationService.track(AlTrackingMetricEventName.UsageTrackingEvent, {
                    category: AlTrackingMetricEventCategory.ExposuresAction,
                    action: 'Event Export',
                    label: "Export in "+(this.viewName === 'exposures' ? 'Exposures' : 'Remediation')+"/"+this.filterUtilityService.activeStateFilter.label
                });
                break;
            case 'dispose':
                this.trackSelectedItemAttributes();
                this.affectedAssetDetail.allFutureAssetsToggleable= true;
                this.disposeAction.rightDrawer.open();
                break;
            case 'conclude':
                this.trackSelectedItemAttributes();
                this.affectedAssetDetail.allFutureAssetsToggleable = false;
                this.affectedAssetDetail.allFutureAssetSelected = false;
                this.concludeAction.rightDrawer.open();
                break;
            case 'restore':
                this.actionInProgress = true;
                this.actionSnackbarButtons[2].disabled = true;
                this.trackSelectedItemAttributes();
                const undisposeOperations: Promise<any>[] = [];
                if(this.selectedItemAuditIds.length > 0) {
                    const undisposeOperationParams: UndisposeRemediationsRequestBody = {
                        audit_ids: this.selectedItemAuditIds,
                        ...(this.selectedItemVulnerabilityIds.length > 0 && {vulnerability_ids: this.selectedItemVulnerabilityIds}),
                        ...(this.selectedItemRemediationIds.length > 0 && {remediation_ids: this.selectedItemRemediationIds})
                    };
                    undisposeOperations.push(
                        AlAssetsQueryClient.undisposeRemediationItems( this.accountId, undisposeOperationParams )
                    );
                }
                if(this.selectedItemRemediationItemIds.length > 0) {
                    undisposeOperations.push(
                        AlAssetsQueryClient.undisposeRemediationItems( this.accountId, {remediation_item_ids: [this.selectedItemRemediationItemIds.join()]} )
                    );
                }
                if(undisposeOperations.length > 0) {
                    Promise.all(undisposeOperations).then(() => {
                        this.onRemediationActionSuccess('Restored');
                        this.actionInProgress = false;
                        this.actionSnackbarButtons[2].disabled = false;
                    });
                } else {
                    console.error('Restore operation failed - ');
                    this.actionInProgress = false;
                    this.actionSnackbarButtons[2].disabled = false;
                }
                break;
            default:
                break;
        }
    }

    onTextFilterApplied() {
        const search = this.alCardstack.view.textFilter as string;
        this.filterUtilityService.updateFiltersInUrl(search ? {search} : {});
    }

    /**
     * The export method should be overwritten.
     * Note: To change file name overwrite attribute this.exportFileName in
     * the overwritten exportData function.
     */
    protected abstract exportData(): Promise<string>;

    /**
     * Get the data joined by a comma and end of line.
     * @param data Data to join
     */
    protected getRow(data: string[]): string {
        return data.join(",") + "\n";
    }

    /**
     * Gets the body for the csv file.
     * @param cards Reference to the cards.
     */
    protected async getBody(viewType: string, state: string, usersMap:{ [id:string]: AIMSUser }): Promise<string> {
        const deployments:Deployment[] = await AlDeploymentsClient.listDeployments(this.accountId);
        this.filterUtilityService.createDeploymentDictionary(deployments);
        let bodyData = "";
        this.alCardstack.view.filteredCards.forEach((card: AlCardstackItem) => {
            if (card.checked || this.allCardsChecked) {

                const isRemediation = viewType === 'Remediation';
                if(!card.entity.exposures) {
                    const exposureDetail = (<ExposureQueryResultItem>card.entity);
                    exposureDetail.vinstances.map( asset => {
                        bodyData += this.getRow(this.extractAssetDetailsForExport(viewType, state, card, exposureDetail, asset));
                    });
                } else {
                    const exposureDetail = (<RemediationItemAsset>card.entity);
                    let remediationName: string = null;
                    if(isRemediation) {
                        remediationName = state === 'Open' ? (<ExposureQueryResultItem>exposureDetail).name : exposureDetail.remediation.name;
                    }

                    exposureDetail.exposures.map(exposure => {
                        exposure.vinstances.map(async asset => {
                            bodyData += this.getRow(this.extractAssetDetailsForExport(viewType, state, card, isRemediation ? exposure : exposureDetail.exposures[0], asset, usersMap,
                                isRemediation ? remediationName : null));
                        });
                    });
                }
            }
        });
        return bodyData;
    }

    /**
     * Scapes special characters like commas.
     * @param cellData The data to put in the cell
     */
    protected scapeCell(cellData: string): string {
        if (cellData) {
            return "\"" + cellData + "\"";
        }
        return "";
    }

    private extractAssetDetailsForExport(viewType: string, state: string, card: AlCardstackItem,
                                         exposureDetail: ExposureQueryResultItem, asset: ExposureVInstanceItem, usersMap?:{ [id:string]: AIMSUser }, remediationName?: string) {
        let row: string[] = [];
        row.push(this.scapeCell(viewType));
        if(remediationName) {
            row.push(this.scapeCell(remediationName));
        }
        row.push(this.scapeCell(state));
        if(state !== 'Open') {
            if(state === 'Disposed') {
                row.push(this.scapeCell(new Date((<Date>card.entity.expires)).toLocaleDateString()));
            }
            row.push(this.scapeCell(usersMap[card.entity.user_id] && usersMap[card.entity.user_id].name ? usersMap[card.entity.user_id].name : 'N/A'));
            row.push(this.scapeCell(new Date((<Date>card.entity.modified_on)).toLocaleDateString()));
            if(state === 'Disposed') {
                row.push(this.scapeCell(card.entity.comment));
            }
        }
        const deploymentKey = `${asset.target.deployment_id}`;
        const deploymentName = ( deploymentKey in this.filterUtilityService.assetsList )
                            ? this.filterUtilityService.assetsList[deploymentKey].name
                            : 'N/A';
        row.push(this.scapeCell(card.properties.accountName));
        row.push(this.scapeCell(deploymentName));
        row.push(this.scapeCell(card.properties.toptitle));
        row.push(this.scapeCell(exposureDetail.severity));
        row.push(this.scapeCell(exposureDetail.cvss_score.toString()));
        row.push(this.scapeCell(exposureDetail.cve));
        row.push(this.scapeCell(exposureDetail.name));
        row.push(this.scapeCell(asset.target.name));
        row.push(this.scapeCell(asset.target.type));
        return row;
    }

    /**
     * This will download the data as a cvs file.
     * @param data The text plain to put in the file.
     */
    private downloadFile(data: string) {
        this.alDownloadCsvService.downloadFile(this.exportFileName, data);
    }

    public async initialiseCardstackView(viewName: string, clearExistingFilters: boolean = false) {
        this.accountId = AlSession.getActingAccountId();
        const deployments = await this.filterUtilityService.preLoadAdditonalAssetData(false);
        const hasDeployments: boolean = deployments && deployments.length > 0;
        this.zeroState.hasDeployments = hasDeployments;
        this.zeroState.active = !hasDeployments;
        setTimeout(() => {
            this.handleUrlFilters(clearExistingFilters, viewName);
        });
    }

    /**
    * As the method name suggests, this will search for any filters for the given view name persisted in local storage
    * and will use these to build out corresponding filter and value definitions on the associated cardstack view.
    * In case filters not present in local storage but present in filter query param, then store in local storage and set the filter.
    * These will then appear as preselected in the view when the initial fetch from the backend is returned.
    */
    public restoreDefinitionsFromLocalStorage(viewName: string) {
        let filter : { defs?: { [key: string]: AlCardstackPropertyDescriptor },filterValuesToApply?:AlCardstackValueDescriptor[] } = {};
        let savedFilters = this.filterUtilityService.getSelectedFiltersFromStorage(viewName, this.filterUtilityService.activeStateFilter.label.toLowerCase());
        savedFilters = this.dedupeFilterValues(savedFilters);
        let filtersFromQueryParams = this.filterUtilityService.getSelectedFiltersFromQueryParam(['no_filters', 'search']);
        filtersFromQueryParams = this.dedupeFilterValues(filtersFromQueryParams);
        if (filtersFromQueryParams.length > 0) {
            this.filterUtilityService.addSelectedFiltersToStorage(filtersFromQueryParams, viewName, this.filterUtilityService.activeStateFilter.label.toLowerCase());
            filter = this.filterDefinitionsService.filterValuesToApply(filtersFromQueryParams);
        } else if (savedFilters.length > 0) {
            filter = this.filterDefinitionsService.filterValuesToApply(savedFilters);
        }
        if (savedFilters.length > 0 || filtersFromQueryParams.length > 0) {
            this.alCardstack.view.characteristics.definitions = {...filter.defs, ...AppConstants.Characteritics.defaultSortableByDefination};
            this.alCardstack.view.applyMultipleFilterBy(filter.filterValuesToApply);
            this.alCardstack.resetSelectAll();
        }
    }

    onActingAccountChanged = () => {
        if(!this.alCardstack) {
            return;
        }
        this.alCardstack.view.cards = [];
        this.initialiseCardstackView(this.viewName, true);
    }

    onRemediationItemSelected(exposuresByRemediation: ExposuresByRemediation) {
        const currentActiveFilters = this.alCardstack.view.activeFilters;
        const remediationFilters = this.alUrlFilterService.fromSelectedFilters(exposuresByRemediation.remediations_filters);
        // When navigating to remediation\exposure detail views, the exposures API doesnt accept 'deployment:' filters which are valid in the
        // health API calls, so these need to be converted to 'deployment_id:' - annoying but needed!
        const deploymentFilter = this.filterUtilityService.getSelectedFiltersFromQueryParam()
            .find(filter => {
                return filter.includes('deployment:');
            });
        if(deploymentFilter) {
            const deploymentId = deploymentFilter.replace('deployment:', '');
            remediationFilters['deployment_id'] = deploymentId;
            remediationFilters['deployment'] = null;
        }


        console.log(`Navigate to remediation detail view for remediationId (${exposuresByRemediation.remediationId}) using these filters - ${exposuresByRemediation.remediations_filters}`);
        if (currentActiveFilters.length > 0) {
            console.log(`Set active filters in remediation detail view to - ${currentActiveFilters}`);
        }
        this.alNavigationService.navigate.byNgRoute(
            ['exposure-management/remediations/open', AlSession.getActingAccountId(), exposuresByRemediation.remediationId],
            {
                queryParams: remediationFilters
            }
        );
    }

    contentUnavailable() {
        this.zeroState.active = true;
        this.zeroState.hasDeployments = false;
    }

    public goToDetailPage(event: MouseEvent, item: AlCardstackItem) {
        const state = this.alNavigationService.routeData.pageData.state;
        const options: AlNavigateOptions = (event.ctrlKey || event.metaKey) ? { target: '_blank' } : {};
        const extras: NavigationExtras = {};
        extras.queryParams = { search: null };
        if (state === "disposed" || state === "concluded") {
            const remediationItem = (<RemediationItemAsset>item.entity);
            const vulnerabilityId = remediationItem.exposures[0].vulnerability_id;
            const deploymentId = remediationItem.deployment_id ? remediationItem.deployment_id : remediationItem.deployment_ids[0];
            if(options.target) {
                let pathSuffix = '';
                if(this.viewName === 'remediations') {
                    if(remediationItem.audit_id) {
                        pathSuffix = `${deploymentId}/${remediationItem.audit_id}/${remediationItem.remediation_id}`;
                    } else {
                        pathSuffix = `${deploymentId}/${remediationItem.item_ids[0]}`;
                    }
                } else {
                    if(remediationItem.audit_id) {
                        pathSuffix = `${deploymentId}/${remediationItem.audit_id}/${vulnerabilityId}`;
                    } else {
                        pathSuffix = `${deploymentId}/${remediationItem.item_ids[0]}`;
                    }
                }
                this.alNavigationService.navigate.byLocation(
                    AlLocation.MagmaUI, `/#/exposure-management/${this.viewName}/${state}/${AlSession.getActingAccountId()}/${pathSuffix}`,
                    {},
                    options
                );
            } else {
                console.log("View Name", this.viewName );
                const commands = [ 'exposure-management', this.viewName, state, AlSession.getActingAccountId(), deploymentId];

                if(this.viewName === 'remediations') {
                    if(remediationItem.audit_id) {
                        commands.push(remediationItem.audit_id, remediationItem.remediation_id);
                    } else {
                        commands.push(remediationItem.item_ids[0]);
                    }
                } else {
                    if(remediationItem.audit_id) {
                        commands.push(remediationItem.audit_id, vulnerabilityId);
                    } else {
                        commands.push(remediationItem.item_ids[0]);
                    }
                }
                this.alNavigationService.navigate.byNgRoute(commands, extras);

            }
        } else {
            if(options.target) {
                this.alNavigationService.navigate.byLocation(
                    AlLocation.MagmaUI, `/#/exposure-management/${this.viewName}/open/${AlSession.getActingAccountId()}/${item.id}`,
                    this.alUrlFilterService.fromSelectedFilters(this.filterUtilityService.getSelectedFiltersFromStorage(this.viewName, state)),
                    options
                );
            } else {
                this.alNavigationService.navigate.byNgRoute([ 'exposure-management', this.viewName, 'open', AlSession.getActingAccountId(), item.id], {
                    queryParams: {...this.alUrlFilterService.fromSelectedFilters(this.filterUtilityService.getSelectedFiltersFromStorage(this.viewName, state)), ...{search: null}},
                });
            }
        }
    }

    onRemediationActionSuccess(action: string) {
        const messageText = `${this.currentSelection.length} ${this.viewName === 'exposures' ? 'Exposure' : 'Remediation'}${this.currentSelection.length > 1 ? 's' : ''} ${action}`;
        this.currentSelection = [];
        this.actionSnackbarProccess();
        this.disposeAction.rightDrawer.close();
        this.concludeAction.rightDrawer.close();
        const alToastMessage: AlToastMessage = {
            sticky: false,
            closable: false,
            data: {
                message: messageText,
            }
        };
        this.alToastService.showMessage('alToast', alToastMessage);
        this.alCardstack.view.start();
    }

    private trackSelectedItemAttributes() {
        this.selectedItemDeploymentIds = [];
        this.selectedItemIds = []; // either vulnerability_ids or remediation_ids
        this.selectedFilters = [];
        this.selectedItemVulnerabilityIds = [];
        this.selectedItemRemediationItemIds = [];
        this.selectedItemAuditIds = [];
        this.affectedAssetDetail.selectedAssetCount = 0;
        this.affectedAssetDetail.selectedAssetKeys = [];
        this.alCardstack.view.activeFilters.forEach( activeFilter=> {
            if(activeFilter.propField!=='deployment_id') {
                this.selectedFilters.push(activeFilter.propField + ":" + activeFilter.rawValues.join());
            }
        });
        const activeState = this.filterUtilityService.activeStateFilter.label;
        if(activeState === 'Open') {
            let affectedAssetKeys: string[] = [];
            this.currentSelection.forEach(item => {
                const entity = (<ExposureQueryResultItem>item.entity);
                const assetKeys: string[] = [];
                if(entity.deployment_ids) {
                    entity.deployment_ids.forEach(id => {
                        if(!this.selectedItemDeploymentIds.includes(id)){
                            this.selectedItemDeploymentIds.push(id);
                        }
                    });
                } else {
                    if(!this.selectedItemDeploymentIds.includes(entity.deployment_id)){
                        this.selectedItemDeploymentIds.push(entity.deployment_id);
                    }
                }

                if(this.viewName === 'exposures') {
                    if(!this.selectedItemIds.includes(entity.vulnerability_id)){
                        this.selectedItemIds.push(entity.vulnerability_id);
                    }
                    entity.vinstances.forEach(vinstance => {
                        assetKeys.push(`${vinstance.target.type}:${vinstance.target.key}`);
                    });
                } else {
                    if(!this.selectedItemIds.includes(entity.remediation_id)){
                        this.selectedItemIds.push(entity.remediation_id);
                    }
                    entity.exposures.forEach(exp => {
                        exp.vinstances.forEach(vinstance => {
                            assetKeys.push(`${vinstance.target.type}:${vinstance.target.key}`);
                        });
                    });
                }
                // Makin sure to keep an updated list of unique asset keys, using Set to dedupe entries :-)
                affectedAssetKeys = [...new Set(affectedAssetKeys.concat(assetKeys))];
            });
            this.affectedAssetDetail.selectedAssetCount = affectedAssetKeys.length;
            this.affectedAssetDetail.selectedAssetKeys = affectedAssetKeys;
        } else {
            // Record audit_ids, vuln_ids, remediation_ids for records that have an audit_id present
            // Then record any remaining non audit_id based records remediation_item_ids
            // These will get used in any restore operation against multiple selected items
            this.currentSelection.forEach(item => {
                const entity = (<RemediationItemAsset>item.entity);
                if(entity.audit_id) {
                    if(!this.selectedItemAuditIds.includes(entity.audit_id)){
                        this.selectedItemAuditIds.push(entity.audit_id);
                    }
                    if(entity.vulnerability_id) {
                        this.selectedItemVulnerabilityIds.push(entity.vulnerability_id);
                    }
                    if(entity.remediation_id) {
                        this.selectedItemRemediationIds.push(entity.remediation_id);
                    }
                } else {
                    entity.item_ids.forEach(id => {
                        if(!this.selectedItemRemediationItemIds.includes(id)){
                            this.selectedItemRemediationItemIds.push(id);
                        }
                    });
                }

            });
        }
    }

    public onAlFilterChanged (alFilterValue :AlUiFilterValue){
         this.toggelHelpText(false);
         if( alFilterValue.activeFilter ) {
            this.alNavigationService.track(AlTrackingMetricEventName.UsageTrackingEvent, {
                category: AlTrackingMetricEventCategory.ExposuresAction,
                action: 'Event Filter',
                label: (this.viewName === 'exposures' ? 'Exposures' : 'Remediation')+"/"+
                    this.filterUtilityService.activeStateFilter.label+"/"+AppConstants.Filters.filterCaptions[alFilterValue.property].caption
            });
         }

    }

    toggelHelpText(clearAll?:boolean){

        const state = this.alNavigationService.routeData.pageData.state;
        this.alCardstack.characteristics.alFilterConfig.showHelpText = state === 'open'? true :false;
        if(!clearAll && state === 'open'){
            const deploymentIdFilter = this.alCardstack.view.activeFilters.find(activeFilter => activeFilter.propField ==='deployment_id');
            this.alCardstack.characteristics.alFilterConfig.showHelpText = deploymentIdFilter === undefined ;
        }

        this.alCardstack.alFilterConfig = {...this.alCardstack.characteristics.alFilterConfig};
    }
    ngAfterViewInit() {
      // TODO: Review the below since its reliant on material stuff we are ripping out now
        // if (this.storage) {
        //     if (!this.storage.get('Navigation.Open.Tutorial')) {
        //         if ( this.dialog && !this.dialogRef ) {
        //             this.dialogRef = this.dialog.open( TutorialComponent, { closeOnNavigation: false } );
        //             this.dialogRef.afterClosed().subscribe(() => {
        //                 this.dialogRef = null;
        //             });
        //         }
        //     }
        // }
    }

    private handleUrlFilters(clearExistingFilters: boolean, viewName: string): void {
        // Handling of special query param from dashboards to clear out any applied filters
        const activeState = this.filterUtilityService.activeStateFilter.label.toLowerCase();
        if (this.alNavigationService.queryParams.hasOwnProperty('no_filters')) {

           this.filterUtilityService.addSelectedFiltersToStorage([], viewName, this.filterUtilityService.activeStateFilter.label.toLowerCase());
           this.alNavigationService.navigate.byNgRoute([ 'exposure-management', `${this.viewName}/${activeState}`, this.accountId], { queryParams: { no_filters: null } });
       }
       if(!clearExistingFilters) {
           this.restoreDefinitionsFromLocalStorage(viewName);
       }
       if (this.alCardstack) {
           if(this.alCardstack.view.activeFilters.length > 0 && clearExistingFilters) {
               this.alCardstack.clearAllFilters();
           } else {
               this.alCardstack.view.start().then(() => {
                   const searchTerm = this.alNavigationService.queryParams['search'];
                   if (searchTerm) {
                       this.alCardstack.setInputTextFilter(searchTerm);
                   }
               });
           }
           this.toggelHelpText();
       }
   }

   private dedupeFilterValues(filters: string[]) {
    return filters.map(fil => {
        const filterParts = fil.split(':');
        return `${filterParts[0]}:${[...new Set(filterParts[1].split(','))].join()}`;
    });
   }
}
