
/**
 * Utility service to handle the construction of cardstack filters for different response types from the backend
 * @author Robert Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */

import { Injectable } from '@angular/core';
import { AlCardstackValueDescriptor, AlCardstackPropertyDescriptor, AlCardstackActiveFilter } from '@al/core';
import { HealthResponseFilters, ExposuresQueryFilter, AssetTypeDictionary, RemediationItemAsset, RemediationItemsFilter } from '@al/assets-query';
import { AlCardstackViewCharacteristics } from '@al/ng-cardstack-components';
import { AppConstants } from '../constants';
import { FiltersUtilityService } from './filters-utility.service';
import { AlUiFilter } from '@al/ng-generic-components';
import { IconAsset } from '../types';
import { Deployment } from '@al/deployments';

type AssetFilter = RemediationItemsFilter & ExposuresQueryFilter;

@Injectable({providedIn: 'root'})
export class FilterDefinitionsService {

    constructor(private filterUtilityService: FiltersUtilityService) { }

    /**
     * The main workhorse routine which will handle filters returned from the backend in two different formats
     * Either a keyed object is returned where the keys are the actual filters with values as part of the key e.g deployment-type:aws
     * or an array of filter value objects
     */
    buildFilterDefinitions(filters: AssetFilter[], characteristics: AlCardstackViewCharacteristics, remoteFilters: AlCardstackActiveFilter[] = []) {
        const filterProps: string[] = [];
        let definitions = characteristics.definitions;

        filters.forEach(filter => {
            const filterProp = filter.type;
            this.updateFilterDefinitions(definitions, filterProps, filterProp, filter.key, filter.vinstances_count ? filter.vinstances_count : (<any>filter).count, `${filterProp}:${filter.key}`);
        });

        // Cleanup redundant filter values definitions
        Object.entries(characteristics.definitions).forEach(([key, def]) => {
            def.values = def.values.filter(val => {
                return filters.some(filter => {
                    return filter.type === val.property && filter.key === val.value;
                });
            });
            if(def.metadata && def.metadata.overrideValueSortOrder) {
                def.values.sort((a, b) => (<number>b.metadata.sortOrderIndex) - (<number>a.metadata.sortOrderIndex));
            } else {
                def.values.sort((a, b) => b.count - a.count); // ensure filters are sorted in count descending order
            }
        });




        characteristics.filterableBy = filterProps;
    }
    /**
     * This will attempt to extract a suitable friendly display name for a supplied filter key value
     */
    determineFilterValueCaption(key: string, filterType?: string): string {
        if (filterType === 'region') {
            const regionKeyParts = key.split('/');
            return AssetTypeDictionary.getType(filterType).renderName({ name: regionKeyParts[regionKeyParts.length - 1], key: null });
        }
        if (AppConstants.Filters.commonValueCaptions[key]) {
            return AppConstants.Filters.commonValueCaptions[key].caption;
        }
        if (this.filterUtilityService.extraAssetDetails[key] && this.filterUtilityService.extraAssetDetails[key].hasOwnProperty('name')) {
            return this.filterUtilityService.extraAssetDetails[key].name;
        }
        if (this.filterUtilityService.assetsList[key] && this.filterUtilityService.assetsList[key].hasOwnProperty('name')) {
            return this.filterUtilityService.assetsList[key].name;
        }


        if (String(key).indexOf('/') !== -1) {
            let keyPart = key;
            keyPart = '(' + key.slice(key.lastIndexOf('/') + 1) + ')';
            return keyPart;
        }

        // Attempt to use value part but humanize into Camel Case
        // e.g: 'some-value' -> 'Some Value'
        let value = key.split(':')[1];
        if(value) {
            return value.split('_').map(t => {
                        return t.charAt(0).toUpperCase() + t.slice(1);
                    })
                    .join(' ');
        } else {
            return key; // fallback to raw value
        }
    }

    public generateFilterDefinition(filterPropertyName: string) {
        const propDescr = {
            property: filterPropertyName,
            caption: AppConstants.Filters.filterCaptions[filterPropertyName]?.caption ?? filterPropertyName, // fallback to using raw filter name to not break UI!
            values: [],
            metadata: {},
            remote: true
        } as AlCardstackPropertyDescriptor;
        if(filterPropertyName === 'severity') {
            propDescr.sortPositionIndex = 4;
            propDescr.metadata = {
                overrideValueSortOrder: true
            };
        }
        if(filterPropertyName === 'category') {
            propDescr.sortPositionIndex = 3;
        }
        if(filterPropertyName === 'deployment_id') {
            propDescr.sortPositionIndex = 2;
        }
        if(filterPropertyName === 'deployment_type') {
            propDescr.sortPositionIndex = 1;
        }
        return propDescr;
    }

    public generateFilterValueDefinitions(filterValues: string, filterProp: string, filterKey: string) {
        return filterValues.split(',').map(fValue => {
            return {
                property: filterProp,
                value: fValue,
                caption: this.determineFilterValueCaption(filterKey, filterProp)
            } as AlCardstackValueDescriptor;
        });
    }

