/**
 * Remdiations CardstackView
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
    AIMSUser,
    AIMSClient
} from '@al/core';

import {
    AlAssetsQueryClient,
    HealthAssetVPC,
    HealthAssetDeployment,
    ExposureQueryResultItem,
    ThreatSummary,
    RemediationItemAsset, RemediationItemsQueryResult
} from '@al/assets-query';
import { FiltersUtilityService } from '../services';
import { FilterDefinitionsService } from '../services/filter-definitions.service';
import { BaseCardItemCore } from '../types';
import { AppConstants } from '../constants';

export class RemediationProperties implements AlCardstackItemProperties {
    id: string;
    caption: string;
    toptitle: string;
    category: string;
    severities: ThreatSummary;
    vinstances_count: number;
    accountName: string;
    deploymentNames: string[];
    deployment_ids: string[];
    reason?: string;
    expiration_Date?:number;
    modified_on?: number;
    affected_asset_count?:number;
    cvss_score?: number;
    threatiness?: number;
    exposures?: ExposureQueryResultItem[];
}

export class RemediationsCardstackView extends AlCardstackView<ExposureQueryResultItem, RemediationProperties> {

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
        const activeState = this.filterUtilityService.activeStateFilter.label;
        const accountId = AlSession.getActingAccountId();
        let rawResult;
        let responseItemsPropName: string;
        if(['Disposed', 'Concluded'].includes(activeState)){
            const remediationItemsQueryParams = this.filterUtilityService.prepareRemediationItemsQueryParams('remediations', remoteFilters);
            rawResult = await AlAssetsQueryClient.queryRemediationItems(accountId, remediationItemsQueryParams);
            responseItemsPropName = 'remediation-items';
            rawResult[responseItemsPropName].assets = (<RemediationItemsQueryResult>rawResult[responseItemsPropName]).assets.filter(item => {
                return item.hasOwnProperty('remediation_id') && item.vinstances_count > 0;
            });
            this.updateUserMap(rawResult[responseItemsPropName].assets);
            this.stateCount = rawResult[responseItemsPropName].rows;
        } else {
            const exposuresQueryParams = this.filterUtilityService.prepareExposuresQueryParams('remediations', remoteFilters);
            rawResult = await AlAssetsQueryClient.queryExposures(accountId, exposuresQueryParams);
            responseItemsPropName = 'remediations';
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
    public deriveEntityProperties(entity: ExposureQueryResultItem | RemediationItemAsset): RemediationProperties & BaseCardItemCore {
        let entityProps: RemediationProperties & BaseCardItemCore;
        let remediationId: string;
        let remediationName: string;
        let severities: ThreatSummary;
        let categories: string[];
        let vinstances_count: number;
        let deploymentNames: string[];
        let deploymentIds: string[];
        let reason: string;
        let expires:number;
        let asset_count:number;
        let cvss_score : number;
        let modified_on : number;
        let threatiness: number;
        let exposures: ExposureQueryResultItem[] = [];

        if(entity.type === 'remediation-item') {
            const remediationItem = (<RemediationItemAsset>entity);
            remediationId = remediationItem.audit_id + `${remediationItem['item_ids'] ? '/' + remediationItem.item_ids.join('/') : ''}`,
            severities = remediationItem.severities;
            categories = remediationItem.remediation.categories;
            vinstances_count = remediationItem.vinstances_count;
            remediationName = remediationItem.remediation.name;
            deploymentNames = this.filterUtilityService.extractExposureDeploymentNames(remediationItem);
            deploymentIds = [remediationItem.deployment_id];
            if(remediationItem.reason) {
                reason = AppConstants.PageConstant.reasonDispositions[remediationItem.reason].caption;
            }
            expires = remediationItem.expires;
            asset_count = remediationItem.asset_count;
            modified_on = remediationItem.modified_on;
            threatiness = remediationItem.threatiness;
            exposures = this.filterUtilityService.getExposuresForRemediation(remediationItem);

        } else {
            const exposureItem = (<ExposureQueryResultItem>entity);
            remediationId = exposureItem.remediation_id;
            severities = exposureItem.severities;
            categories = exposureItem.categories;
            vinstances_count = exposureItem.vinstances_count;
            remediationName = exposureItem.name;
            deploymentNames = this.filterUtilityService.extractExposureDeploymentNames(exposureItem);
            deploymentIds = [exposureItem.deployment_id];
            asset_count = exposureItem.asset_count;
            cvss_score = exposureItem.cvss_score;
            modified_on = exposureItem.modified_on;
            threatiness = exposureItem.threatiness;
            exposures = this.filterUtilityService.getExposuresForRemediation(exposureItem);
        }

        entityProps = {
            id: remediationId,
            caption: remediationName,
            toptitle: this.filterUtilityService.humanizeCategoriesList(categories),
            severities: severities,
            category: categories.join(),
            vinstances_count: vinstances_count,
            accountName: AlSession.getActingAccountName(),
            deploymentNames: deploymentNames,
            deployment_ids: deploymentIds,
            reason: reason,
            expiration_Date:expires,
            affected_asset_count:asset_count,
            cvss_score :cvss_score,
            modified_on: modified_on,
            threatiness: threatiness,
            countItems: [{
                number: asset_count,
                text: 'Affected Assets'
            },{
                number: vinstances_count,
                text: 'Exposure Instances'
            }],
            exposures
        };

        return entityProps;
    }

    /**
     * This function describes the behaviors of the view
     */
    public async generateCharacteristics(): Promise<AlCardstackCharacteristics> {
        return this.characteristics;
    }

    buildSubtitleText(deployment: HealthAssetDeployment, network: HealthAssetVPC) {
        let deploymentName = '';
        let cidr = '';
        if (deployment.hasOwnProperty('name')) {
            deploymentName = deployment.name;
        }
        if (network.hasOwnProperty('cidr_ranges')) {
            if (deploymentName.length > 0 && network.cidr_ranges.length > 0) {
                cidr = ` | ${network.cidr_ranges[0]}`;
            } else {
                cidr = network.cidr_ranges[0];
            }
        }
        return `${deploymentName}${cidr}`;
    }

}
