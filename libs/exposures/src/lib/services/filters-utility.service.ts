/**
 * Utility for filters
 * @author Sir Rob <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */

import { Injectable } from '@angular/core';
import { AlCabinet, AlSession, AlCardstackActiveFilter } from '@al/core';
import {
    HealthAssetVPC,
    ExposureQueryParams,
    ExposuresQueryFilter,
    ExposureQueryResultItem,
    RemediationItemAsset,
    RemediationItemsFilter, RemediationItemsQueryParams
} from '@al/assets-query';
import { AlStateFilterDescriptor, AlViewByItem, AlUiFilter, AlUiFilterValue, AlFilterDescriptor } from '@al/ng-generic-components';
import { AlNavigationService, AlUrlFilterService } from '@al/ng-navigation-components';
import { AlCardstackViewCharacteristics, AlCardstackComponent } from '@al/ng-cardstack-components';
import { AlPoliciesClient, Policy } from '@al/policies';
import { AlDeploymentsClient, Deployment } from '@al/deployments';
import { ExposuresByRemediation } from '../types';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { AppConstants } from '../constants';

@Injectable({providedIn: 'root'})
export class FiltersUtilityService {

    public storage: AlCabinet = AlCabinet.persistent("al-exposures.filters");
    public stateFiltersInitial: {value:AlStateFilterDescriptor}[] = [
        { value:{ label:'Open', key: 'health_level:2', iconClass: 'material-icons', icon: 'warning', showTotal: false, total:0, showToolTip:true,totalText:"Exposure Instances"}},
        { value:{ label:'Disposed', key: 'state:disposed', iconClass: 'material-icons', icon: 'block', showTotal: false, total:0}},
        { value:{ label:'Concluded', key: 'state:concluded', iconClass: 'material-icons', icon: 'check', showTotal: false, total:0}},
    ];

    public viewByOptions: AlViewByItem[] = [
        { icon: { name: 'build' }, value: 'remediations', label: 'Remediations' },
        { icon: { cssClasses: 'al al-vulnerability' }, value: 'exposures', label: 'Exposures' }
    ];

    public alFilterConfiguration: AlFilterDescriptor = { showToolTip:true,  toolTipText:'Exposure Instances'};
    public activeStateFilter = this.stateFiltersInitial[0].value;

    public assetsList: {[key:string]: HealthAssetVPC} = {};

    public extraAssetDetails: {[key:string]: {name: string, type?: string}} = {};

    constructor(
        private alNavigationService: AlNavigationService,
        private alUrlFilterService :AlUrlFilterService,
        private router:Router,
        private route:ActivatedRoute
    ) {

    }

    /**
     * Store in the localstorage the filter selected
     * @param filtersSelected
     * @param account
     */
    addSelectedFiltersToStorage(filtersSelected = [], viewName: string, stateFilter: string) {
        this.storage.set(`${viewName}-${stateFilter}-filters`, filtersSelected);
    }

    /**
     * Get the filters selected
     * @param account
     * @param page
     */
    getSelectedFiltersFromStorage(viewName: string, stateFilter: string): string[] {
        return this.storage.get(`${viewName}-${stateFilter}-filters`, []);
    }

    populateCardstackViewByOptions(defaultValue: string) {
        this.setDefaultViewByOption(defaultValue);
        return this.viewByOptions;
    }

    generateDefaultCharacteristics(propName: string, propCaption: string, viewByCaption: string, searchableByFields:string[]=[], sortableByFields:string[]=[], sortOrder:string='desc', state: string) {
        const sortDefs = JSON.parse(JSON.stringify(AppConstants.Characteritics.defaultSortableByDefination));
        const defaultDefs = JSON.parse(JSON.stringify(AppConstants.Characteritics.defaultNonAssetCardstackDefinitions));
        const filterConfiguration: AlFilterDescriptor = {
            showToolTip:true,
            toolTipText: state !== AppConstants.PageConstant.Open ? 'Remediation Items' : 'Exposure Instances',
            showFiltersCount: state === 'open',
            helpText: AppConstants.Characteritics.filterUserHelpText
        };
        return {
            entity: {
                property: propName,
                caption: propCaption,
                values: null,
                metadata: {}
            },
            groupableBy:[],
            stateFilters: this.stateFiltersInitial,
            alFilterConfig: filterConfiguration,
            selectedState: this.getActiveStateFilter(),
            filterableBy: [],
            sortableBy: [...sortableByFields],
            searchableBy: ["caption",...searchableByFields],
            definitions: {...sortDefs, ...defaultDefs},
            header: this.generateCardstackHeaderConfig(),
            toolbarConfig: {
                showSelectAll: true,
                selectAll: false,
                showSortBy: true,
                search: {
                    textPlaceHolder: 'search'
                },
                sort:{
                    order:sortOrder,
                    options:[]
                },
                showViewBy: true,
                viewBy: this.populateCardstackViewByOptions(viewByCaption)
            },
            remoteSearch: false,
            greedyConsumer: false,
            filterValueLimit: 10,
            filterValueIncrement: 10,
            hideEmptyFilterValues: true,
            localPagination: true,
            skipFetchOnStateChange: true

        } as AlCardstackViewCharacteristics;
    }

