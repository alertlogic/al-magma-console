# Al Content Header

## Summary

The content header showing Title, header icon and calendar. Header icon and calendar is optional field.

**Authors:**
Rakhi Mundhada (rakhi.mundhada@alertlogic.com)

## Example Usage

TS
### Inputs

headerIcon:string ='fa fa-bug'
headerTitle : string = ' Testing App'
showCalendar : string = 'range'|'single' // Defines the quantity of the selection, valid values are "single" and "range".from to
defaultFixedRanges : default ranges to set the buttons in the al-date-range-selector
returnTimeFrame: boolean // set input in AlDateRangeSelector if you want to get a timeframe
placeholder: string // set a placeholder in the AlDateRangeSelector

### Output
onDateRangeSelected :Event will trigger when a date is selected and click on apply.

public applyDateChange(dateRange) {
      console.log('date is ', dateRange);
  }

onDateRangeSelectedFromAlDateRangeSelector: Event will trigger when a date is selected and click on apply in the al-date-range-selector component.

onClosedAlDateRangeSelector :Event will trigger when close the AlDateRangeSelector.

onShowAlDateRangeSelector :Event will trigger when you open the AlDateRangeSelector.

onSelectFixedRangeAlDateRangeSelector :Event will trigger when you select a fixed range in the AlDateRangeSelector.


### HTML


Include an instance in your component's HTML providing an title is nessesary .Other inputs are optional

#### Simple usage
````
<al-content-header [title]="headerTitle"></al-content-header>

````
#### Full usage
````
<al-content-header
    [icon]="headerIcon" [title]="headerTitle"
    [showCalendar]="showCalendar" (onDateRangeSelected)="applyDateChange($event)">
</al-content-header>

````

#### al-date-range-selector usage
````
<al-content-header
    [icon]="headerIcon" [title]="headerTitle"
    [showCalendar]="'al-date-range-selector'" [defaultFixedRanges]="defaultFixedRanges" [returnTimeFrame]="returnTimeFrame"
    (onDateRangeSelectedFromAlDateRangeSelector)="selectDateRangePicker($event)"
    (onClosedAlDateRangeSelector)="closedDateRangeSelector($event)"
    (onSelectFixedRangeAlDateRangeSelector)="fixedRangeDateRangeSelector($event)"
    (onShowAlDateRangeSelector)="showDateRangeSelector($event)">
</al-content-header>


````