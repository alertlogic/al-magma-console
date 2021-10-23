
import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InsightUtilityService, UtilityService } from '@components/technical-debt';
import { AlSession } from '@al/core';

import { AlBottomSheetHeaderOptions, AlBottomSheetComponent, AlNotification } from '@al/ng-generic-components';
import { from as observableFrom } from 'rxjs';

import { AlRulePayload,
         AlApplication,
         AlRule,
         AlApplicationMessageTimestamp,
         AlApplicationsClient,
        } from '@al/applications';

import { timestampPatterns,
         timestampFormats,
         multilineContinuationList
        } from './form-helpers';

import { TimestampFormatChecker,
         RuleCreationMode as Mode,
         AlApplicationMessage,
         AlApplicationFilename,
         ApplicationLogCardDescriptor } from '../../../../../types/application-log.types';
import { AlSelectFilterItem, AlSelectFilterItemDetails } from '@al/ng-generic-components/al-dropdown-filter/al-dropdown-filter.types';

@Component({
    selector: 'al-deployment-application-logs-create-rule-form',
    templateUrl: './deployment-application-logs-create-rule-form.component.html',
    styleUrls: ['./deployment-application-logs-create-rule-form.component.scss']
})
export class DeploymentApplicationLogsCreateRuleFormComponent implements OnInit, AfterViewInit {
    @Input() applications: AlApplication[] = [];
    @Input() headerOptions: AlBottomSheetHeaderOptions;
    @Input() deploymentId: string;
    @Input() item:ApplicationLogCardDescriptor = null;
    @Input() mode: Mode = 'CREATE';
    @Input() toggleActivated:boolean = false;
    @Input() standAlone: boolean = true;

    @ViewChild('alBottomSheet', { static: true } ) alBottomSheet: AlBottomSheetComponent;
    @ViewChild('ruleNameInput', { static: true } ) ruleNameInput: ElementRef;

    @Output() onChangedData: EventEmitter<any> = new EventEmitter();
    @Output() saveModal: EventEmitter<AlRule> = new EventEmitter();
    @Output() nextModal: EventEmitter<AlRule> = new EventEmitter();
    @Output() closeModal: EventEmitter<never> = new EventEmitter();

    public formNotifications = new EventEmitter<AlNotification>();

    form: FormGroup;
    selectedItem: AlApplication|AlRule;
    collect: boolean = true;
    fileNameRotationScheme: string;
    fileNameRotationSchemeValuePreDefined: string;
    fileNameRotationSchemeValueCustom: string;
    fileNameRotationSchemeCounter:string;
    timestampPatterns: AlSelectFilterItem[];
    timestampFormats = [];
    patternPreview: TimestampFormatChecker;
    patternPreviewTimestampRule: TimestampFormatChecker;
    ruleName: string = "";
    multilineContinuation:string = "At the beginning of message";
    multilineContinuationList = multilineContinuationList;
    timestampFormat:string = "";
    timestampFormatCustom:string;
    applicationList:AlSelectFilterItem[] = [];
    applicationsMap = {};
    selectedApplicationDropDown:AlSelectFilterItemDetails;
    isLoading: boolean = true;

    rule: AlRule = {
        scope: null,
        version: null,
        application_id: null,
        account_id: null,
        id: null,
        name: null,
        created: null,
        modified: null,
        config: {
            flatfile: {
                filename: {
                    pattern: null
                },
                path: null
            }
        }
    };

