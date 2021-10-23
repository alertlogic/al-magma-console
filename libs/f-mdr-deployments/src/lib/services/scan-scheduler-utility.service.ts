import { FormGroup, FormControl, Validators, FormBuilder, ValidatorFn } from '@angular/forms';
import { Injectable } from '@angular/core';

import { AlScanSchedulerClientV2, AlTimeZone, AlScanSchedule } from '@al/scan-scheduler';
import { AlAssetsQueryClient, AssetQueryGeneralResponse } from '@al/assets-query';

import { DeploymentsUtilityService } from './deployment-utility.service';

export interface ScanAssetTypeVisualAddition {
    name: string;
    icon?: string;
    materialIcon?: string;
}

export interface TimezoneItem {
    label: string,
    value: string,
    utcOffset: string
};

export const defaultTimeZoneItem: TimezoneItem =  {label: 'Etc/UTC [+00:00]', value: 'Etc/UTC', utcOffset: '00:00'};

export const assetTypeMap: { [key: string]: ScanAssetTypeVisualAddition } = {
    "deployment": {
        name: "Deployment",
        icon: "al al-deployment"
    },
    "region": {
        name: "Region",
        icon: "al al-region"
    },
    "network": {
        name: "Network",
        icon: "al al-network"
    },
    "vpc": {
        name: "VPC",
        icon: "al al-vpc"
    },
    "subnet": {
        name: "Subnet",
        icon: "al al-subnet"
    },
    "host": {
        name: "Host",
        icon: "al al-host"
    },
    "tag": {
        name: "Tag",
        icon: "al al-tag"
    },
    "ip": {
        name: "IP"
    },
    "ip_range": {
        name: "IP Range"
    },
    "cidr": {
        name: "CIDR"
    },
    "external-dns-name": {
        name: "DNS Name",
        icon: "material-icons",
        materialIcon: "dns"
    },
    "external-ip": {
        name: "External IP",
        icon: "material-icons",
        materialIcon: "settings_ethernet"
    }
}

@Injectable()
export class ScanSchedulerUtilityService {

    public assetsDictionary: {[key: string]: {}}[] = [];
    public timeZoneOptions: TimezoneItem[] = [];

    constructor(private formBuilder: FormBuilder,
                private deploymentsUtilityService: DeploymentsUtilityService) { }

    public getDefaultWindow(minStartDay: number, maxEndDay: number): FormGroup {
        let formGroup: FormGroup = this.formBuilder.group({
            startDay: new FormControl(minStartDay, [Validators.min(minStartDay), Validators.max(maxEndDay)]),
            startTime: this.formBuilder.group({
                hours: new FormControl("00", [Validators.required, Validators.pattern('([01][0-9]|2[0-3])')]),
                minutes: new FormControl("00", [Validators.required, Validators.pattern('([0-5][0-9])')])
            }),
            endDay: new FormControl(maxEndDay, [Validators.min(minStartDay),Validators.max(maxEndDay)]),
            endTime: this.formBuilder.group({
                hours: new FormControl("00", [Validators.required, Validators.pattern('([01][0-9]|2[0-3])')]),
                minutes: new FormControl("00", [Validators.required, Validators.pattern('([0-5][0-9])')])
            })
        });
        if (maxEndDay === 31) {
            formGroup.setValidators([this.greaterEndDayValidator(formGroup), this.minScanWindowDurationValidator(formGroup)]);
        } else {
            formGroup.setValidators(this.minScanWindowDurationValidator(formGroup))
        }
        return formGroup;
    }

    public getDefaultQuarterlyWindow(): FormGroup {
        let quarterlyFormGroup: FormGroup = this.getDefaultWindow(1, 31);
        quarterlyFormGroup.addControl("monthOfQuarter", new FormControl(1, [Validators.required, Validators.min(1), Validators.max(3)]));
        return quarterlyFormGroup;
    }

    private greaterEndDayValidator(group: FormGroup): ValidatorFn {
        return (): {[key: string]: any} | null => {
            const isEndDayGreater = group.get('endDay').value >= group.get('startDay').value;
            return isEndDayGreater ? null : {'isGreaterEndDay': {'isGreater': false}};
        }
    }

