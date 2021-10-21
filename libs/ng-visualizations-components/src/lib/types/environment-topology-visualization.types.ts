export interface IChartCategory {
    categoryCode: string;
    caption: string;
    visible?: boolean;
    cssClass?: string;
    icon?: string;
    weight?: number;
    extra?: any;
}

export interface IVisualizationElement {
    paths?: (string | {class: string, definition: string})[];//  if 'type' is path
    shiftX?: number;
    shiftY?: number;
    centerX?: number;
    centerY?: number;
    radius?: number;
    scale?: number;
    order?: number;
    class?: string;
}
