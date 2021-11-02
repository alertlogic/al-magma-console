/**
 * Advanced Scanning Scheduling
 * @author Carlos Orozco <carlos.orozco@alertlogic.com>
 *
 * @copyright Alertlogic, Inc 2020
 */
import { Component,
         OnInit,
         OnDestroy,
         Input,
         Output,
         EventEmitter,
         ViewChild,
         ChangeDetectorRef,
         AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ConfirmationService } from 'primeng/api';
import { TabView } from 'primeng/tabview'

import { AlLocation, AlSession } from '@al/core';
import { Deployment } from '@al/deployments';
import { AlToolbarContentConfig,
         AlActionSnackbarElement,
         AlViewHelperComponent } from '@al/ng-generic-components';
import { AlBaseCardConfig,
         AlBaseCardItem } from '@al/ng-cardstack-components';
import { AlScanSchedulerClientV2,
         AlScanSchedule,
         AlScanScheduleSummary,
         AlScanScopeItemAsset,
         AlScanScopeItemTag,
         ScanOptionPorts } from '@al/scan-scheduler';

import { AlAdvancedSchedulingFormComponent } from '../al-advanced-scheduling-form/al-advanced-scheduling-form.component';
import { DeploymentHeaderDescriptor } from '../../types';
import { AlFilterByValuePipe } from '../../../../../pipes';
import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';
import { assetTypeMap, ScanSchedulerUtilityService } from '../../../../../services/scan-scheduler-utility.service';
import { AlNavigationService } from '@al/ng-navigation-components';
import { ALTacoma, AlTacomaSite, AlTacomaView, AlTacomaWorkbook } from '@al/tacoma';

import {
    DeploymentConfigurationNotificationMessage as NotificationMessage
} from '../../types';

export interface ScanScheduleItem {
    item: AlBaseCardItem;
    status: string;
    assets_number: number;
    last_scan_date: Date;
    next_scan_date: Date;
    assets_in_sla: number;
    rawItem: AlScanSchedule;
}

@Component({
    selector: 'al-deployment-advanced-scheduling',
    templateUrl: './deployment-advanced-scheduling.component.html',
    styleUrls: ['./deployment-advanced-scheduling.component.scss'],
    providers: [ConfirmationService]
})
export class DeploymentAdvancedSchedulingComponent implements OnInit, OnDestroy, AfterViewChecked {

    @Input() showDiscovery: boolean;
    @Output() onNextAction: EventEmitter<any> = new EventEmitter();
    @Output() notify: EventEmitter<NotificationMessage> = new EventEmitter();

    @ViewChild('schedulingForm', { static: false }) schedulingForm!: AlAdvancedSchedulingFormComponent;
    @ViewChild(AlViewHelperComponent, { static: true }) viewHelper:AlViewHelperComponent;
    @ViewChild('mainTabView', { static: true }) mainTabView: TabView;

    private aaid: string;
    private locid: string;
    private step: string;
    private deepLinkScheduleId: string;

    public schedulesCollection: Array<ScanScheduleItem> = [];
    public filteredSchedulesCollection: Array<ScanScheduleItem> = [];
    public scanFrequencyLabelMap: { [key: string]: string } = {
        automatic: "Scan as often as necessary",
        daily: "Scan once a day",
        weekly: "Scan once a week",
        monthly: "Scan once a month",
        quarterly: "Scan once a quarter",
        once: "Scan once"
    };

    public scanWindowLabelMap: { [key: string]: string } = {
        days_of_week: "Scan only during certain times",
        days_of_month: "Days of month",
        weekly_period: "Scan only during certain times",
        monthly_period: "Scan only during certain times",
        certain_times_certain_days: "Scan only during certain times on certain days",
        weekday_of_month: "Scan only during a certain week on certain day",
        quarterly: "Scan only during certain times"
    };

    public daysOfWeekLabelMap: { [key: string]: string } = {
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
        7: "Sunday"
    };

    public dayOfMonthMap: { [key: string]: string } = {
        1: "1st",
        2: "2nd",
        3: "3rd",
        4: "4th"
    };

    public quarterLabelsMap: { [key: string]: string } = {
        1: "First month of quarter (Jan, Apr, Jul, Oct)",
        2: "Second month of quarter (Feb, May, Aug, Nov)",
        3: "Third month of quarter (March, June, Sep, Dec)"
    };