    generateCardstackHeaderConfig() {
        const activeStateFilterLabel = this.activeStateFilter.label;
        const config: {title: string, iconConfig?: {name: string; cssClasses: string;}, icon?: string;} = {
            title: activeStateFilterLabel,
            iconConfig: {
                cssClasses: 'material-icons',
                name: ''
            }
        };

        switch (activeStateFilterLabel) {
            case 'Open':
                config.iconConfig.name = 'warning';
                break;
            case 'Disposed':
                config.iconConfig.name = 'block';
                break;
            case 'Concluded':
                config.iconConfig.name = 'check';
                break;
            default:
                console.warn(`Unexpected state filter value detected - ${activeStateFilterLabel}`);
                break;
        }

        return config;
    }


    /**
     * Get the filters selected
     * Takes an array of strings and returns as a comma separated single string with first character
     * of each string capitalized
     */
    humanizeCategoriesList(entries: string[]) {
        return entries.map(entry =>
            entry.split('_').map(t => {
                return t.charAt(0).toUpperCase() + t.slice(1);
            })
            .join(' ')
        ).join(', ');
    }

    navigateToNamedRoute(routeName: string) {
        this.setDefaultViewByOption(routeName);
        this.alNavigationService.navigate.byNgRoute(
            ['exposure-management', routeName, this.activeStateFilter.label.toLowerCase(), AlSession.getActingAccountId()],
            {
                queryParams: this.clearCurrentFilterQueryParams()
            }
        );
    }

    onStateFilterChanged(cardStack: AlCardstackComponent, stateFilter: AlStateFilterDescriptor, viewName: string) {
        this.activeStateFilter = stateFilter;
        const queryParams =  this.clearCurrentFilterQueryParams();
        this.alNavigationService.navigate.byNgRoute([ 'exposure-management', viewName, stateFilter.label.toLowerCase(), AlSession.getActingAccountId()], {queryParams: queryParams});
        (<AlCardstackViewCharacteristics>cardStack.view.characteristics).header = this.generateCardstackHeaderConfig();
    }

    getActiveStateFilter() {
        const pageState = this.alNavigationService.routeData.pageData.state;
        const match = this.stateFiltersInitial.find( filter => filter.value.label.toLowerCase() === pageState);
        this.activeStateFilter = match.value;
        return this.activeStateFilter;
    }

    prepareExposuresQueryParams(viewName: string, remoteFilters?: AlCardstackActiveFilter[], groupByExposure: boolean = false) {
        let exposuresQueryParams: ExposureQueryParams = {
            filter: this.parseRemoteFilters(viewName, remoteFilters, true),
            scope: true,
            details: true
        };
        if(groupByExposure) {
            exposuresQueryParams.group = 'exposure';
        }
        if(this.activeStateFilter.label === 'Disposed') {
            exposuresQueryParams.disposed = true;
        }
        if(this.activeStateFilter.label === 'Concluded') {
            exposuresQueryParams.concluded = true;
        }
        return exposuresQueryParams;
    }

    prepareRemediationItemsQueryParams(viewName: string, remoteFilters?: AlCardstackActiveFilter[]) {
        const remediationItemsQueryParams = {
            filter: this.parseRemoteFilters(viewName, remoteFilters, true),
            detailed_filters: true,
            state: this.activeStateFilter.label.toLowerCase(),
            details: true,
            group_by_audit_id:  true
        };
        return remediationItemsQueryParams;
    }

    private parseRemoteFilters(viewName: string, remoteFilters: AlCardstackActiveFilter[], ignoreStateFilter: boolean) {
        const filters = ['category:!configuration', 'category:!connection']; // These must be excluded as they are managed in Health console now
        if(!ignoreStateFilter && !['Disposed', 'Concluded'].includes(this.activeStateFilter.label)) {
            filters.push(this.activeStateFilter.key as string);
        }
        if(remoteFilters) {
            const filtersToPersist: string[] = [];
            remoteFilters.forEach(remoteFilter => {
                const filterValue = `${remoteFilter.propField}:${remoteFilter.rawValues.join()}`;
                filters.push(filterValue);
                filtersToPersist.push(filterValue);
            });
            let urlFiltersToApply = this.alUrlFilterService.fromSelectedFilters(filtersToPersist);
            const search = this.alNavigationService.queryParams['search'];
            if(search) {
                urlFiltersToApply = {...this.alUrlFilterService.fromSelectedFilters(filtersToPersist), ...{search}};
            }
            this.updateFiltersInUrl(urlFiltersToApply);
            this.addSelectedFiltersToStorage(filtersToPersist, viewName, this.activeStateFilter.label.toLowerCase());
        }
        return filters;
    }

