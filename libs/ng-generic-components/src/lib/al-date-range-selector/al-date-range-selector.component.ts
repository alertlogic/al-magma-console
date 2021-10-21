import { Component, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { Calendar } from 'primeng/calendar';
import { SelectItem } from 'primeng/api';

export interface DateRangeSelection {
    timeFrame?: number|null;
    timeRange?: {
        start: number,
        end?: number
    };
}

export interface SelectFixedRange extends SelectItem {
    selected?: boolean;
}

/**
 * This constant object represents the chain to calculate
 * the amount of seconds from a particular time unit, so this
 * can be used as follows:
 * if we want to transform 2-d to seconds we will loop over the
 * keys until we find the needed entry and perform sequencial
 * multiplications the: 2-d would be: we find the time unit key
 * which is d -> 24*60(h)*60(m) = 86400 * 2 = 172800
 */
const timeUnitsMap: {[key: string]: number} = {
    min: 60,
    h: 60,
    d: 24,
    m: 30,
    y: 12
};

@Component({
    selector: 'al-date-range-selector',
    templateUrl: './al-date-range-selector.component.html',
    styleUrls: ['./al-date-range-selector.component.scss']
})

export class AlDateRangeSelectorComponent {

    @ViewChild('calendar') calendar: Calendar;

    /**
     * Inputs, properties to handle visual behaviour
     */
    @Input() selectorTitle: string = 'Data for the last:';
    @Input() fixedRanges: SelectFixedRange[] = [];
    @Input() customRangeTitle: string ='Custom range:';
    @Input() hideSelector: boolean = false;
    @Input() calendarSelectionMode: 'single'|'range' = 'range';
    @Input() calendarDateFormat: string = 'dd M yy';
    @Input() calendarMaxDaysHistory: number = 90; // By default we will be allowing the user to select 90 days in the past tops
    @Input() calendarMaxDate: Date = new Date();
    @Input() calendarMinDate: Date = new Date(new Date().setDate(this.calendarMaxDate.getDate() - this.calendarMaxDaysHistory));
    @Input() disableCalendar = false;
    @Input() showCalendar: boolean = true;
    @Input() showTimePicker: boolean = false;
    @Input() returnTimeFrame: boolean = false; // This will tell the component to return timeFrame instead of timeRange for fixed ranges
    @Input() timeZoneOffset?: string; // Time zone offset that will let the calendar to correctly represent the user tz configured
    @Input() placeholder?: string; // Placeholder for if there shouldn't be a default date.
    @Input() initialDateRangeSelection?: Date[]|undefined;
    /**
     * Outputs
     */
    @Output() onDateSelected: EventEmitter<DateRangeSelection> = new EventEmitter();
    @Output() onClosedCalendar: EventEmitter<DateRangeSelection> = new EventEmitter();
    @Output() onSelectFixedRange: EventEmitter<DateRangeSelection> = new EventEmitter();
    @Output() onShowCalendar: EventEmitter<DateRangeSelection> = new EventEmitter();

    /**
     * Public variables
     */
    public selectedFixedDate?: string;
    public selectedDateRange: Date|Date[]|undefined = [new Date(), new Date()];
    public startTime: Date = new Date();
    public endTime: Date = new Date();
    public hideCalendar: boolean = false;

    ngOnInit() {
        //  Always called at initialization time
    }

    ngAfterViewInit() {
        if (!this.placeholder) {
            if(!this.initialDateRangeSelection) {
                this.selectedDateRange = undefined;
                this.hideCalendar = true;
                this.setDefaultDateRange();
            } else {
                this.setInitialDateSelection();
            }
        } else {
            this.setInitialDateSelection();
        }
    }

    /**
     * Sets the default fixed date range or the one passed as param
     * @param fixedRangeToSelect SelectFixedRange, the fixedRange we want to set
     * @param emit boolean, if we want to emit the events or only setup the calendar
     */
    setDefaultDateRange(fixedRangeToSelect?: SelectFixedRange, emit: boolean = true): void {
        let selectedFixedRange: SelectFixedRange;
        if (fixedRangeToSelect) {
            selectedFixedRange = fixedRangeToSelect;
        } else {
            selectedFixedRange = this.fixedRanges.find((fixedRange: SelectFixedRange) => fixedRange.selected) || this.fixedRanges[0];
        }
        // Helps to wait the lifecycle to end and
        // assign the new value at the right time
        setTimeout(() => {
            this.selectedFixedDate = selectedFixedRange.value;
            this.updateCalendarFromFixedRange(this.selectedFixedDate, undefined, emit);
        });
    }

    /**
     * Handle date selection on fixed selector or calendar
     * @param date string
     * @param event string, possible event where the function may be called from (fixed or show)
     * @param emit boolean, if we want to emit the events or only setup the calendar
     */
    updateCalendarFromFixedRange(fixedRange: string|undefined = this.selectedFixedDate, event: 'fixed'|'show' = "fixed", emit: boolean = true): void {

        this.hideCalendar = false;

        // Let's set the emitter besed in the event we are emitting (fixed or closed)
        let emitter = (event === 'fixed')? this.onSelectFixedRange : this.onShowCalendar;

        if (fixedRange) {
            const milliseconds: number = this.getMillisecondsFromFixedRange(fixedRange);
            this.setCalendarDateRange(milliseconds);
            if (this.returnTimeFrame) {
                if (emit) {
                    emitter.emit({ timeFrame: Math.round(milliseconds / 1000) });
                }
            } else {
                this.handleDateRangeSelection(event);
            }
        } else if (fixedRange === null) {
            this.hideCalendar = true;
            this.selectedDateRange = undefined;
            if (emit) {
                emitter.emit(undefined);
            }
        }

        // Let's check if we are hiding the calendar
        // in order to set its placeholder
        if (this.hideCalendar) {
            this.placeholder = 'None';
        }


    }

    /**
     * Handle the event on show calendar
     */
    updateCalendarOnShow() {
        const fixedRange: string|undefined = this.selectedFixedDate;
        this.updateCalendarFromFixedRange(fixedRange, 'show');
    }

    handleDateRangeSelection(event?: string) {
        let startTime = this.startTime;
        let endTime = this.endTime;
        // If we are not using the time picker we should
        // set the lower and higher time for each boundary
        if (!this.showTimePicker) {
            startTime = new Date(startTime.setHours(0, 0, 0));
            endTime = new Date(endTime.setHours(23, 59, 59));
        }
        let dateSelection: DateRangeSelection = {
            timeRange: {
                start: Math.round(this.getMillisecondsFromDate((this.selectedDateRange as Date[])[0], startTime) / 1000),
                end: Math.round(this.getMillisecondsFromDate((this.selectedDateRange as Date[])[1], endTime) / 1000)
            }
        };

        if (event === "fixed") {
            this.onSelectFixedRange.emit(dateSelection);
        } else if (event === "closed") {
            this.onClosedCalendar.emit(dateSelection);
        } else if (event === "selected") {
            this.onDateSelected.emit(dateSelection);
        } else if (event === "show") {
            this.onShowCalendar.emit(dateSelection);
        }
    }

    /**
     * Handle date selection from calendar
     * @param date string, date string representation
     */
    selectDate(date?: string, isClosing: boolean = false): void {

        if (!this.selectedDateRange) {
            return;
        }
        // Let's unselect all fixed options
        // if we are selecting a calendar option
        this.selectedFixedDate = undefined;
        if (this.calendarSelectionMode === 'single') {
            // for single we do not set end timestamp
            let dateSelection: DateRangeSelection = {
                timeRange: {
                    start: Math.round(this.getMillisecondsFromDate(this.selectedDateRange as Date) / 1000)
                }
            };
            this.onDateSelected.emit(dateSelection);
        } else {
            let selectedDateRange: Date[] = this.selectedDateRange as Date[];
            // Let's check if we are closing the calendar only selecting the start date
            // then we force the end date to be equals to that one to make it work
            if (isClosing && selectedDateRange[1] === null) {
                selectedDateRange[1] = selectedDateRange[0];
            }
            // If we get the whole range, then we handle it
            if (selectedDateRange[1]) {
                const eventType = isClosing ? "closed" : "selected";
                this.handleDateRangeSelection(eventType);
            }
        }
        // Let's unhide the calendar
        this.hideCalendar = false;
    }

    getMillisecondsFromDate(date: Date, timeOnlyDate?: Date): number {
        if (timeOnlyDate) {
            return date.setHours(timeOnlyDate.getHours(), timeOnlyDate.getMinutes(), timeOnlyDate.getSeconds());
        } else {
            return date.getTime();
        }
    }

    getMillisecondsFromFixedRange(fixedRange: string): number {
        const fixedRangeParts: string[] = fixedRange.split('-');
        const quantity: number = parseInt(fixedRangeParts[0], 10);
        const unit: string = fixedRangeParts[1];
        let numberOfSeconds: number = 0;
        Object.keys(timeUnitsMap).find(timeUnit => {
            if (numberOfSeconds === 0) {
                numberOfSeconds = timeUnitsMap[timeUnit];
            } else {
                numberOfSeconds *= timeUnitsMap[timeUnit];
            }
            return timeUnit === unit;
        });
        numberOfSeconds = numberOfSeconds * quantity;
        if (numberOfSeconds === 0) {
            console.log(`Not valid fixed range value! -> ${fixedRange}`);
            return -1;
        }
        return numberOfSeconds * 1000;
    }

    /**
     * Allows the user to set the calendar date-range based on a timeframe
     * (milliseconds in the past) or using start and end date in milliseconds
     *
     * @param millisecondsInthePast number, this can represent the milliseconds in the past or the start date in milliseconds
     * @param endMilliseconds number, if set this means we are setting start and end date in milliseconds
     */
    setCalendarDateRange(millisecondsInthePast: number, endMilliseconds?: number): void {
        const endDate = (endMilliseconds)? new Date(endMilliseconds) : new Date();
        const startDate = (endMilliseconds)? new Date(millisecondsInthePast) : new Date(endDate.getTime() - millisecondsInthePast);

        // Now let's set the calendar values in order
        // to provide visual changes on each selection
        this.selectedDateRange = [startDate, endDate];
        this.startTime = startDate;
        this.endTime = endDate;
    }

    /**
     * Public function allowing parent to setup the whole date-range-selector
     * visualization from a defined dateRange programmatically
     * @param dateRange DateRangeSelection, date range structure to be used as base for the setup
     * @param emit boolean, if we want to emit the events or only setup the calendar
     */
    setupFromDateRange(dateRange: DateRangeSelection, emit: boolean = true): void {
        if (dateRange.timeFrame !== undefined) {
            // Let's look for the fixedRange that represents the timeFrame
            // we are trying to set programmatically and return the item
            const selectedFixedRange: SelectFixedRange|undefined = this.fixedRanges.find((fixedRange: SelectFixedRange) => {
                let secondsFromFixedRange: number = (fixedRange.value)? this.getMillisecondsFromFixedRange(fixedRange.value) / 1000 : fixedRange.value;
                return secondsFromFixedRange === dateRange.timeFrame;
            });
            // if item found lets set it as the default date range
            if (selectedFixedRange) {
                this.setDefaultDateRange(selectedFixedRange, emit);
            } else {
                console.error('The dateRange.timeframe is not a valid value entry from the list of fixed ranges you passed to the component');
            }
        } else {
            setTimeout(() => {
                if (dateRange.timeRange && dateRange.timeRange.end) {
                    this.selectedFixedDate = undefined;
                    this.setCalendarDateRange(dateRange.timeRange.start * 1000, dateRange.timeRange.end * 1000);
                    if (emit) {
                        this.handleDateRangeSelection("selected");
                    }
                }
            });
        }
    }
    openCalendar():void {
        this.calendar.inputfieldViewChild.nativeElement.dispatchEvent(new Event('click'));
    }
    private setInitialDateSelection() {
        setTimeout(() => {
            this.selectedDateRange = this.initialDateRangeSelection;
        });
    }
}