    formConfig: any = {
        infoName: 'Application name',
        colletMessage: 'Automatically Enable Collection from This Application Log',

        flatfilePathPlaceholder: 'Application File Path',
        flatfilePathTextError: 'A name for the application log is required.',
        infoFlatfilePath: 'The full path to the share or system directory (e.g. /var/www/logs). \
                           The source path is required for appliance-based collection. The system path is required for agent-based collection.',

        flatfilePatternPlaceholder: 'File Name or Pattern',
        flatfileCollectionPolicyPlaceholder: 'File Name Parsing Policy',
        flatfilePatternTextError: 'Filename or pattern could not be empty.',
        infoFlatfilePattern: 'The filename search mask (e.g. sql-errors-*.log).',

        flatfileRotationSchemaLabel: 'File Name Rotation Scheme',
        flatfileRotationSchemaPreDefinedLabel: 'Use a pre-defined timestamp format',
        flatfileRotationSchemaPreDefinedPlaceholder: 'Select a pattern',
        flatfileRotationSchemaPreDefinedInfo: 'The selected file name rotation scheme will apply to the "*" character location \
                                            in the file name to detect the correct rotation scheme. The "*" character must be preceded by a "*" \
                                            character separator. Increasing and decreasing options are only supported by agent version 2.2.0 and above.',

        flatfileRotationSchemaCustomLabel: 'Use a custom timestamp format',

        flatfileRotationSchemaCounterIncreasingLabel: 'Use an increasing counter format',
        flatfileRotationSchemaCounterDecreasingLabel: 'Use a decreasing counter format',

        flatfileRotationSchemaCustomPlaceholder: 'Format of date string',
        flatfileRotationSchemaCustomTextError: 'Format of date string could not be empty.',

        numberLinesPlaceholder: 'Number of lines',
        numberLinesEmptyError: 'Number of lines must be a positive integer.',
        numberLinesIntegerError: 'Number of lines must be a positive integer.',

        pathKnownPatternPlaceholder: 'Pattern',
        pathKnownPatternError: 'Pattern could not be empty.',

        regularEspressionLabel: 'Regular expression',

        muntiLineHandlingTitle: 'Multiline Handling',
        multiLineSingle: 'Single line log messages',
        multiLineMultipleLines: 'Log messages with multiple lines',
        multilineLineCount: 'Each log message spans a fixed number of lines',
        multilineLinePattern: 'Each log message follows a known pattern',

        timestampActual: 'Set message time as collect time',
        timestampPredefined: 'Parse file name using a pre-defined timestamp format',
        timestampCustom: 'Parse file name using a custom timestamp format',
        timestampFormatPlaceholder: 'Select a format',

        timestampCustomPlaceholder: 'Format of date string',
        timestampCustomCustomTextError: 'Format of date string could not be empty.',

        multiline: {
            operator: null,
            continuation: null,
            line_count: null,
            pattern: null,
            is_regex: null,
            is_multiline: false,
        },
        timestamp: {
            format: null,
            rule: 'actual',
        }
    };

    private accountId: string;
    private readonly errorAutoDismiss: number = 8000;

    constructor(private formBuilder: FormBuilder,
                protected utilityService: UtilityService,
                protected insightUtilityService: InsightUtilityService) {}

    ngAfterViewInit(): void {
        this.openBottomSheet();
    }

    ngOnInit() {
        this.accountId = AlSession.getActingAccountId();
        this.setDefaultFormValues();
        this.checkFormatFileNameRotationScheme({label:this.fileNameRotationSchemeValuePreDefined});
        this.checkFormatTimeStampRule({label:this.timestampFormat});
        this.setHeader();
        this.open(this.item);
        this.isLoading = false;
    }

    open = ( item:ApplicationLogCardDescriptor = null) => {
        if( this.applications.length > 1 ) {
            this.selectedItem = this.applications[0];
            this.rule.config.flatfile.filename.pattern = this.selectedItem.config.flatfile.filename.pattern;
        }
        if ( item && item.rule ) {
            this.setRuleRelatedVariables(item);
            this.setFileNameRelatedVariables(item);
            this.setMessageSplitSpecRelatedVariables(item);
            this.setMessageTimestampRelatedVariables(item);
            this.setFormControlAttributes(item, 'rule');
        } else if ( item && item.application ) {
            this.setAppLogRelatedVariables(item);
            this.setFormControlAttributes(item, 'app_log');
        }
        this.subscribeToFormChanges();
        this.applicationList = this.dropDwonListApplications(this.applications);
        this.applicationsMap = this.createApplicationDictionary(this.applications);
    }

    openBottomSheet() {
        this.alBottomSheet.open();
    }
    /**
     * selectedApplicationChange
     *
     * Function related to the Application dropdown
     *
     * @param applicationItem selected application.
     */
    selectedApplicationChange = ( ):void => {
        this.selectedItem = this.applicationsMap[this.selectedApplicationDropDown[0].id];
        this.rule.config.flatfile.path = this.selectedItem.config.flatfile.path;
        this.rule.config.flatfile.filename.pattern = this.selectedItem.config.flatfile.filename.pattern;
    }

