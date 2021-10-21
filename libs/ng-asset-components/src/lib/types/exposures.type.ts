import { TooltipConfig } from '@al/ng-generic-components';

export interface AssetDetail {
    accountId?: string;
    deploymentId?: string;
    details?: any;
    hasComplementaryData?: boolean;
    icon?: string;
    iconMt?: string;
    key?: string;
    name?: string;
    parentExposures?: {[k: string]: boolean};
    type?: string;
    checked?: boolean;
    cardBackground?: boolean;
    uniqueKey?: string;
    tooltip?:TooltipConfig;
    remediationItemId?: string;
}

// Migrated from exposures.
export class VInstance {
    categories?: string[];
    concluded?: boolean;
    details?: string;
    disposed?: boolean;
    key?: string;
    modifiedOn?: number;
    target?: Array<{[k:string]: any}>;
    threatiness?: number;
}

/**
 * Migrated from exposures.
 * interface that helps grouping common utilities/functions
 * that are needed for both: Exposures and Remediations
 */
export class BaseExposureElement {
    accountId?: string;
    assetCount?: number;
    // When we filter by deployment, then each item came with this property instead of deploymentIds prop
    deploymentId?: string;
    deploymentIds?: string[];
    type?: string;
}

//  Migrated from exposures.
export class Remediation extends BaseExposureElement {
    categories?: string[];
    exposures?: Exposure[];
    exposuresCount?: number;
    name?: string;
    remediationId?: string;
    severities?: {[k:string]: number};
    tags?: {[k:string]: any};
    targetAssetType?: string;
    threatLevel?: number;
    threatPct?: number;
    threatiness?: number;
    type?: string;
    vinstancesCount?: number;
}

//  Migrated from exposures.
export class Exposure implements BaseExposureElement {
    categories?: string[];
    cve?: string;
    cvssScore?: number;
    cvssVector?: string;
    cwe?: string;
    // When we filter by deployment, then each item came with this property instead of deploymentIds prop
    deploymentId?: string;
    deploymentIds?: string[];
    external?: boolean;
    name?: string;
    remediations?: Remediation[];
    remediationCount?: number;
    remediationId?: string;
    severity?: string;
    tags?: any;
    threatiness?: number;
    threatLevel?: number;
    threatPct?: number;
    threatScore?: number;
    threatVector?: string;
    type?: string;
    vinstancesCount?: number;
    vinstances?: VInstance[];
    vulnerabilityId?: string;

    // OPTIONAL PROPERTIES ONLY USED IN REMEDIATION-DETAIL PAGE
    // I hope we can put this in a better place later
    hasComplementaryData?: boolean;
    resolution?: string;
    description?: string;
    impact?: string;
}

export interface Evidence {
    accountId?: string;
    key?: string;
    assetKey?: string;
    exposureId?: string;
    evidence?: string;
    title?: string;
    cardBorder?:boolean;
}

export interface  AffectedAssetDetails{
    selectedAssetCount?:number;
    allFutureAssetSelected? :boolean;
    selectedAssetText?:string;
    allFutureAssetText?:string;
    selectedAssetKeys?: string[];
    allFutureAssetsToggleable?: boolean;
}
