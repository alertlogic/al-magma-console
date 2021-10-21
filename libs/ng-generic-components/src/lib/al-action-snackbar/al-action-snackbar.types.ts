export type AlActionSnackbarEvent = string;

export interface AlActionSnackbarElement {
    event: AlActionSnackbarEvent;
    visible: boolean;
    text: string;
    icon?: string;
    type: 'button' | 'input_switch';
    checked?: boolean;
    disabled?: boolean;
}
