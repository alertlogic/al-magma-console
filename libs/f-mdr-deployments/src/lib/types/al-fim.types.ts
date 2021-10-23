import { AlFimConfiguration, fimConfigType } from '@al/fim';
import { SearchableItem } from '@al/ng-generic-components'

export interface CardItem extends SearchableItem{
    item:AlFimConfiguration;
    selected:boolean;
}

export interface FimGroup {
    [i: string]:{
        selected:boolean;
        type:fimConfigType;
        label:string;
        list:Array<CardItem>;
    }
}

export type GroupDescriptor = {
    [i in fimConfigType]: {
        type: fimConfigType;
        icon: string;
        label: string;
    }
}

export type fimFormMode = 'CREATE' | 'EDIT' | 'DUPLICATE';

export type fimType = 'MONITORING' | 'EXCLUSIONS';
