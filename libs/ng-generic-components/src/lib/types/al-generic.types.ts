import { SelectItem } from 'primeng/api';
export interface AlToolbarContentConfig {
    showSelectAll?: boolean;
    selectAll?: boolean;
    showSortBy?: boolean;
    sort?: {
        options?: SelectItem[];
        order?: 'asc' | 'desc';
        selectedOption?: string;
    };

    showGroupBy?: boolean;
    group?: {
        options?: SelectItem[];
        selectedOption?: string;
    };
    showSearch?: boolean;
    search?: {
        maxSearchLength?: number;
        textPlaceHolder?: string;
    };
    showViewBy?: boolean;
    viewBy?: AlViewByItem[];
}

export interface AlViewByItem {
    default?: boolean;
    icon?: {
        name?: string; // material icon
        cssClasses?: string; // use this property if you want to display a non material icon, e.g fontawesome
    };
    value: any;
    label: string;
}

export interface AlSelectItem<T = any> extends SelectItem {
    id?: string;
    subtitle?: string;
    checked?: boolean;
    isMaterialIcon?: boolean;
}

export interface AlChipItem<T = any> extends SelectItem {
    id?: string;
    subtitle?: string;
    separator: 'AND' | 'OR' | 'and' | 'or';
}

export interface SearchableItem {
    searchableVals: Array<string | number>;
}

export type searchableItem<T> = T & SearchableItem;

export interface TooltipConfig {
    showTooltip?:boolean;
    tooltipText?:string;
    tooltipPosition?:'right' | 'left' | 'top' | 'bottom';
}

export interface AlOptionItem {
    value?:         any;
    label?:         string;
    id?:            string | number;
    description?:   string;
    selected?:      boolean;
    highlighted?:   boolean;
    disabled?:      boolean;
    items?:         AlOptionItem[];
    data?:          any;
}