    checkFormatFileNameRotationScheme = ( value:AlSelectFilterItem ): void => {

        this.fileNameRotationSchemeValuePreDefined = value.label;

        if (this.fileNameRotationScheme === "pre-defined") {
            if (value.label === "Auto-Detect") {
                this.patternPreview = { status: "valid", value: "Auto-Detect" };
            } else {
                this.patternPreview = this.processTimestampPattern(value.label);
            }
        } else if ( this.fileNameRotationScheme === "increasing" || this.fileNameRotationScheme === "decreasing" ) {
            this.patternPreview = { status: "valid", value: "Auto-Detect" };
        } else {
            if (value.label !== "") {
                this.patternPreview = this.processTimestampPattern(value.label);
            } else {
                this.patternPreview = { status: "invalid", value: "Format string is empty" };
            }
        }
        const isValid: boolean = this.isFormValid();
        this.disableSaveButton(isValid);
    }

    checkFormatTimeStampRule = (value:AlSelectFilterItem ): void => {
        this.timestampFormat = value.label;
        if( this.formConfig.timestamp.rule === "predefined" ) {
            if( value.label === "epoch" ) {
                this.patternPreviewTimestampRule = { status: "valid", value: "" };
            } else {
                this.patternPreviewTimestampRule = this.processTimestampPattern(value.label);
            }
        } else if (value.label === 'increasing' || value.label === 'decreasing') {
            this.patternPreviewTimestampRule = { status: 'invalid', value: "Format string contains disallowed characters." };
        } else if (this.formConfig.timestamp.rule === "custom") {
            if( value.label !== "" ) {
                this.patternPreviewTimestampRule = this.processTimestampPattern(value.label);
            } else {
                this.patternPreviewTimestampRule = { status: "invalid", value: "Format string is empty" };
            }
        }
        const isValid: boolean = this.isFormValid();
        this.disableSaveButton(isValid);
    };

    selectRotationScheme = (): void => {
        if (this.fileNameRotationScheme === "pre-defined" ||
            this.fileNameRotationScheme === "increasing" ||
            this.fileNameRotationScheme === "decreasing" ) {
            this.checkFormatFileNameRotationScheme({ label: this.fileNameRotationSchemeValuePreDefined});
            this.fileNameRotationSchemeValueCustom = "";
            this.fileNameRotationSchemeValuePreDefined = "Auto-Detect";
            this.form.controls.patternDateStringCustom.disable();
        } else if( this.fileNameRotationScheme === "custom" ) {
            this.form.controls.patternDateStringCustom.enable();
            if (!this.fileNameRotationSchemeValueCustom) {
                this.patternPreview = {status: "valid", value: ""};
            }
        }
    }

    onChangeOperator = (): void => {
        if (this.formConfig.multiline.operator === 'pattern') {
            this.multilineContinuation = "At the beginning of message";
            this.formConfig.multiline.line_count = null;
            this.formConfig.multiline.pattern = null;
            this.formConfig.multiline.is_regex = false;
            this.form.controls.numberLines.disable();
            this.form.controls.pathKnownPattern.enable();
        } else {
            this.multilineContinuation = null;
            this.formConfig.multiline.line_count = null;
            this.formConfig.multiline.is_regex = null;
            this.formConfig.multiline.pattern = null;
            this.form.controls.numberLines.enable();
            this.form.controls.pathKnownPattern.disable();
        }
    }

    onChangeMultiline = (): void => {
        this.formConfig.multiline.line_count = null;
        this.formConfig.multiline.pattern = null;
        this.form.controls.pathKnownPattern.disable();
        if (this.formConfig.multiline.is_multiline) {
            this.formConfig.multiline.operator = 'line_count';
            this.form.controls.numberLines.enable();
        } else {
            this.formConfig.multiline.operator = null;
            this.form.controls.numberLines.disable();
        }
    }

    onChangeTimestampRule = (): void => {
        if (this.formConfig.timestamp.rule === 'actual') {
            this.checkFormatTimeStampRule( { label:this.timestampFormat } );
            this.form.controls.formatDateStringCustom.disable();
            this.timestampFormatCustom = "";
        } else if (this.formConfig.timestamp.rule === 'predefined') {
            this.checkFormatTimeStampRule( { label:this.timestampFormat } );
            this.timestampFormat = 'epoch';
            this.timestampFormatCustom = "";
            this.form.controls.formatDateStringCustom.disable();
        } else if(this.formConfig.timestamp.rule === 'custom') {
            this.form.controls.formatDateStringCustom.enable();
            if (!this.timestampFormatCustom) {
                this.patternPreviewTimestampRule = {status: "valid", value: ""};
            }
        }
    }

