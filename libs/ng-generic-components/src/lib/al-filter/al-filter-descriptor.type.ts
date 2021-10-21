import { AlCardstackValueDescriptor, AlCardstackPropertyDescriptor } from '@al/core';

export interface AlFilterDescriptor {
    showFiltersCount?: boolean;
    hideEmptyFilterValues?: boolean;
    hideNotSelectedValues?: boolean;
    filterValueLimit?: number;
    filterValueIncrement?: number;
    expanded?: boolean; // Show or hide item on first load
    showMoreType?: "popover" | "plain" | "accordion";
    showClearFilter?:boolean;
    showSearch?:boolean;
    showToolTip?: boolean;
    toolTipText?: string;
    showHelpText?:boolean;
    helpText?:string;
    highlight?: boolean;
    activeIcon?: boolean;
    showMoreNoActive?: boolean; // show in the "show more" the filters that are not active
    showMoreZeros?: boolean;
}

/**
 * Filter values extend the underlying value descriptor managed by cardstack.
 */
export interface AlUiFilterValue extends AlCardstackValueDescriptor {
    cssClasses:string[];
}

/**
 * Filters extend the underlying property descriptor managed by cardstack.
 */
export interface AlUiFilter extends AlCardstackPropertyDescriptor {
    shown: number;
    children?: AlUiFilter[];
}
