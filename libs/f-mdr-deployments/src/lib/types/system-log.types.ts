import { AlBaseCardItem, AlBaseCardConfig } from '@al/ng-cardstack-components';
import { AlTagScopeItem, AlAssetScopeItem, AlApplicationSyslog, AlApplicationEventlog } from '@al/applications';

export enum LogType{
    SYSLOG = 'syslog',
    EVENTLOG = 'eventlog'
}

export interface SystemLogCard {
    data: AlBaseCardItem,
    config: AlBaseCardConfig
}

export interface PropertiesCard {
    type: LogType.EVENTLOG | LogType.SYSLOG;
    collect: boolean;
    default: boolean;
    general: GeneralPropertiesEventLogCard | GeneralPropertiesSystemLogCard;
    scope: (AlAssetScopeItem | AlTagScopeItem)[]
}

export interface GeneralPropertiesBaseCard {
    created: {
        userId: string;
        user: string;
        date: number;
    };
    modified: {
        userId: string;
        user: string;
        date: number;
    };
}

export interface GeneralPropertiesSystemLogCard extends GeneralPropertiesBaseCard {
    config: {
        syslog: AlApplicationSyslog;
    }
}

export interface GeneralPropertiesEventLogCard extends GeneralPropertiesBaseCard {
    config: {
        eventlog: AlApplicationEventlog;
    }
}

export interface CardCollectEvent {
    status: boolean;
    value: AlBaseCardItem;
}

export interface SysLogTypes {
    label: string;
    value: string;
    allTypes: boolean;
}

export interface UserInfoCache {
    userId: string;
    name: string;
}
