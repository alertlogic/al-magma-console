import { Component,
         OnInit,
         ViewChild,
         Input,
         Output,
         EventEmitter,
         ChangeDetectorRef,
         AfterViewChecked } from '@angular/core';
import { FormGroup,
         FormControl,
         Validators,
         FormBuilder,
         FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AlSession } from '@al/core';
import { AssetQueryGeneralResponse } from '@al/assets-query';
import { AlBottomSheetComponent,
         AlBottomSheetHeaderOptions,
         AlSelectItem,
         AlViewHelperComponent,
         AlNotification,
         AlNotificationPanelComponent,
         AlNotificationType } from '@al/ng-generic-components';
import { AlScanSchedulerClientV2,
         AlScanSchedule,
         AlScanScopeItemAsset,
         AlScanScopeItemTag,
         AlScanScopeItemIPAddress,
         AlScanScopeItemIPRange,
         AlScanScopeItemCIDR,
         AlScanWindowSelectedDaysOfWeek,
         AlScanWindowContinuousPeriodMonthly,
         AlScanWindowContinuousPeriodWeekly,
         AlScanWindowSelectedDaysOfMonth,
         AlScanWindowSpecificDate,
         AlScanWindowContinuousQuarterly,
         AlScanWindowSelectedWeekdayOfMonth,
         ScanOptionPorts,
         ScanOptionPortWildcard,
         ScanOptionPortSingle,
         ScanOptionPortRange } from '@al/scan-scheduler';
import { Deployment } from '@al/deployments';
import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';
import { AlScanScopeIprangesCidrsComponent } from '../al-scan-scope-ipranges-cidrs/al-scan-scope-ipranges-cidrs.component';
import { ScanSchedulerUtilityService, defaultTimeZoneItem, TimezoneItem } from '../../../../../services/scan-scheduler-utility.service';

import { TabView } from 'primeng/tabview';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { InsightUtilityService } from '@components/technical-debt';

type scanWindowTypes = (AlScanWindowSelectedDaysOfWeek | AlScanWindowSelectedDaysOfMonth |
                        AlScanWindowContinuousPeriodWeekly | AlScanWindowContinuousPeriodMonthly |
                        AlScanWindowSpecificDate | AlScanWindowContinuousQuarterly |
                        AlScanWindowSelectedWeekdayOfMonth )[];
type includeAssetTypes = (AlScanScopeItemAsset | AlScanScopeItemCIDR | AlScanScopeItemIPRange | AlScanScopeItemTag)[];
type AlIpItem = AlScanScopeItemCIDR | AlScanScopeItemIPRange | AlScanScopeItemIPAddress;
type AlAssetItem = AlScanScopeItemAsset | AlScanScopeItemTag;

@Component({
    selector: 'al-advanced-scheduling-form',
    templateUrl: './al-advanced-scheduling-form.component.html',
    styleUrls: ['./al-advanced-scheduling-form.component.scss'],
    providers: [ConfirmationService]
})
export class AlAdvancedSchedulingFormComponent implements OnInit, AfterViewChecked {

    @ViewChild("alBottomSheet", { static: true } ) alBottomSheet!: AlBottomSheetComponent;
    @ViewChild("alScanScopeIprangesCidrs", { static: true } ) alScanScopeIprangesCidrs!: AlScanScopeIprangesCidrsComponent;
    @ViewChild(AlViewHelperComponent, { static: true } ) viewHelper: AlViewHelperComponent;
    @ViewChild('tabView', { static: true } ) tabView: TabView;

    @Input() typeOfScan: AlScanSchedule.TypeOfScanEnum;

    @Output() onSuccess: EventEmitter<{action: "create"|"edit", schedule: AlScanSchedule}> = new EventEmitter<{action: "create"|"edit", schedule: AlScanSchedule}>();
    @Output() onError: EventEmitter<string> = new EventEmitter<string>();

    private aaid: string;
    private locid: string;
    private step: string;
    public accountId: string = "";
    public deployment: Deployment = DeploymentsUtilityService.createDeploymentBase();
    public scheduleForm: FormGroup;
    public headerOptions: AlBottomSheetHeaderOptions;
    public loading: boolean = false;
    public schedule: AlScanSchedule;
    public assetsList: AlSelectItem[] = [];
    public tagsList: AlSelectItem[] = [];
    public filteredAssetsList: AlSelectItem[] = [];
    public selectedAssets: AlSelectItem[] = [];
    public assetsLoaded: boolean = false;
    public assetTypeFilterOptions: {[key: string]: string}[] = [];
    public isIncompatibleScanWindows: boolean = false;
    public isIncompatiblePortGroups: boolean = false;
    public includeIncompatibleScanWindows: scanWindowTypes = [];
    public includeIncompatiblePortGroups: ScanOptionPortWildcard[] = [];
    public errorProcess: boolean = false;
    public selectedPortGroupsOptions: AlSelectItem[] = [];
    public protocolOptionsList: SelectItem[] = [];
    public selectedCustomPortsList: AlSelectItem[] = [];

    // Default ScanWindows Objects
    private selectedDaysOfWeekObject: AlScanWindowSelectedDaysOfWeek = {
        "days_of_week": null,
        "end_time": null,
        "start_time": null,
        "type": "days_of_week",
    };
    private continuousPeriodWeeklyObject: AlScanWindowContinuousPeriodWeekly = {
        "end_day": null,
        "end_time": null,
        "start_day": null,
        "start_time": null,
        "type": "weekly_period"
    };
    private continuousPeriodMonthlyObject: AlScanWindowContinuousPeriodMonthly = {
        "end_day": null,
        "end_time": null,
        "start_day": null,
        "start_time": null,
        "type": "monthly_period"
    };
    private specificDateObject: AlScanWindowSpecificDate = {
        type: "specific_date",
        start_date: "",
        start_time: "",
        end_date: "",
        end_time: ""
    }
    private continuousQuarterlyObject: AlScanWindowContinuousQuarterly = {
        "end_day": null,
        "end_time": null,
        "start_day": null,
        "start_time": null,
        "type": "quarterly",
        "month_of_quarter": null
    };
    private selectedWeekdayOfMonthObject: AlScanWindowSelectedWeekdayOfMonth = {
        "day_of_week": null,
        "start_time": null,
        "end_time": null,
        "nth_week": null,
        "type": "weekday_of_month"
    };

    /**
     * Notifications
     */
    static AUTO_DISMISS_SUCCESS: number = 3000;
    static AUTO_DISMISS_ERROR: number = 8000;
    public notifications: EventEmitter<AlNotification> = new EventEmitter<AlNotification>();
    public notification: AlNotification;
    @ViewChild("notificationPanel", { static: true } ) notificationPanel: AlNotificationPanelComponent;

    constructor(private formBuilder: FormBuilder,
                private changeDetectorRef: ChangeDetectorRef,
                private deploymentsUtilityService: DeploymentsUtilityService,
                private scanSchedulerUtilityService: ScanSchedulerUtilityService,
                private insightUtilityService: InsightUtilityService,
                private confirmationService: ConfirmationService,
                protected router: Router,
                protected route: ActivatedRoute) {
    }

    ngAfterViewChecked(): void {
        this.changeDetectorRef.detectChanges();
    }

    ngOnInit() {
        this.accountId = AlSession.getActingAccountId(); // Only used for actions against the acting accountId
        this.deployment = this.deploymentsUtilityService.getDeploymentOnTracking();
        this.route.queryParams.subscribe( params => {
            this.aaid = params.hasOwnProperty('aaid') ? params['aaid'] : null;
            this.locid = params.hasOwnProperty('locid') ? params['locid'] : null;
            this.step = params.hasOwnProperty('step') ? params['step'] : null;
        });
        this.scanSchedulerUtilityService.getAllTimeZoneOptions();
        this.setupDefaultValues();
        this.getAssets();
    }

