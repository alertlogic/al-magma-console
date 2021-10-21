import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { AlDateRangeSelectorComponent, DateRangeSelection, SelectFixedRange } from '@al/ng-generic-components';
import { AlFrequency, AlScheduleTime, AlScheduleWithDelayComponent } from '../al-schedule-with-delay/al-schedule-with-delay.component';
import { CargoReportDailyScheduleV2, CargoReportMonthlyScheduleV2, CargoReportWeeklyScheduleV2 } from '@al/cargo';

export interface Schedule {
    every_6_hours?: CargoReportDailyScheduleV2;
    every_12_hours?: CargoReportDailyScheduleV2;
    daily?: CargoReportDailyScheduleV2;
    weekly?: CargoReportWeeklyScheduleV2;
    monthly?: CargoReportMonthlyScheduleV2;
}

@Component({
    selector: 'al-schedule-report-form',
    templateUrl: './al-schedule-report-form.component.html',
    styleUrls: ['./al-schedule-report-form.component.scss'],
})

export class AlScheduleReportFormComponent implements OnInit {

    @ViewChild(AlDateRangeSelectorComponent) dateRangeSelector?: AlDateRangeSelectorComponent;
    @ViewChild(AlScheduleWithDelayComponent) scheduleWithDelayComponent?: AlScheduleWithDelayComponent;

    @Input() visible: boolean = false;
    @Input() allowMoreFrecuencies: boolean = false;

    @Output() onScheduleFormChanged:
        EventEmitter< 'once' |'asap' | 'every_15_minutes' |  'hourly' |
            Schedule > = new EventEmitter();

    @Output() isValidForm: EventEmitter<boolean> = new EventEmitter();

    public scheduleSearchFormGroup: FormGroup = new FormGroup({
        scheduleTime: new FormControl()
    });

    public componentTextsConfig: { [i: string]: string } = {
        scheduledFrequencyLabel: "Scheduled search to run",
        scheduledTimeRangeLabel: "Search time range",
        scheduledDayLabel: "on day",
        scheduledMonthDayLabel: "on each day",
        scheduledTimeLabel: "at time (GMT)"
    };

    public scheduledFrequencyOptions: Array<SelectItem> = [
        { label: "Daily", value: "daily" },
        { label: "Weekly", value: "weekly" },
        { label: "Monthly", value: "monthly" }
    ];

    public searchFixedRanges: SelectFixedRange[] = [
        { label: "1h", value: "1-h" },
        { label: "6h", value: "6-h" },
        { label: "12h", value: "12-h" },
        { label: "24h", value: "24-h" },
        { label: "48h", value: "48-h" },
        { label: "7d", value: "7-d" },
        { label: "30d", value: "30-d" }
    ];

