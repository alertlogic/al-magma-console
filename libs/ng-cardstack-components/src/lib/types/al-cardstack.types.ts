import { AlCardstackCharacteristics } from "@al/core";
import {
    AlStateFilterDescriptor,
    AlToolbarContentConfig,
    AlFilterDescriptor,
} from "@al/ng-generic-components";

/**
 * AlCardstackViewCharacteristics is an extension of @al/core:AlCardstackView that includes descriptions of behaviors
 * in the presentation layer.
 */
export interface AlCardstackViewCharacteristics extends AlCardstackCharacteristics {
    /**
     * Header behaviors
     */
    header?: {
        title?: string;
        description?: string;
        descriptionBelowHeader?: string;
        icon?:string;
        iconConfig?: {name:string; cssClasses: string;}
        calendar?: null|"range"|"single"; //  Should the date range selector be exposed?  Absence of this property indicates false.
        addButton?: boolean;
        defaultDate?: null | Date[]
    };

    toolbarConfig?:AlToolbarContentConfig;

    selectedState?: AlStateFilterDescriptor;
    stateFilters?: { value: AlStateFilterDescriptor; disabled?: boolean }[];
    skipFetchOnStateChange?: boolean;
    alFilterConfig?: AlFilterDescriptor;
    displayFilterSideNav?: boolean;
}