    private setupDefaultValues() {
        this.assetTypeFilterOptions = [
            {label:'ASSETS', value: 'asset'}
        ];
        // Let's show TAGS to scan option only if AWS deployment
        if (this.deployment.platform.type === 'aws') {
            this.assetTypeFilterOptions.push({label:'TAGS', value: 'tag'});
        }
        this.isIncompatibleScanWindows = false;
        this.isIncompatiblePortGroups = false;
        this.errorProcess = false;
        this.includeIncompatibleScanWindows = [];
        this.includeIncompatiblePortGroups = [];
        this.selectedAssets = [];
        this.viewHelper.cleanNotifications();
        this.flushNotifications();
        this.setupDefaultScheduleObject();
        this.setupProtocolOptionsList();
        this.setupForm();
    }

    private setupProtocolOptionsList() {
        this.protocolOptionsList = [
            <SelectItem>{
                label: "UDP",
                value: "u"
            },
            <SelectItem>{
                label: "TCP",
                value: "t"
            },
        ];
    }

    private setupDefaultScheduleObject() {
        this.schedule = {
            name: "",
            enabled: true,
            type_of_scan: this.typeOfScan,
            scan_frequency: "automatic",
            scan_windows: [],
            scan_scope: {
                include_all_assets: true,
                include: []
            }
        };
    }

