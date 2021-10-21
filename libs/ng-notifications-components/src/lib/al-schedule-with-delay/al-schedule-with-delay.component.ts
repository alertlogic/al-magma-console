import { Component, Input, EventEmitter, Output, OnInit} from '@angular/core';

export interface AlFrequency {
    amount: number;
    unit: 'minutes'|'hours'|'days';
}

export interface AlScheduleTime {
    hour: number;
    minute: number;
}

@Component({
    selector: 'al-schedule-with-delay',
    templateUrl: './al-schedule-with-delay.component.html',
    styleUrls: ['./al-schedule-with-delay.component.scss']
})

export class AlScheduleWithDelayComponent implements OnInit{

    // Configuration inputs
    @Input() frequency: AlFrequency = { amount: 6, unit: 'hours'};
    // if we are going to show the delay time in UTC, false to show it in browser time
    @Input() isGMT: boolean = true;

    // This will emit when the delay hours change 0 as soon as possible otherwise schedule with delay
    @Output() onDelayChange: EventEmitter<AlScheduleTime> = new EventEmitter();

    public scheduleWithDelay: boolean = false;
    public scheduleDelayHours: number = 1;
    public hour?: number; // next schedule hour
    public min?: number; // next schedule minute

    constructor() {
    }

    ngOnInit() {
        this.handleScheduleWithDelay(this.frequency);
    }

    /**
     * Handle the proces of setting asap or with delay schedule
     *
     * @param frequency the frequency in a generic format amount and unit
     * @param scheduleTime optional, the schedule time we want to set without calculaion (hour and minute)
     */
    handleScheduleWithDelay(frequency?: AlFrequency, scheduleTime?: AlScheduleTime): void {

        setTimeout(() => {
            // Let's set the new frequency if it comes
            if (frequency) {
                this.frequency = frequency;
            }
            if (scheduleTime) {
                this.scheduleWithDelay = true;
                this.hour = scheduleTime.hour;
                this.min = scheduleTime.minute;
            } else {
                let date: Date = new Date();
                this.hour =  this.isGMT? date.getUTCHours() : date.getHours();
                this.min = this.isGMT? date.getUTCMinutes() : date.getMinutes();
                if (this.scheduleWithDelay) {
                    this.isGMT? date.setUTCHours(this.hour + this.scheduleDelayHours) :
                                date.setHours(this.hour + this.scheduleDelayHours) ;
                } else { // Let's add 10 minutes when scheduling asap
                    this.isGMT? date.setUTCMinutes(this.min + 10) :
                                date.setMinutes(this.min + 10) ;
                }
                this.hour = this.isGMT? date.getUTCHours() : date.getHours();
                this.min = this.isGMT? date.getUTCMinutes() : date.getMinutes();
            }
            this.onDelayChange.emit({hour: this.hour, minute: this.min});
        });
    }
}
