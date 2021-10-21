/**
 * This definition of what filter properties and values are available will need to be expanded to address
 * other use cases.
 */

export interface AlSimpleFilterValue {
    title:string;
    selected?:boolean;
    value:any;
    disabled?:boolean;
    css_classes?:string|string[];
    count?:number;
}

export interface AlSimpleFilter {
    title:string;
    collapsed?:boolean;
    values: AlSimpleFilterValue[];
    value_limit?: number;
}
