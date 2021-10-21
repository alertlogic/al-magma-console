export interface AlBaseCardConfig {
    toggleable?: boolean;
    toggleableButton?: boolean;
    checkable?: boolean;
    hasIcon?: boolean;
    style?: 'plain' | 'card';
}

export interface AlItemCount {
    number: number;
    text: string;
}

export interface AlBaseCardFooterActionEvent {
    name: string;
    value: AlBaseCardItem;
}

export interface AlActionFooterButtons {
    event: string;
    icon: string;
    visible: boolean;
    text: string;
}

export interface AlBaseCardFooterActions {
    left?: AlActionFooterButtons[];
    right?: AlActionFooterButtons[];
}

export interface AlBaseCardItem {
    id?: string;
    icon?: { name?: string; text?: string; cssClasses?: string; };
    toptitle?: string;
    caption?: string;
    subtitle?: string;
    countItems?: AlItemCount[];
    expanded?: boolean;
    checked?: boolean;
    footerActions?: AlBaseCardFooterActions;
    properties?: {[key: string]: unknown};
}

export const alEditDeleteFooterActions: AlActionFooterButtons[] = [
    {
        event: 'delete',
        icon: 'ui-icon-delete',
        visible: true,
        text: 'DELETE'
    },
    {
        event: 'edit',
        icon: 'ui-icon-edit',
        visible: true,
        text: 'EDIT'
    }
];
