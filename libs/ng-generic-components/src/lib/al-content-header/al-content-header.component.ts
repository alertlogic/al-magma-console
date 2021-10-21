import { Component, Input, Output, EventEmitter, ViewEncapsulation, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Calendar } from 'primeng/calendar';
import { AlDateRangeSelectorComponent, DateRangeSelection, SelectFixedRange } from '../al-date-range-selector/al-date-range-selector.component';

@Component({
    selector: 'al-content-header',
    templateUrl: './al-content-header.component.html',
    styleUrls: ['./al-content-header.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AlContentHeaderComponent implements OnChanges{
    /**
    *  Contains the css class to show icon
    */
    @Input() icon: string = "";
    @Input() iconConfig: {name:string; cssClasses: string;} | null = null;

    /**
     *  Main title in the header
     */
    @Input() title: string = "";

    @Input() descriptionHeader: string = "";

    /**
     *  Absence of this property indicates the + button will not display.
     */
    @Input() showAddButton: boolean = false;

    @Input() addMenuItems: MenuItem[] = [];

    @Input() defaultDate: Date[] | null = null;

    /**
     *  Defines the quantity of the selection, valid values are "single" and "range".from to
     *  Absence of this property indicates calender will not display.
     */
    @Input() showCalendar ?: 'single' | 'range' | 'al-date-range-selector';

    @Input() showTime: boolean = false;

    @Input() dateTimePlaceholder: string;

    @Input() defaultFixedRanges: SelectFixedRange[];

    @Input() returnTimeFrame: boolean = false;

    @Input() placeholder: string;

    @Input() selectorTitle: string = 'Data for the last:';

    @Input() customRangeTitle: string ='Custom range:';

    @Input() calendarMaxDaysHistory: number = 90; // By default we will be allowing the user to select 90 days in the past tops

    @Input() calendarMaxDate: Date = new Date();

    @Input() calendarMinDate: Date = new Date(new Date().setDate(this.calendarMaxDate.getDate() - this.calendarMaxDaysHistory));

    @Output() onDateRangeSelectedFromAlDateRangeSelector: EventEmitter<DateRangeSelection> = new EventEmitter<DateRangeSelection>();

    @Output() onClosedAlDateRangeSelector: EventEmitter<DateRangeSelection> = new EventEmitter<DateRangeSelection>();

    @Output() onShowAlDateRangeSelector: EventEmitter<DateRangeSelection> = new EventEmitter<DateRangeSelection>();

    @Output() onSelectFixedRangeAlDateRangeSelector: EventEmitter<DateRangeSelection> = new EventEmitter<DateRangeSelection>();

    @Output() onDateRangeSelected: EventEmitter<Date[]> = new EventEmitter<Date[]>();

    @Output() onButtonClicked = new EventEmitter<{event:MouseEvent}>();

    @ViewChild('datePicker') datePicker: Calendar;

    @ViewChild('alDateSelector') alDateSelector: AlDateRangeSelectorComponent;

    dateRange: Date[];

    showDateSelector: boolean;

    previousState: Date[] = [];


    ngOnChanges(changes: SimpleChanges) {
        if (changes && this.defaultDate) {
            this.dateRange = this.defaultDate;
            this.previousState = this.defaultDate;
        }
    }

    /**
    *  @method toggleSelectorVisibility
    *
    *  Toggles the Date Selector visibility
    */
    public toggleSelectorVisibility() {
        this.showDateSelector = !this.showDateSelector;
    }

    public selectedDateRange() {
        if( this.dateRange.length > 1 && this.dateRange[1]) {
            const endTime = this.dateRange[1];
            if (!this.showTime) {
                endTime.setHours(23);
                endTime.setMinutes(59);
                endTime.setSeconds(59);
            }
            this.dateRange[1] = endTime;
        }
        this.onDateRangeSelected.emit(this.dateRange);
        this.datePicker.overlayVisible = false;
        this.previousState = this.dateRange;
    }

    public selectedSingleDate() {
        if (this.showCalendar && this.showCalendar === 'single') {
            this.onDateRangeSelected.emit(this.dateRange);
        }
    }

    onClickAddButton(event:MouseEvent){
        this.onButtonClicked.emit({event});
    }

    dateRangeSelectedFromAlDateRangeSelector(event: DateRangeSelection) {
        this.onDateRangeSelectedFromAlDateRangeSelector.emit(event);
    }

    closedAlDateRangeSelector(event: DateRangeSelection) {
        this.onClosedAlDateRangeSelector.emit(event);
    }

    showAlDateRangeSelector(event: DateRangeSelection) {
        this.onShowAlDateRangeSelector.emit(event);
    }

    selectFixedRangeAlDateRangeSelector(event: DateRangeSelection) {
        this.onSelectFixedRangeAlDateRangeSelector.emit(event);
    }

    /**
     * close the calender on click of cancel
     */
    public close() {
        if (this.previousState) {
            this.dateRange = this.previousState;
        } else {
            this.datePicker.onClearButtonClick(true);
        }
        this.datePicker.overlayVisible = false;
    }

     /**
     * reset the calender on click of clear
     */
    clear() {
        this.datePicker.onClearButtonClick(true);
        this.previousState = this.dateRange;
        this.onDateRangeSelected.emit(this.dateRange);
    }

    setDateRange(dateRange: DateRangeSelection, emit: boolean = true): void {
        setTimeout(() => {
            if (this.alDateSelector) {
                this.alDateSelector.setupFromDateRange(dateRange, emit);
            }
        });
    }
}