    setFormValidations = (): void => {
        this.form = this.formBuilder.group({
            collect: [''],
            flatfilePath: ['', Validators.required],
            flatfilePattern: ['', Validators.required],
            ruleName: this.mode === "DUPLICATE" ? ['', Validators.required] : [''],
            formatDateStringCustom: [''],
            patternDateStringCustom: [''],
            numberLines: ['', [Validators.pattern("^[0-9]+$")]],
            pathKnownPattern: [''],
            formatDateString: [''],
            patternDateString: [''],
        });
    }

    onSubmit = (): void => {
        this.disableInputs();
        this.save();
    }

    save = (): void => {
        let alRulePayload: AlRulePayload = this.buildRulePayload();
        if (this.mode === 'CREATE' || this.mode === 'DUPLICATE' ) {
            if (this.mode === 'DUPLICATE') {
                alRulePayload.default = false;
            }
           this.saveRule(alRulePayload);
        } else {
           this.updateRule(alRulePayload);
        }
    }

    close(): void {
        this.alBottomSheet.hide();
        this.closeModal.emit();
    }

    selectMultilineContinuation( item:AlSelectFilterItem = null ):'begins'|'contains'|'ends'|null {
        if( item ){
            this.multilineContinuation = item.label
        } else {
            switch (this.multilineContinuation) {
                case "At the beginning of message":
                    return "begins";
                case "In the middle of message":
                    return "contains";
                case "At the end of message":
                    return "ends";
            }
        }
    }

    /**
     * dropDwonListApplications
     *
     * Converting the @Input Applications to AlSelectFilterItem.
     *
     * @param applicationList list of applications.
     */
    dropDwonListApplications( applicationList:AlApplication[] ):AlSelectFilterItem[] {
        let applications:AlSelectFilterItem[] = [];
        applicationList.forEach( ( application:AlApplication ) => {
            applications.push( {
                label:application.name,
                value: [{
                    id:application.id,
                    name:application.name,
                    code: application.id,
                }]});
        });
        return applications;
    }

    /**
     * createApplicationDictionary
     *
     * Creating Application Dictionary to store the list.
     *
     * @param applicationsList list of applications.
     */
    private createApplicationDictionary = (applicationsList: AlApplication[]): { [i: string]: AlApplication } => {
        let applicationsMap = {};
        applicationsList.forEach((application: AlApplication) => {
            applicationsMap[application.id] = application;
        });
        return applicationsMap;
    }

    private handleError(errorType: 'update'|'create'|'fetch', error): void {
        let body = error.hasOwnProperty('json') ? error.data : error;
        let reason_text = this.insightUtilityService.nestedGet(body, "message", null);
        let message: string = "";
        switch(errorType) {
            case 'update':
                message = "Internal error updating data";
                break;
            case 'create':
                message = "Internal error creating data";
                break;
            case 'fetch':
                message = "Internal error getting data";
                break;
        }
        if (error.status !== 500 && reason_text) {
            message = reason_text;
        }
       this.formNotifications.emit(AlNotification.error(message, this.errorAutoDismiss, true));
       setTimeout(()=>{
            this.ruleNameInput.nativeElement.focus();
       },0);
       this.enableInputs();
    }

    private setDefaultFormValues = (): void => {
        this.headerOptions.primaryAction.disabled = this.mode === "EDIT" ? false : true;
        this.setFormValidations();
        this.collect = true;
        this.fileNameRotationScheme = "pre-defined";
        this.fileNameRotationSchemeValuePreDefined = "Auto-Detect";
        this.fileNameRotationSchemeValueCustom = "";
        this.timestampFormatCustom = "";
        this.timestampFormat = "epoch";
        this.timestampPatterns = timestampPatterns;
        this.timestampFormats = timestampFormats;
        this.patternPreview = {status: "valid", value: "Auto-Detect"};
        this.patternPreviewTimestampRule = {status: "valid", value: ""};
        this.ruleName = "";
    }