    private minScanWindowDurationValidator(group: FormGroup): ValidatorFn {
        return (): {[key: string]: any} | null => {
            const startDay: number = group.get('startDay').value;
            const endDay: number = group.get('endDay').value;
            if ( (startDay === endDay || (startDay+1) === endDay) || (startDay+1 === 8 && endDay === 1) ) {
                const startTimeHours: number = parseInt(group.get('startTime').get('hours').value, 10);
                const endTimeHours: number = parseInt(group.get('endTime').get('hours').value, 10);
                let scanDuration: number = 0;
                if (startDay === endDay) {
                    scanDuration = endTimeHours - startTimeHours;
                }
                if (startDay+1 === endDay || (startDay+1 === 8 && endDay === 1)) {
                    scanDuration = (24 - startTimeHours) + endTimeHours;
                }
                return scanDuration >= 8 ? null : {'minScanWindowDuration': {'minScanWindowDuration': false}};
            }
            return null;
        }
    }

    public minScanOnceDurationValidator(group: FormGroup): ValidatorFn {
        return (): {[key: string]: any} | null => {
            const startDate: Date = group.get('startDate').value;
            const endDate: Date = group.get('endDate').value;
            const startDay: number = startDate.getDate();
            const endDay: number = endDate.getDate();
            if (startDay === endDay && group.get('hasSpecificEndDay').value) {
                const startTimeHours: number = parseInt(group.get('startTime').get('hours').value, 10);
                const endTimeHours: number = parseInt(group.get('endTime').get('hours').value, 10);
                const scanDuration: number = endTimeHours - startTimeHours;
                return scanDuration >= 8 ? null : {'minScanOnceDuration': {'minScanOnceDuration': false}};
            }
            return null;
        }
    }

    public greaterScanOnceEndDateValidator(group: FormGroup): ValidatorFn {
        return (): {[key: string]: any} | null => {
            if (group.get('hasSpecificEndDay').value) {
                let isEndDateGreater = group.get('endDate').value.getTime() >= group.get('startDate').value.getTime();
                return isEndDateGreater ? null : {'isGreaterEndDate': {'isGreater': false}};
            }
            return null;
        }
    }

    public minStartDateScanOnceValidator(group: FormGroup): ValidatorFn {
        return (): {[key: string]: any} | null => {
            const selectedTimezone: TimezoneItem = group.parent.get('selectedTimezone').value;
            const splitedUtcOffset: string[] = selectedTimezone.utcOffset.split(':');
            const utcOffset: number = splitedUtcOffset.length === 2 ? parseInt(splitedUtcOffset[0], 10) : 0;
            let startDate: Date = group.get('startDate').value;
            startDate.setHours(parseInt(group.get('startTime').get('hours').value, 10), parseInt(group.get('startTime').get('minutes').value, 10));
            // Getting todayDate depending on the selected timezone
            const todayDate: Date = this.calcDateFromOffset(new Date(), utcOffset);

            if (startDate > todayDate) {
                return null;
            } else {
                return {'minStartDateScanOnce': {'minStartDateScanOnce': false}};
            }
        }
    }

    public whiteSpacesValidator(control: FormControl): {[key: string]: boolean} | null {
        return (control.value as string).trim().length === 0 ? {'whiteSpaces': true} : null;
    }

    public getHoursFromString(time: string): string {
        const splitTime: string[] = time.split(':');
        return splitTime.length > 0 ? splitTime[0] : "";
    }

    public getMinutesFromString(time: string): string {
        const splitTime: string[] = time.split(':');
        return splitTime.length === 2 ? splitTime[1] : "";
    }

    public getDateFromString(stringDate: string): Date {
        const splitDate: string[] = stringDate.split('.');
        const year: number = splitDate.length === 3 ? parseInt(splitDate[0], 10) : 0;
        const month: number = splitDate.length === 3 ? parseInt(splitDate[1], 10) - 1 : 0;
        const day: number = splitDate.length === 3 ? parseInt(splitDate[2],10) : 0;
        let date: Date = new Date(year, month, day);
        return date;
    }

