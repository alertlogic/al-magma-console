/**
 * DeploymentSchedulingComponent handles Deployment Scheduling page
 *
 * @author Carlos Orozco <carlos.orozco@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2017
 *
 */
import {
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { SubscriptionLike as ISubscription, forkJoin } from 'rxjs';

import {
    BlackoutsResolution,
    DetailsFeature,
    ExclusionsAssets,
    ExclusionsBlackouts,
    ExclusionsRulesDescriptor,
    ExclusionsRulesService,
    ExclusionsRulesSnapshot,
    ExlusionsDetails,
    InsightUtilityService,
    ScanType,
    TimeScheduleDescriptor,
} from '@components/technical-debt';
import { AlConfirmComponent, AlTabsComponent, Tab, TabsDescriptor } from '@components/technical-debt';
import { MatDialog } from '@angular/material/dialog';
import { AssetsUtilityService } from '../../../../../services';
import { AlViewHelperComponent } from '@al/ng-generic-components';
import { BoxDescriptor, DeploymentHeaderDescriptor } from '../../types';
import { Deployment } from '@al/deployments';
import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';
import { AlAssetsQueryClient } from '@al/assets-query';

export class TimeObject {
    hh: number = 0;
    mm: number = 0;
    constructor() { }
}

export class TimeFrame {
    ti: TimeObject = new TimeObject();
    tf: TimeObject = new TimeObject();
    constructor() { }
}

@Component({
    selector: 'al-deployment-scheduling',
    templateUrl: './deployment-scheduling.component.html',
    styleUrls: ['./deployment-scheduling.component.scss']
})
export class DeploymentSchedulingComponent implements OnInit, OnDestroy {

    @Output() onNextAction: EventEmitter<any> = new EventEmitter();

    @ViewChild('alViewHelper', { static: true } ) viewHelper: AlViewHelperComponent;
    @ViewChild(AlTabsComponent, { static: true }) alTabs: AlTabsComponent;
    public isLoading: boolean = false;
    /**
     * Notifications
     */
    static AUTO_DISMISS_SUCCESS: number = 3000; // We should to get this values from a global config, isn't? ¯\_(ツ)_/¯
    static AUTO_DISMISS_ERROR: number = 8000; // We should to get this values from a global config, isn't? ¯\_(ツ)_/¯
    /**
     * Subscriptions
     */
    private statusChangesDiscoverySubscription: ISubscription;
    private statusChangesVulnSubscription: ISubscription;

    public deployment: Deployment;
    public deploymentHeaderConfig: DeploymentHeaderDescriptor = new DeploymentHeaderDescriptor(
        {
            title: 'Scheduling',
            buttons: [
                {
                    label: "Next",
                    color: "mat-primary",
                    disabled: false,
                    onClick: () => { }
                }
            ]
        }
    );

    /**
     * Unsaved Dialog
     */
    public expandableMenu;
    public headerBase;
    public eventTarget: Event;
    public headerBaseGetEvent;
    public expandableMenuGetEvent;
    //

    public selectedTab: string = "vuln-scans";
    public configTabs: TabsDescriptor = new TabsDescriptor().import({
        search: false,
        tabs: [
            { title: "Vulnerability Scans", key: "vuln-scans" }
        ],
        selector: false,
        selectorPlaceholder: "Timezone",
        selectorOptionSelected: "GMT +0"
    });
    public saveButtonText: string = "SAVE";
    public isProcessSaved: boolean = false;
    public isSaveDisabled: boolean = true;
    public selectedTimeZone: string = "GMT +0";

    private exclusions: ExclusionsRulesSnapshot;
    private savedExclusions: ExclusionsRulesSnapshot;

    /** ------- Data config - Scheduling info ----- */
    /** Discovery Scans */
    public discoveryScansForm: FormGroup;
    public discoveryScansConfig: TimeScheduleDescriptor = new TimeScheduleDescriptor({
        isCertainHoursChecked: false,
        hourWindow: '12',
        hours: '00',
        minutes: '00'
    });
    public isDiscoveryRuleCreated: boolean = false;
    /**  Vulnerability Scans */
    public vulnScansForm: FormGroup;
    public vulnScansTimeSchedule: TimeScheduleDescriptor = new TimeScheduleDescriptor({
        isCertainHoursChecked: false,
        hourWindow: '12',
        hours: '00',
        minutes: '00'
    });
    public vulnScansConfig: any = {
        isDaysChecked: false,
        isHolidaysChecked: false
    }
    public holidays: Array<object> = [
        {
            id: 'thanksgiving',
            label: "Thanksgiving",
            checked: false
        },
        {
            id: 'blackfriday',
            label: "Black Friday",
            checked: false
        },
        {
            id: 'whateverelse',
            label: "Whatever else",
            checked: false
        }
    ];
    public daysOfWeek: Array<string> = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
    public boxesOptionsWeek: Array<BoxDescriptor> = [];
    public selectedDaysWeek = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
    public selectedDaysWeekByIndex: Array<string> = ["1", "2", "3", "4", "5", "6", "7"];
    public isVulnRuleCreated: boolean = false;

    /**  CD PCI Scans embedded */
    public resource: string = "exposures.php";
    public parameters: any = {};

    private deploymentId: string = "";
    private accountId: string = "";
    private deploymentKey: string = "";

    constructor(protected deploymentsService: DeploymentsUtilityService,
        protected exclusionsRulesService: ExclusionsRulesService,
        protected insightUtilityService: InsightUtilityService,
        protected assetsUtilityService: AssetsUtilityService,
        protected route: ActivatedRoute,
        protected dialog: MatDialog) { }

    ngOnInit() {
        this.deployment = this.deploymentsService.getDeploymentOnTracking();
        this.route.params.subscribe(params => {
            this.deploymentId = params.hasOwnProperty("id") ? params["id"] : null;
            this.accountId = params.hasOwnProperty("accountId") ? params["accountId"] : null;
            if (this.deployment.platform.type === 'datacenter') {
                this.configTabs.tabs.unshift(new Tab().import({ title: "Discovery Scans", key: "discovery-scans" }));
                this.selectedTab = 'discovery-scans';
            }
            this.setDeploymentHeader();
            this.setForms();
            this.onFormsChanges();
            this.loadData();

            this.parameters = {
                legacy_embedded: true,
                source: "config-phoenix",
                tab: "pci",
                customer_id: this.accountId
            };
        });
        this.defineListenEvents();
    }

    ngOnDestroy() {
        this.expandableMenu.removeEventListener('click', this.expandableMenuGetEvent, true);
        this.headerBase.removeEventListener('click', this.headerBaseGetEvent, true);
        if (this.statusChangesDiscoverySubscription) {
            this.statusChangesDiscoverySubscription.unsubscribe();
        }
        if (this.statusChangesVulnSubscription) {
            this.statusChangesVulnSubscription.unsubscribe();
        }
    }

    onFormsChanges() {
        this.statusChangesDiscoverySubscription = this.discoveryScansForm.statusChanges.subscribe(
            status => {
                this.resetSaveButtonValues();
            }
        );
        this.statusChangesVulnSubscription = this.vulnScansForm.statusChanges.subscribe(
            status => {
                this.resetSaveButtonValues();
            }
        );
    }

    loadData() {
        forkJoin([
            this.exclusionsRulesService.getAll(this.accountId, this.deploymentId),
            AlAssetsQueryClient.getDeploymentAssets(this.accountId, this.deployment.id, {asset_types: 'deployment'})
        ]).subscribe(responses => {
            responses[0].rules.forEach(rule => {
                this.isDiscoveryRuleCreated = this.isDiscoveryRuleCreated ? this.isDiscoveryRuleCreated : rule.id === 'discovery_scan_' + this.deploymentId;
                this.isVulnRuleCreated = this.isVulnRuleCreated ? this.isVulnRuleCreated : rule.id === 'vulnerability_scan_' + this.deploymentId;
            });
            // we store existing values here so we can go back to these values
            // we the user clicks on CANCEL button
            this.savedExclusions = responses[0];
            if (this.isDiscoveryRuleCreated) {
                this.setupDiscoveryScans(this.getExclusion("discovery_scan_" + this.deploymentId, responses[0]));
            }
            if (this.isVulnRuleCreated) {
                this.setupVulnScans(this.getExclusion("vulnerability_scan_" + this.deploymentId, responses[0]));
            }
            this.getDeploymentKey(
                responses[1].hasOwnProperty('assets') && Array.isArray(responses[1].assets) && responses[1].assets.length > 0 ? responses[1].assets[0] : null
            );
        }, error => {
            this.handlerError(error);
        });
    }

    getDeploymentKey(asset: any) {
        if (asset && asset.length > 0) {
            this.deploymentKey = asset[0].hasOwnProperty('key') ? asset[0].key : "";
        }
    }

    /**
     * Get an specific exclusion that matches with the provided type
     * @param exclusionType exclusion type's name to retrieve
     * @param exclusions instance of ExclusionsRulesSnapshot
     */
    getExclusion(exclusionType: string, exclusions: ExclusionsRulesSnapshot): ExclusionsRulesDescriptor {
        let exclusion: ExclusionsRulesDescriptor;

        if (exclusions === undefined || (exclusions.hasOwnProperty('rules') &&
            (!Array.isArray(exclusions.rules) ||
                exclusions.rules.length === 0))) {
            return exclusion;
        }
        exclusion = ExclusionsRulesDescriptor.import({});
        let rule = exclusions.rules.filter(ruleItem => ruleItem.id === exclusionType);
        exclusion = Array.isArray(rule) && rule.length > 0 ? rule[0] : null;
        return exclusion;
    }

    setupDiscoveryScans(exclusion: ExclusionsRulesDescriptor) {
        this.discoveryScansConfig = this.transformExclusionToTimeSchedule(exclusion);
    }

    setupVulnScans(exclusion: ExclusionsRulesDescriptor) {
        this.vulnScansTimeSchedule = this.transformExclusionToTimeSchedule(exclusion);
        let blackout = exclusion && exclusion.blackouts.length > 0 ? exclusion.blackouts[0] : ExclusionsBlackouts.import({});
        let isThereDaysOfWeek: boolean = blackout && blackout.day_of_week && blackout.day_of_week.length > 0;
        this.vulnScansConfig.isDaysChecked = isThereDaysOfWeek;
        let isBlackoutAllDay = this.isBlackoutAllDay(this.getTimeFrame(blackout));
        if (isThereDaysOfWeek) {
            this.boxesOptionsWeek = [];
            this.selectedDaysWeekByIndex = [];
            this.daysOfWeek.forEach((day, index) => {
                let isSelected = blackout.day_of_week.indexOf(index === 0 ? 7 : index) !== -1;
                if (isSelected) {
                    this.selectedDaysWeekByIndex.push(index === 0 ? "7" : index + "");
                }
                this.boxesOptionsWeek.push(
                    new BoxDescriptor().setDescriptor(
                        {
                            id: index === 0 ? 7 : index,
                            label: day,
                            selected: isBlackoutAllDay ? !isSelected : isSelected
                        }
                    )
                );
            });
        }
    }

    /**
     * transform a Exclusion Rule Descriptor into a Time Schedule Descriptor that we can use
     * @param  {ExclusionsRulesDescriptor} exclusion an instance of ExclusionsRulesDescriptor
     * @returns {TimeScheduleDescriptor} an instance of TimeScheduleDescriptor
     */
    transformExclusionToTimeSchedule(exclusion: ExclusionsRulesDescriptor): TimeScheduleDescriptor {
        let discoverySchedule: TimeScheduleDescriptor = new TimeScheduleDescriptor({});
        if (exclusion && exclusion.blackouts.length > 0) {
            let blackout1 = exclusion.blackouts[0];
            let blackout2 = exclusion.blackouts.length > 1 ? exclusion.blackouts[1] : null;

            let originalHour;
            let originalMins;
            let window;

            let blackout_1 = this.getTimeFrame(blackout1);

            if (!this.isBlackoutAllDay(blackout_1)) {
                if (blackout2 && !this.isBlackoutAllDay(this.getTimeFrame(blackout2))) {
                    let blackout_2 = this.getTimeFrame(blackout2);
                    originalHour = blackout_1.tf.hh;
                    originalMins = blackout_1.tf.mm + 1;
                    if (originalMins === 60) {
                        originalHour = blackout_1.tf.hh + 1;
                        originalMins = 0;
                    }
                    window = Math.abs(blackout_1.tf.hh - blackout_2.ti.hh);
                    window = blackout_1.tf.mm === 59 || blackout_2.ti.mm === 0 ? window - 1 : window;

                } else {
                    originalHour = blackout_1.tf.hh;
                    originalMins = blackout_1.tf.mm + 1;

                    if (originalMins === 60) {
                        originalHour = originalHour + 1;
                        originalMins = 0;
                        originalHour = originalHour === 24 ? 0 : originalHour;
                    }
                    window = 24 - Math.abs(blackout_1.ti.hh - blackout_1.tf.hh);
                    if (blackout_1.ti.mm === 0 || blackout_1.ti.mm === 1) {
                        window = 24 - (Math.abs(blackout_1.ti.hh - blackout_1.tf.hh) + 1);
                    }
                }
                discoverySchedule.isCertainHoursChecked = true;
                discoverySchedule.hourWindow = window + "";
                discoverySchedule.hours = this.parserTwoDigits(originalHour);
                discoverySchedule.minutes = this.parserTwoDigits(originalMins);
            }
        }

        return discoverySchedule;
    }

    getTimeFrame(blackout: ExclusionsBlackouts) {
        let timeFrame: TimeFrame = new TimeFrame();
        if (blackout.start_time && blackout.end_time) {
            timeFrame.ti.hh = this.timeStringToArray(blackout.start_time)[0];
            timeFrame.ti.mm = this.timeStringToArray(blackout.start_time)[1];
            timeFrame.tf.hh = this.timeStringToArray(blackout.end_time)[0];
            timeFrame.tf.mm = this.timeStringToArray(blackout.end_time)[1];
        }
        return timeFrame;
    }

    timeStringToArray(timeString: string) {
        let hours: number = parseInt(timeString.split(":")[0], 10);
        let mins: number = parseInt(timeString.split(":")[1], 10);
        return [hours, mins];
    }

    isBlackoutAllDay(blackout: TimeFrame): boolean {
        let start_time = this.parserTwoDigits(blackout.ti.hh) + ":" + this.parserTwoDigits(blackout.ti.mm);
        let end_time = this.parserTwoDigits(blackout.tf.hh) + ":" + this.parserTwoDigits(blackout.tf.mm);
        return start_time === "00:00" && end_time === "23:59";
    }

    next = () => {
        this.onNextAction.emit();
    }

    setDeploymentHeader() {
        this.deploymentHeaderConfig.buttons[0].onClick = this.next;
    }

    handleTab(tab: any) {
        let areChangesSaved: boolean = true;
        let tabNumber: number = 0;
        switch (this.selectedTab) {
            case "discovery-scans":
                areChangesSaved = !this.discoveryModelChanged();
                tabNumber = 0;
                break;
            case "vuln-scans":
                areChangesSaved = !this.vulnScanModelChanged();
                tabNumber = this.deployment.platform.type === 'datacenter' ? 1 : 0;
                break;
        }
        if (areChangesSaved) {
            this.changeTab(tab);
        } else {
            this.alTabs.goTab(tabNumber);
            this.viewHelper.cleanNotifications();
            this.viewHelper.notifyError("Please save changes before switching tabs", DeploymentSchedulingComponent.AUTO_DISMISS_ERROR);
        }
    }

    changeTab(tab: any) {
        this.selectedTab = tab.hasOwnProperty('key') ? tab.key : "discovery-scans";
        // this.resetSaveButtonValues();
    }

    handleTimezone(selectedTimeZone: any) {
        this.selectedTimeZone = selectedTimeZone.hasOwnProperty('name') ? selectedTimeZone.name : "";
    }

    resetSaveButtonValues() {
        this.viewHelper.cleanNotifications();
        this.saveButtonText = "SAVE";
        this.isProcessSaved = false;
        // save/cancel buttons should be enabled ONLY when there are changes in the form model
        // otherwise, those buttons should be disabled
        switch (this.selectedTab) {
            case "discovery-scans":
                this.isSaveDisabled = this.discoveryScansForm.status === 'VALID' && !this.discoveryModelChanged();
                break;
            case "vuln-scans":
                this.isSaveDisabled = this.vulnScansForm.status === 'VALID' && !this.vulnScanModelChanged();
                break;
        }
    }

    updateDiscoveryHoursValue(newValue) {
        this.discoveryScansConfig.hours = newValue;
        this.resetSaveButtonValues();
    }

    updateDiscoveryMinutesValue(newValue) {
        this.discoveryScansConfig.minutes = newValue;
        this.resetSaveButtonValues();
    }

    updateVulnHoursValue(newValue) {
        this.vulnScansTimeSchedule.hours = newValue;
        this.resetSaveButtonValues();
    }

    updateVulnMinutesValue(newValue) {
        this.vulnScansTimeSchedule.minutes = newValue;
        this.resetSaveButtonValues();
    }

    /**
     * determinates if the discovery scheduling model has changes that have not been saved yet
     * @returns boolean true if there are non-saved changes, otherwise false
     */
    discoveryModelChanged(): boolean {
        let initialDiscoverySchedule: TimeScheduleDescriptor = this.transformExclusionToTimeSchedule(
            this.getExclusion("discovery_scan_" + this.deploymentId, this.savedExclusions));
        return (this.discoveryScansConfig.isCertainHoursChecked !== initialDiscoverySchedule.isCertainHoursChecked ||
            this.discoveryScansConfig.hourWindow !== initialDiscoverySchedule.hourWindow ||
            this.discoveryScansConfig.hours !== initialDiscoverySchedule.hours ||
            this.discoveryScansConfig.minutes !== initialDiscoverySchedule.minutes
        );
    }

    vulnScanModelChanged(): boolean {
        let exclusion = this.getExclusion("vulnerability_scan_" + this.deploymentId, this.savedExclusions);
        let initialBlackout: ExclusionsBlackouts = exclusion && exclusion.blackouts.length > 0 ? exclusion.blackouts[0] : ExclusionsBlackouts.import({});
        let initialDaysOfWeek = initialBlackout && initialBlackout.day_of_week ? initialBlackout.day_of_week.sort().join() : "";
        let currentDaysOfWeek = this.selectedDaysWeekByIndex.map((value) => { return parseInt(value === "0" ? "7" : value, 10) }).sort().join();
        let intialTimeSchedule: TimeScheduleDescriptor = this.transformExclusionToTimeSchedule(exclusion);
        let currentDaysOfWeekComplement = [];
        if (!this.vulnScansTimeSchedule.isCertainHoursChecked && (initialDaysOfWeek !== currentDaysOfWeek)) {
            this.boxesOptionsWeek.forEach(optionDay => {
                if (!optionDay.selected) {
                    currentDaysOfWeekComplement.push(parseInt(optionDay.id === "0" ? "7" : optionDay.id, 10));
                }
            });
            currentDaysOfWeek = currentDaysOfWeekComplement.sort().join();
        }
        return (this.vulnScansTimeSchedule.isCertainHoursChecked !== intialTimeSchedule.isCertainHoursChecked ||
            this.vulnScansTimeSchedule.hourWindow !== intialTimeSchedule.hourWindow ||
            this.vulnScansTimeSchedule.hours !== intialTimeSchedule.hours ||
            this.vulnScansTimeSchedule.minutes !== intialTimeSchedule.minutes ||
            (!this.vulnScansConfig.isDaysChecked && initialBlackout && initialBlackout.day_of_week && initialBlackout.day_of_week.length < 7) ||
            ((initialDaysOfWeek !== currentDaysOfWeek) && this.vulnScansConfig.isDaysChecked) ||
            (this.vulnScansConfig.isDaysChecked && !this.isVulnRuleCreated && !this.isProcessSaved)
        );
    }

    setForms() {
        this.setDiscoveryScansForm();
        this.setVulnScansForm();
    }

    setDiscoveryScansForm() {
        this.discoveryScansForm = new FormGroup({
            certainHours: new FormControl(false),
            hourWindow: new FormControl('12')
        });
    }

    setVulnScansForm() {
        this.vulnScansForm = new FormGroup({
            certainHours: new FormControl(false),
            hourWindow: new FormControl(false),
            certainDays: new FormControl(false),
            certainHolidays: new FormControl(false)
        });
        this.holidays.forEach((holiday, index) => {
            this.vulnScansForm.addControl('holiday_' + index, new FormControl());
        });
        this.setDaysOfWeek();
    }

    setDaysOfWeek() {
        this.daysOfWeek.forEach((day, index) => {
            this.boxesOptionsWeek.push(
                new BoxDescriptor().setDescriptor(
                    {
                        id: index === 0 ? 7 : index,
                        label: day,
                        selected: this.selectedDaysWeek.indexOf(day) !== -1
                    }
                )
            );
        });
    }

    getSelectedDaysWeek(selectedDaysWeek: Array<string>) {
        this.selectedDaysWeekByIndex = selectedDaysWeek;
        this.resetSaveButtonValues();
    }

    save() {
        switch (this.selectedTab) {
            case "discovery-scans":
                this.saveDiscoveryScans();
                break;
            case "vuln-scans":
                this.saveVulnScans();
                break;
        }
    }

    cancel() {
        switch (this.selectedTab) {
            case 'discovery-scans':
                this.setupDiscoveryScans(this.getExclusion("discovery_scan_" + this.deploymentId, this.savedExclusions));
                break;
            case "vuln-scans":
                this.setupVulnScans(this.getExclusion("vulnerability_scan_" + this.deploymentId, this.savedExclusions));
                this.resetSaveButtonValues();
                break;
        }
    }

    saveDiscoveryScans() {
        let hours: number = parseInt(this.discoveryScansConfig.hours, 10);
        let minutes: number = parseInt(this.discoveryScansConfig.minutes, 10);
        if (hours !== NaN && minutes !== NaN && (hours <= 23 && minutes <= 59)) {
            this.isLoading = true;
            this.updateBlackoutsExclusions("discovery_scan_" + this.deploymentId);
        }
    }

    updateBlackoutsExclusions(scanType: string) {

        let isRuleCreated: boolean;
        let timeSchedule: TimeScheduleDescriptor;
        let daysOfWeek: Array<number> = [1, 2, 3, 4, 5, 6, 7];

        switch (scanType) {
            case "discovery_scan_" + this.deploymentId:
                isRuleCreated = this.isDiscoveryRuleCreated;
                timeSchedule = this.discoveryScansConfig;
                break;
            case "vulnerability_scan_" + this.deploymentId:
                isRuleCreated = this.isVulnRuleCreated;
                timeSchedule = this.vulnScansTimeSchedule;
                daysOfWeek = this.vulnScansConfig.isDaysChecked ?
                    this.selectedDaysWeekByIndex.map((value) => { return parseInt(value, 10) }) : daysOfWeek;
                break;
        }

        // let's get the existing exclusion and start applying the changes to it that comes from the form
        let exclusion: ExclusionsRulesDescriptor = isRuleCreated ?
            this.getExclusion(scanType, this.savedExclusions) : this.setupNewRule(scanType);

        if (timeSchedule.isCertainHoursChecked) {
            let blackout1: ExclusionsBlackouts = new ExclusionsBlackouts();
            let blackout2: ExclusionsBlackouts = new ExclusionsBlackouts();
            blackout1.resolution = blackout2.resolution = BlackoutsResolution.weekly;
            blackout1.day_of_week = blackout2.day_of_week = daysOfWeek;

            let timeFrames = this.calculateTimeFrames(timeSchedule);

            blackout1.start_time = timeFrames.startTime1;
            blackout1.end_time = timeFrames.endTime1;
            blackout2.start_time = timeFrames.startTime2;
            blackout2.end_time = timeFrames.endTime2;

            switch (timeFrames.blackoutToUse) {
                case 1:
                    exclusion.blackouts = [blackout1];
                    break;
                case 2:
                    exclusion.blackouts = [blackout2];
                    break;
                default:
                    exclusion.blackouts = [blackout1, blackout2];
                    break;
            }

        } else {
            // if we arrive here is because the user wants to remove an existing exclusion blackout window
            exclusion.blackouts = [];
        }

        if (this.vulnScansConfig.isDaysChecked && daysOfWeek.length < 7) {
            exclusion.blackouts.push(this.getBlackoutToExcludeDays());
        }

        exclusion.assets = [
            ExclusionsAssets.import(
                {
                    type: "asset",
                    asset_type: "deployment",
                    key: this.deploymentKey
                }
            )
        ];

        if (isRuleCreated) {
            this.exclusionsRulesService.update(this.accountId, this.deploymentId, exclusion.id, exclusion)
                .subscribe(
                    () => {
                        this.isLoading = false;
                        if (!timeSchedule.isCertainHoursChecked) {
                            this.resetTimeSchedule(timeSchedule);
                        }
                        this.isSaveDisabled = true;
                        this.handleSuccessOperation();
                    },
                    error => {
                        this.handlerError(error);
                    }
                );
        } else {
            this.exclusionsRulesService.create(this.accountId, this.deploymentId, exclusion).subscribe(
                () => {
                    this.isLoading = false;
                    if (!timeSchedule.isCertainHoursChecked) {
                        this.resetTimeSchedule(timeSchedule);
                    }
                    this.isSaveDisabled = true;
                    this.handleSuccessOperation();
                }, error => {
                    this.handlerError(error);
                }
            );
        }
    }

    getBlackoutToExcludeDays() {
        let blackout: ExclusionsBlackouts = new ExclusionsBlackouts();
        blackout.resolution = BlackoutsResolution.weekly;
        blackout.start_time = "00:00";
        blackout.end_time = "23:59";
        let daysOfWeek: Array<number> = [];

        this.boxesOptionsWeek.forEach(optionDay => {
            if (!optionDay.selected) {
                daysOfWeek.push(parseInt(optionDay.id === "0" ? "7" : optionDay.id, 10));
            }
        });
        blackout.day_of_week = daysOfWeek;

        return blackout;
    }

    resetTimeSchedule(timeSchedule: TimeScheduleDescriptor) {
        timeSchedule.hourWindow = '12';
        timeSchedule.hours = '00';
        timeSchedule.minutes = '00';
    }

    setupNewRule(scanType: string) {
        let exclusionRule: ExclusionsRulesDescriptor = new ExclusionsRulesDescriptor();
        exclusionRule.id = scanType;
        exclusionRule.name = this.deployment.name + '/' + scanType;
        exclusionRule.enabled = true;
        exclusionRule.blackouts = [];
        exclusionRule.assets = [];
        exclusionRule.features.push("scan");
        let scanTypeValue: string;
        switch (scanType) {
            case "discovery_scan_" + this.deploymentId:
                scanTypeValue = ScanType.discovery;
                break;
            case "vulnerability_scan_" + this.deploymentId:
                scanTypeValue = ScanType.vulnerability;
                break;
        }
        exclusionRule.details = [
            ExlusionsDetails.import(
                {
                    feature: DetailsFeature.scan,
                    scan_type: scanTypeValue,
                    ports: []
                }
            )
        ];
        exclusionRule.assets = [
            ExclusionsAssets.import(
                {
                    type: "asset",
                    asset_type: "deployment",
                    key: this.deploymentKey
                }
            )
        ];
        return exclusionRule;
    }

    saveVulnScans() {
        let hours: number = parseInt(this.vulnScansTimeSchedule.hours, 10);
        let minutes: number = parseInt(this.vulnScansTimeSchedule.minutes, 10);
        if (hours !== NaN && minutes !== NaN && (hours <= 23 && minutes <= 59)) {
            this.isLoading = true;
            this.updateBlackoutsExclusions("vulnerability_scan_" + this.deploymentId);
        }
    }

    calculateTimeFrames(timeSchedule: TimeScheduleDescriptor) {

        let timeFrames = {
            startTime1: "",
            endTime1: "",
            startTime2: "",
            endTime2: "",
            blackoutToUse: 0
        }

        let hours: number = parseInt(timeSchedule.hours, 10);
        let minutes: number = parseInt(timeSchedule.minutes, 10);
        let window = parseInt(timeSchedule.hourWindow, 10);

        let blackout1: ExclusionsBlackouts = new ExclusionsBlackouts();
        let blackout2: ExclusionsBlackouts = new ExclusionsBlackouts();

        blackout1.start_time = "00:00";
        blackout1.end_time = this.parserTwoDigits(hours) + ":" + this.parserTwoDigits(minutes - 1);
        blackout2.start_time = this.parserTwoDigits(hours + window) + ":" + this.parserTwoDigits(minutes + 1);
        blackout2.end_time = "23:59";

        let blackout_1 = this.getTimeFrame(blackout1);
        let blackout_2 = this.getTimeFrame(blackout2);

        let tempHour = hours + window;
        let tempMins = minutes + 1;

        if (blackout_2.ti.hh > 23) {
            tempHour = tempHour > 23 ? tempHour - 24 : tempHour;
            if (tempMins === 60) {
                tempHour = tempHour + 1;
                tempMins = 0;
            }
            blackout_1.ti.hh = tempHour;
            blackout_1.ti.mm = tempMins;
            timeFrames.blackoutToUse = 1;
        }

        if (hours !== 0 && minutes === 0) {
            blackout_1.tf.hh = hours - 1;
            blackout_1.tf.mm = 59;
        }

        if (blackout_2.ti.mm === 60) {
            blackout_2.ti.hh = blackout_2.ti.hh + 1;
            blackout_2.ti.mm = 0;
            if (blackout_2.ti.hh === 24) {
                timeFrames.blackoutToUse = 1;
            }
        }

        if (hours === 0 && minutes === 0) {
            blackout_2.ti.hh = tempHour;
            blackout_2.ti.mm = tempMins;
            timeFrames.blackoutToUse = 2;
        }

        timeFrames.startTime1 = this.parserTwoDigits(blackout_1.ti.hh) + ":" + this.parserTwoDigits(blackout_1.ti.mm);
        timeFrames.endTime1 = this.parserTwoDigits(blackout_1.tf.hh) + ":" + this.parserTwoDigits(blackout_1.tf.mm);
        timeFrames.startTime2 = this.parserTwoDigits(blackout_2.ti.hh) + ":" + this.parserTwoDigits(blackout_2.ti.mm);
        timeFrames.endTime2 = this.parserTwoDigits(blackout_2.tf.hh) + ":" + this.parserTwoDigits(blackout_2.tf.mm);

        return timeFrames;
    }

    parserTwoDigits(number: number): string {
        return (number / 10) < 1 ? "0" + number : number + "";
    }

    handleSuccessOperation() {
        this.viewHelper.cleanNotifications();
        this.isProcessSaved = true;
        this.saveButtonText = "SAVED";
        this.exclusionsRulesService.getAll(this.accountId, this.deploymentId)
            .subscribe(
                exclusions => {
                    this.exclusions = exclusions;
                    this.savedExclusions = exclusions;
                    exclusions.rules.forEach(rule => {
                        this.isDiscoveryRuleCreated = this.isDiscoveryRuleCreated ? this.isDiscoveryRuleCreated : rule.id === 'discovery_scan_' + this.deploymentId;
                        this.isVulnRuleCreated = this.isVulnRuleCreated ? this.isVulnRuleCreated : rule.id === 'vulnerability_scan_' + this.deploymentId;
                    });
                },
                error => {
                    this.handlerError(error);
                }
            );
    }

    handlerError(error: any) {
        this.isLoading = false;
        let message: string = "We could not complete this action. Please try again.";
        this.viewHelper.cleanNotifications();
        this.viewHelper.notifyError(message, DeploymentSchedulingComponent.AUTO_DISMISS_ERROR);
    }

    /**
     * Methods related with Unsaved Diaglog logic
     */

    defineListenEvents() {
        this.expandableMenu = document.getElementsByTagName('AL-EXPANDABLE-MENU')[0];
        this.headerBase = document.getElementsByTagName('AL-ARCHIPELIGO17-HEADER')[0];
        this.expandableMenu.addEventListener('click', this.expandableMenuGetEvent = event => this.listenEventUnsavedDialog("expandable-menu", event), true);
        this.headerBase.addEventListener('click', this.headerBaseGetEvent = event => this.listenEventUnsavedDialog("header-base", event), true);
    }

    listenEventUnsavedDialog(section, event) {
        if (!this.isSaveDisabled) {
            event.preventDefault();
            if (this.assetsUtilityService.showDialogUnsavedData(section, event)) {
                this.eventTarget = event;
                this.showUnsavedDialog();
                event.stopPropagation();
            }
        }
    }

    showUnsavedDialog() {
        // Open the dialog
        let dialogRef = this.dialog.open(AlConfirmComponent, {
            width: '55%',
            data: {
                cancel: 'LEAVE WITHOUT SAVING',
                confirm: 'STAY HERE',
                data: { key: 'stayHere' },
                customTitle: 'deployment-steps-unsaved-data',
                customMessage: 'deployment-steps-unsaved-data'
            }
        });
        // Listen when the the modal confirm close
        dialogRef.afterClosed().subscribe(result => {
            /*  Only it redirects when the user click in the botton 'Leave without saving', because of styles,
                it's the cancel botton of the dialog */
            let key = this.insightUtilityService.nestedGet(result, "key", null);
            if (key === 'cancel') {
                let target = this.assetsUtilityService.getTargetEventToDialogUnsavedData(this.eventTarget);
                this.expandableMenu.removeEventListener('click', this.expandableMenuGetEvent, true);
                this.headerBase.removeEventListener('click', this.headerBaseGetEvent, true);
                let event = new Event("click");
                target.dispatchEvent(event);
            }
        });
    }
}
