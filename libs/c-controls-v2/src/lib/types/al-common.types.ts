export interface AlOptionItem {
    value?: any;
    label?: string;
    id?: string | number;
    description?: string;
    selected?: boolean;
    indeterminate?: boolean;
    highlighted?: boolean;
    disabled?: boolean;
    items?: AlOptionItem[];
    data?: any;
}

export enum BtnType {
    default = 'default',
    defaultOutline = 'default-outline',
    defaultGhost = 'default-ghost',
    primary = 'primary',
    primaryOutline = 'primary-outline',
    primaryGhost = 'primary-ghost',
    light = 'light',
    lightOutline = 'light-outline',
    lightGhost = 'light-ghost',
    danger = 'danger',
    success = 'success'
  }

export enum BadgeType {
    primary = 'primary',
    dark = 'dark',
    light = 'light',
    success = 'success',
    warning = 'warning',
    danger = 'danger',
    essentials = 'essentials',
    professional = 'professional',
    enterprise = 'enterprise',
    aws = 'aws',
    azure = 'azure',
    datacenter = 'datacenter'
}

export enum IconClass {
    al = 'al',
    materialIcons = 'material-icons',
    materialIconsOutlined = 'material-icons-outlined',
    materialIconsRound = 'material-icons-round'
}

export enum IconSize {
    sm = 'sm',
    md = 'md',
    lg = 'lg',
    xl = 'xl'
}