    public deploymentHeaderConfig: DeploymentHeaderDescriptor;
    public toolbarConfig: AlToolbarContentConfig;
    public typeOfScan: AlScanSchedule.TypeOfScanEnum = 'vulnerability';
    public loading: boolean = false;
    public accountId: string;
    public deployment: Deployment = DeploymentsUtilityService.createDeploymentBase();
    public selectedScheduleId: string;
    public scanSchedules: AlScanSchedule[];
    public filteredScanSchedules: AlScanSchedule[];
    public filterApplied: string = '';
    public selectedSortByType: 'name'|'enabled'|'last_scan_date'|'next_scan_date'|'assets_number' = "name";
    public selectedSortType: 'asc'|'desc' = "asc";
    public inputSearch: string = "";
    public assetsDictionary: {[key: string]: {}}[] = [];

    // Base card variables
    public baseCardConfig: AlBaseCardConfig = {
        toggleable: true,
        toggleableButton: true,
        hasIcon: true,
        checkable: true
    };
    public actionSnackbarButtons: AlActionSnackbarElement[] = [
        {
            event: "edit",
            icon: "edit",
            text: "EDIT",
            visible: true,
            type: "button"
        },
        {
            event: "delete",
            icon: "delete",
            text: "DELETE",
            visible: true,
            type: "button"
        },
    ];

    constructor(
        private deploymentsUtilityService: DeploymentsUtilityService,
        private changeDetectorRef: ChangeDetectorRef,
        private alFilterByValuePipe: AlFilterByValuePipe,
        private confirmationService: ConfirmationService,
        private scanSchedulerUtilityService: ScanSchedulerUtilityService,
        protected navigation: AlNavigationService,
        protected route: ActivatedRoute,
        protected router: Router
    ) { }

    ngOnDestroy() {
    }

    ngAfterViewChecked(): void {
        this.changeDetectorRef.detectChanges();
    }

    ngOnInit() {
        this.accountId = AlSession.getActingAccountId(); // Only used for actions against the acting accountId
        this.deployment = this.deploymentsUtilityService.getDeploymentOnTracking();
        this.setupInitialData();
        this.loadData();
        this.route.queryParams.subscribe( params => {
            this.aaid = params.hasOwnProperty('aaid') ? params['aaid'] : null;
            this.locid = params.hasOwnProperty('locid') ? params['locid'] : null;
            this.step = params.hasOwnProperty('step') ? params['step'] : null;
            this.deepLinkScheduleId = params.hasOwnProperty('edit') ? params['edit'] : null;
        });
    }

    private setupInitialData() {
        if (this.showDiscovery) {
            this.typeOfScan = "discovery";
        }
        this.deploymentHeaderConfig = new DeploymentHeaderDescriptor({
            title: 'Scan Schedules',
            buttons: [
                {
                    label: 'Next',
                    color: 'mat-primary',
                    disabled: false,
                    onClick: () => { this.onNextAction.emit() }
                }
            ]
        });
        this.toolbarConfig = {
            showSearch: true,
            showSortBy: true,
            search: { maxSearchLength: 80, textPlaceHolder: "search" },
            sort: {
                order: 'asc',
                options: [
                    {
                        label: 'Sort by Name',
                        value: 'name'
                    },
                    {
                        label: 'Sort by Active or Inactive',
                        value: 'enabled'
                    },
                    {
                        label: 'Sort by Latest Scan',
                        value: 'last_scan_date'
                    },
                    {
                        label: 'Sort by Next Scan',
                        value: 'next_scan_date'
                    },
                    {
                        label: 'Sort by Scan Targets',
                        value: 'assets_number'
                    }
                ]
            }
        };
    }

    async loadData(filter: string = null, forceNewData: boolean = false, checkDeepLink: boolean = true) {
        // starts loading
        this.loading = true;
        // Let's reset the current resuls
        this.schedulesCollection = [];
        // Now if we are not setting a filter (initial load)
        // or we have not results loaded yet then
        if (!filter || !this.scanSchedules || forceNewData) {
            // Let's loop over the queried schedules.
            this.scanSchedules = await AlScanSchedulerClientV2.getScanSchedulesList(this.deployment.account_id, this.deployment.id);
            filter = this.typeOfScan;
        }
        // Let's apply the active tab filter over the original list in order to not affect it
        // and use it when moving from one tab to other without the need of re-call the API
        this.filteredScanSchedules = this.alFilterByValuePipe.transform(this.scanSchedules, 'type_of_scan', filter);
        Promise.all(this.filteredScanSchedules.map(async (scanSchedule) => {
            // In here we should do our call to the AlScanSchedulerClient.getScanScheduleSummary
            return await this.loadScheduleSummary(scanSchedule);
        })).then( schedulesCollection => {
            this.schedulesCollection = this.filteredSchedulesCollection = schedulesCollection;
            this.sortBy(this.selectedSortByType);
            if (checkDeepLink) {
                this.checkForEditingDeepLink();
            }
            this.loading = false;
        } ). catch( error => this.handleError("summary"));
    }

