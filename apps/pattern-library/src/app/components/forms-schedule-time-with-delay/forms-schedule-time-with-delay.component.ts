import { Component } from '@angular/core';
import { AlScheduleTime } from '@al/ng-notifications-components';

@Component({
    selector: 'app-forms-schedule-time-with-delay',
    templateUrl: './forms-schedule-time-with-delay.component.html'
})
export class FormsScheduleTimeWithDelayComponent {

    delayChange(scheduleTime: AlScheduleTime): void {
        console.log(scheduleTime);
    }
}
