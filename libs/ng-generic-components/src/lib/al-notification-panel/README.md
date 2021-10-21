# AL Notification Panel

A component used to show any kind of notification

![screen shot 2018-05-09 at 14 59 02 am](https://algithub.pd.alertlogic.net/storage/user/66/files/af2a1414-592e-11e8-8384-e6c38d21fc71)

## Usage

Import the required types and classes

```javascript

import { EventEmitter } from '@angular/core';
import { AlNotification } from '../types';

```
Define the emitter attribute within the component that is going to use the notifications one
and emit the event to trigger the notification itself with the details we required for it

```javascript
// Notifications Panel attributes
public notifications: EventEmitter<AlNotification> = new EventEmitter<AlNotification>();
public notification: AlNotification;
@ViewChild("notificationPanel") notificationPanel: AlNotificationPanelComponent;

// The following methods are used one to trigger the notification and the other one
// to receive the event emmit 
triggerNotification() {
    // Show notification panel
    let contentText = "2 Incidents Closed";
    this.notification = new AlNotification(contentText, AlNotificationType.Information, 0, true, null, "UNDO");
    this.notifications.emit(this.notification);
}

notificationButtonClick() {
    this.notificationPanel.flush(this.notification);
    console.log("The notification button was clicked and flushed!");
}

```
Html

``` html
<al-notification-panel #notificationPanel 
                       [alertSource]="notifications" 
                       (onButtonClicked)="notificationButtonClick()">
</al-notification-panel>
```

## Inputs

### alertSource:EventEmitter<AlNotification>;

This is the notification definition

## Callbacks

### onButtonClicked;

The event receiver from the notification emmitter