    private checkForEditingDeepLink() {
        if (this.deepLinkScheduleId) {
            this.selectedScheduleId = this.deepLinkScheduleId;
            AlScanSchedulerClientV2.getScanSchedule(this.deployment.account_id, this.deployment.id, this.selectedScheduleId).then(
                schedule => {
                    if (this.mainTabView) {
                        this.setScanTab(schedule.type_of_scan);
                    }
                    this.editScanSchedule(schedule);
                }
            ).catch(
                error => {
                    console.error("Error getting the scan scheduling by deep linking -> ", error)
                    this.handleError("getOne");
                }
            );
        }
    }

    private setScanTab(typeScan: AlScanSchedule.TypeOfScanEnum) {
        let index = 0;
        switch (typeScan) {
            case "discovery":
                index = 0;
                break;
            case "vulnerability":
                index = this.showDiscovery? 1 : 0;
                break;
            case "external":
                index = this.showDiscovery? 2 : 1;
                break;
            default:
                break;
        }
        this.typeOfScan = typeScan;
        setTimeout(() => this.schedulingForm.getAssets() );
        this.loadData(this.typeOfScan, false, false);
        setTimeout(() => this.mainTabView.activeIndex = index );
    }

    // Get the required property from the asset type map
    getAssetMapValue(assetType: string, property: string = 'icon'): string {
        return (assetTypeMap.hasOwnProperty(assetType)) ?
            assetTypeMap[assetType][property] :
            assetType;
    }

    getMaterialIcon(assetType: string): string {
        if (assetTypeMap.hasOwnProperty(assetType) && assetTypeMap[assetType].hasOwnProperty('materialIcon')) {
            return assetTypeMap[assetType]['materialIcon'];
        } else {
            return "";
        }
    }

    updateScanSchedule(schedule: AlScanSchedule) {
        if ( !schedule.default || (this.typeOfScan !== "discovery" && schedule.default) ) {
            AlScanSchedulerClientV2.updateScanSchedule(this.deployment.account_id, this.deployment.id, schedule.id, schedule).then(
                response => {
                    this.handleSuccessOperation("edit-enabled", schedule);
                }
            ).catch( error => {
                console.error(error);
                schedule.enabled = !schedule.enabled;
                this.handleError("edit");
            });
        }
    }

    stopScan(scheduleId: string) {
        this.confirmationService.confirm({
            header: 'Stop This Scan',
            message: 'Are you sure you want to stop this scan? Unscanned assets will not be scanned until the next scheduled time.<br/><br/>\
                      To stop future scans, select "Inactive" on the scan schedule.',
            acceptLabel: 'STOP THIS SCAN',
            rejectLabel: 'CANCEL',
            accept: () => {
                this.loading = true;
                AlScanSchedulerClientV2.stopScanSchedule(this.deployment.account_id, this.deployment.id, scheduleId).then(
                    response => {
                        this.handleSuccessOperation("stop");
                    }
                ).catch(
                    error => {
                        this.loading = false;
                        console.error("Error stopping the scan schedule", error);
                        this.handleError("stop");
                    }
                );
            }
        });
    }

    handleTab(tab) {
        var index = tab.hasOwnProperty('index')? tab.index : 0;
        switch (index) {
            case 0:
                this.typeOfScan = this.showDiscovery? AlScanSchedule.typeOfScanEnum.Discovery : AlScanSchedule.typeOfScanEnum.Vulnerability;
                break;
            case 1:
                this.typeOfScan = this.showDiscovery? AlScanSchedule.typeOfScanEnum.Vulnerability : AlScanSchedule.typeOfScanEnum.External;
                break;
            case 2:
                this.typeOfScan = AlScanSchedule.typeOfScanEnum.External;
                break;
            default:
                break;
        }
        setTimeout(() => this.schedulingForm.getAssets() );
        this.loadData(this.typeOfScan);
    }