    private subscribeToFormChanges = (): void => {
        this.form.valueChanges.subscribe(changes => {
            const isValid: boolean = this.isFormValid();
            this.disableSaveButton(isValid);
            this.onChangedData.emit(isValid);
        });
    }

    private disableInputs = (): void => {
        this.form.controls.collect.disable();
        this.form.controls.flatfilePath.disable();
        this.form.controls.flatfilePattern.disable();
        this.form.controls.ruleName.disable();
    }

    private enableInputs = (): void => {
        this.form.controls.collect.enable();
        this.form.controls.flatfilePath.enable();
        this.form.controls.flatfilePattern.enable();
        this.form.controls.ruleName.enable();
    }

    /**
     * getFilename Function
     *
     * Setup the filename object depending on the selected option from the form.
     *
     * @param option string.
     */
    private getFilename( option:string = "" ): AlApplicationFilename {
        if( option === "pre-defined" ) {
            if( this.fileNameRotationSchemeValuePreDefined !== "Auto-Detect" ) {
                return {
                    type:"datetime",
                    pattern: this.form.get('flatfilePattern').value,
                    format: this.fileNameRotationSchemeValuePreDefined
                }
            } else {
                return {
                    type:"automatic",
                    pattern: this.form.get('flatfilePattern').value
                }
            }
        } else if ( option === "increasing" ) {
            return {
                type:"counter",
                pattern: this.form.get('flatfilePattern').value,
                format: "increasing"
            }
        } else if ( option === "decreasing" ) {
            return {
                type:"counter",
                pattern: this.form.get('flatfilePattern').value,
                format: "decreasing"
            }
        } else if (option === "custom") {
            return {
                type: "datetime",
                pattern: this.form.get('flatfilePattern').value,
                format: this.form.get('patternDateStringCustom').value
            }
        }
    }

    /**
     * getMessageSplitSpec function
     *
     * Setup the Message Split Spec object depending on the selected option from the form.
     *
     * @param isMultiLine for 'single' false, for 'multiline' true.
     * @param option line_count or pattern.
     */
    private getMessageSplitSpec( isMultiLine:boolean, option:string ): AlApplicationMessage {
        if( isMultiLine === false ) {
            return {
                type:"single_line"
            };
        } else if( option === "line_count" ) {
            return {
                type:"fixed_lines_count",
                value: this.form.get('numberLines').value
            }
        } else if( option === "pattern" ) {
            return {
                type:"multiline_pattern",
                pattern:{
                    type: this.formConfig.multiline.is_regex? "regex":"string",
                    value:  this.form.get('pathKnownPattern').value
                },
                match_mode: this.selectMultilineContinuation()
            }
        }
    }

    /**
     * getMessageTimestamp function
     *
     * Setup the Message timestamp object depending on the selected option from the form.
     *
     * @param option actual | predefined | custom
     */
    private getMessageTimestamp( option:string ):AlApplicationMessageTimestamp {
        if( option === "actual" ) {
            return {
                type: "automatic"
            }
        } else if ( option === "predefined" ) {
            return {
                type: "datetime",
                format: this.timestampFormat
            }
        } else if ( option === "custom" ) {
            return {
                type: "datetime",
                format: this.timestampFormatCustom
            }
        }
    }

    private setHeader(): void {
        switch(this.mode) {
            case 'CREATE':
                this.headerOptions.title = "Add New Application";
                break;
            case 'EDIT':
                this.headerOptions.title = "Edit Application";
                break;
            case 'DUPLICATE':
                this.ruleName = "copy of ";
                this.headerOptions.title = "Duplicate Application";
                break;
        }
        this.headerOptions.primaryAction.text = this.standAlone ? 'SAVE' : 'SAVE AND NEXT';
    }

    private saveRule(payload: AlRulePayload): void {
        observableFrom( AlApplicationsClient
            .addRule(this.accountId, payload, this.deploymentId))
            .subscribe( (rule:AlRule) => {
                this.emitSavingEvent(rule);
                this.alBottomSheet.hide();
            },
            error => {
                this.handleError('create', error);
            });
    }