    /**
     * Unfortunatley we don't get all the necessary meta data for the deployment and policy filters so we have to get this data from
     * the services directly and store them as entries in a lookup object for later use (see FilterDefinitionsSevice)
     */
    async preLoadAdditonalAssetData(includePolicies: boolean = true) {
        const accountId = AlSession.getActingAccountId();
        this.extraAssetDetails = {};
        let deployments: Deployment[] = [];
        const promises: Promise<Deployment[]|Policy[]>[] = [AlDeploymentsClient.listDeployments(accountId)];
        if(includePolicies){
            promises.push(AlPoliciesClient.listPolicies(accountId));
        }
        return Promise.all(promises).then(responses => {
            deployments = responses[0];
            if(responses[1]) {
                let policies = responses[1] as Policy[];
                policies.forEach(policy => {
                    this.extraAssetDetails[`protection_policy_id:${policy.id}`] = { name: policy.name};
                });
            }

            deployments.forEach(deployment => {
                this.extraAssetDetails[includePolicies ? `deployment:${deployment.id}`: `deployment_id:${deployment.id}`] = { name: deployment.name, type: deployment.platform.type};
            });
            return deployments;
        });
    }

    public extractExposureDeploymentNames(exposure: ExposureQueryResultItem | RemediationItemAsset) {
        let deploymentNames: string[] = [];
        if(exposure.hasOwnProperty('deployment_ids')) {
            (<ExposureQueryResultItem>exposure).deployment_ids.forEach( deploymentId =>{
                let deploymentObject = Object.entries(this.assetsList).find(([key, detail]) => key === `deployment_id:${deploymentId}`);
                if(!deploymentObject) {
                    deploymentObject = Object.entries(this.extraAssetDetails).find(([key, detail]) => key === `deployment_id:${deploymentId}` || key === `deployment:${deploymentId}`);
                }
                deploymentNames.push(deploymentObject[1].name);
            });
        } else {
            const isRemediationItemRecord = exposure.hasOwnProperty('remediation');
            let deploymentId = isRemediationItemRecord ? (exposure as unknown as RemediationItemAsset).remediation.deployment_id : exposure.deployment_id;
            let deploymentObject;
            if(isRemediationItemRecord) {
                deploymentObject = Object.entries(this.extraAssetDetails).find(([key, detail]) => key.includes(deploymentId));

            } else {
                deploymentObject = Object.entries(this.assetsList).find(([key, detail]) => key.includes(deploymentId));
            }
            if(deploymentObject) {
                deploymentNames.push(deploymentObject[1].name);
            }
        }
        return deploymentNames;
    }

    public populateAssetsFromExposuresFilters(exposuresQueryFilters: ExposuresQueryFilter[]) {
        this.assetsList = {};
        exposuresQueryFilters.forEach(filter => {
            if(filter.type !== 'category') {
                this.assetsList[`${filter.type}:${filter.key}`] = filter;
            }
        });
    }

    public populateAdditionalAssetsFromRemediationFilters(remediationFilters: RemediationItemsFilter[] | ExposuresQueryFilter[] ) {
        // this.extraAssetDetails = {};
        remediationFilters.forEach(filter => {
            this.extraAssetDetails[`${filter.type}:${filter.key}`] = filter;
        });
    }

    public getExposuresCountForAsset(assetExposuresByRemediations: ExposuresByRemediation[]) {
        let exposuresCount = 0;
        assetExposuresByRemediations.forEach(remediation => {
            exposuresCount += remediation.exposures.length;
        });
        return exposuresCount;
    }

    prepareExposuresByIdQueryParams(exposureId: string, selectedFilters?: string[], groupByExposure: boolean = false) {
        let exposuresQueryParams: ExposureQueryParams = {
            details: true,
            include_filters: true,
            filter: [groupByExposure ? `vulnerability:${exposureId}` : `remediation:${exposureId}`, ...selectedFilters]
        };
        const collectorFilter = selectedFilters.find(filter => {
            return filter.includes('collector:');
        });
        if(collectorFilter) { // collectors are not part of a deployment so wont be in scope, so must set this false so we can see remediations returned
            exposuresQueryParams.scope = false;
        }
        if (groupByExposure) {
            exposuresQueryParams.group = 'exposure';
        }
        if (this.activeStateFilter.label === 'Disposed') {
            exposuresQueryParams.disposed = true;
        }
        if (this.activeStateFilter.label === 'Concluded') {
            exposuresQueryParams.concluded = true;
        }

        return exposuresQueryParams;

    }

