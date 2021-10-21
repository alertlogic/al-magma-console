import { Component, Input, EventEmitter, Output } from '@angular/core';
import { AlScanSchedulerClientV2, AlTimeZone } from '@al/scan-scheduler';

export interface AlTimezoneItem {
    label: string;
    value: string;
    utcOffset: string;
}

export const defaultTimeZoneItem: AlTimezoneItem =  {label: 'Etc/UTC [+00:00]', value: 'Etc/UTC', utcOffset: '+00:00'};

@Component({
    selector: 'al-time-zone-selector',
    templateUrl: './al-time-zone-selector.component.html',
    styleUrls: ['./al-time-zone-selector.component.scss']
})

export class AlTimeZoneSelectorComponent {
    /**
     * Set the initial time zone if provided (e.g. 'Etc/UTC')
     */
    @Input() initialTimeZone?: string;

    /**
     * Outputs
     */
    @Output() onTimeZoneSelected: EventEmitter<AlTimezoneItem> = new EventEmitter();

    /**
     * Public variables
     */
    public selectedTimeZone?: AlTimezoneItem;
    public timeZoneOptions: AlTimezoneItem[] = [];
    public filteredTimeZoneOptions: AlTimezoneItem[] = [];

    ngOnInit() {
        this.getAllTimeZoneOptions();
    }

    onSelectTimezone(timezone: AlTimezoneItem): void {
        this.onTimeZoneSelected.emit(timezone);
    }

    searchTimezone(event: any): void {
        let query: string = event.query;
        this.filteredTimeZoneOptions = this.timeZoneOptions.filter(tzOption => tzOption.label.toLowerCase().includes(query.toLowerCase()));
    }

    /**
     * Get all timezone options
     */
    private getAllTimeZoneOptions() {
        this.filteredTimeZoneOptions = [];
        AlScanSchedulerClientV2.getTimeZonesList().then((timeZoneOptionsResponse: AlTimeZone[]) => {
            timeZoneOptionsResponse.forEach(timeZone => {
                if (timeZone.tz_name && timeZone.utc_offset && timeZone.dst_offset) {
                    // Let's check if the time zone offset we should apply is utc or dst
                    const tzOffset: string = (timeZone.dst)? timeZone.dst_offset : timeZone.utc_offset;

                    const item: AlTimezoneItem = this.setTimezoneItem(timeZone.tz_name, tzOffset);
                    this.filteredTimeZoneOptions.push(item);
                }
                this.timeZoneOptions = this.filteredTimeZoneOptions;
                this.selectedTimeZone = this.getTimezoneItem(this.initialTimeZone);
                this.onTimeZoneSelected.emit(this.selectedTimeZone);
            });
        }).catch(
            (error: any) => console.error("Error getting timezones --> ", error)
        );
    }

    /**
     * Search for a timezoneItem from timezone value in the
     * timeZoneOptions array (contains all available timezone options from backend),
     * if no param is passed will search one using timezone local browser
     * @param timezoneValue
     */
    private getTimezoneItem(timezoneValue?: string): AlTimezoneItem {
        let defaultTzName: AlTimezoneItem = defaultTimeZoneItem;
        // let's check the timezone browser name
        const localTzName: string = timezoneValue ? timezoneValue : Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.timeZoneOptions.forEach( timezone => {
            const timezoneName: string = timezone.value;
            if (localTzName === timezoneName) {
                defaultTzName = timezone;
            }
        });
        return defaultTzName;
    }

    /**
     * Creates a timezone item based in the data coming from scan-scheduler endpoint
     * @param timezoneName Time zone name representation (e.g. Etc/UTC)
     * @param tzOffset The time zone offset thia can be utc or dst if applies
     */
    private setTimezoneItem(timezoneName: string, tzOffset: string): AlTimezoneItem {
        return {
            label: `${timezoneName} ${tzOffset}`,
            value: timezoneName,
            utcOffset: tzOffset
        };
    }
}