    private updateRule(payload: AlRulePayload): void {
        observableFrom(AlApplicationsClient
            .updateRule(this.accountId, this.rule.id, payload))
            .subscribe( (rule:AlRule) => {
                 this.emitSavingEvent(rule);
                 this.alBottomSheet.hide();
            },
            error => {
                 this.handleError('update', error);
            });
    }

    private buildRulePayload(): AlRulePayload {
        const applicationId =
            (this.selectedItem as AlRule).application_id ?
                (this.selectedItem as AlRule).application_id :  this.selectedItem.id
        const messageTimestamp =
            this.getMessageTimestamp(this.formConfig.timestamp.rule);
        const messageSplitSpec =
            this.getMessageSplitSpec(this.formConfig.multiline.is_multiline,
                                     this.formConfig.multiline.operator);
        const name = this.ruleName

        const scope = this.selectedItem['scope'] ? this.selectedItem['scope']: [];
        const filename = this.getFilename( this.fileNameRotationScheme );
        const payload: AlRulePayload =  {
            application_id: applicationId,
            name,
            config: {
                flatfile: {
                    path: this.form.get('flatfilePath').value,
                    message_timestamp: messageTimestamp,
                    message_split_spec: messageSplitSpec,
                    filename,
                }
            },
            scope,
            enabled: this.collect,
        };
        if (this.mode === 'CREATE') {
            payload.default = false;
        }
        return payload;
    }

    private disableSaveButton(isValid: boolean): void {
        this.headerOptions.primaryAction.disabled = !isValid;
    }

    private emitSavingEvent = (message: AlRule): void => {
        if (this.standAlone) {
            this.saveModal.emit(message);
        } else {
            this.nextModal.emit(message);
        }
    }

    private isFormValid = (): boolean => {
        return this.form.valid &&
               this.patternPreview.status === "valid" &&
               this.patternPreviewTimestampRule.status === "valid";
    }

    private processTimestampPattern = (format: string): TimestampFormatChecker => {
        let result: TimestampFormatChecker = { status: "valid", value: "Integer: " + format };
        if (format !== "increasing" && format !== "decreasing") {
            result =
                this.utilityService
                    .processTimestampPattern(format) as TimestampFormatChecker;

        }
        return result;
    }

    private setRuleRelatedVariables(item: ApplicationLogCardDescriptor): void {
          this.selectedItem = item.rule;
          this.rule.id = item.rule.id;
          this.rule.config.flatfile.path = item.rule.config.flatfile.path;
          this.rule.config.flatfile.filename.pattern = item.rule.config.flatfile.filename.pattern;
          this.ruleName =
              this.mode === 'EDIT' ? this.selectedItem.name : this.ruleName += this.selectedItem.name;
          this.collect = item.rule.enabled;
    }

    private setAppLogRelatedVariables(item: ApplicationLogCardDescriptor): void {
        this.selectedItem = item.application;
        this.setFormValidations();
        this.ruleName =
            this.mode === 'EDIT' || this.mode === 'CREATE' ? this.selectedItem.name : this.ruleName += this.selectedItem.name;
        this.rule.config.flatfile.path = item.application.config.flatfile.path;
        this.rule.config.flatfile.filename.pattern = item.application.config.flatfile.filename.pattern;
        this.fileNameRotationSchemeValuePreDefined =
            item.application.config.flatfile.filename['format'] ? item.application.config.flatfile.filename['format']
                : "Auto-Detect";
        this.fileNameRotationScheme =
            item.application.config.flatfile.filename.type === "automatic" ? "pre-defined"
                : this.timestampPatterns.map( function( element ) { return element.label; } ).
                    indexOf(item.application.config.flatfile.filename['format']) === -1 ? "custom" : "pre-defined";
    }

