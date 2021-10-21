import { TemplateRef } from "@angular/core";

export class AlPreviewData {
    title:string = "";
    subtitle:string = "";
    properties: AlPreviewDataPropertyDefinition[] = [];
}

export interface AlPreviewDataPropertyDefinition {
    key:string;
    value:string|string[]|AlPreviewDataValueDefinition[]|TemplateRef<any>;
    icon?:string;
    isTemplate?:boolean;
    templateData?:any;
    action?: () => void;
}

export interface AlPreviewDataValueDefinition {
    label: string|TemplateRef<any>;
    icon?: string;
    action?:() => void;
}
