export interface AlIconConfig {
    name?: string;   // use this if you want materialIcon
    cssClasses?: string;    // use this if you want non-material icons
}
export interface AlSidebarConfig {

    expand?: boolean;
    expandable?: boolean;
    inline?: boolean;    // inline or fullpage side content
    modal?: boolean;
    header: {
        icon?: AlIconConfig;
        title: string;
        showClose: boolean;
        disableClose: boolean;
    };
    isloading: boolean;
    loadingCaption?: string;

    enableButtonToolbar?: boolean;
    primary?: {
        text: string;
        disabled: boolean;
        icon?: AlIconConfig;
    };
    secondary?: {
        text: string;
        disabled: boolean;
        icon?: AlIconConfig;
        callback?: any;
    };
    ternary?: {
        text: string;
        disabled: boolean;
        icon?: AlIconConfig;
        callback?: any;
    };
    viewHelper?: boolean;
    headerColor?: string;
    toolbarColor?: string;
}