    getAssetNameFromDictionary (asset: AlScanScopeItemAsset|AlScanScopeItemTag): string {
        this.assetsDictionary = this.scanSchedulerUtilityService.assetsDictionary;
        let key: string = (asset.type === 'tag')? `${asset.key}_${asset.value}` : asset.key;
        if (this.assetsDictionary.hasOwnProperty(key)) {
            const assetInfoArray: [string, string, string] = this.schedulingForm.getAssetTitle(this.assetsDictionary[key]);
            return assetInfoArray[0] !== undefined || assetInfoArray[0] !== null ? assetInfoArray[0] : "No name found";
        } else {
            return "";
        }
    }

    createScanSchedule() {
        this.schedulingForm.createSchedule();
    }

    editScanSchedule(selectedSchedule: AlScanSchedule) {
        if (selectedSchedule) {
            this.selectedScheduleId = selectedSchedule.id;
        }
        if (this.aaid && this.locid && this.step) {
            this.router.navigate(['.'],
                { relativeTo: this.route, queryParams: {aaid: this.aaid, locid: this.locid, step: this.step, edit: this.selectedScheduleId },
                queryParamsHandling: ''}
            );
            this.schedulingForm.editSchedule(this.selectedScheduleId);
        }
    }

    deleteScanSchedule(selectedSchedule: AlScanSchedule) {
        this.selectedScheduleId = selectedSchedule.id;
        this.confirmationService.confirm({
            header: 'Delete Schedule',
            message: 'Are you sure you want to delete this schedule?',
            acceptLabel: 'DELETE',
            rejectLabel: 'CANCEL',
            accept: () => {
                this.loading = true;
                AlScanSchedulerClientV2.removeScanSchedule(this.deployment.account_id, this.deployment.id, this.selectedScheduleId).then(
                    response => {
                        this.handleSuccessOperation("delete", selectedSchedule);
                    }
                ).catch(
                    error => {
                        this.loading = false;
                        console.error(error);
                        this.handleError('delete');
                    }
                );
            }
        });
    }

    sortBy(sortByTpe: 'name'|'enabled'|'last_scan_date'|'next_scan_date'|'assets_number') {
        this.selectedSortByType = sortByTpe;
        const mapSortingValues: {"asc": number, "desc": number} = {"asc": 1, "desc": -1};
        switch(this.selectedSortByType) {
            case "name":
                this.filteredSchedulesCollection = this.filteredSchedulesCollection.sort(
                    (scheduleA, scheduleB) => {
                        let value: number = (scheduleA.rawItem.name < scheduleB.rawItem.name) ? -1 : 1;
                        return value * mapSortingValues[this.selectedSortType];
                    }
                );
                break;
            case "enabled":
                this.filteredSchedulesCollection = this.filteredSchedulesCollection.sort(
                    (scheduleA, scheduleB) => {
                        let value: number = (scheduleA.rawItem.enabled && !scheduleB.rawItem.enabled) ? -1 : 1;
                        return value * mapSortingValues[this.selectedSortType];
                    }
                );
                break;
            case "last_scan_date":
                this.compareNextAndLastScanDates("last_scan_date");
                break;
            case "next_scan_date":
                this.compareNextAndLastScanDates("next_scan_date");
                break;
            case "assets_number":
                this.filteredSchedulesCollection = this.filteredSchedulesCollection.sort(
                    (scheduleA, scheduleB) => {
                        let value: number = -1;
                        if (scheduleA.assets_number === undefined || scheduleA.assets_number === null) {
                            value = 1;
                        } else if (scheduleB.assets_number === undefined || scheduleB.assets_number === null) {
                            value = -1;
                        } else {
                            value = (scheduleA.assets_number < scheduleB.assets_number) ? -1 : 1;
                        }
                        return value * mapSortingValues[this.selectedSortType];
                    }
                );
                break;
        }
    }

    private compareNextAndLastScanDates(propertyToCompare: string) {
        const mapSortingValues: {"asc": number, "desc": number} = {"asc": 1, "desc": -1};
        this.filteredSchedulesCollection = this.filteredSchedulesCollection.sort(
            (scheduleA, scheduleB) => {
                if (scheduleA[propertyToCompare] === null || scheduleA[propertyToCompare] === undefined) {
                    return -1;
                } else if (scheduleB[propertyToCompare] === null || scheduleB[propertyToCompare] === undefined) {
                    return 1;
                } else {
                    const value: number = ( new Date(scheduleA[propertyToCompare]).getTime() >
                                            new Date(scheduleB[propertyToCompare]).getTime() ) ? -1 : 1;
                    return value * mapSortingValues[this.selectedSortType];
                }
            }
        );
    }

