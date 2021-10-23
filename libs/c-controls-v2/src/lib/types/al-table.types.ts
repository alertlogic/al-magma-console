import { IconClass, AlOptionItem } from './al-common.types';

export interface ColumnDef {
    header: string;
    headerTitle?: string; // Column Header title
    field: string; // field value for column per row
    fieldTitle?: string; // Field title
    path?: string; // path and is used for href linked cell with the key (below)
    key?: string; // [routerLink]="[path, key]"
    type?: ColumnType; // Data type
    minColWidth?: number; // px
    maxColWidth?: number; // px
    hidden?: boolean; // Hides the column and filter from view
    iconClass?: IconClass | string;
    iconColor?: string;
    filters?: AlOptionItem[];
}

export enum ColumnType {
    text = 'text',
    date = 'date',
    threat = 'threat',
    icon = 'icon',
    boolean = 'boolean',
    ipAddress = 'ipAddress'
  }
