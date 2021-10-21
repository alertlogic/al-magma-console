# Al cadence component

## Summary

This component allow the user select the cadence, hour, minutes of a report schedule and return the cargo structure


List authors.
Maryit Sanchez

## Example Usage

```html
<al-cadence-selector [frequencies]="frequencies"
                    (onCadenceChanged)="onCadenceChanges($event)"></al-cadence-selector>
```

## Inputs

frequencies the list of cadence supported by a report, for example:
* ['daily']
* ['monthly']
* ['weekly']
* ['daily', 'weekly', 'monthly']

## Outputs

onCadenceChanged returns the cargo structure for the component
examples:

when the cadence selected is daily return a CargoReportDailyScheduleV2
```
{
    daily: {
        hour: 5,
        minute: 22
    }
};
```

when the cadence selected is weekly return a CargoReportWeeklyScheduleV2
```
{
    weekly: {
        day: 'sunday',
        hour: 1,
        minute: 22
    }
};
```

when the cadence selected is monthly return a CargoReportMonthlyScheduleV2
```
{
    monthly: {
        day: 2,
        hour: 23,
        minute: 00
    }
};
```

## Notes
* For weekly we return equivalent to monday, hour, minutes selected by the user(using user time) but we convert to utc time.

* For monthly we return equivalent to 1sr day of the month, hour, minutes selected by the user(using user time) but we convert to utc time.

* For daily we return the minutes selected by the user(using user time) but we convert to utc time.
