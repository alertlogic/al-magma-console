export interface AlBottomSheetFooterOptions {
    primaryAction?: { // primary buttom
        text?: string,
        disabled: boolean,
        hidden: boolean
    };
    secondaryAction?: { // secondary buttom
        text: string,
        disabled: boolean,
        hidden: boolean
    };
}