    public calculateScanDuration(startTime: string, endTime: string): string {
        const startHour: number = parseInt(this.getHoursFromString(startTime), 10);
        const endHour: number = parseInt(this.getHoursFromString(endTime), 10);
        if (startHour < endHour) {
            return (endHour-startHour) + "";
        } else {
            return ((24 - startHour)+endHour) + "";
        }
    }

    public calculateEndHoursFromScanDuration(startHours: string, scanDuration: number): string {
        let endHours: string = "00";
        const hours: number = parseInt(startHours, 10);
        if ( (hours+scanDuration) >= 24) {
            const endFinalHour = ((hours+scanDuration)-24);
            endHours = this.getFullDayMonthFormat(endFinalHour);
        } else {
            endHours = this.getFullDayMonthFormat(hours+scanDuration);
        }
        return endHours;
    }

    public getFullDayMonthFormat(dayOrMonth: number): string {
        return dayOrMonth < 10 ? "0"+dayOrMonth : dayOrMonth+"";
    }

    public async getTimezoneItemByName(timezoneName: string): Promise<TimezoneItem> {
        let timezone: AlTimeZone = (await AlScanSchedulerClientV2.getTimeZonesList()).find(timezoneItem => timezoneItem.tz_name === timezoneName);
        return (timezone)? this.setTimezoneItem(timezone.tz_name, timezone.utc_offset) : defaultTimeZoneItem;
    }

    public setTimezoneItem(timezoneName: string, utcOffset: string): TimezoneItem {
        return {
            label: `${timezoneName} ${utcOffset}`,
            value: timezoneName,
            utcOffset: utcOffset
        };
    }

    public hasAssetsToScanValidator(control: FormControl): {[key: string]: boolean}|null {
        if (control.parent) {
            const count: number = control.value.length;
            const includeAllAssets: boolean = control.parent.get('includeAllAssets').value;
            const hasItems = count > 0;

            return (includeAllAssets || hasItems) ? null : {'noAssetsToScanItems': true};
        }
        return null;
    }

    /**
     * Get the assets list to be shown
     */
    public getAssets(typeOfScan: AlScanSchedule.TypeOfScanEnum): Promise<AssetQueryGeneralResponse> {
        const deployment = this.deploymentsUtilityService.getDeploymentOnTracking();
        let params = {
            "asset_types": 'a:any',
            "a.type": "",
            "reduce": true
        };
        if (typeOfScan === 'external') {
            params["a.type"] = "<<external-dns-name,external-ip";
        } else if (typeOfScan === 'discovery') {
            params["a.type"] = "<<tag,vpc,region,deployment";
        } else {
            params["a.type"] = "<<tag,vpc,subnet,host,network,deployment,region";
        }
        return AlAssetsQueryClient.getDeploymentAssets(deployment.account_id, deployment.id, params);
    }

    /**
     * Get all timezone options
     */
    public getAllTimeZoneOptions() {
        this.timeZoneOptions = [];
        AlScanSchedulerClientV2.getTimeZonesList().then(
            timeZoneOptionsResponse => {
                timeZoneOptionsResponse.forEach(timezone => {
                    const timezoneOffset: string = timezone.dst ? timezone.dst_offset : timezone.utc_offset;
                    const item: TimezoneItem = this.setTimezoneItem(timezone.tz_name, timezoneOffset);
                    this.timeZoneOptions.push(item);
                });
            }
        ).catch(
            error => console.error("Error getting timezones --> ", error)
        );
    }

    /**
     * Search for a timezoneItem from timezone value in the
     * timeZoneOptions array (contains all available timezone options from backend),
     * if no param is passed will search one using timezone local browser
     * @param timezoneValue
     */
    public getTimezoneItem(timezoneValue?: string): TimezoneItem {
        let defaultTzName: TimezoneItem = defaultTimeZoneItem;
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

    calcDateFromOffset(localDate: Date, offset: number): Date {

        const utcDate = localDate.getTime() + (localDate.getTimezoneOffset() * 60000);
        return new Date(utcDate + (3600000*offset));

    }

}
