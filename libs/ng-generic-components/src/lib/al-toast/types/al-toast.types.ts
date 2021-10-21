export interface AlToastMessage {
    closable?: boolean;
    data?: AlToastMessageData;
    id?: any;
    key?: string;
    life?: number;
    severity?: string;
    sticky?: boolean;
}

export interface AlToastMessageData {
    buttons?: AlToastButtonDescriptor[];
    iconClass?: string;
    message?: string;
    textAlign?: string;
    title?: string;
}

export interface AlToastButtonDescriptor {
    class?: string;
    disabled?: boolean;
    key: string;
    label: string;
    textAlign?: string;
}