    /**
     * Checks existing cardstack definitions for a given filter property and value by
     * 1. Creating a new filter definition if one does not yet exist for the given filter Prop
     * 2. Updates an existing filter definition for give filter prop by either adding that prop as a new filter value if not already present, otherwise
     * just updates the existing filter prop value's count property with the latest value supplied.
     */
    public updateFilterDefinitions(definitions: {[key: string]:AlCardstackPropertyDescriptor}, filterProps: string[],
                                    filterProp: string, filterValue: string, filterCount: number, filterKey: string, remoteFilters?: AlCardstackActiveFilter[]) {
        if (!filterProps.includes(filterProp)) {
            filterProps.push(filterProp);
        }

        if (!(filterProp in definitions)) {
            definitions[filterProp] = this.generateFilterDefinition(filterProp);
        }
        const filterPropDef = definitions[filterProp];
        const overrideSortOrder = filterPropDef.metadata && filterPropDef.metadata.overrideValueSortOrder ? filterPropDef.metadata.overrideValueSortOrder : false;
        const existingDef = filterPropDef.values.find(vDescr => vDescr.value === filterValue);
        const filterCaption = this.determineFilterValueCaption(filterKey, filterProp);
        if (!existingDef) {
            const valDescr = {
                property: filterProp,
                value: filterValue,
                count: filterCount,
                caption: filterCaption,
            } as AlCardstackValueDescriptor;
            if(overrideSortOrder && filterProp === 'severity'){
                valDescr.metadata = {
                    sortOrderIndex: AppConstants.Characteritics.threatLevelSortOrder[filterValue]
                };
            }
            filterPropDef.values.push(valDescr);
        } else {
            existingDef.count = filterCount;
            existingDef.caption = this.determineFilterValueCaption(filterKey, filterProp);
            if(overrideSortOrder && filterProp === 'severity'){
                if(!existingDef.metadata) {
                    existingDef.metadata = {};
                }
                existingDef.metadata = {
                    sortOrderIndex: AppConstants.Characteritics.threatLevelSortOrder[filterValue]
                };
            }
        }
    }

    public filterValuesToApply(savedFilters: string[]) {
        const defs: { [key: string]: AlCardstackPropertyDescriptor } = {};
        let filterValuesToApply: AlCardstackValueDescriptor[] = [];
        savedFilters.forEach(filter => {
            const filterParts = filter.split(':');
            const filterProp = filterParts[0];
            const filterValue = filterParts[1];
            defs[filterProp] = this.generateFilterDefinition(filterProp);
            defs[filterProp].values = this.generateFilterValueDefinitions(filterValue, filterProp, filter);
            filterValuesToApply = filterValuesToApply.concat(defs[filterProp].values);
        });

        return { defs: defs, filterValuesToApply: filterValuesToApply };
    }

    public setFilterData(exposuresfilters: ExposuresQueryFilter[], selectedFilters: string[]) {

        let definitions: { [propertyId: string]: AlCardstackPropertyDescriptor; } = JSON.parse(JSON.stringify(AppConstants.Characteritics.defaultNonAssetCardstackDefinitions));
        const filterProps: string[] = [];

        exposuresfilters.forEach(explosuresfilter => {
            const filterProp = explosuresfilter.type;
            this.updateFilterDefinitions(definitions, filterProps, filterProp, explosuresfilter.key, explosuresfilter.vinstances_count, `${filterProp}:${explosuresfilter.key}`);
        });

        let filters = Object.values(definitions) as AlUiFilter[];
        if (selectedFilters.length > 0) {
            let selectedFiltersValue = this.filterValuesToApply(selectedFilters);
            filters.forEach(filter => {
                let active = false;
                filter.values.forEach(value => {
                    selectedFiltersValue.filterValuesToApply.forEach(activeFilter => {
                        if (value.value === activeFilter.value) {
                            value.activeFilter = true;
                            active = true;
                        }
                    });
                });
                if (active) {
                    filter.activeFilter = true;
                }
            });
        }

        return filters;

    }


     /**
     * Set readOnly filter to display for conclude/dispose state
     * @param remediationFilter
     * @param deployment
     * @param remediationItem
     */
    setReadOnlyFilter(remediationFilter: RemediationItemsFilter[], deployment: Deployment[], remediationItem: RemediationItemAsset) {
        let readOnlyFilter = [];
        const typeList = ['deployment_id', 'region', 'host-stopped', 'host-scan-in-progress', 'host-not-scanned', 'vulnerability', 'deployment_type', 'collector'];

        this.filterUtilityService.createDeploymentDictionary(deployment);
        remediationItem.deployment_ids.forEach(id => {
            const deploymentAsset = this.filterUtilityService.assetsList[id];
            if(deploymentAsset) {
                if( readOnlyFilter.length > 0 ) {
                    readOnlyFilter[0]['elements'].push({
                        title: deploymentAsset.name,
                        icon: IconAsset.getAssetIcon(deploymentAsset.type).iconClass
                    });
                } else {
                    readOnlyFilter.push(
                        {
                            title: AppConstants.Filters.filterCaptions['deployment_id'].caption ? AppConstants.Filters.filterCaptions['deployment_id'].caption
                                : IconAsset.getAssetIcon(deploymentAsset.type).label,
                            rank: IconAsset.getFilterRank('deployment_id'),
                            elements: [{
                                title: deploymentAsset.name,
                                icon: IconAsset.getAssetIcon(deploymentAsset.type).iconClass
                            }]
                        }
                    );
                }
            }
        });

        remediationFilter.forEach(filter => {
            const filterType = filter.type;
            if (typeList.includes(filterType)) {
                readOnlyFilter.push({
                    title: AppConstants.Filters.filterCaptions[filterType].caption,
                    rank: IconAsset.getFilterRank[filterType],
                    elements: [{
                        title: this.determineFilterValueCaption(`${filterType}:${filter.key}`, filterType),
                        icon: IconAsset.getAssetIcon(filterType).iconClass
                    }]
                });
            }

            readOnlyFilter.sort((a, b) => a.rank - b.rank);
        });

        return readOnlyFilter;

    }

}
