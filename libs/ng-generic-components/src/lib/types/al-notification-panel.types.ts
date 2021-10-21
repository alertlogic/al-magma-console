
/**
 *  AlNotificationTypes - an enumeration of different types of notifications.
 */
export const enum AlNotificationType {
    Information,
    Warning,
    Error,
    Critical,
    Success,
    FakeEnthusiasm
}

/**
 *  Defines a notification to be created.
 */
export class AlNotification {
    /**
     *  Indicates what type of notification this is.
     */
    type: AlNotificationType;

    /**
     *  The textual message to accompany this notification.
     */
    text: string;

    /**
     *  If provided, the number of milliseconds to display this notification before it is automatically dismissed.
     */
    autoDismiss?: number;

    /**
     * require flush the other notifications
     */
    flush?: boolean;

    /**
     *  The name of the icon to accompany this notification.
     */
    icon?: string;

    /**
     *  The text for the button to accompany this notification.
     */
    buttonText?: string;

    /**
     *  Constructor
     *
     *  @param text string The message text.
     *  @param type AlNotificationType The type of the notificatino (see AlNotificationType enum)
     *  @param number autoDismiss (optional) number of milliseconds before this notification should be automatically dismissed.
     */
    constructor(text: string,
        type: AlNotificationType = AlNotificationType.Information,
        autoDismiss: number = 0,
        flush: boolean = false,
        icon: string = '',
        buttonText: string = '') {
        this.text = text;
        this.type = type;
        this.flush = flush;
        if (autoDismiss) {
            this.autoDismiss = autoDismiss;
        }
        this.icon = icon;
        this.buttonText = buttonText;
    }

    /**
     *  Helper static constructor for Information notifications
     */
    public static info(text: string, autoDismiss: number = 0, flush: boolean = false, icon: string = '', buttonText: string = ''): AlNotification {
        return new AlNotification(text, AlNotificationType.Information, autoDismiss, flush, icon, buttonText);
    }

    /**
     *  Helper static constructor for Warning notifications
     */
    public static warning(text: string, autoDismiss: number = 0, flush: boolean = false, icon: string = '', buttonText: string = ''): AlNotification {
        return new AlNotification(text, AlNotificationType.Warning, autoDismiss, flush, icon, buttonText);
    }

    /**
     *  Helper static constructor for Error notifications
     */
    public static error(text: string, autoDismiss: number = 0, flush: boolean = false, icon: string = '', buttonText: string = ''): AlNotification {
        return new AlNotification(text, AlNotificationType.Error, autoDismiss, flush, icon, buttonText);
    }

    /**
     *  Helper static constructor for Error notifications
     */
    public static success(text: string, autoDismiss: number = 0, flush: boolean = false, icon: string = '', buttonText: string = ''): AlNotification {
        return new AlNotification(text, AlNotificationType.Success, autoDismiss, flush, icon, buttonText);
    }
}

/**
 *  This class is used internally to describe a notification that is currently being displayed.
 */
export declare type AlActiveNotification = {
    definition: AlNotification;
    classes: string;
    displayed_on: number;
    expanded: boolean;

};
