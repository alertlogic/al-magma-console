import { AlResponderCronScheduleTrigger } from "@al/responder";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { SelectItem } from "primeng/api";


@Component({
    selector: 'al-trigger-cron-scheduler',
    templateUrl: './al-trigger-cron-scheduler.component.html',
    styleUrls: ['./al-trigger-cron-scheduler.component.scss']
})
export class AlTriggerCronSchedulerComponent implements OnInit {

    cronUnits: SelectItem[] = [
        {label: 'Day(s)', value: 'day'},
        {label: 'Week(s)', value: 'week'},
        {label: 'Month(s)', value: 'month'},
        {label: 'Year(s)', value: 'year'}
    ];
    cronSelectedUnit: keyof AlResponderCronScheduleTrigger = 'day';

    cronDaysOptions: SelectItem[] = [
        {label: 'Mo', value: 'mon'},
        {label: 'Tu', value: 'tue'},
        {label: 'We', value: 'wed'},
        {label: 'Th', value: 'thu'},
        {label: 'Fr', value: 'fri'},
        {label: 'Sa', value: 'sat'},
        {label: 'Su', value: 'sun'}
    ];
    cronSelectedDay: string[] = [];

    cronMonthOptions: SelectItem[] = [
        {label: 'January', value: '1'},
        {label: 'February', value: '2'},
        {label: 'March', value: '3'},
        {label: 'April', value: '4'},
        {label: 'May', value: '5'},
        {label: 'June', value: '6'},
        {label: 'July', value: '7'},
        {label: 'August', value: '8'},
        {label: 'September', value: '9'},
        {label: 'October', value: '10'},
        {label: 'November', value: '11'},
        {label: 'December', value: '12'}
    ];

    cronExpressionOptions: SelectItem[] = [
        {label: 'First', value: '1st'},
        {label: 'Second', value: '2nd'},
        {label: 'Third', value: '3rd'},
        {label: 'Fourth', value: '4th'},
        {label: 'Last', value: 'last'}
    ];
    cronExpression: string = '1st'; // default

    cronExpressionDayOptions: SelectItem[] = [
        {label: 'Monday', value: 'mon'},
        {label: 'Tuesday', value: 'tue'},
        {label: 'Wednesday', value: 'wed'},
        {label: 'Thursday', value: 'thu'},
        {label: 'Friday', value: 'fri'},
        {label: 'Saturday', value: 'sat'},
        {label: 'Sunday', value: 'sun'}
    ];
    cronExpressionDay: string = 'mon'; // default
    cronExpressionMonth: string = '1'; // default - January

    cronTrigger: AlResponderCronScheduleTrigger;
    cronFrequency: number = 1;

    triggerHour: string = '00';
    triggerMinute: string = '00';

    recurringMode: 'date' | 'expression' = 'date';
    recurringDay: number | null = null;

    @Input() trigger: AlResponderCronScheduleTrigger;
    @Input() timezones: SelectItem[];

    @Output() onValidateTriggerSchedule: EventEmitter<boolean> = new EventEmitter<boolean>();

    ngOnInit() {
        this.setUpScheduler();
    }

    onFrequencyChange() {
        // Typescript is being really strict here.
        // This is to make sure the strings didn't magically change to undefined.
        if (!this.cronSelectedUnit) {
            return;
        } else {
            switch (this.cronSelectedUnit) {
                case "day":
                case "day_of_week":
                case "month":
                case "year":
                case "week":
                    break;
                default:
                    return;
            }
        }

        delete this.trigger.day;
        delete this.trigger.week;
        delete this.trigger.month;
        delete this.trigger.year;
        delete this.trigger.day_of_week;

        if (this.cronFrequency > 1) {
            this.trigger[this.cronSelectedUnit] = `*/${this.cronFrequency}`;
        } else {
            this.trigger[this.cronSelectedUnit] = '*';
        }

        if (this.cronSelectedUnit === 'week') {
            if (this.cronSelectedDay.length === 0) {
                this.cronSelectedDay = ['mon'];
                this.trigger.day_of_week = 'mon';
            } else {
                this.onSelectedDaysChange();
            }
        }
        if (['year', 'month'].includes(this.cronSelectedUnit)) {
            this.onRecurringModeClick();
        }
        this.validateScheduleInputs();
    }

    onSelectedDaysChange() {

        this.trigger.day_of_week = this.cronSelectedDay.join();
        this.onValidateTriggerSchedule.emit(this.cronSelectedDay.length > 0);
    }

    onRecurringModeClick() {
        if (this.recurringMode === 'date') {
            this.onRecurringDayChange();
        } else {
            this.trigger.day = `${this.cronExpression} ${this.cronExpressionDay}`;
            if (this.cronSelectedUnit === 'year') {
                this.trigger.month = this.cronExpressionMonth;
            }
            this.validateScheduleInputs();
        }
    }


    onRecurringDayChange() {
        if (this.recurringDay && this.recurringDay > 1) {
            this.trigger.day = `*/${this.recurringDay}`;
        } else {
            this.trigger.day = '*';
        }
        this.onValidateTriggerSchedule.emit(this.recurringDay !== null);
    }

    setTriggerTime() {
        this.trigger.hour = this.triggerHour.startsWith('0') ? this.triggerHour.charAt(1) : this.triggerHour;
        this.trigger.minute = this.triggerMinute.startsWith('0') ? this.triggerMinute.charAt(1) : this.triggerMinute;
        this.validateScheduleInputs();

    }

    private setUpScheduler() {

        if (this.trigger.year) {
            this.cronSelectedUnit = 'year';
            if (this.trigger.month) {
                this.cronExpressionMonth = this.trigger.month;
            }
            this.setCronFrequency(this.trigger.year);
            this.setRecurringFrequency(this.trigger.day || '');
        } else if (this.trigger.month) {
            this.cronSelectedUnit = 'month';
            this.setCronFrequency(this.trigger.month);
            this.setRecurringFrequency(this.trigger.day || '');
        } else if (this.trigger.week) {
            this.cronSelectedUnit = 'week';
            this.cronSelectedDay = (this.trigger.day_of_week || '').split(',');
            this.setCronFrequency(this.trigger.week);
        } else if (this.trigger.day) {
            this.cronSelectedUnit = 'day';
            this.setCronFrequency(this.trigger.day);
        }
        const hour = this.trigger.hour;
        const minute = this.trigger.minute;
        this.triggerHour = hour?.length === 1 ? `0${hour}` : (hour || '');
        this.triggerMinute = minute?.length === 1 ? `0${minute}` : (minute || '');
    }


    private setCronFrequency(val: string) {
        if (val.startsWith('*/')) {
            this.cronFrequency = Number.parseInt(val.replace('*/', ''), 10);
        } else if (val === '*') {
            this.cronFrequency = 1;
        } else {
            console.error(`An unexpected value of "${val}" was supplied`);
        }
    }

    private setRecurringFrequency(val: string) {
        if (val.startsWith('*/')) {
            this.recurringDay = Number.parseInt(val.replace('*/', ''), 10); // what if this cant be parsed??
            this.recurringMode = 'date';
        } else {
            const parts = val.split(' ');
            this.cronExpression = parts[0];
            this.cronExpressionDay = parts[1];
            this.recurringMode = 'expression';
        }
    }

    private validateScheduleInputs() {
        let isValid = true;
        if (!this.cronFrequency || this.triggerHour.length < 2 || this.triggerMinute.length < 2) {
            isValid = false;
        }
        this.onValidateTriggerSchedule.emit(isValid);
    }

}