    prepareRemediationItemByIdQueryParam(state:string, includeExposures:boolean, remediationItemIds?:string, auditIds?: string, remediationIds?: string, vulnerabilityIds?: string, deploymentIds?: string){
        const remediationItemsQueryParams: RemediationItemsQueryParams = {
            detailed_filters: true,
            state: state,
            details: true,
            ...( includeExposures && { include_exposures:true } ),
            group_by_audit_id: true,
            ...( remediationItemIds && { remediation_item_ids: remediationItemIds } ),
            ...( auditIds && { audit_ids: auditIds } ),
            ...( remediationIds && { remediation_ids: remediationIds } ),
            ...( vulnerabilityIds && { vulnerability_ids: vulnerabilityIds } ),
            ...( deploymentIds && { deployment_ids: deploymentIds } )
        };
        return remediationItemsQueryParams;
    }

   public setActiveFilterValue(vDescriptor: AlUiFilterValue,filters:AlUiFilter[],activeflage:boolean){
    filters.forEach(filter => {
        let active = false;
        filter.values.forEach(value => {
            if (value.value === vDescriptor.value) {
                value.activeFilter = activeflage;
                active = true;
            }

        });
        if (active) {
            filter.activeFilter = activeflage;
        }
    });
    return filters ;
    }

    public getSelectedFiltersFromQueryParam(extraBlacklistFilters:string[] = []){
        const defaultFilterBlacklist = ['aaid','locid', 'health_level'];
        let selectedFilters = Object.entries(this.alNavigationService.queryParams)
            .filter(([key]) => !defaultFilterBlacklist.concat(extraBlacklistFilters).includes(key))
            .map(entry => {
                return `${entry[0]}:${entry[1]}`;
            }, {});

        return selectedFilters;
    }

    private setDefaultViewByOption(routeName: string) {
        this.viewByOptions.forEach(option => {
            option.default = option.value === routeName;
        });
    }
     public unSelectFilter(selectedFilters: string [] | string[][] , key: string, value: string){
        for (let i = 0; i < selectedFilters.length; i++) {
            let listItem = selectedFilters[i];
            if(typeof(listItem)=== 'string' &&  listItem.includes(key + ":" + value)){
                selectedFilters.splice(i, 1);
            } else if (listItem[0].includes(key + ":" + value)) {
                selectedFilters.splice(i, 1);
            }
        }
        return selectedFilters;
    }

    public createDeploymentDictionary = (deploymentList: Deployment[]) => {
        this.assetsList = {};
        deploymentList.forEach(deployment => {
            this.assetsList[deployment.id] = { name: deployment.name, type: deployment.platform.type };
        });
    }

    public updateFiltersInUrl(filters: { [i: string]: string },  extras:NavigationExtras = {} ):void{
        extras.relativeTo = this.route;
        extras.queryParams = filters;
        const newLocation:string = '/#' + this.router.createUrlTree([], extras ).toString();
        this.alNavigationService.navigate.byURL( newLocation, {}, {replace: true});
    }

    public clearCurrentFilterQueryParams() {
        const existingFilterParams = this.alUrlFilterService.fromSelectedFilters(this.getSelectedFiltersFromQueryParam());
        let paramsToClear = {};
        Object.entries(existingFilterParams).forEach(([key]) => {
            paramsToClear[key] = null;
        });
        return {...paramsToClear, ...{search:null}};
    }

    public updateStateFilterCount(stateCount: number) {
        this.stateFiltersInitial.map(stateFilter => {
            if (this.activeStateFilter.label==='Open' && stateFilter.value.label === this.activeStateFilter.label) {
                stateFilter.value.showTotal = true;
                stateFilter.value.total = stateCount;
            } else {
                stateFilter.value.showTotal = false;
            }
        });
    }

    public getExposuresForRemediation(remediationItem: ExposureQueryResultItem) {
        const vulnIds: string[] = [];
        const uniqueExposures: ExposureQueryResultItem[] = [];
        remediationItem.exposures.forEach(exposure => {
            if(!vulnIds.includes(exposure.vulnerability_id)){
                vulnIds.push(exposure.vulnerability_id);
                uniqueExposures.push(exposure);
            }
        });
        return uniqueExposures;
    }

}