    private setupForm() {
        let todayDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        const fullTodayDate: Date = new Date();
        let todayTimeHours: number = parseInt(fullTodayDate.toLocaleTimeString('en-GB').split(':')[0], 10);
        let todayTimeMinutes: number = parseInt(fullTodayDate.toLocaleTimeString('en-GB').split(':')[1], 10) + 5;
        if (todayTimeMinutes > 59) {
            todayTimeHours = todayTimeHours + 1;
            if (todayTimeHours > 23) {
                todayTimeHours = 0;
                todayDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1);
            }
            todayTimeMinutes = todayTimeMinutes - 60;
        }
        let onceFormGroup: FormGroup = this.formBuilder.group({
            startDate: new FormControl(todayDate, Validators.required),
            startTime: this.formBuilder.group({
                hours: new FormControl(this.scanSchedulerUtilityService.getFullDayMonthFormat(todayTimeHours),
                    [Validators.required, Validators.pattern('([01][0-9]|2[0-3])')]),
                minutes: new FormControl(this.scanSchedulerUtilityService.getFullDayMonthFormat(todayTimeMinutes),
                    [Validators.required, Validators.pattern('([0-5][0-9])')])
            }),
            hasSpecificEndDay: new FormControl(false),
            endDate: new FormControl(todayDate),
            endTime: this.formBuilder.group({
                hours: new FormControl("00", Validators.pattern('([01][0-9]|2[0-3])')),
                minutes: new FormControl("00", Validators.pattern('([0-5][0-9])'))
            })
        });
        this.scheduleForm = new FormGroup({
            scheduleName: new FormControl(this.schedule.name, [Validators.required, Validators.maxLength(127), this.scanSchedulerUtilityService.whiteSpacesValidator]),
            enabled: new FormControl(true),
            scanFrequency: new FormControl("automatic"),
            scanWindow: new FormControl("default"),
            selectedTimezone: new FormControl(defaultTimeZoneItem),
            includeAllAssets: new FormControl(true),
            assetTypeFilter: new FormControl('asset'),
            automaticForm: this.formBuilder.array([ this.scanSchedulerUtilityService.getDefaultWindow(1, 7) ]),
            dailyForm: this.formBuilder.group({
                scanDuration: new FormControl("8", [Validators.min(8), Validators.max(24)]),
                startTime: this.formBuilder.group({
                    hours: new FormControl("00", [Validators.required, Validators.pattern('([01][0-9]|2[0-3])')]),
                    minutes: new FormControl("00", [Validators.required, Validators.pattern('([0-5][0-9])')])
                }),
                selectedDays: new FormControl(["1","2","3","4","5","6","7"], Validators.required)
            }),
            weeklyForm: this.formBuilder.array([ this.scanSchedulerUtilityService.getDefaultWindow(1, 7) ]),
            monthlyForm: this.formBuilder.array([ this.scanSchedulerUtilityService.getDefaultWindow(1, 31) ]),
            monthlyCertainDaysForm: this.formBuilder.array([ this.scanSchedulerUtilityService.getDefaultWindow(1, 7) ]),
            monthlyWeekdayForm: this.formBuilder.group({
                startTime: this.formBuilder.group({
                    hours: new FormControl("00", [Validators.required, Validators.pattern('([01][0-9]|2[0-3])')]),
                    minutes: new FormControl("00", [Validators.required, Validators.pattern('([0-5][0-9])')])
                }),
                endTime: this.formBuilder.group({
                    hours: new FormControl("23", [Validators.required, Validators.pattern('([01][0-9]|2[0-3])')]),
                    minutes: new FormControl("59", [Validators.required, Validators.pattern('([0-5][0-9])')])
                }),
                dayOfWeek: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(7)]),
                nthWeek: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(4)])
            }),
            quarterlyForm: this.formBuilder.array([ this.scanSchedulerUtilityService.getDefaultQuarterlyWindow() ]),
            onceForm: onceFormGroup,
            specificAssetsToScan: new FormControl([], this.scanSchedulerUtilityService.hasAssetsToScanValidator),
            specificIprangesCidrsToScan: new FormControl([], this.scanSchedulerUtilityService.hasAssetsToScanValidator),
            isIprangesCidrsInputValid: new FormControl(true, [Validators.requiredTrue]),
            portsInput: new FormControl(""),
            portOptions: new FormControl(this.deployment.platform.type === 'aws' && this.typeOfScan !== "external" ? 'security-groups' : 'all'),
            selectedPortGroupsOptions: new FormControl([]),
            protocolSelected: new FormControl("u")
        });
        this.scheduleForm.get("portsInput").setValidators(() => this.insightUtilityService.portsValidator(this.scheduleForm.get("portsInput") as FormControl, true));
        onceFormGroup.setValidators([
            this.scanSchedulerUtilityService.greaterScanOnceEndDateValidator(onceFormGroup),
            this.scanSchedulerUtilityService.minScanOnceDurationValidator(onceFormGroup),
            this.scanSchedulerUtilityService.minStartDateScanOnceValidator(onceFormGroup),
        ]);
        this.headerOptions = {
            icon:  'schedule',
            title:  'Create a Scan Schedule',
            primaryAction: {
                text: 'SAVE',
                disabled:  true,
            },
            secondaryAction:{
                text:  'CANCEL',
                disabled:  false,
            },
        };
        this.selectedCustomPortsList = [];
        this.subscribeToValueChanges();
        this.subscribeToFormChanges();
    }

    private subscribeToFormChanges() {
        this.scheduleForm.valueChanges.subscribe( newValues => {
            this.checkFormValidity();
        });
    }

    private subscribeToValueChanges() {
        // Here we subscribe to the value the includeAllAssets
        // value changes to load the assets if not loaded yet
        this.scheduleForm.get("includeAllAssets").valueChanges.subscribe(selectedValue => {
            const specificAssetsToScanControl = this.scheduleForm.get("specificAssetsToScan");
            const specificIprangesCidrsToScanControl = this.scheduleForm.get("specificIprangesCidrsToScan");
            if (selectedValue === false) {
                specificAssetsToScanControl.updateValueAndValidity({onlySelf: true});
                specificIprangesCidrsToScanControl.updateValueAndValidity({ onlySelf: true });
            }
        });
        this.scheduleForm.get("assetTypeFilter").valueChanges.subscribe(selectedValue => {
            this.filterAssetsByType(selectedValue);
        });
    }

    private checkFormValidity() {
        let isValid = this.scheduleForm.controls.scheduleName.valid || this.scheduleForm.controls.scheduleName.disabled;
        const scanWindow: string = this.scheduleForm.get('scanWindow').value;
        const isDefaultScanWindowSelected: boolean = scanWindow === 'default';
        if (!isDefaultScanWindowSelected || this.scheduleForm.get('scanFrequency').value === 'once') {
            switch(this.scheduleForm.get('scanFrequency').value) {
                case "automatic":
                    isValid = isValid && this.scheduleForm.get('automaticForm').valid;
                    break;
                case "daily":
                    isValid = isValid && this.scheduleForm.get('dailyForm').valid;
                    break;
                case "weekly":
                    isValid = isValid && this.scheduleForm.get('weeklyForm').valid;
                    break;
                case "monthly":
                    if (scanWindow === "certain_hours") {
                        isValid = isValid && this.scheduleForm.get('monthlyForm').valid;
                    }
                    if (scanWindow === "certain_days") {
                        isValid = isValid && this.scheduleForm.get('monthlyCertainDaysForm').valid;
                    }
                    if (scanWindow === "certain_week") {
                        isValid = isValid && this.scheduleForm.get('monthlyWeekdayForm').valid;
                    }
                    break;
                case "quarterly":
                    if (scanWindow === "certain_hours") {
                        isValid = isValid && this.scheduleForm.get('quarterlyForm').valid;
                    }
                    break;
                case "once":
                    isValid = isValid && this.scheduleForm.get('onceForm').valid;
                    break;
                default:
                    isValid = false;
                    break;
            }
        }
        // Lets check if the specific assets/ips to scan section is valid
        if (!this.scheduleForm.get('includeAllAssets').value) {
            isValid = this.scheduleForm.get('isIprangesCidrsInputValid').valid && isValid &&
                        (this.scheduleForm.get('specificAssetsToScan').valid || this.scheduleForm.get('specificIprangesCidrsToScan').valid);
            if (this.typeOfScan === "discovery") {
                const totalAssets: number = this.assetsList.length;
                let totalSelectedDiscoveryAssets: number = this.getNumberOfSelectedAssetsForDiscovery();
                isValid = isValid && (totalSelectedDiscoveryAssets !== totalAssets);
            }
        }
        if (this.scheduleForm.get('portOptions').value === 'selected') {
            const selectedPortGroups: string[] = this.scheduleForm.get('selectedPortGroupsOptions').value as string [];
            isValid = isValid && (selectedPortGroups.length > 0 || this.selectedCustomPortsList.length > 0);
        }
        this.headerOptions.primaryAction.disabled = !isValid;
    }

    onCustomPortsSelectedChanged(values: AlSelectItem[]) {
        this.checkFormValidity();
    }

    save() {
        this.loading = true;
        this.flushNotifications();
        const operation: "POST" | "PUT" = this.schedule.id ? "PUT" : "POST";
        const payload = this.getScanScheduleObject(operation);
        let promiseCalled: Promise<AlScanSchedule>;
        switch (operation) {
            case "POST":
                promiseCalled = AlScanSchedulerClientV2.createScanSchedule(this.deployment.account_id, this.deployment.id, payload);
                break;
            case "PUT":
                promiseCalled = AlScanSchedulerClientV2.updateScanSchedule(this.deployment.account_id, this.deployment.id, this.schedule.id, payload);
                break;
            default:
                break;
        }
        promiseCalled.then(
            scheduleResponse => {
                this.loading = false;
                this.closeModal();
                this.onSuccess.emit({ action: operation === "PUT" ? "edit" : "create", schedule: scheduleResponse });
            }
        ).catch(
            error => {
                this.loading = false;
                console.error("Error creating the schedule ", error);
                this.handleError(operation === "PUT" ? "edit" : "create");
            }
        );
    }

    closeModal() {
        if (this.schedule.id) {
            // In order to have a deep linking for editing scan schedules
            if (this.aaid && this.locid && this.step) {
                this.router.navigate(['.'],
                    { relativeTo: this.route, queryParams: {aaid: this.aaid, locid: this.locid, step: this.step},
                    queryParamsHandling: '' }
                );
            }
        }
        this.setupForm();
        this.alScanScopeIprangesCidrs.handleIpTypesList([]);
        this.alScanScopeIprangesCidrs.cleanTextArea();
        this.alBottomSheet.hide();
    }

    private getScanScheduleObject(operation: "PUT" | "POST"): AlScanSchedule {
        const frequency: AlScanSchedule.ScanFrequencyEnum = this.scheduleForm.get('scanFrequency').value;
        let timezoneValue: string = null;
        if (this.scheduleForm.get('scanWindow').value === 'default' && this.scheduleForm.get('scanFrequency').value !== "once") {
            timezoneValue = this.scanSchedulerUtilityService.getTimezoneItem().value;
        }
        let payload: AlScanSchedule = {
            name: this.scheduleForm.get('scheduleName').value,
            enabled: this.scheduleForm.get('enabled').value,
            default: operation === "PUT" ? this.schedule.default : false,
            type_of_scan: this.typeOfScan,
            timezone: timezoneValue ? timezoneValue : (this.scheduleForm.get('selectedTimezone').value as TimezoneItem).value,
            scan_frequency: frequency,
            scan_windows: this.scheduleForm.get('scanWindow').value === 'default' && frequency !== 'once' ? this.includeIncompatibleScanWindows : this.getScanWindowsObject(),
            scan_scope: {
                include_all_assets: this.scheduleForm.get('includeAllAssets').value,
                include: this.scheduleForm.get('includeAllAssets').value ? [] : this.mergeScanScopeArrays()
            },
            scan_options: [{ "scan_ports": this.getScanOptions() }]
        }
        return payload;
    }

    private mergeScanScopeArrays(): includeAssetTypes {
        let array: includeAssetTypes = [];
        array = array.concat((this.scheduleForm.get('specificAssetsToScan').value) as []);
        array = array.concat((this.scheduleForm.get('specificIprangesCidrsToScan').value) as []);
        return array;
    }

    private getScanOptions(): (ScanOptionPortSingle | ScanOptionPortRange | ScanOptionPortWildcard)[] {
        let scanOptions: (ScanOptionPortSingle | ScanOptionPortRange | ScanOptionPortWildcard)[] = [];

        switch (this.scheduleForm.get('portOptions').value) {
            case 'security-groups':
                if (this.deployment.platform.type === "aws") {
                    return [];
                }
                break;
            case 'all':
                scanOptions = [{"proto": "t", "value": "all"},{"proto": "u", "value": "common"}];
                return scanOptions;
            case 'selected':
                scanOptions = this.getSelectedPorts();
                break;
            default:
                break;
        }

        return scanOptions;
    }

    private getSelectedPorts(): (ScanOptionPortSingle | ScanOptionPortRange | ScanOptionPortWildcard)[] {
        let scanOptions: (ScanOptionPortSingle | ScanOptionPortRange | ScanOptionPortWildcard)[] = [];
        let portGroups = {
            "udp-singles": {
                proto: 'u',
                ports: []
            },
            "udp-ranges": {
                proto: 'u',
                ranges: []
            },
            "tcp-singles": {
                proto: 't',
                ports: []
            },
            "tcp-ranges": {
                proto: 't',
                ranges: []
            }
        };
        if (this.scheduleForm.get('selectedPortGroupsOptions').value) {
            if (Array.isArray(this.scheduleForm.get('selectedPortGroupsOptions').value)) {
                scanOptions = (this.scheduleForm.get('selectedPortGroupsOptions').value as string[]).map(
                    scanOption => {
                        return (JSON.parse(scanOption) as ScanOptionPortWildcard);
                    }
                );
            }
            // addding incompatible port groups
            scanOptions = scanOptions.concat(this.includeIncompatiblePortGroups);
        }
        if (this.selectedCustomPortsList.length > 0) {
            this.selectedCustomPortsList.forEach( selectedPort => {
                const protocolId: string = selectedPort.id.split('#')[0];
                const protocol: string = protocolId === 'u' ? 'udp' : 'tcp';
                if (selectedPort.id.includes('-') || selectedPort.id.includes(':')) {
                    const range: string = selectedPort.id.split('#')[1];
                    portGroups[protocol+"-ranges"]['ranges'].push(range);
                } else {
                    const port: number = parseInt(selectedPort.id.split('#')[1], 10);
                    portGroups[protocol+"-singles"]['ports'].push(port);
                }
            });
            if (portGroups['udp-singles'].ports.length > 0) {
                scanOptions.push(portGroups['udp-singles'] as ScanOptionPortSingle);
            }
            if (portGroups['udp-ranges'].ranges.length > 0) {
                scanOptions.push(portGroups['udp-ranges'] as ScanOptionPortRange);
            }
            if (portGroups['tcp-singles'].ports.length > 0) {
                scanOptions.push(portGroups['tcp-singles'] as ScanOptionPortSingle);
            }
            if (portGroups['tcp-ranges'].ranges.length > 0) {
                scanOptions.push(portGroups['tcp-ranges'] as ScanOptionPortRange);
            }
        }
        return scanOptions;
    }

    private getScanWindowsObject(): scanWindowTypes {

        let scanWindow: scanWindowTypes = [];
        switch(this.scheduleForm.get('scanFrequency').value) {
            case "automatic":
                scanWindow = this.getScanWindowByFrequencyType("automaticForm");
                break;
            case "daily":
                scanWindow = [this.getDailyScanWindow()];
                break;
            case "weekly":
                scanWindow = this.getScanWindowByFrequencyType("weeklyForm");
                break;
            case "monthly":
                if (this.scheduleForm.get('scanWindow').value === "certain_hours") {
                    scanWindow = this.getScanWindowByFrequencyType("monthlyForm");
                }
                if (this.scheduleForm.get('scanWindow').value === "certain_days") {
                    scanWindow = this.getScanWindowByFrequencyType("monthlyCertainDaysForm");
                }
                if (this.scheduleForm.get('scanWindow').value === "certain_week") {
                    scanWindow = [this.getWeekdayOfMonthWindow()]
                }
                break;
            case "quarterly":
                scanWindow = this.getQuarterlyScanWindow();
                break;
            case "once":
                scanWindow = [this.getOnceScanWindow()];
                break;
            default:
                break;
        }
        // Adding scan windows which not were displayed on the UI (concat)
        return scanWindow.concat(this.includeIncompatibleScanWindows);
    }

    private getScanWindowByFrequencyType(formName: string): (AlScanWindowContinuousPeriodWeekly | AlScanWindowContinuousPeriodMonthly)[] {
        let scanWindows: (AlScanWindowContinuousPeriodWeekly | AlScanWindowContinuousPeriodMonthly)[] = [];
        (this.scheduleForm.get(formName) as FormArray).controls.forEach( scanWindowForm => {
            scanWindows.push(
                <AlScanWindowContinuousPeriodWeekly | AlScanWindowContinuousPeriodMonthly> {
                    type: formName === "monthlyForm" ? AlScanWindowContinuousPeriodMonthly.typeEnum.Period : AlScanWindowContinuousPeriodWeekly.typeEnum.Period,
                    start_day: parseInt(scanWindowForm.get('startDay').value,10),
                    start_time: scanWindowForm.get('startTime').get('hours').value+":"+scanWindowForm.get('startTime').get('minutes').value,
                    end_day: parseInt(scanWindowForm.get('endDay').value, 10),
                    end_time: scanWindowForm.get('endTime').get('hours').value+":"+scanWindowForm.get('endTime').get('minutes').value,
                }
            );
        });
        return scanWindows;
    }

    private getQuarterlyScanWindow(): AlScanWindowContinuousQuarterly[] {
        let scanWindows: AlScanWindowContinuousQuarterly[] = [];
        (this.scheduleForm.get('quarterlyForm') as FormArray).controls.forEach( scanWindowForm => {
            scanWindows.push(
                <AlScanWindowContinuousQuarterly> {
                    type: AlScanWindowContinuousQuarterly.typeEnum.Quarterly,
                    start_day: parseInt(scanWindowForm.get('startDay').value,10),
                    start_time: scanWindowForm.get('startTime').get('hours').value+":"+scanWindowForm.get('startTime').get('minutes').value,
                    end_day: parseInt(scanWindowForm.get('endDay').value, 10),
                    end_time: scanWindowForm.get('endTime').get('hours').value+":"+scanWindowForm.get('endTime').get('minutes').value,
                    month_of_quarter: parseInt(scanWindowForm.get('monthOfQuarter').value, 10)
                }
            );
        });
        return scanWindows;
    }

    private getDailyScanWindow(): AlScanWindowSelectedDaysOfWeek {
        const scanDuration: number = parseInt(this.scheduleForm.get('dailyForm').get('scanDuration').value, 10);
        const startHours: string = this.scheduleForm.get('dailyForm').get('startTime').get('hours').value;
        const startMinutes: string = this.scheduleForm.get('dailyForm').get('startTime').get('minutes').value;
        const endHours: string = this.scanSchedulerUtilityService.calculateEndHoursFromScanDuration(startHours, scanDuration);
        const stringDaysOfWeek: string[] = this.scheduleForm.get('dailyForm').get('selectedDays').value as string[];
        const selectedDaysOfWeek: number[] = stringDaysOfWeek.map( day => parseInt(day, 10) );
        let scanWindow: AlScanWindowSelectedDaysOfWeek = {
            type: AlScanWindowSelectedDaysOfWeek.typeEnum.Week,
            start_time: startHours+":"+startMinutes,
            end_time: endHours+":"+startMinutes,
            days_of_week: selectedDaysOfWeek
        };
        return scanWindow;
    }

    private getWeekdayOfMonthWindow(): AlScanWindowSelectedWeekdayOfMonth {
        const startHours: string = this.scheduleForm.get('monthlyWeekdayForm').get('startTime').get('hours').value;
        const startMinutes: string = this.scheduleForm.get('monthlyWeekdayForm').get('startTime').get('minutes').value;
        const endHours: string = this.scheduleForm.get('monthlyWeekdayForm').get('endTime').get('hours').value;
        const endMinutes: string = this.scheduleForm.get('monthlyWeekdayForm').get('endTime').get('minutes').value;
        const dayOfWeek: number = parseInt(this.scheduleForm.get('monthlyWeekdayForm').get('dayOfWeek').value, 10);
        const nthWeek: number = parseInt(this.scheduleForm.get('monthlyWeekdayForm').get('nthWeek').value, 10);
        const scanWindow: AlScanWindowSelectedWeekdayOfMonth = {
            type: AlScanWindowSelectedWeekdayOfMonth.typeEnum.Month,
            start_time: startHours+":"+startMinutes,
            end_time: endHours+":"+endMinutes,
            nth_week: nthWeek as AlScanWindowSelectedWeekdayOfMonth.NthWeekEnum,
            day_of_week: dayOfWeek as AlScanWindowSelectedWeekdayOfMonth.DayOfWeekEnum
        };
        return scanWindow;
    }

    private getOnceScanWindow(): AlScanWindowSpecificDate {
        const startDate: Date = this.scheduleForm.get('onceForm').get('startDate').value;
        const startDay: string = this.scanSchedulerUtilityService.getFullDayMonthFormat(startDate.getDate());
        const startMonth: string = this.scanSchedulerUtilityService.getFullDayMonthFormat(startDate.getMonth()+1);
        const startYear: number = startDate.getFullYear();
        const endDate: Date = this.scheduleForm.get('onceForm').get('endDate').value;
        const endDay: string = this.scanSchedulerUtilityService.getFullDayMonthFormat(endDate.getDate());
        const endMonth: string = this.scanSchedulerUtilityService.getFullDayMonthFormat(endDate.getMonth()+1);
        const endYear: number = endDate.getFullYear();
        const startHours: string = this.scheduleForm.get('onceForm').get('startTime').get('hours').value;
        const startMinutes: string = this.scheduleForm.get('onceForm').get('startTime').get('minutes').value;
        const endHours: string = this.scheduleForm.get('onceForm').get('endTime').get('hours').value;
        const endMinutes: string = this.scheduleForm.get('onceForm').get('endTime').get('minutes').value;
        const hasSpecificEndDay: boolean = this.scheduleForm.get('onceForm').get('hasSpecificEndDay').value;
        let scanWindow: AlScanWindowSpecificDate = {
            type: "specific_date",
            start_date: startYear+"."+startMonth+"."+startDay,
            start_time: startHours+":"+startMinutes,
            end_date: hasSpecificEndDay ? endYear+"."+endMonth+"."+endDay : null,
            end_time: hasSpecificEndDay ? endHours+":"+endMinutes : null,
        };
        return scanWindow;
    }

    editSchedule(selectedScheduleId: string) {
        this.setDefaultTabForm();
        this.setupDefaultValues();
        this.headerOptions.title = 'Edit a Scan Schedule';
        this.headerOptions.primaryAction.text = "UPDATE";
        if (this.typeOfScan === "discovery") {
            this.scheduleForm.controls.includeAllAssets.setValue(false);
        }
        this.alBottomSheet.open();
        this.loading = true;
        AlScanSchedulerClientV2.getScanSchedule(this.deployment.account_id, this.deployment.id, selectedScheduleId).then(
            schedule => {
                this.schedule = schedule;
                this.typeOfScan = this.schedule.type_of_scan;
                this.mapScheduleRawToForm();
                this.loading = false;
            }
        ).catch(
            error => {
                console.error("Error loading the scan schedule -> ", error);
                this.loading = false;
                this.handleError("loading");
            }
        );
    }

    createSchedule() {
        this.setupForm();
        this.setupDefaultValues();
        this.setDefaultTabForm();
        this.setScheduleNameAndEnableInputsState();
        this.headerOptions.title = 'Create a Scan Schedule';
        this.headerOptions.primaryAction.text = "SAVE";
        if (this.typeOfScan === "discovery") {
            this.scheduleForm.controls.includeAllAssets.setValue(false);
        }
        this.alBottomSheet.open();
    }

    private setDefaultTabForm() {
        if (this.tabView) {
            this.tabView.activeIndex = 1;
            setTimeout(() => this.tabView.activeIndex = 0 );
        }
    }

    private mapScheduleRawToForm() {
        const frequency = this.schedule.scan_frequency;
        this.scheduleForm.controls.scheduleName.setValue(this.schedule.name);
        this.setScheduleNameAndEnableInputsState();
        this.scheduleForm.controls.enabled.setValue(this.schedule.enabled);
        this.scheduleForm.controls.scanFrequency.setValue(frequency);
        let scanWindowType: "default" | "certain_hours" | "certain_days" | "certain_week" = "default";
        if (frequency === "monthly") {
            if (this.schedule.scan_windows.length > 0) {
                switch (this.schedule.scan_windows[0].type) {
                    case "weekly_period":
                        scanWindowType = "certain_days";
                        break;
                    case "monthly_period":
                        scanWindowType = "certain_hours";
                        break;
                    case "weekday_of_month":
                        scanWindowType = "certain_week";
                        break;
                    default:
                        scanWindowType = "default"
                        break;
                }
            }
            this.scheduleForm.controls.scanWindow.setValue(this.schedule.scan_windows.length === 0? "default" : scanWindowType);
        } else {
            this.scheduleForm.controls.scanWindow.setValue(this.schedule.scan_windows.length > 0? "certain_hours" : "default");
        }
        this.scheduleForm.controls.selectedTimezone.setValue(this.scanSchedulerUtilityService.getTimezoneItem(this.schedule.timezone));
        this.scheduleForm.controls.includeAllAssets.setValue(this.schedule.scan_scope.include_all_assets);
        this.mapScanWindowsToForm();
        // Let's add the assets to scan to the form from the scan schedule
        if (!this.schedule.scan_scope.include_all_assets) {
            this.handleAssetsToScan(this.schedule.scan_scope.include);
        }
        this.checkIncompatibleScanWindows();
        this.mapScanOptionsToForm();
    }

    private mapScanOptionsToForm() {
        const scanOptions: ScanOptionPorts[]  = this.schedule.hasOwnProperty('scan_options') ? this.schedule['scan_options'] as ScanOptionPorts[] : undefined;
        if (scanOptions) {
            let scanPorts = scanOptions.find( option => option.hasOwnProperty('scan_ports') );

            if (scanOptions === null || scanOptions.length === 0 ||
                (scanOptions.length === 1 && scanPorts && scanPorts.scan_ports.length === 0) ) {
                this.scheduleForm.controls.portOptions.setValue(this.deployment.platform.type === 'aws' && this.typeOfScan !== "external" ? 'security-groups' : 'all');
                return null;
            }
            if (scanOptions.length > 0 && scanPorts) {
                let hasAllPorts: boolean = false;
                hasAllPorts = scanPorts.scan_ports.some(
                    scanPort => scanPort.proto === "t" && scanPort.hasOwnProperty('value') && scanPort['value'] === 'all'
                ) && scanPorts.scan_ports.some(
                    scanPort => scanPort.proto === "u" && scanPort.hasOwnProperty('value') && scanPort['value'] === 'common'
                )  && scanPorts.scan_ports.length === 2;
                if (!hasAllPorts) {
                    scanPorts.scan_ports.forEach( scanPort => this.mapScanPortToForm(scanPort) );
                }
                if (hasAllPorts) {
                    this.scheduleForm.controls.portOptions.setValue('all');
                    this.scheduleForm.controls.selectedPortGroupsOptions.setValue([]);
                    this.selectedCustomPortsList = [];
                    return null;
                } else {
                    this.scheduleForm.controls.portOptions.setValue('selected');
                }
            }
        }
    }

    private mapScanPortToForm(scanPort: ScanOptionPortSingle | ScanOptionPortRange | ScanOptionPortWildcard) {
        // For ScanOptionPortWildcard type
        if (scanPort.hasOwnProperty('proto') && scanPort.hasOwnProperty('value')) {
            const proto: string = scanPort['proto'];
            const value: string = scanPort['value'];
            let allValue: string = "";
            if ( (proto==='t' && value==='*') || (proto==='t' && value==='all') ) {
                allValue = '{"value":"*","proto":"t"}';
            }
            if ( (proto==='u' && value==='common') ) {
                allValue = '{"value":"common","proto":"u"}';
            }
            if ( (proto==='t' && value==='common') ) {
                allValue = '{"value":"common","proto":"t"}';
            }
            if ( (proto==='tu' && value==='common') ) {
                allValue = '{"value":"common","proto":"tu"}';
            }
            if ( (proto==='t' && value==='typically_vulnerable') ) {
                allValue = '{"value":"typically_vulnerable","proto":"t"}';
            }
            if ( (proto==='tu' && value==='typically_vulnerable') ) {
                allValue = '{"value":"typically_vulnerable","proto":"tu"}';
            }
            let groupPorts: string[] = this.scheduleForm.controls.selectedPortGroupsOptions.value;
            // If "allValue" is still "" it means there are some incompatible port groups created from API directly
            if (allValue === "") {
                this.isIncompatiblePortGroups = true;
                this.includeIncompatiblePortGroups.push(scanPort as ScanOptionPortWildcard);
            } else {
                groupPorts.push(allValue);
                this.scheduleForm.get('selectedPortGroupsOptions').setValue(groupPorts);
            }
        }
        // For ScanOptionPortSingle type
        if (scanPort.hasOwnProperty('proto') && scanPort.hasOwnProperty('ports')) {
            const protocolId = scanPort.proto;
            const protocol: string = protocolId === 'u' ? 'UDP' : 'TCP';
            scanPort['ports'].forEach( port => {
                this.selectedCustomPortsList.push(this.mapPortOrRangeToAlSelectItem(protocolId, protocol, port));
            });
        }
        // For ScanOptionPortRange type
        if (scanPort.hasOwnProperty('proto') && scanPort.hasOwnProperty('ranges')) {
            const protocolId = scanPort.proto;
            const protocol: string = protocolId === 'u' ? 'UDP' : 'TCP';
            scanPort['ranges'].forEach( range => {
                this.selectedCustomPortsList.push(this.mapPortOrRangeToAlSelectItem(protocolId, protocol, range));
            });
        }
    }

    private mapPortOrRangeToAlSelectItem(protocolId: string, protocol: string, portOrRange: string): AlSelectItem {
        return {
            id: protocolId+"#"+portOrRange,
            title: "Custom " + protocol + " " + "(" + portOrRange + ")",
            value: portOrRange,
            checked: true
        } as AlSelectItem;
    }

    private setScheduleNameAndEnableInputsState() {
        if (this.schedule.default === true) {
            this.scheduleForm.controls.scheduleName.disable();
        } else {
            setTimeout(() => { this.scheduleForm.controls.scheduleName.enable(); });
        }
        if (this.typeOfScan === "discovery" && this.schedule.default === true) {
            this.scheduleForm.controls.enabled.disable();
        } else {
            setTimeout(() => { this.scheduleForm.controls.enabled.enable(); });
        }
    }

    private checkIncompatibleScanWindows() {
        if (this.isIncompatibleScanWindows) {
            const messageError: string = "Some of the configured Scan Windows do not match with the UI structure requirements " +
                "and will not be loaded nor able to be updated on this form. " +
                "These incompatible scan windows will not modify but you will able to add more scan windows if needed";
            this.notification = new AlNotification(messageError, AlNotificationType.Information, 0, true, null, "DISMISS");
            this.notifications.emit(this.notification);
        }
    }

    private checkIncompatiblePortGroups() {
        if (this.isIncompatiblePortGroups) {
            const messageError: string = "Some of the configured Ports Groups do not match with the UI structure requirements " +
                "and will not be loaded nor able to be updated on this form. " +
                "These incompatible Ports Groups will not modify but you will able to add more Ports Groups if needed";
            this.notification = new AlNotification(messageError, AlNotificationType.Information, 0, true, null, "DISMISS");
            this.notifications.emit(this.notification);
        }
    }

    private handleAssetsToScan(assetsIpsToScan: (AlAssetItem | AlIpItem)[]) {
        let ipsToScan: (AlIpItem)[] = [];
        this.selectedAssets = [];
        assetsIpsToScan.forEach(assetToScan => {
            if (['asset', 'tag'].includes(assetToScan.type)) {
                // Let's findout the asset/tag name from the lists we have
                // already loaded in order to avoid additional calls
                let assetsList: AlSelectItem[] = (assetToScan.type === 'asset')? this.assetsList : this.tagsList;
                let assetData = assetsList.find(asset => {
                    let key: string = (assetToScan.type === 'tag')? `${assetToScan.key}_${assetToScan.value}` : (assetToScan as AlAssetItem).key;
                    return key === asset.value.assetKey;
                });
                if (assetData) {
                    this.selectedAssets.push(assetData.value);
                }
            } else {
                ipsToScan.push((assetToScan as AlIpItem));
            }
        });
        setTimeout(() => {
            if (this.alScanScopeIprangesCidrs) {
                this.alScanScopeIprangesCidrs.selectedIprangesCidrsList = [];
                this.alScanScopeIprangesCidrs.handleIpTypesList(ipsToScan);
            }
        });
        // Let's make the loaded assets part of the initial form list
        if (this.selectedAssets.length > 0) {
            let specificSelectedAssets = [];
            this.selectedAssets.forEach( assetItem => {
                specificSelectedAssets.push(assetItem.value)
            });
            this.scheduleForm.get('specificAssetsToScan').setValue(specificSelectedAssets);
        }
    }

    private mapScanWindowsToForm() {
        const scanWindow: string = this.scheduleForm.get('scanWindow').value;
        switch (this.schedule.scan_frequency) {
            case "automatic":
                this.setScanWindows('automaticForm', 'weekly_period', this.continuousPeriodWeeklyObject);
                break;
            case "daily":
                this.setDailyScanWindows();
                break;
            case "weekly":
                this.setScanWindows('weeklyForm', 'weekly_period', this.continuousPeriodWeeklyObject);
                break;
            case "monthly":
                if (scanWindow === "certain_hours") {
                    this.setScanWindows('monthlyForm', 'monthly_period', this.continuousPeriodMonthlyObject);
                }
                if (scanWindow === "certain_days") {
                    this.setScanWindows('monthlyCertainDaysForm', 'weekly_period', this.continuousPeriodWeeklyObject);
                }
                if (scanWindow === "certain_week") {
                    this.setCertainWeekdayScanWindows();
                }
                break;
            case "quarterly":
                this.setScanQuarterlyWindows();
                break;
            case "once":
                this.setOnceScanWindow();
                break;
            default:
                break;
        }
    }

    private setDailyScanWindows() {
        if (this.schedule.scan_windows.length > 1) {
            this.isIncompatibleScanWindows = true;
            this.includeIncompatibleScanWindows = this.schedule.scan_windows;
            this.scheduleForm.controls.scanWindow.setValue("default");
        } else {
            if (this.schedule.scan_windows.length === 1) {
                const scanWindow = this.schedule.scan_windows[0];
                const scanWindowKeys: string[] = Object.keys(scanWindow).sort();
                const selectedDaysOfWeekObjectKeys: string[] = Object.keys(this.selectedDaysOfWeekObject).sort();
                if(JSON.stringify(scanWindowKeys) === JSON.stringify(selectedDaysOfWeekObjectKeys) && scanWindow.type === "days_of_week") {
                    let scanDuration = this.scanSchedulerUtilityService.calculateScanDuration(scanWindow.start_time, scanWindow.end_time);
                    let startHours = this.scanSchedulerUtilityService.getHoursFromString(scanWindow.start_time);
                    let startMinutes = this.scanSchedulerUtilityService.getMinutesFromString(scanWindow.start_time);
                    this.scheduleForm.get('dailyForm').get('scanDuration').setValue(scanDuration);
                    this.scheduleForm.get('dailyForm').get('startTime').get('hours').setValue(startHours);
                    this.scheduleForm.get('dailyForm').get('startTime').get('minutes').setValue(startMinutes);
                    this.scheduleForm.get('dailyForm').get('selectedDays').setValue(scanWindow.days_of_week.map(day => day+""));
                } else {
                    this.includeIncompatibleScanWindows.push(scanWindow);
                    this.isIncompatibleScanWindows = true;
                    this.scheduleForm.controls.scanWindow.setValue("default");
                }
            }
        }
    }

    private setCertainWeekdayScanWindows() {
        if (this.schedule.scan_windows.length > 1) {
            this.isIncompatibleScanWindows = true;
            this.includeIncompatibleScanWindows = this.schedule.scan_windows;
            this.scheduleForm.controls.scanWindow.setValue("default");
        } else {
            if (this.schedule.scan_windows.length === 1) {
                const scanWindow = this.schedule.scan_windows[0];
                const scanWindowKeys: string[] = Object.keys(scanWindow).sort();
                const selectedWeekdayOfMonthObjectKeys: string[] = Object.keys(this.selectedWeekdayOfMonthObject).sort();
                if(JSON.stringify(scanWindowKeys) === JSON.stringify(selectedWeekdayOfMonthObjectKeys) && scanWindow.type === "weekday_of_month") {
                    let startHours = this.scanSchedulerUtilityService.getHoursFromString(scanWindow.start_time);
                    let startMinutes = this.scanSchedulerUtilityService.getMinutesFromString(scanWindow.start_time);
                    let endHours = this.scanSchedulerUtilityService.getHoursFromString(scanWindow.end_time);
                    let endMinutes = this.scanSchedulerUtilityService.getMinutesFromString(scanWindow.end_time);
                    this.scheduleForm.get('monthlyWeekdayForm').get('dayOfWeek').setValue(scanWindow.day_of_week);
                    this.scheduleForm.get('monthlyWeekdayForm').get('nthWeek').setValue(scanWindow.nth_week);
                    this.scheduleForm.get('monthlyWeekdayForm').get('startTime').get('hours').setValue(startHours);
                    this.scheduleForm.get('monthlyWeekdayForm').get('startTime').get('minutes').setValue(startMinutes);
                    this.scheduleForm.get('monthlyWeekdayForm').get('endTime').get('hours').setValue(endHours);
                    this.scheduleForm.get('monthlyWeekdayForm').get('endTime').get('minutes').setValue(endMinutes);
                } else {
                    this.includeIncompatibleScanWindows.push(scanWindow);
                    this.isIncompatibleScanWindows = true;
                    this.scheduleForm.controls.scanWindow.setValue("default");
                }
            }
        }
    }

    private setScanWindows(formName: string, scanWindowType: "weekly_period" | "monthly_period",
        windowObjectToCompare: AlScanWindowContinuousPeriodWeekly | AlScanWindowContinuousPeriodMonthly) {

        (this.scheduleForm.get(formName) as FormArray).controls = [];
        this.schedule.scan_windows.forEach( scanWindow => {
            let sizeItemsForm: number = (this.scheduleForm.get(formName) as FormArray).length;
            const scanWindowKeys: string[] = Object.keys(scanWindow).sort();
            const windowObjectToCompareKeys: string[] = Object.keys(windowObjectToCompare).sort();
            if(JSON.stringify(scanWindowKeys) === JSON.stringify(windowObjectToCompareKeys) && scanWindow.type === scanWindowType) {
                (this.scheduleForm.get(formName) as FormArray).insert(sizeItemsForm, this.setDefaultWindowWithValues(scanWindow, 1, scanWindowType === "monthly_period" ? 31 : 7));
            } else {
                this.includeIncompatibleScanWindows.push(scanWindow);
                this.isIncompatibleScanWindows = true;
            }
        });
        if ((this.scheduleForm.get(formName) as FormArray).controls.length === 0) {
            (this.scheduleForm.get(formName) as FormArray).insert(0, this.scanSchedulerUtilityService.getDefaultWindow(1, scanWindowType === "monthly_period" ? 31 : 7));
        }
    }

    private setScanQuarterlyWindows() {
        (this.scheduleForm.get('quarterlyForm') as FormArray).controls = [];
        this.schedule.scan_windows.forEach( scanWindow => {
            let sizeItemsForm: number = (this.scheduleForm.get('quarterlyForm') as FormArray).length;
            const scanWindowKeys: string[] = Object.keys(scanWindow).sort();
            const windowObjectToCompareKeys: string[] = Object.keys(this.continuousQuarterlyObject).sort();
            if(JSON.stringify(scanWindowKeys) === JSON.stringify(windowObjectToCompareKeys) && scanWindow.type === "quarterly") {
                (this.scheduleForm.get('quarterlyForm') as FormArray).insert(sizeItemsForm, this.setDefaultQuarterlyWindowWithValues(scanWindow));
            } else {
                this.includeIncompatibleScanWindows.push(scanWindow);
                this.isIncompatibleScanWindows = true;
            }
        });
        if ((this.scheduleForm.get('quarterlyForm') as FormArray).controls.length === 0) {
            (this.scheduleForm.get('quarterlyForm') as FormArray).insert(0, this.scanSchedulerUtilityService.getDefaultQuarterlyWindow());
        }
    }

    private setDefaultQuarterlyWindowWithValues(scanWindow: AlScanWindowContinuousQuarterly) {
        let scanWindowTemp: FormGroup = this.scanSchedulerUtilityService.getDefaultQuarterlyWindow();
        scanWindowTemp.get('startDay').setValue(scanWindow.start_day);
        scanWindowTemp.get('startTime').get('hours').setValue(this.scanSchedulerUtilityService.getHoursFromString(scanWindow.start_time));
        scanWindowTemp.get('startTime').get('minutes').setValue(this.scanSchedulerUtilityService.getMinutesFromString(scanWindow.start_time));
        scanWindowTemp.get('endDay').setValue(scanWindow.end_day);
        scanWindowTemp.get('endTime').get('hours').setValue(this.scanSchedulerUtilityService.getHoursFromString(scanWindow.end_time));
        scanWindowTemp.get('endTime').get('minutes').setValue(this.scanSchedulerUtilityService.getMinutesFromString(scanWindow.end_time));
        scanWindowTemp.get('monthOfQuarter').setValue(scanWindow.month_of_quarter);

        return scanWindowTemp;
    }

    private setOnceScanWindow() {
        this.schedule.scan_windows.forEach( scanWindow => {
            scanWindow = scanWindow as AlScanWindowSpecificDate;
            const scanWindowKeys: string[] = Object.keys(scanWindow).sort();
            const windowObjectToCompareKeys: string[] = Object.keys(this.specificDateObject).sort();
            if(JSON.stringify(scanWindowKeys) === JSON.stringify(windowObjectToCompareKeys) && scanWindow.type === "specific_date") {
                this.scheduleForm.get('onceForm').get('startDate').setValue(this.scanSchedulerUtilityService.getDateFromString((scanWindow as AlScanWindowSpecificDate).start_date));
                this.scheduleForm.get('onceForm').get('startTime').get('hours').setValue(this.scanSchedulerUtilityService.getHoursFromString(scanWindow.start_time));
                this.scheduleForm.get('onceForm').get('startTime').get('minutes').setValue(this.scanSchedulerUtilityService.getMinutesFromString(scanWindow.start_time));
                if ((scanWindow as AlScanWindowSpecificDate).end_date) {
                    this.scheduleForm.get('onceForm').get('hasSpecificEndDay').setValue(true);
                    this.scheduleForm.get('onceForm').get('endDate').setValue(
                        this.scanSchedulerUtilityService.getDateFromString((scanWindow as AlScanWindowSpecificDate).end_date));
                    this.scheduleForm.get('onceForm').get('endTime').get('hours').setValue(this.scanSchedulerUtilityService.getHoursFromString(scanWindow.end_time));
                    this.scheduleForm.get('onceForm').get('endTime').get('minutes').setValue(this.scanSchedulerUtilityService.getMinutesFromString(scanWindow.end_time));
                }
            } else {
                this.includeIncompatibleScanWindows.push(scanWindow);
                this.isIncompatibleScanWindows = true;
            }
        });
    }

    private setDefaultWindowWithValues(scanWindow: AlScanWindowContinuousPeriodWeekly | AlScanWindowContinuousPeriodMonthly,
        minStartDay:number, maxEndDay: number): FormGroup {

        let scanWindowTemp: FormGroup = this.scanSchedulerUtilityService.getDefaultWindow(minStartDay,maxEndDay);
        scanWindowTemp.get('startDay').setValue(scanWindow.start_day);
        scanWindowTemp.get('startTime').get('hours').setValue(this.scanSchedulerUtilityService.getHoursFromString(scanWindow.start_time));
        scanWindowTemp.get('startTime').get('minutes').setValue(this.scanSchedulerUtilityService.getMinutesFromString(scanWindow.start_time));
        scanWindowTemp.get('endDay').setValue(scanWindow.end_day);
        scanWindowTemp.get('endTime').get('hours').setValue(this.scanSchedulerUtilityService.getHoursFromString(scanWindow.end_time));
        scanWindowTemp.get('endTime').get('minutes').setValue(this.scanSchedulerUtilityService.getMinutesFromString(scanWindow.end_time));

        return scanWindowTemp;
    }

    frequencyChange() {
        const scanFrequency = this.scheduleForm.get('scanFrequency').value;
        if (scanFrequency === 'quarterly') {
            this.scheduleForm.get('scanWindow').setValue("certain_hours");
        } else {
            this.scheduleForm.get('scanWindow').setValue("default");
        }
    }

    onAssetSelected(selectedAsset: AlSelectItem[]) {
        let specificSelectedAssets = [];
        selectedAsset.forEach( assetItem => {
            specificSelectedAssets.push(assetItem.value)
        });
        this.scheduleForm.get('specificAssetsToScan').setValue(specificSelectedAssets);
        if (this.typeOfScan === "discovery") {
            const totalAssets: number = this.assetsList.length;
            let totalSelectedDiscoveryAssets: number = this.getNumberOfSelectedAssetsForDiscovery();
            if (totalAssets === totalSelectedDiscoveryAssets) {
                this.scheduleForm.get("specificAssetsToScan").setErrors(
                    {'allAssetsDiscoverySelected': true}
                );
            }
        }
    }

    private getNumberOfSelectedAssetsForDiscovery(): number {
        let totalSelectedDiscoveryAssets: number = 0;
        (this.scheduleForm.get('specificAssetsToScan').value as []).forEach(asset => {
            totalSelectedDiscoveryAssets = totalSelectedDiscoveryAssets + (asset['label'] !== 'tag' ? 1 : 0);
        });
        return totalSelectedDiscoveryAssets;
    }

    /**
     * Get the assets list to be shown
     */
    public getAssets(): void {

        this.scanSchedulerUtilityService.getAssets(this.typeOfScan).then(
            assetsResponse => {
                this.setupAssetsList(assetsResponse);
            }
        ).catch(
            error => {
                console.error('Error retrieving the assets data', error);
            }
        );

    }

    /**
     * Get the assets list to be shown
     */
    private setupAssetsList(assetsResponse: AssetQueryGeneralResponse) {
        this.tagsList = [];
        this.assetsList = [];
        this.scanSchedulerUtilityService.assetsDictionary = [];
        assetsResponse.assets.forEach(asset => {
            let assetData: any = asset[0];
            let dictKey: string = (assetData.type === 'tag')? `${assetData.tag_key}_${assetData.tag_value}` : assetData.key;
            let key: string = (assetData.type === 'tag')? assetData.tag_key : assetData.key;
            // Let's setup the assetsDictionary
            this.scanSchedulerUtilityService.assetsDictionary[`${dictKey || assetData.name}`] = assetData;
            let value: unknown = {
                key: key,
                type: (assetData.type === 'tag')? 'tag' : 'asset'
            };
            let name: string = '';
            let icon: string;
            let materialIcon = null;
            if (assetData.type === 'tag') {
                (value as AlScanScopeItemTag).value = assetData.tag_value;
                name = assetData.name;
                icon = 'al al-tag';
            } else {
                (value as AlScanScopeItemAsset).asset_type = assetData.type;
                [name, icon, materialIcon] = this.getAssetTitle(assetData);
            }
            let item: AlSelectItem = {
                title: name,
                icon: icon,
                value: {
                    title: name,
                    icon: icon,
                    label: assetData.type,
                    assetKey: dictKey,
                    value: value
                }
            };
            if (materialIcon !== null) {
                item.icon = materialIcon;
                item.isMaterialIcon = true;
                item.value.icon = materialIcon;
                item.value.isMaterialIcon = true;
            }
            if (assetData.hasOwnProperty('in_scope')) {
                item.value['in_scope'] = assetData.in_scope;
            }
            // Let's separate the type on its own list to ease the filtering
            if (assetData.type === 'tag') {
                this.tagsList.push(item);
            } else {
                this.assetsList.push(item);
            }
        });
        this.filterAssetsByType('asset');

    }

    public getAssetTitle(assetData: any): [string, string, string] {

        let assetTitleTxt: string = assetData.name || assetData.key;
        let iconClass: string = 'al al-shrug';
        let materialIcon = null;

        if (assetData.type === 'host') {
            iconClass = 'al al-host';
        } else if (assetData.type === 'subnet') {
            iconClass = 'al al-subnet';
        } else if (assetData.type === 'vpc') {
            if (this.deployment.platform.type === 'aws') {
                iconClass = 'al al-topology-vpc-1';
            } else if (this.deployment.platform.type === 'datacenter') {
                iconClass = 'al al-topology-network-1';
            } else if (this.deployment.platform.type === 'azure') {
                iconClass = 'al al-topology-vpc-1';
            }
        } else if( assetData.type === 'region'){
            iconClass = 'al al-topology-region-1';
        } else if( assetData.type === 'external-dns-name'){
            materialIcon = 'dns';
        } else if( assetData.type === 'external-ip'){
            materialIcon = 'settings_ethernet';
        }

        if (this.deployment.platform.type !== 'azure') {
            if (assetData.type === 'subnet' ) {
                if (assetData.hasOwnProperty('subnet_id')){
                    assetTitleTxt = `${assetTitleTxt} - ( ${assetData.subnet_id} )`;
                } else if (assetData.hasOwnProperty('cidr_block')) {
                    assetTitleTxt = `${assetTitleTxt} - ( ${assetData.cidr_block} )`;
                }
            } else if (assetData.type === 'host'){
                if ( assetData.hasOwnProperty('instance_id')){
                    assetTitleTxt = `${assetTitleTxt} - ( ${assetData.instance_id} )`;
                } else if (assetData.hasOwnProperty('local_ipv4')) {
                    if (Array.isArray(assetData.local_ipv4)) {
                        assetTitleTxt = `${assetTitleTxt} - ( ${assetData.local_ipv4.join()} )`;
                    } else if (typeof assetData.local_ipv4 === "string") {
                        assetTitleTxt = `${assetTitleTxt} - ( ${assetData.local_ipv4} )`;
                    }
                }
            } else if (assetData.type === 'vpc'){
                if ( assetData.hasOwnProperty('vpc_id')){
                    assetTitleTxt = `${assetTitleTxt} - ( ${assetData.vpc_id} )`;
                } else if (assetData.hasOwnProperty('cidr_ranges')){
                    if (Array.isArray(assetData.cidr_ranges)) {
                        assetTitleTxt = `${assetTitleTxt} - ( ${(assetData.cidr_ranges.join())} )`;
                    } else if (typeof assetData.cidr_ranges === "string") {
                        assetTitleTxt = `${assetTitleTxt} - ( ${assetData.cidr_ranges} )`;
                    }
                }
            }
        }
        if (!['tag', 'external-dns-name', 'external-ip'].includes(assetData.type)) {
            if (assetData.hasOwnProperty('in_scope') && !assetData.in_scope) {
                assetTitleTxt += " (out of scope)";
            }
        }
        return [assetTitleTxt, iconClass, materialIcon];
    }

    private filterAssetsByType(type: string) {
        if (type === 'tag') {
            this.filteredAssetsList = this.tagsList;
        } else {
            if (this.typeOfScan === "external") {
                this.filteredAssetsList = this.assetsList;
            } else {
                this.filteredAssetsList = this.assetsList.filter( (assetItem: AlSelectItem) => {
                    return (assetItem.value.hasOwnProperty('in_scope') && assetItem.value.in_scope);
                });
            }
        }
    }

    flushNotifications() {
        this.notificationPanel.flush();
    }

    handleError(typeOfError: "create" | "edit" | "loading") {
        let message: string = "Error processing your request";
        switch(typeOfError) {
            case "create":
                message = "Error creating the Scan Schedule";
                break;
            case "edit":
                message = "Error updating the Scan Schedule";
                break;
            case "loading":
                this.errorProcess = true;
                message = "Scan Schedule not found";
                break;
            default:
                break;
        }
        this.viewHelper.cleanNotifications();
        this.viewHelper.notifyError(message, AlAdvancedSchedulingFormComponent.AUTO_DISMISS_ERROR);
    }

    onTimeZoneDefaultSetted(timezones: TimezoneItem[]) {
        if (this.schedule.id !== undefined) {
            timezones.forEach( timezoneItem => {
                if (timezoneItem.value === this.schedule.timezone) {
                    this.scheduleForm.controls.selectedTimezone.setValue(timezoneItem);
                }
            });
        }
    }

    setScopeSelectionVisibility(): { 'display': string } {
        return {
            'display': this.scheduleForm.get('includeAllAssets').value ? 'none' : 'flex'
        };
    }

    onProtocolSelected(protocol: {event: MouseEvent, value: string}) {
        this.scheduleForm.get('protocolSelected').setValue(protocol.value);
    }

    addCustomPort() {
        if (this.scheduleForm.get('portsInput').valid) {
            let value: string = this.scheduleForm.get('portsInput').value;
            let portsList: string[];
            portsList = value.split(',');
            portsList.forEach( port => {
                const protocolId: string = (this.scheduleForm.get('protocolSelected').value as string);
                const protocol: string = protocolId === 'u' ? 'UDP' : 'TCP';
                port = port.trim();
                if (!this.selectedCustomPortsList.find( selectedPort => selectedPort.id === protocolId+"#"+port)) {
                    this.selectedCustomPortsList.push( this.mapPortOrRangeToAlSelectItem(protocolId, protocol, port) );
                }
            });
            this.scheduleForm.get('portsInput').reset();
        }
    }

    checkSelectedPortGroupsOptions() {
        const removeLastSelectedPort = () => {
            let portOptions = this.scheduleForm.get('selectedPortGroupsOptions').value as string[];
            portOptions.pop();
            this.scheduleForm.get('selectedPortGroupsOptions').setValue(portOptions);
        };
        if (Array.isArray(this.scheduleForm.get('selectedPortGroupsOptions').value) && this.scheduleForm.get('selectedPortGroupsOptions').value.length === 6) {
            this.confirmationService.confirm({
                header: 'Select Scan all Ports',
                message: 'Are you sure you want to scan all ports?',
                acceptLabel: 'SELECT ALL PORTS',
                rejectLabel: 'CANCEL',
                accept: () => {
                    this.scheduleForm.get('portOptions').setValue('all');
                    removeLastSelectedPort();
                },
                reject: () => {
                    removeLastSelectedPort();
                }
            });
        }
    }

    checkTabChanged(tab) {
        this.flushNotifications();
        switch (tab?.index as number) {
            // when "Schedule" tab is clicked
            case 0:
                this.checkIncompatibleScanWindows();
                break;
            // when "Scope" tab is clicked
            case 1:
                break;
            // when "Ports" tab is clicked
            case 2:
                this.checkIncompatiblePortGroups();
                break;
            default:
                break;
        }
    }

}