    // Schedule Variables.
    public frequency: string = "monthly";
    public day: number = 1;
    public eachDay: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday" = "monday";
    public timeFrame: DateRangeSelection = { timeFrame: 3600 };
    public defaultDate = (date => (new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)))(new Date());
    public calendarDay: Date = this.defaultDate;
    public calendarTimestamp: number = 0;
    public minDate: Date = this.defaultDate;
    public time: string = "9:00";
    public formattedTime: Array<number> = [9, 0];
    public formattedSchedule: 'once' | 'asap' | 'every_15_minutes' | 'hourly' |
        Schedule = {
            monthly: {
                day: this.day,
                hour: this.formattedTime[0],
                minute: this.formattedTime[1]
            }
        };

    public scheduleDayOfMonthOptions: Array<SelectItem> = [];

    public scheduleDayOptions: Array<SelectItem> = [
        { label: "Sunday", value: "sunday" },
        { label: "Monday", value: "monday" },
        { label: "Tuesday", value: "tuesday" },
        { label: "Wednesday", value: "wednesday" },
        { label: "Thursday", value: "thursday" },
        { label: "Friday", value: "friday" },
        { label: "Saturday", value: "saturday" }
    ];
    // This will be the loaded date range to get the report data from if set
    public dataFromDateRange?: DateRangeSelection;

    public scheduleTime?: AlScheduleTime;
    public scheduleFrequency: AlFrequency = { amount: 6, unit: 'hours'};

    ngOnInit() {
        // Setting up days of the month.
        for (let i = 1; i <= 31; i++) {
            this.scheduleDayOfMonthOptions.push({ label:i.toString(), value:i });
        }
        if ( this.allowMoreFrecuencies ) {
            this.scheduledFrequencyOptions = [
                { label: "Once", value: "once" },
                { label: "As soon as possible", value: "asap" },
                { label: "Every 15 Minutes", value: "every_15_minutes" },
                // { label: "Hourly", value:"hourly"},
                { label: "Every 6 Hours", value: "every_6_hours" },
                { label: "Every 12 Hours", value: "every_12_hours" },
                ...this.scheduledFrequencyOptions
            ];
        }
        this.reset();
    }

    public onselectTemplate(): void {
        if (this.frequency === "monthly") {
            this.day = 1;
        } else if (this.frequency === "weekly") {
            this.eachDay = 'monday';
        } else if (this.frequency ===  "once") {
            this.calendarDay = this.defaultDate;
        } else if (['every_6_hours', 'every_12_hours'].includes(this.frequency)) {
            const amount: number = this.frequency === 'every_6_hours'? 6 : 12;
            // Let's wait the lifecycle to end until we access the component method
            setTimeout(() => {
                this.scheduleWithDelayComponent?.handleScheduleWithDelay({ amount: amount, unit: 'hours' });
            });
        }
        this.scheduleFormElementChange();
        // Let's set the date time selector to the range we have set if defined
        setTimeout(() => {
            if (this.dataFromDateRange) {
                this.dateRangeSelector?.setupFromDateRange(this.dataFromDateRange);
                this.dateRangeSelected(this.dataFromDateRange);
            }
        });
    }

    setFormValidations() {
        if (this.frequency !== 'every_15_minutes' &&
            this.frequency !== 'hourly') {
            this.scheduleSearchFormGroup = new FormGroup({
                scheduleTime: new FormControl( this.scheduleSearchFormGroup.get('scheduleTime')!.value, [
                    Validators.required
                ])
            });
        } else {
            this.scheduleSearchFormGroup = new FormGroup({
                scheduleTime: new FormControl()
            });
        }
    }

    public dateRangeSelected(timeFrame: DateRangeSelection) {
        this.timeFrame = timeFrame;
        this.scheduleFormElementChange();
    }

    public scheduleFormElementChange() {
        if (!this.scheduleSearchFormGroup.get('scheduleTime')!.value) {
            this.scheduleSearchFormGroup.get('scheduleTime')!.setValue(`${this.formattedTime[0]}:${this.formattedTime[1]}`);
        }
        this.setFormValidations();
        this.createScheduleObject();
        this.isValidForm.emit(this.scheduleSearchFormGroup.valid);
        this.onScheduleFormChanged.emit(this.formattedSchedule);
    }

    public createScheduleObject(): void {
        // Building Schedule Object.
        let scheduleTimeArr: string = '00:00';
        let scheduleTime: AlScheduleTime = { hour: 0, minute: 0 };
        if (this.scheduleSearchFormGroup.get('scheduleTime')!.value) {
            scheduleTimeArr = this.scheduleSearchFormGroup.get('scheduleTime')!.value.split(':');
            scheduleTime = {
                hour: parseInt(scheduleTimeArr[0], 10),
                minute: parseInt(scheduleTimeArr[1], 10)
            };
        }
        if ( typeof this.frequency === 'string' && ['once', 'asap', 'every_15_minutes', 'hourly'].includes(this.frequency) ) {
            this.formattedSchedule = this.frequency as 'once' | 'asap' | 'every_15_minutes' | 'hourly';
            if (this.frequency === 'once' && this.calendarDay) {
                this.calendarTimestamp = Math.floor(this.calendarDay.getTime()/1000);
                this.calendarTimestamp = this.calendarTimestamp + ((scheduleTime.hour * 60 * 60) + (scheduleTime.minute * 60));
            }
        } else {
            if ( this.frequency === 'daily' ) {
                this.formattedSchedule = { daily: scheduleTime };
            } else if ( this.frequency === 'weekly' ) {
                this.formattedSchedule = { weekly: { day: this.eachDay, hour: scheduleTime.hour, minute: scheduleTime.minute } };
            } else if ( this.frequency === 'monthly' ) {
                this.formattedSchedule = { monthly: { day: this.day, hour: scheduleTime.hour, minute: scheduleTime.minute } };
            } else if (['every_6_hours', 'every_12_hours'].includes(this.frequency)) {
                this.formattedSchedule = this.frequency === 'every_6_hours'? { every_6_hours: this.scheduleTime } :
                                         { every_12_hours: this.scheduleTime };
            }
        }
    }

    public setSchedule(schedule:Schedule | 'once' | 'asap' | 'every_15_minutes' | 'hourly'):void {
        this.formattedSchedule = schedule;
        if(schedule === 'once'){
            this.frequency = 'once';
            this.formattedSchedule = 'once';
        } else if(schedule === 'asap'){
            this.frequency = 'asap';
            this.formattedSchedule = 'asap';
        } else if(schedule === 'every_15_minutes'){
            this.frequency = 'every_15_minutes';
            this.formattedSchedule = 'every_15_minutes';
        } else if(schedule === 'hourly'){
            this.frequency = 'hourly';
            this.formattedSchedule = 'hourly';
        } else if(schedule.daily){
            this.frequency = 'daily';
            this.scheduleSearchFormGroup.get('scheduleTime')!.setValue(
                schedule.daily.hour.toLocaleString(undefined, {minimumIntegerDigits: 2}) + ':' + schedule.daily.minute.toLocaleString(undefined, {minimumIntegerDigits: 2})
            );
        } else if(schedule.weekly){
            this.frequency = 'weekly';
            this.eachDay = schedule.weekly.day;
            this.scheduleSearchFormGroup.get('scheduleTime')!.setValue(
                schedule.weekly.hour.toLocaleString(undefined, {minimumIntegerDigits: 2}) + ':' + schedule.weekly.minute.toLocaleString(undefined, {minimumIntegerDigits: 2})
            );
        } else if(schedule.monthly){
            this.frequency = 'monthly';
            this.day = schedule.monthly.day;
            this.scheduleSearchFormGroup.get('scheduleTime')!.setValue(
                schedule.monthly.hour.toLocaleString(undefined, {minimumIntegerDigits: 2}) + ':' + schedule.monthly.minute.toLocaleString(undefined, {minimumIntegerDigits: 2})
            );
        } else if (schedule.every_6_hours || schedule.every_12_hours) {
            // Let's set the frequency in order to show the new with delay component
            this.frequency = schedule.every_6_hours? 'every_6_hours' : 'every_12_hours';
            // Based on the frequency set let's set the needed information to be sent
            // to the component to present it correctly
            const amount: number = schedule.every_6_hours? 6 : 12;
            const scheduleDefinition: CargoReportDailyScheduleV2 = schedule.every_6_hours? schedule.every_6_hours :
                                                                 schedule.every_12_hours as CargoReportDailyScheduleV2;
            const frequency: AlFrequency = { amount: amount, unit: 'hours' };
            const scheduleTime: AlScheduleTime = {
                hour: scheduleDefinition.hour,
                minute: scheduleDefinition.minute
            };
            // Let's wait the lifecycle to end until we access the component method
            setTimeout(() => {
                this.scheduleWithDelayComponent?.handleScheduleWithDelay(frequency, scheduleTime);
            });
        }
    }

    public reset(){
        this.frequency = "monthly";
        this.day = 1;
        this.eachDay = "monday";
        this.calendarDay = this.defaultDate;
        this.minDate = this.defaultDate;
        this.scheduleSearchFormGroup.get('scheduleTime')!.setValue('09:00');
        this.formattedTime = [9, 0];
        this.formattedSchedule = {
                monthly: {
                day: this.day,
                hour: this.formattedTime[0],
                minute: this.formattedTime[1]
            }
        };
        this.setFormValidations();
        this.isValidForm.emit(this.scheduleSearchFormGroup.valid);
        this.onScheduleFormChanged.emit(this.formattedSchedule);
    }

    delayChange(scheduleTime: AlScheduleTime): void {
        this.scheduleTime = scheduleTime;
        this.scheduleFormElementChange();
    }
}
