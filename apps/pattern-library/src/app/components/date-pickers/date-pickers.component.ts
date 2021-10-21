import { Component } from '@angular/core';
import { SelectFixedRange, DateRangeSelection } from '@al/ng-generic-components';

@Component({
    selector: 'app-date-pickers',
    templateUrl: './date-pickers.component.html',
    styleUrls: ['./date-pickers.component.scss']
})
export class DatePickersComponent {

    rangeDates?: Date[];
    rangeDates2?: Date[];

    public defaultFixedRanges: SelectFixedRange[] = [
        {
            label: "7d",
            value: "7-d"
        }, {
            label: "14d",
            value: "14-d"
        }, {
            label: "30d",
            value: "30-d",
            selected: true,
        }
    ];

    public searchFixedRanges: SelectFixedRange[] = [
        {
            label: "1h",
            value: "1-h"
        }, {
            label: "6h",
            value: "6-h"
        }, {
            label: "12h",
            value: "12-h"
        }, {
            label: "24h",
            value: "24-h"
        }, {
            label: "48h",
            value: "48-h"
        }, {
            label: "7d",
            value: "7-d"
        }, {
            label: "30d",
            value: "30-d"
        }
    ];

    public fixedRangesWithAll: SelectFixedRange[] = [
        {
            label: "7d",
            value: "7-d"
        }, {
            label: "14d",
            value: "14-d"
        }, {
            label: "30d",
            value: "30-d",
            selected: true,
        }, {
            label: "All",
            value: null
        }
    ];

    public startTime: Date = new Date();

    dateSelected(event: DateRangeSelection) {
        console.log(event);
    }

    timeSelected(event: Date) {
        console.log(event);
    }
}
