import { Component, Input, EventEmitter, Output, OnChanges} from '@angular/core';
import { SelectItem } from 'primeng/api';
import { CargoReportWeeklyScheduleV2, CargoReportDailyScheduleV2, CargoReportMonthlyScheduleV2 } from '@al/cargo';
import { startOfMonth, startOfWeek } from 'date-fns';
import { AlNotificationDictionariesUtility } from '../services/al-notification-dictionaries-utility';

@Component({
    selector: 'al-cadence-selector',
    templateUrl: './al-cadence-selector.component.html',
    styleUrls: ['./al-cadence-selector.component.scss']
})

export class AlCadenceSelectorComponent implements OnChanges{

    @Input() frequencies: string[] | false = []; // each report can have differente valid frecuency false or ["daily", "weekly", "monthly"],
    @Input() initialSchedule: undefined | 'every_15_minutes' | {
        daily?: CargoReportDailyScheduleV2;
        weekly?: CargoReportWeeklyScheduleV2;
        monthly?: CargoReportMonthlyScheduleV2;
    };
    // Emitter which emits the selected item and the hour
    @Output() onCadenceChanged: EventEmitter<{ daily: CargoReportDailyScheduleV2; } | { weekly: CargoReportWeeklyScheduleV2; }
        | { monthly: CargoReportMonthlyScheduleV2; } | 'every_15_minutes'> = new EventEmitter();

    options: SelectItem[] = [];
    selectedOption: { key: string, subLabel: string, hourInputLabel?: string } | undefined = undefined;
    hourSelected: Date = new Date();
    hourFieldName: string = '';
    dictionaries = new AlNotificationDictionariesUtility();

    constructor() {
        this.initialSetup();
    }

    ngOnChanges() {
        this.initialSetup();
    }

    /**
     * setup the frecuency and the default values
     */
    initialSetup = () => {
        this.options = [];

        if (this.frequencies instanceof Array) {
            this.setOptions(this.frequencies);
        }

        this.selectedOption = this.options.length > 0 ? this.options[0].value : undefined;
        this.hourSelected = new Date();

        // in edit mode if a schedule is passed
        if (this.initialSchedule) {
            const runTime = this.dictionaries.getRunTime(this.initialSchedule);
            this.hourSelected = runTime ? new Date(runTime): new Date();
            const cadenceSelected = this.dictionaries.getCadenceName(this.initialSchedule);
            const findOption = this.options.filter( option => cadenceSelected === option.value.key );
            if(findOption && findOption.length > 0){
                this.selectedOption = findOption[0].value;
            }
        }
        this.onBuildSchedule();
    }

    /**
     * populate the options
     * @param frequencies
     */
    setOptions = (frequencies: string[]) => {
        let options = [];
        if (frequencies.indexOf('daily') !== -1) {
            options.push({ label: 'Daily', value: { key: 'daily', hourInputLabel: 'at this local time (24-hour clock)' } });
        }
        if (frequencies.indexOf('weekly') !== -1) {
            options.push({ label: 'Weekly', value: { key: 'weekly', hourInputLabel: 'every Monday at this local time (24-hour clock)'  } });
        }
        if (frequencies.indexOf('monthly') !== -1) {
            options.push({ label: 'Monthly', value: { key: 'monthly', hourInputLabel: 'the first of the month at this local time (24-hour clock)'} });
        }
        this.options = options;
    }

    /**
     * function called when the frecuency is change or the time is changed
     */
    onBuildSchedule = () => {
        if (this.selectedOption) {
            let schedule = this.buildSchedule(this.selectedOption.key, this.hourSelected);
            if(schedule) {
                this.onCadenceChanged.emit(schedule);
            }
        }
    }
    /**
     * Build the schedule time using cargo types
     */
    buildSchedule = (selectedOptionKey: string, timeSelected: Date) => {
        let schedule;
        switch (selectedOptionKey) {
            case 'daily':
                schedule = this.buildDailySchedule(timeSelected);
                break;
            case 'weekly':
                schedule = this.buildWeeklySchedule(timeSelected);
                break;
            case 'monthly':
                schedule = this.buildMonthlySchedule(timeSelected);
                break;
            case 'default':
                schedule = undefined;
        }
        return schedule;
    }

    /**
     * build weekly schedule
     */
    buildWeeklySchedule = (inputDate: Date): { weekly: CargoReportWeeklyScheduleV2 } => {
        let customerTime = startOfWeek(inputDate, { weekStartsOn: 1 });
        customerTime.setHours(inputDate.getHours());
        customerTime.setMinutes(inputDate.getMinutes());

        return {
            weekly: {
                day: this.getDayName(customerTime.getUTCDay()),
                hour: customerTime.getUTCHours(),
                minute: customerTime.getUTCMinutes()
            }
        };
    }

    /**
     * Get the name of the day of the week
     * */
    getDayName = (day: number): 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' => {
        const daysOfWeek: any = {
            '0': 'sunday',
            '1': 'monday',
            '2': 'tuesday',
            '3': 'wednesday',
            '4': 'thursday',
            '5': 'friday',
            '6': 'saturday'
        };

        if (day >= 0 && day < 7) {
            return daysOfWeek[day];
        } else {
            console.warn("ERROR: requesting the name for the day :", day);
        }
        return daysOfWeek['1'];
    }

    /**
     * build daily schedule
     */
    buildDailySchedule = (inputDate: Date): { daily: CargoReportDailyScheduleV2 } => {
        return {
            daily: {
                hour: inputDate.getUTCHours(),
                minute: inputDate.getUTCMinutes()
            }
        };
    }

    /**
     * build monthly schedule
     */
    buildMonthlySchedule = (inputDate: Date): { monthly: CargoReportMonthlyScheduleV2 } => {
        let customerTime = startOfMonth(inputDate);
        customerTime.setHours(inputDate.getHours());
        customerTime.setMinutes(inputDate.getMinutes());

        return {
            monthly: {
                day: customerTime.getUTCDate(),
                hour: customerTime.getUTCHours(),
                minute: customerTime.getUTCMinutes()
            }
        };
    }
}
