import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';

import { AlScanSchedule } from '@al/scan-scheduler';
import { ScanSchedulerUtilityService, TimezoneItem } from '../../../../../services/scan-scheduler-utility.service';
import { BoxDescriptor } from '../../types';

@Component({
    selector: 'al-scan-window',
    templateUrl: './al-scan-window.component.html',
    styleUrls: ['./al-scan-window.component.scss']
})
export class AlScanWindowComponent implements OnInit {

    @Input() frequency: AlScanSchedule.ScanFrequencyEnum;
    @Input() scanWindow: "certain_hours" | "certain_days";
    @Input() parentForm: FormArray;
    @Input() parentAutomaticForm: FormArray;
    @Input() parentDailyForm: FormGroup;
    @Input() parentWeeklyForm: FormArray;
    @Input() parentMonthlyForm: FormArray;
    @Input() parentMonthlyCertainDaysForm: FormArray;
    @Input() parentQuarterlyForm: FormArray;
    @Input() parentWeekDayForm: FormArray;
    @Input() parentOnceForm: FormArray;

    @Output() onTimeZoneDefaultSet: EventEmitter<TimezoneItem[]> = new EventEmitter<TimezoneItem[]>();

    public timeZoneOptions: TimezoneItem[] = [];
    public filteredTimeZoneOptions: TimezoneItem[] = [];
    public daysOfWeek: {label: string, value}[] = [];
    public pluralizedDaysOfWeek: {label: string, value}[] = [];
    public daysOfMonth: {label: string, value}[] = [];
    public todayDate: Date = new Date();
    public formatTimeLabel: string = "24-hour clock";
    public daysOfWeekOptions: BoxDescriptor[] = [];
    public quarterOptions: {label: string, value}[] = [];
    public nthWeekOptions: {label: string, value}[] = [];

    public minimumDurationErrorLabel: string = "Scan duration must be a minimum of 8 hours.";
    public fewerDaysLabel: string = "If a month has fewer days, the last day of the month is used.";

    constructor(private scanSchedulerUtilityService: ScanSchedulerUtilityService) { }

    ngOnInit() {
        this.setInitialValues();
    }

    async setInitialValues() {
        this.daysOfWeek = [
            {label: "Monday", value: 1},
            {label: "Tuesday", value: 2},
            {label: "Wednesday", value: 3},
            {label: "Thursday", value: 4},
            {label: "Friday", value: 5},
            {label: "Saturday", value: 6},
            {label: "Sunday", value: 7},
        ];
        this.daysOfWeekOptions = [
            {id: "7", label: 'Su', selected: true} as BoxDescriptor,
            {id: "1", label: 'M', selected: true} as BoxDescriptor,
            {id: "2", label: 'Tu', selected: true} as BoxDescriptor,
            {id: "3", label: 'W', selected: true} as BoxDescriptor,
            {id: "4", label: 'Th', selected: true} as BoxDescriptor,
            {id: "5", label: 'F', selected: true} as BoxDescriptor,
            {id: "6", label: 'Sa', selected: true} as BoxDescriptor
        ];
        this.quarterOptions = [
            {label: "First month of quarter (Jan, Apr, Jul, Oct)", value: 1},
            {label: "Second month of quarter (Feb, May, Aug, Nov)", value: 2},
            {label: "Third month of quarter (March, June, Sep, Dec)", value: 3}
        ];
        this.nthWeekOptions = [
            {label: "1st", value: 1},
            {label: "2nd", value: 2},
            {label: "3rd", value: 3},
            {label: "4th", value: 4}
        ];
        this.pluralizedDaysOfWeek = [
            {label: "Mondays", value: 1},
            {label: "Tuesdays", value: 2},
            {label: "Wednesdays", value: 3},
            {label: "Thursdays", value: 4},
            {label: "Fridays", value: 5},
            {label: "Saturdays", value: 6},
            {label: "Sundays", value: 7},
        ];
        for (let index = 1; index <= 32; index++) {
            if (index === 32) {
                this.daysOfMonth.push({ label: "Last day", value: 31 });
            } else {
                this.daysOfMonth.push({ label: ""+index, value: index });
            }
        }
        let defaultTzName: TimezoneItem = this.scanSchedulerUtilityService.getTimezoneItem();
        this.filteredTimeZoneOptions = this.timeZoneOptions = this.scanSchedulerUtilityService.timeZoneOptions;
        this.parentForm.get('selectedTimezone').setValue(defaultTzName);
        this.onTimeZoneDefaultSet.emit(this.timeZoneOptions);
    }

    addScanWindow() {
        switch(this.frequency) {
            case "automatic":
                this.parentAutomaticForm.insert(this.parentAutomaticForm.length, this.scanSchedulerUtilityService.getDefaultWindow(1, 7));
                break;
            case "weekly":
                this.parentWeeklyForm.insert(this.parentWeeklyForm.length, this.scanSchedulerUtilityService.getDefaultWindow(1, 7));
                break;
            case "monthly":
                if (this.scanWindow === "certain_hours") {
                    this.parentMonthlyForm.insert(this.parentMonthlyForm.length, this.scanSchedulerUtilityService.getDefaultWindow(1, 31));
                }
                if (this.scanWindow === "certain_days") {
                    this.parentMonthlyCertainDaysForm.insert(this.parentMonthlyCertainDaysForm.length, this.scanSchedulerUtilityService.getDefaultWindow(1, 7));
                }
                break;
            case "quarterly":
                this.parentQuarterlyForm.insert(this.parentQuarterlyForm.length, this.scanSchedulerUtilityService.getDefaultQuarterlyWindow());
                break;
            default:
                console.error("Invalid to add a form in al-scan-window");
                break;
        }
    }

    deleteWindow(index: number) {
        switch(this.frequency) {
            case "automatic":
                this.parentAutomaticForm.removeAt(index);
                break;
            case "weekly":
                this.parentWeeklyForm.removeAt(index);
                break;
            case "monthly":
                if (this.scanWindow === "certain_hours") {
                    this.parentMonthlyForm.removeAt(index);
                }
                if (this.scanWindow === "certain_days") {
                    this.parentMonthlyCertainDaysForm.removeAt(index);
                }
                break;
            case "quarterly":
                this.parentQuarterlyForm.removeAt(index);
                break;
            default:
                console.error("Invalid to delete a form in al-scan-window");
                break;
        }
    }

    searchTimezone(event: any): void {
        let query: string = event.query;
        this.filteredTimeZoneOptions = this.timeZoneOptions.filter(tzOption => tzOption.label.toLowerCase().includes(query.toLowerCase()));
    }

    onSelectTimezone(timezone: TimezoneItem): void {
        if (this.frequency === "once") {
            this.parentForm.get('onceForm').updateValueAndValidity();
        }
    }

    checkLastDaysOfMonth(monthlyForm: FormGroup): boolean {
        const startDay: number = parseInt(monthlyForm.get('startDay').value, 10);
        const endDay: number = parseInt(monthlyForm.get('endDay').value, 10);
        const lastDaysOfMonth: number[] = [29, 30, 31];
        return lastDaysOfMonth.includes(startDay) || lastDaysOfMonth.includes(endDay);
    }

}
