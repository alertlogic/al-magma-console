/**
 *  Imports
 */
import { AlStopwatch } from '@al/core';
import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import {
    AlActiveNotification,
    AlNotification,
    AlNotificationType,
} from '../types';

@Component({
    selector: 'al-notification-panel',
    templateUrl: './al-notification-panel.component.html',
    styleUrls: ['./al-notification-panel.component.scss'],
    providers: []
})

export class AlNotificationPanelComponent implements OnInit, OnDestroy {


    /**
     *  External accessible inputs
     */
    @Input() alertSource: EventEmitter<AlNotification>;
    @Input() displayMaximum: number = 3;
    @Input() allowExternalContent: boolean = false;

    /**
     * Outputs
     */
    @Output() onButtonClicked: EventEmitter<void> = new EventEmitter();
    @Output() onDismissFlush: EventEmitter<void> = new EventEmitter();

    /**
     *  Component instance data
     */
    notifications: AlActiveNotification[] = [];
    refreshTimer: AlStopwatch;


    /**
     *  On View Initialization
     */
    ngOnInit() {
        if (!this.isSubscribable(this.alertSource)) {
            throw new Error("Unexpected input: al-notification-panel's alertSource input must be an EventEmitter.");
        }
        this.alertSource.subscribe(this.onNotificationReceived);
        this.refreshTimer = AlStopwatch.repeatedly(this.onRefresh, 2000);
    }

    /**
     *  On View Destruction
     */
    ngOnDestroy() {
        this.refreshTimer.cancel();
    }

    /**
     *  On notification received
     */
    onNotificationReceived = (notification: AlNotification) => {
        console.log('notification received ', notification);
        let classes = ['notification'];
        if (notification.type === AlNotificationType.Information) {
            classes.push('info');
        } else if (notification.type === AlNotificationType.Warning) {
            classes.push('warning');
        } else if (notification.type === AlNotificationType.Error) {
            classes.push('error');
        } else if (notification.type === AlNotificationType.Critical) {
            classes.push('critical');
        } else if (notification.type === AlNotificationType.Success) {
            classes.push('success');
        }

        if (notification.flush) {
            this.notifications = [];
        }
        this.notifications.push({
            definition: notification,
            displayed_on: +(new Date()),
            classes: classes.join(' '),
            expanded: false
        });
    }

    /**
     *  On tick - clean up our active notifications list
     */
    onRefresh = () => {
        let currentTimestamp = +(new Date());
        for (let i = this.notifications.length - 1; i >= 0; --i) {
            let notification = this.notifications[i];

            if (notification.definition.autoDismiss) {
                if (currentTimestamp - notification.displayed_on >= notification.definition.autoDismiss) {
                    this.notifications.splice(i, 1);
                    continue;
                }
            }
        }
    }

    /**
     *  Type predicate for EventEmitter<AlNotification>
     */
    isSubscribable(emitter: EventEmitter<AlNotification>): emitter is EventEmitter<AlNotification> {
        return (emitter && typeof (emitter.subscribe) === 'function') ? true : false;
    }

    /**
     * Clean the notification panel
     */
    flush = () => {
        this.notifications = [];
    }

    /**
     * Emit the event when the user clicks the button
     */
    onButtonClick() {
        this.onButtonClicked.emit();
    }

    flushByIndex(index: number): void {
        this.notifications.splice(index, 1);
        this.onDismissFlush.emit();
    }
}
