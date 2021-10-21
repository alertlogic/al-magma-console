/**
 * List item details
 */
export interface AlSelectFilterItemDetails {
     id: number|string;
     name: string;
     code: number|string;
}

/**
 * Dashboard list items
 */
export interface AlSelectFilterItem {
    label: string;
    icon?: string;
    value?: AlSelectFilterItemDetails[]|AlSelectFilterItemDetails;
    subtext?: string;
}
