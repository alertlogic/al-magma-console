export interface AlBottomSheetHeaderOptions {
    icon?: string;
    classIcon?:string;
    iconStyle?: { [key: string]: string };
    title?: string;
    titleStyle?: { [key: string]: string };
    collapsibleFromTitle?: boolean;
    primaryAction?: { // primary buttom
        text?: string,
        disabled: boolean
    };
    secondaryAction?: { // secondary buttom
        text: string,
        disabled: boolean
    };
    tertiaryAction?: { // tertiary buttom
        text: string,
        disabled: boolean
    };
}
