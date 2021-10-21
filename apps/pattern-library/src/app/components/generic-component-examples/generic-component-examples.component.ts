import { Component, EventEmitter, ViewChild } from '@angular/core';
import { AlNotification, AlNotificationPanelComponent, AlNotificationType, AlScoreCountDescriptor, AlSearchBarComponent } from '@al/ng-generic-components';
import { AlBaseCardItem, AlBaseCardConfig, AlBaseCardFooterActions, AlActionFooterButtons, alEditDeleteFooterActions, AlBaseCardFooterActionEvent, AlItemCount } from '@al/ng-cardstack-components';
@Component({
    selector: 'generic-component-examples',
    templateUrl: './generic-component-examples.component.html',
    styleUrls: ['./generic-component-examples.component.scss']
})
export class GenericComponentExamplesComponent {

    public alScoreCountConfig = AlScoreCountDescriptor.import({
        high: 10,
        medium: 0,
        low: 30,
        none: 20,
    });

    // Notifications Panel attributes
    public notifications: EventEmitter<AlNotification> = new EventEmitter<AlNotification>();
    public notification: AlNotification;
    @ViewChild("notificationPanel", {static:false}) notificationPanel: AlNotificationPanelComponent;
    @ViewChild("alSearchBar", {static: false}) alSearchBar: AlSearchBarComponent;

    public jsonViewerMock = {
        "my_string": "My awesome string",
        "my_number": 123,
        "my_boolean": false,
        "my_array": [
            "Item 1",
            "Item 2",
            "Item 3"
        ],
        "my_object": {
            "another_number": 456,
            "another_array": [
                { "key": "value" },
                {
                    "key": true,
                    "my_object": {
                        "another_number": 456,
                        "another_array": [
                            { "key": "value" },
                            { "key": true }
                        ]
                    }
                }
            ]
        }
    };

    // al-base-card examples
    public alBaseCardBasicItem: AlBaseCardItem = {
        id: '1',
        toptitle: 'Title',
        caption: 'Content',
        subtitle: 'Subtitle'
    };

    // Toggleagle with content projection
    public alBaseCardConfigToggleable: AlBaseCardConfig = {
        toggleable: true,
        toggleableButton: true,
        checkable: false,
        hasIcon: false,
    };

    public alBaseCardToggleableItem: AlBaseCardItem = {
        id: '1',
        icon: { name: 'date_range' },
        toptitle: 'Title',
        caption: 'Content',
        subtitle: 'Subtitle',
        expanded: false
    };

    // Footer actions, checkable
    public alBaseCardConfigFooterActions: AlBaseCardConfig = {
        toggleable: true,
        toggleableButton: true,
        checkable: true,
        hasIcon: false,
    };

    public alBaseCardFooterButtons: AlActionFooterButtons = {
        event: 'download',
        icon: 'ui-icon-get-app',
        visible: true,
        text: "DOWNLOAD"
    };

    public alBaseCardFooterActions: AlBaseCardFooterActions = {
        left: [this.alBaseCardFooterButtons],
        right: alEditDeleteFooterActions
    };

    public alBaseCardFooterActionsItem: AlBaseCardItem = {
        id: '1',
        icon: { name: 'date_range' },
        toptitle: 'Title',
        caption: 'Content',
        subtitle: 'Subtitle',
        expanded: false,
        footerActions: this.alBaseCardFooterActions
    };

    // Icon and checkable
    public alBaseCardConfigIcon: AlBaseCardConfig = {
        toggleable: true,
        toggleableButton: true,
        checkable: true,
        hasIcon: true,
    };

    public alBaseCardIconItem: AlBaseCardItem = {
        id: '1',
        icon: { name: 'date_range' },
        toptitle: 'Title',
        caption: 'Content',
        subtitle: 'Subtitle',
        expanded: false,
        footerActions: this.alBaseCardFooterActions
    };

    // Icon and checkable
    public alBaseCardItemCount: AlItemCount = {
        number: 135,
        text: 'Items'
    };

    public alBaseCardItemCountItem: AlBaseCardItem = {
        id: '1',
        icon: { name: 'date_range', text: 'Daily' },
        toptitle: 'Title',
        caption: 'Content',
        subtitle: 'Subtitle',
        countItems: [this.alBaseCardItemCount],
        expanded: false,
        footerActions: this.alBaseCardFooterActions
    };

    public loading: boolean = true;

    getData(searchTxt: string) {
        console.log('OnSearchChanged ', searchTxt);
    }

    toggleLoading() {
        this.loading = !this.loading;
    }

    notifyConsole() {
        console.log('Zero state component with content - button hit');
    }

    // The following methods are used one to trigger the notification and the other one
    // to receive the event emmit
    triggerNotification() {
        console.log('trigger');
        // Show notification panel
        let contentText = "Manually created notification need to dismiss to get away";
        this.notification = new AlNotification(contentText, AlNotificationType.Information, 0, true, undefined, "Dismiss");
        // custom notification
        this.notifications.emit(this.notification);

        this.notifications.emit(AlNotification.info("Info notification", 3000));
        this.notifications.emit(AlNotification.warning("Warning Notification", 3000));
        this.notifications.emit(AlNotification.error("Error Notification", 3000));
        this.notifications.emit(AlNotification.success("Success Notification", 3000));
    }

    notificationButtonClick() {
        this.notificationPanel.flush();
        console.log("The notification button was clicked and flushed!");
    }

    selectedScore(severity: string) {
        console.log('Selected Score : ', severity);
    }

    alBaseCardFooterAction(event: AlBaseCardFooterActionEvent) {
        console.log(event.name, event.value);
    }

    searchTest(search:string){
        console.log("Search =>", search)
    }

    lostFocus(){
        console.log("Focus Lost");
    }

    forceFocus(){
        this.alSearchBar.setSearchValue("Set Search Test", false);
        this.alSearchBar.setFocus();
    }
}
