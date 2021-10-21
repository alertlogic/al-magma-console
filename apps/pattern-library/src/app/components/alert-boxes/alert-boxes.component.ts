import { Component, EventEmitter, ViewChild } from '@angular/core';
import { AlNotification, AlNotificationPanelComponent, AlNotificationType } from '@al/ng-generic-components';

@Component({
  selector: 'al-alert-boxes',
  templateUrl: './alert-boxes.component.html',
  styleUrls: ['./alert-boxes.component.scss']
})
export class AlertBoxesComponent {

  public notifications: EventEmitter<AlNotification> = new EventEmitter<AlNotification>();
  public notification: AlNotification;
  @ViewChild("notificationPanel", {static:true}) notificationPanel: AlNotificationPanelComponent;

  notifyConsole() {
    console.log('Zero state component with content - button hit');
  }

  // The following methods are used one to trigger the notification and the other one
  // to receive the event emmit
  triggerNotification() {
    console.log('trigger');
    // Show notification panel
    let contentText = "Manually created notification, needs to dismiss to close";
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
}
