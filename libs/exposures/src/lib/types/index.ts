import { HealthAssetExposure } from '@al/assets-query';
import { AlItemCount } from '@al/ng-cardstack-components';

export * from './icons.types';

export interface ExposuresByRemediation {
    remediationId: string;
    name: string;
    remediations_filters: string[];
    exposures?: HealthAssetExposure[];
    asset_count?: number;
}

export interface BaseCardItemCore {
    toptitle: string;
    countItems?: AlItemCount[];
    icon?: {
        name?: string;
        text?: string;
        cssClasses?: string;
    };
}

export interface IZeroState {
    active:boolean,
    isAlertLogicIcon:boolean,
    icon:string,
    title:string
    description:string,
    hasDeployments:boolean
}