    private setFileNameRelatedVariables(item: ApplicationLogCardDescriptor): void {
        if( item.rule.config.flatfile.filename.type === "automatic" ) {
            this.fileNameRotationScheme = "pre-defined";
            this.fileNameRotationSchemeValuePreDefined = "Auto-Detect";
            this.patternPreview.value = "Auto-Detect";
        } else if( item.rule.config.flatfile.filename.type === "datetime" ) {
            if (item.rule.config.flatfile.filename.hasOwnProperty("format") ) {
                if (this.timestampPatterns.map( function( element ) { return element.label; } )
                        .indexOf(item.rule.config.flatfile.filename.format) === -1 ) {
                    this.fileNameRotationScheme = "custom";
                    this.fileNameRotationSchemeValueCustom = item.rule.config.flatfile.filename.format;
                    this.form.controls['patternDateStringCustom'].setValue(item.rule.config.flatfile.filename.format);
                } else {
                    this.fileNameRotationScheme = "pre-defined";
                    this.fileNameRotationSchemeValuePreDefined = item.rule.config.flatfile.filename['format'];
                    this.patternPreview.value = item.rule.config.flatfile.filename['format'];
                }
            }
        } else if (item.rule.config.flatfile.filename.type === "counter") {
            if (item.rule.config.flatfile.filename.format === "decreasing") {
                this.fileNameRotationScheme = "decreasing";
            } else {
                this.fileNameRotationScheme = "increasing";
            }
        }
    }

    private setMessageSplitSpecRelatedVariables(item: ApplicationLogCardDescriptor): void {
        if (item.rule.config.flatfile.message_split_spec.type === "single_line" ) {
            this.formConfig.multiline.is_multiline = false;
        } else {
            this.formConfig.multiline.is_multiline = true;
            if (item.rule.config.flatfile.message_split_spec.type === "multiline_pattern" ) {
                this.formConfig.multiline.operator = "pattern"

                switch (item.rule.config.flatfile.message_split_spec.match_mode) {
                    case "begins":
                        this.multilineContinuation = this.multilineContinuationList[0].label
                        break;
                    case "contains":
                        this.multilineContinuation = this.multilineContinuationList[1].label
                        break;
                    case "ends":
                        this.multilineContinuation = this.multilineContinuationList[2].label
                        break;
                }

                this.formConfig.multiline.pattern = item.rule.config.flatfile.message_split_spec.pattern.value;
                this.form.controls['pathKnownPattern'].setValue(item.rule.config.flatfile.message_split_spec.pattern.value);
                this.formConfig.multiline.is_regex = item.rule.config.flatfile.message_split_spec.pattern.type === "regex"? true:false;
            } else if (item.rule.config.flatfile.message_split_spec.type === "fixed_lines_count" ) {
                this.formConfig.multiline.operator = "line_count"
                this.formConfig.multiline.line_count = item.rule.config.flatfile.message_split_spec.value;
                this.form.controls['numberLines'].setValue(item.rule.config.flatfile.message_split_spec.value);
            }
        }
    }

    private setMessageTimestampRelatedVariables(item: ApplicationLogCardDescriptor): void {
        if (item.rule.config.flatfile.message_timestamp.type === "automatic" ) {
            this.formConfig.timestamp.rule = "actual"
        } else if( item.rule.config.flatfile.message_timestamp.type === "datetime" ) {
            if( item.rule.config.flatfile.message_timestamp.hasOwnProperty("format") ) {
                if( this.timestampFormats.map( function( element ) { return element.label; } )
                        .indexOf(item.rule.config.flatfile.message_timestamp.format) === -1 ) {
                    this.formConfig.timestamp.rule = "custom"
                    this.timestampFormatCustom = item.rule.config.flatfile.message_timestamp.format;
                    this.form.controls['formatDateStringCustom'].setValue(item.rule.config.flatfile.message_timestamp.format);
                } else {
                    this.formConfig.timestamp.rule = "predefined";
                    this.timestampFormat = item.rule.config.flatfile.message_timestamp.format;
                    this.form.controls['formatDateString'].setValue(item.rule.config.flatfile.message_timestamp.format);
                }
            }
        }
    }

    private setFormControlAttributes(item: ApplicationLogCardDescriptor, from: 'rule' | 'app_log'): void {
        if (from === 'rule') {
            this.form.controls['flatfilePath'].setValue(item.rule.config.flatfile.path);
            this.form.controls['flatfilePattern'].setValue(item.rule.config.flatfile.filename.pattern);
            this.form.controls['ruleName'].setValue(item.rule.name);
        } else if (from === 'app_log') {
            this.fileNameRotationSchemeValuePreDefined =
                item.application.config.flatfile.filename['format'] ? item.application.config.flatfile.filename['format']
                    : "Auto-Detect" ;
            this.form.controls['flatfilePattern'].setValue(item.application.config.flatfile.filename.pattern);
            this.form.controls['ruleName'].setValue(item.application.name);
        }
    }
}
