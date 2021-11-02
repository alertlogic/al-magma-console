/**
 * Exposures CardstackView
 *
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */

import {
    AlCardstackView,
    AlCardstackItemProperties,
    AlCardstackCharacteristics,
    AlSession,
    AIMSClient,
    AIMSUser
} from '@al/core';

import {
    AlAssetsQueryClient,
    ExposureQueryResultItem,
    RemediationItemAsset,
    RemediationItemsQueryResult
} from '@al/assets-query';
import { FiltersUtilityService } from '../services';
import { FilterDefinitionsService } from '../services/filter-definitions.service';
import { BaseCardItemCore } from '../types';
import { AppConstants } from '../constants';

export class ExposureProperties implements AlCardstackItemProperties {
    id: string;
    caption: string;
    severity: string;
    category: string;
    accountName?: string;
    deploymentNames?: string[];
    deployment_ids: string[];
    remediationsIds: string[];
    cvss_score: number;
    cve: string;
    reason?: string;
    affected_asset_count?: number;
    vinstances_count?: number;
    expiration_Date?: number;
    modified_on?:number;
}

export class ExposuresCardstackView extends AlCardstackView<ExposureQueryResultItem, ExposureProperties> {

    constructor(
        private filterUtilityService: FiltersUtilityService,
        private filterDefinitionsService: FilterDefinitionsService,
    ) {
        super();
    }

    public usersMap:{ [id:string]: AIMSUser } = {};
    public stateCount: number;
    /**
     * This functions retrieves (or in this case, generates) more data.  In addition to returning
     * a list of raw entities, it is also responsible for setting pagination information.
     */
    public async fetchData(initialLoad: boolean, remoteFilters?: any[]): Promise<any[]> {
        const accountId = AlSession.getActingAccountId();
        const activeState = this.filterUtilityService.activeStateFilter.label;
        let rawResult;
        let responseItemsPropName: string;
        if(['Disposed', 'Concluded'].includes(this.filterUtilityService.activeStateFilter.label)){
            const remediationItemsQueryParams = this.filterUtilityService.prepareRemediationItemsQueryParams('exposures', remoteFilters);
            rawResult = await AlAssetsQueryClient.queryRemediationItems(accountId, remediationItemsQueryParams);
            responseItemsPropName = 'remediation-items';
            rawResult[responseItemsPropName].assets = (<RemediationItemsQueryResult>rawResult[responseItemsPropName]).assets.filter(item => {
                return item.hasOwnProperty('vulnerability_id') && item.hasOwnProperty('exposures') && item.exposures.length > 0;
            });
            this.stateCount = rawResult[responseItemsPropName].rows;
            this.updateUserMap(rawResult[responseItemsPropName].assets);
        } else {
            const exposuresQueryParams = this.filterUtilityService.prepareExposuresQueryParams('exposures', remoteFilters, true);
            rawResult = await AlAssetsQueryClient.queryExposures(accountId, exposuresQueryParams);
            responseItemsPropName = 'exposures';
            this.stateCount = rawResult.summary.severities.all;
        }
        if(remoteFilters.length > 0 && rawResult[responseItemsPropName].assets.length === 0) {
            console.warn('no results for applied filters, clearing to reset the view');
            this.clearFilters();
            return [];
        }
        if(rawResult[responseItemsPropName].assets.length === 0) {
            rawResult.filters = [];
        }
        this.filterUtilityService.updateStateFilterCount(this.stateCount);
        this.filterUtilityService.populateAssetsFromExposuresFilters(rawResult.filters);
        this.filterDefinitionsService.buildFilterDefinitions(rawResult.filters, this.characteristics, remoteFilters);
        this.updateCharacteristics(this.characteristics);
        this.remainingPages = rawResult[responseItemsPropName].assets.length / this.itemsPerPage;
        return rawResult[responseItemsPropName].assets;
    }

    async updateUserMap(assetsData:RemediationItemAsset[] ){
        assetsData.forEach(async (item) => {
            if (!this.usersMap[item.user_id]) {
                try {
                    this.usersMap[item.user_id] = await AIMSClient.getUserDetailsByUserId(item.user_id);
                } catch (error) {
                    if( error.status === 410 ) {
                        this.usersMap[item.user_id] = { name:"unknown user" } as AIMSUser;
                    } else {
                        console.error(error);
                    }
                }
            }
        });
    }