    sortByDirection(direction: 'asc' | 'desc') {
        this.selectedSortType = direction;
        this.sortBy(this.selectedSortByType);
    }

    search(inputSearch: string) {
        this.filteredSchedulesCollection = this.alFilterByValuePipe.transform(this.schedulesCollection, 'rawItem.name', inputSearch);
    }

    /**
     * Let's handle correctly the event structure on successfull scan schedule update
     */
    preHandleSuccessOperation(event: {action: "create"|"edit", schedule: AlScanSchedule}) {
        this.handleSuccessOperation(event.action, event.schedule);
    }

    handleSuccessOperation(typeOfSucess: "create" | "edit" | "delete" | "stop" | "edit-enabled", schedule?: AlScanSchedule) {
        let message: string = "Your request has been processed successfully";
        switch(typeOfSucess) {
            case "create":
                message = `"${schedule.name}" schedule was created successfully`;
                break;
            case "edit":
                message = `"${schedule.name}" schedule was updated successfully`;
                break;
            case "edit-enabled":
                message = `"${schedule.name}" schedule was updated successfully`;
                break;
            case "delete":
                message = `"${schedule.name}" schedule was deleted successfully`;
                break;
            case "stop":
                message = "Scan was stopped";
                break;
        }
        this.loadData();
        this.notify.emit({
            text: message,
            type: 'success'
        });
    }

    handleError(typeOfError: "create" | "edit" | "delete" | "stop" | "summary" | "getOne") {
        let message: string = "Error processing your request";
        switch(typeOfError) {
            case "create":
                message = "Error creating the Scan Schedule";
                break;
            case "edit":
                message = "Error updating the Scan Schedule";
                break;
            case "delete":
                message = "Error deleting the Scan Schedule";
                break;
            case "stop":
                message = "Error stopping the Scan Schedule";
                break;
            case "summary":
                message = "Error getting the Scan Schedules' summary";
                break;
            case "getOne":
                message = "Error getting the Scan Schedule";
                break;
        }
        this.notify.emit({
            text: message,
            type: 'error'
        });
    }


    getDaysOfWeekFromArray(days: number[]): string {
        let daysLabel: string = "";
        days.forEach( (day, index) => {
            daysLabel += this.daysOfWeekLabelMap[day] + ((index+1 === days.length) ? "" : ", ");
        });
        return daysLabel;
    }

    getDateLabel(rawDate: string): Date {
        return this.scanSchedulerUtilityService.getDateFromString(rawDate);
    }

    getMonthDetailLabel(day: number): string {
        let label: string = "";
        if (day === 29 || day === 30 || day === 31) {
            label = "Last day of the month";
        } else {
            switch (day % 10) {
                case 1:
                    label = day + "st" + " of the month";
                    break;
                case 2:
                    label = day + "nd" + " of the month";
                    break;
                case 3:
                    label = day + "rd" + " of the month";
                    break;
                default:
                    label = day + "th" + " of the month";
                    break;
            }
        }
        return label;
    }

    getTimezoneItemLabel(timezoneValue?: string): string {
        return this.scanSchedulerUtilityService.getTimezoneItem(timezoneValue).label;
    }

    isStopScanButttonVisible(schedule: ScanScheduleItem) {
        return  schedule.status === 'in_progress' && (
                !schedule.rawItem.default && this.typeOfScan !== 'discovery' ||
                schedule.rawItem.default && (this.typeOfScan === 'external' || this.typeOfScan === 'vulnerability') ||
                !schedule.rawItem.default && this.typeOfScan === 'discovery' );
    }

    getScanPortOptionToPreview(schedule: AlScanSchedule): 'security-groups' | 'all' | 'selected' {
        const scanOptions: ScanOptionPorts[]  = schedule.hasOwnProperty('scan_options') ? schedule['scan_options'] as ScanOptionPorts[] : undefined;
        if (scanOptions) {
            let scanPorts = scanOptions.find( option => option.hasOwnProperty('scan_ports') );

            if (scanOptions === null || scanOptions.length === 0 || (scanOptions.length === 1 && scanPorts && scanPorts.scan_ports.length === 0) ) {
                return this.deployment.platform.type === 'aws' ? 'security-groups' : 'all';
            }
            if (scanOptions.length > 0 && scanPorts) {
                let hasAllPorts: boolean = false;
                hasAllPorts = scanPorts.scan_ports.some(
                    scanPort => scanPort.proto === "t" && scanPort.hasOwnProperty('value') && scanPort['value'] === 'all'
                ) && scanPorts.scan_ports.some(
                    scanPort => scanPort.proto === "u" && scanPort.hasOwnProperty('value') && scanPort['value'] === 'common'
                )  && scanPorts.scan_ports.length === 2;
                if (hasAllPorts) {
                    return 'all';
                } else {
                    return 'selected';
                }
            }
        }
        return null;
    }

