import { Component, ViewChild } from '@angular/core';
import { AlContentHeaderComponent, AlToolbarContentConfig, DateRangeSelection, SelectFixedRange } from '@al/ng-generic-components';
import { AlScoreCountDescriptor } from '@al/ng-generic-components';

@Component({
    selector: 'app-page-headers',
    templateUrl: './page-headers.component.html',
    styleUrls: ['./page-headers.component.scss']
})

export class PageHeadersComponent {

    @ViewChild("alContentHeader") alContentHeader: AlContentHeaderComponent;

    config: AlToolbarContentConfig = {
        showSelectAll: true,
        showGroupBy: true,
        showSortBy: true,
        sort: {
            order: 'asc',
            options: [
                {
                    label: 'option1',
                    value: 'option_1'
                },
                {
                    label: 'option2',
                    value: 'option_2'
                }]
        },
        search: {
            maxSearchLength: 20,
            textPlaceHolder: "search"
        },
        group: {
            options: [
                {
                    label: 'group1',
                    value: 'group_1'
                },
                {
                    label: 'group2',
                    value: 'group_2'
                }]
        }
    };

    defaultFixedRanges: SelectFixedRange[] = [
        {
            label: "3d",
            value: "3-d",
            selected: true,
        },
        {
            label: "7d",
            value: "7-d"
        },
        {
            label: "14d",
            value: "14-d"
        },
        {
            label: "All",
            value: null
        }
    ];

    returnTimeFrame = false;

    placeholder = "this is a placeholder";

    ngAfterViewInit(): void {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.
        setTimeout(() => {
            this.alContentHeader.setDateRange({
                timeRange: {
                    start: 1620755471,
                    end: 1620841871
                }
            }, false)
        });
    }
    
    public applyDateChange(date: Date[]) {
        console.log("date: " + date);
    }
    
    public sortByOrder(order: String) {
        console.log('sort order ', order);
    }
    
    public applyTextFilter(searchInput: String) {
        console.log('text filter on ', searchInput);
    }
    
    public sortByChanged(selectedItem: String) {
        console.log('sort item ', selectedItem);
    }
    
    public groupBy(groupItem: String) {
        console.log('group item ',groupItem);
    }
    
    public handleSelectAll(selectedItems: Boolean) {
        console.log('select all ', selectedItems);
    }
    
    public addButtonClicked( e: MouseEvent ) {
        console.log('add button click event ', e);
    }

    public selectDateRangePicker(dateSelection: DateRangeSelection) {
        console.log(dateSelection, "select event");
    }

    public showDateRangeSelector(dateSelection: DateRangeSelection) {
        console.log(dateSelection, "show event")
    }

    public closedDateRangeSelector(dateSelection: DateRangeSelection) {
        console.log(dateSelection, "closed event")
    }

    public fixedRangeDateRangeSelector(dateSelection: DateRangeSelection) {
        console.log(dateSelection, "selected fixed range")
    }

    public alScoreCountConfig = AlScoreCountDescriptor.import({
        high: 10,
        medium: 0,
        low: 30,
        none: 20,
    });

    selectedScore(severity: string) {
        console.log('Selected Score : ', severity);
    }
}