    /**
     * This function extracts properties from the original entity into the property DTO
     */
    public deriveEntityProperties(exposure: ExposureQueryResultItem | RemediationItemAsset): ExposureProperties & BaseCardItemCore {

        let entityProps: ExposureProperties & BaseCardItemCore;
        let remediationsIds: string[] = [];
        if(exposure.hasOwnProperty('remediations')) {
            (<ExposureQueryResultItem>exposure).remediations.forEach(remediation => {
                remediationsIds.push(remediation.remediation_id);
            });
        } else {
            remediationsIds.push((exposure as unknown as RemediationItemAsset).remediation_id);
        }

        const accountName = AlSession.getActingAccountName();
        if(exposure.type === 'remediation-item') {
            const remediationItem = exposure as RemediationItemAsset;
            const exposureItem = remediationItem.exposures[0];
            let uniqueId = '';
            if(remediationItem.audit_id) {
                uniqueId = `${remediationItem.audit_id}/${remediationItem.vulnerability_id}`;
            } else {
                uniqueId = `${remediationItem.vulnerability_id}/${remediationItem.item_ids.join()}/${remediationItem.deployment_id}`;
            }
            entityProps = {
                id: uniqueId,
                caption: exposureItem.name,
                reason: remediationItem.reason ? AppConstants.PageConstant.reasonDispositions[remediationItem.reason].caption : null,
                severity: exposureItem.severity,
                category: this.filterUtilityService.humanizeCategoriesList(exposureItem.categories),
                accountName: accountName,
                deploymentNames: this.filterUtilityService.extractExposureDeploymentNames(exposure),
                deployment_ids: [exposure.deployment_id],
                remediationsIds: remediationsIds,
                cvss_score: exposureItem.cvss_score,
                cve: exposureItem.cve,
                toptitle: this.filterUtilityService.humanizeCategoriesList(exposureItem.categories),
                countItems: [{
                    number: remediationItem.asset_count,
                    text: 'Affected Assets'
                },{
                    number: remediationItem.vinstances_count,
                    text: 'Exposure Instances'
                }],
                icon: this.deriveSeverityIconProps(exposureItem.severity, exposureItem.cvss_score),
                affected_asset_count: exposure.asset_count,
                vinstances_count: exposure.vinstances_count,
                expiration_Date:remediationItem.expires,
                modified_on:remediationItem.modified_on
            };

        } else {
            const exposureResultItem = (<ExposureQueryResultItem>exposure);
            const category = this.filterUtilityService.humanizeCategoriesList(exposureResultItem.categories);
            entityProps = {
                id: exposureResultItem.vulnerability_id,
                caption: exposureResultItem.name,
                severity: exposureResultItem.severity,
                category: category,
                accountName: accountName,
                deploymentNames: this.filterUtilityService.extractExposureDeploymentNames(exposureResultItem),
                deployment_ids: exposureResultItem.deployment_ids ? exposureResultItem.deployment_ids : [],
                remediationsIds: remediationsIds,
                cvss_score: exposureResultItem.cvss_score,
                cve: exposureResultItem.cve,
                toptitle: category,
                countItems: [{
                    number: exposureResultItem.asset_count,
                    text: 'Affected Assets'
                },{
                    number: exposureResultItem.vinstances_count,
                    text: 'Exposure Instances'
                }],
                affected_asset_count: exposure.asset_count,
                vinstances_count: exposure.vinstances_count,
                icon: this.deriveSeverityIconProps(exposureResultItem.severity,exposureResultItem.cvss_score),
                modified_on: exposure.modified_on
            };
        }
        return entityProps;
    }

    /**
     * This function describes the behaviors of the view
     */
    public async generateCharacteristics(): Promise<AlCardstackCharacteristics> {
        return this.characteristics;
    }


    deriveSeverityIconProps = (severity: string, cvssScore?:number) => {
        let icon = {
            cssClasses: 'al al-risk-1 risk low',
            text: 'Info'
        };
        switch (severity) {
            case 'high':
                icon.cssClasses = 'al al-risk-1 risk critical';
                icon.text = 'High';
                break;
            case 'medium':
                icon.cssClasses = 'al al-risk-2 risk high';
                icon.text = 'Medium';
                break;
            case 'low':
                icon.cssClasses = 'al al-risk-3 risk medium';
                icon.text = 'Low';
                break;
            default:
                break;
        }

        icon.text = icon.text+' '+cvssScore;
        return icon;
    }

}