    /**
     * Handles the schedule summary fetch for a particular scan schedule
     *
     * @param scanSchedule the scan schedule
     * @param bypassEnabledValidation flag telling the function to not validate for the scan schedule to be enabled
     */
    async loadScheduleSummary(scanSchedule: AlScanSchedule, bypassEnabledValidation: boolean = false): Promise<ScanScheduleItem> {
        // Let's default some values to be presented and help us with the ordering functionality
        let scanScheduleSummary: AlScanScheduleSummary = {};
        // NOTE: as a load blocker workaround we will only call the summary if the schedule is enabled
        // and will be loaded for those on expanded action
        if (bypassEnabledValidation || scanSchedule.enabled) {
            scanScheduleSummary = await AlScanSchedulerClientV2.getScanScheduleSummary(this.deployment.account_id, this.deployment.id, scanSchedule.id);
        }
        let item: AlBaseCardItem = {
            id: scanSchedule.id,
            icon: { name: 'schedule', text: scanSchedule.scan_frequency },
            expanded: false,
            countItems: [{ number: scanScheduleSummary.assets_number, text: "Scan Targets" }]
        };
        let schedule: ScanScheduleItem = {
            item: item,
            status: scanScheduleSummary.status,
            assets_number: scanScheduleSummary.assets_number,
            last_scan_date: scanScheduleSummary.last_scan_date,
            next_scan_date: scanScheduleSummary.next_scan_date,
            assets_in_sla: scanScheduleSummary.assets_in_sla,
            rawItem: scanSchedule
        };
        return schedule;
    }

    /**
     * Handles the expand/collapse list row and fetches the summary for the disabled ones
     *
     * @param schedule the scan schedule list item
     */
    async expandScheduleListRow(listItem: AlBaseCardItem, schedule: ScanScheduleItem) {
        // Let's update the schedule list item with the summary information
        if (schedule.item.expanded && !schedule.rawItem.enabled) {
            schedule = await this.loadScheduleSummary(schedule.rawItem, true);
            this.filteredSchedulesCollection = this.filteredSchedulesCollection.map(scheduleItem => {
                if(scheduleItem.item.id === schedule.item.id) {
                    scheduleItem = schedule;
                    scheduleItem.item.expanded = true;
                    return scheduleItem;
                }
                return scheduleItem;
            });
        }
    }

    /**
     * Handles redirection to reports (intelligence app)
     */
    goToReport(optionReport: 'summary' | 'details' | 'variance'): void {
        let views: AlTacomaView[] = [];
        const reportType: string = "Vulnerability";
        let embedUrl: string = "";
        this.getWorkbooks(reportType).then(
            response => {
                if (response.length > 0 && response[0].workbooks.length > 0 && response[0].workbooks[0].views.length > 0) {
                    views = response[0].workbooks[0].views;
                    embedUrl = this.getEmbedUrlFromViews(views, optionReport);
                    this.navigation.navigate.byLocation(AlLocation.IntelligenceUI, "/#/dashboard/:accountId/"+reportType+"/"+embedUrl,
                    {
                        accountId: this.deployment.account_id
                    }, {
                        target: "_blank"
                    });
                }
            }, error => {
                console.error("Error getting workbooks from tacoma --> ", error);
            }
        );
    }

    getEmbedUrlFromViews(views: AlTacomaView[], optionReport: 'summary' | 'details' | 'variance'): string {
        let embedUrl: string = "";
        views.forEach( viewObj => {
            if (embedUrl === "" && viewObj.embed_url.toLowerCase().lastIndexOf(optionReport) !== -1) {
                embedUrl = viewObj.embed_url;
            }
        });
        return embedUrl;
    }

    getWorkbooks(reportType: string): Promise<AlTacomaSite[]> {
        return ALTacoma.listWorkbooks(this.accountId, {sub_menu:reportType}).then(
            sites => sites
        );
    }

}
