import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import { SelectItem } from "primeng/api/selectitem";
import { AlSession } from "@al/core";
import {
    AlResponderAction,
    AlResponderActionLong,
    AlResponderClient,
    AlResponderCronScheduleTrigger,
    AlResponderDateTimeScheduleTrigger,
    AlResponderIncidentTrigger,
    AlResponderIntervalScheduleTrigger,
    AlResponderPlaybook,
    AlResponderPlaybookParameter,
    AlResponderPlaybookTrigger,
    AlResponderTriggerActionParameter,
    AlResponderTriggerPlaybookParameter,
    AlResponderWorkflowTask,
} from "@al/responder";
import { AlAssetsQueryClient } from "@al/assets-query";
import { AlWizardStepperComponent, WizardStep } from '@al/ng-generic-components';
import { getTimeZones } from "@vvo/tzdb";
import {
    AlPlaybookEditorTreeUtilityService,
    AlParametersUtilityService
} from "../services";
import {
    AlParameterConfiguration,
    AlTaskPaletteItem,
    AlFormElementBase
} from "../types";
import { AlDynamicFormComponent } from '../al-dynamic-form/al-dynamic-form.component';

@Component({
    selector: 'al-trigger-form',
    templateUrl: './al-trigger-form.component.html',
    styleUrls: ['./al-trigger-form.component.scss']
})
export class AlTriggerFormComponent implements OnInit, OnChanges {

    @Input() trigger: AlResponderPlaybookTrigger;
    @Input() editingTrigger = false;

    @Output() onValidate: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() onTriggerTypeChanged: EventEmitter<string> = new EventEmitter<string>();
    @Output() onWizardStepSelected: EventEmitter<WizardStep> = new EventEmitter<WizardStep>();

    playbooks: SelectItem[] = [];
    assetGroups: SelectItem[] = [];
    selectedAssetGroups: string[] = [];
    isLoading = false;
    loadingFormParams = false;
    availableActions: AlTaskPaletteItem[] = [];
    actionsLookup: { [key: string]: AlTaskPaletteItem } = {};
    showTaskPalette = false;

    @ViewChild('alWizard') alWizard: AlWizardStepperComponent;
    @ViewChild("actionParamsForm") public actionParamsForm?: AlDynamicFormComponent;

    threatLevels: SelectItem[] = [
        {
            value: 'Critical',
            label: 'Critical'
        },
        {
            value: 'High',
            label: 'High'
        },
        {
            value: 'Medium',
            label: 'Medium'
        },
        {
            value: 'Low',
            label: 'Low'
        },
        {
            value: 'Info',
            label: 'Info'
        }
    ];

    units: SelectItem[] = [
        {label: 'Seconds', value: 'seconds'},
        {label: 'Minutes', value: 'minutes'},
        {label: 'Hours', value: 'hours'},
        {label: 'Days', value: 'days'},
        {label: 'Weeks', value: 'weeks'}
    ];

    timezones: SelectItem[] = [];
    selectedDateTime: Date;
    triggerMethod = 'conditional'; // default

    public generalElements: AlFormElementBase<any>[] = [];
    public parametersWithProperties: any; // unused? Type?
    public selectedActionRef = '';
    public selectedActionDisplayName = '';
    public selectedTriggerAction: AlResponderTriggerActionParameter;
    public currentTriggerActionsValidity: { [key: string]: boolean } = {};

    private defaultThreatLevels = ['Critical', 'High', 'Medium', 'Low', 'Info'];
    private actingAccountId: string;
    private playbooksAll: AlResponderPlaybook[] = [];

    constructor(
        private editorTreeService: AlPlaybookEditorTreeUtilityService,
        private parametersUtility: AlParametersUtilityService
    ) {

    }

    async ngOnInit() {
        this.isLoading = true;
        this.timezones = getTimeZones().map(tz => {
            return {
                label: `${tz.name} (${tz.abbreviation})`,
                value: tz.name
            };
        });
        this.triggerMethod = ['incident', 'observation'].includes(this.trigger.type || '') ? 'conditional' : 'scheduled';
        if (this.isDateTimeScheduleTrigger(this.trigger) && this.trigger.date && this.trigger.type === 'datetime') {
            this.selectedDateTime = new Date(this.trigger.date);
        }
        this.actingAccountId = AlSession.getActingAccountId();
        this.playbooksAll = await (await AlResponderClient.getAllPlaybooks(this.actingAccountId, {deleted: false}));
        const assetGroups = await AlAssetsQueryClient.listAssetGroups(this.actingAccountId);

        // todo - get correct actions...
        const actions = await AlResponderClient.getActions(this.actingAccountId);
        this.availableActions = this.editorTreeService.getAddOptions(actions);
        this.availableActions.map(action => {
            const responderAction = <AlResponderAction>action.value;
            this.actionsLookup[responderAction.action.ref || ''] = action;
        });


        if (this.playbooksAll.length > 0) {
            this.determinePlaybooksForTriggerType();
        } else {
            this.playbooks = [];
            // TODO - handle zero playbooks found, show message!?
        }

        if (assetGroups.groups.length > 0) {
            this.assetGroups = assetGroups.groups.map(ag => {
                return {label: ag.key, value: ag.key} as SelectItem;
            });
            if (this.trigger.type === 'incident' && this.isIncidentTrigger(this.trigger)) {
                const triggerGroups = this.trigger.asset_groups;
                if (triggerGroups) {
                    this.assetGroups.forEach(ag => {
                        if (triggerGroups.groups.includes(ag.label || '')) {
                            this.selectedAssetGroups.push(ag.label || '');
                        }
                    });
                }
            }
        } else {
            this.assetGroups = [];
        }
        this.isLoading = false;
    }

    ngOnChanges() {
        console.log('AlTriggerFormComponent onchanges');
        console.log(this.trigger);
    }

    onValidateTrigger(isValid?: boolean) {
        if (this.trigger.actions) {
            const areAllValid = Object.values(this.currentTriggerActionsValidity).find(entry => !entry);
            if (areAllValid === false) {
                this.onValidate.emit(false);
                return;
            }
        }
        this.onValidate.emit(isValid);
    }

    onAssetGroupsSelected(event: { originalEvent: Event, value: string[] }) {
        if (this.isIncidentTrigger(this.trigger)) {
            if (event.value.length > 0) {
                this.trigger.asset_groups = {
                    member_of: true,
                    groups: event.value
                };
            } else {
                delete this.trigger.asset_groups;
            }
        }
        this.onValidate.emit();
    }

    onTriggerTypeClick() {
        this.triggerMethod = ['incident', 'observation'].includes(this.trigger.type || '') ? 'conditional' : 'scheduled';
        this.resetTriggerFields(this.trigger.type);
    }

    onTriggerMethodClick() {
        this.resetTriggerFields(this.triggerMethod === 'conditional' ? 'incident' : 'interval');
    }

    onStepSelected(step: WizardStep) {
        this.onWizardStepSelected.emit(step);
    }

    onDateTimeSelect(d: Date) {
        if (this.isDateTimeScheduleTrigger(this.trigger)) {
            // convert supplied date to a string formatted as 'YYYY-MM-DD hh:mm:ss' as required by stackstorm
            this.trigger.date = `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${("0" + d.getDate()).slice(-2)} ${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}:${("0" + d.getSeconds()).slice(-2)}`;
        }
    }

    resetTriggerFields(triggerType?: string) {
        this.selectedAssetGroups = [];
        const name = this.trigger.name ?? '';
        const playbooks: AlResponderTriggerPlaybookParameter[] = [];
        const type = triggerType ? triggerType : 'incident';
        switch (triggerType) {
            case undefined:
            case 'incident':
                this.trigger = {
                    name,
                    type,
                    playbooks,
                    enabled: true,
                    threat_levels: [...this.defaultThreatLevels],
                    escalated: false,
                };
                break;
            case 'observation':
                this.trigger = {
                    name,
                    type,
                    playbooks,
                    enabled: true,
                };
                break;
            case 'interval':
                this.trigger = {
                    name,
                    type,
                    playbooks,
                    enabled: true,
                    unit: 'hours',
                    delta: 1
                };
                break;
            case 'datetime':
                this.trigger = {
                    name,
                    type,
                    playbooks,
                    enabled: true,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // detect users current timezone
                };
                break;
            case 'cron':
                this.trigger = {
                    name,
                    type,
                    playbooks,
                    enabled: true,
                    day: '*', // default to daily
                    hour: '0',
                    minute: '0',
                    second: '0',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // detect users current timezone
                };
                break;
            default:
                break;
        }
        this.determinePlaybooksForTriggerType();
        this.onValidateTrigger();
    }

    onAddAction(task: AlResponderAction | string) {
        if (typeof task === 'string') {
            return;
        }
        if (!this.trigger.actions) {
            this.trigger.actions = [];
        }

        const ref = task.action.ref || '';

        this.trigger.actions.push({
            ref,
            parameters: []
        });
        this.selectedActionRef = ref;
        this.selectedActionDisplayName = this.determineActionDisplayName(task.action) || '';
        this.loadTriggerActionParams();
        this.showTaskPalette = false;
    }

    onSelectTriggerAction(action: AlTaskPaletteItem) {
        const responderAction = (<AlResponderAction>action.value).action;
        this.selectedActionRef = responderAction.ref || '';
        this.selectedActionDisplayName = this.determineActionDisplayName(responderAction) || '';
        this.loadTriggerActionParams();
    }

    async loadTriggerActionParams() {

        this.loadingFormParams = true;
        this.generalElements = [];
        this.selectedTriggerAction = (this.trigger.actions || []).find(act => act.ref === this.selectedActionRef) as AlResponderTriggerActionParameter;
        const currentActionValues: { [key: string]: any } = {};
        (this.selectedTriggerAction.parameters || []).forEach(param => {
            currentActionValues[param.name] = param.value;
        });
        try {
            const params = {payload_type: this.trigger.type || ''};
            const actionDefinition: AlResponderAction = await AlResponderClient.getActionByRef(this.actingAccountId, this.selectedActionRef, params);
            const config: AlParameterConfiguration = {
                alertDefaults: true,
                responderInputs: false,
                suggestions: [] // check this with Maryit\Bryan
            };
            if (actionDefinition.allowed_values) {
                config.allowedValues = actionDefinition.allowed_values;
            }
            this.generalElements = this.parametersUtility.createGeneralElements(
                actionDefinition.action.parameters as { [key: string]: AlResponderPlaybookParameter },
                {input: currentActionValues} as AlResponderWorkflowTask, // not sure about this, check this with Maryit\Bryan
                config
            );
            const actionsParamsValid = (this.selectedTriggerAction.parameters || []).length > 0;
            this.currentTriggerActionsValidity[this.selectedActionRef] = actionsParamsValid;
            this.loadingFormParams = false;
            this.isTriggerActionParamsValid(Object.keys((actionDefinition.action.parameters || {})).length > 0 ? actionsParamsValid : true);
        } catch (error) {
            this.loadingFormParams = false;
        }
    }

    isTriggerActionParamsValid(valid: boolean) {
        this.currentTriggerActionsValidity[this.selectedActionRef] = valid;
        this.onValidateTrigger(valid);
    }

    onTriggerActionParamChanges(event: { [key: string]: any }) {

        // review below, this is overkill
        this.selectedTriggerAction.parameters = [];
        Object.keys(event).forEach(k => {
            (this.selectedTriggerAction.parameters || []).push({
                name: k,
                value: event[k]
            });
        });
    }

    removeTriggerAction(action: AlTaskPaletteItem) {
        const triggerAction = this.findTriggerAction(action);
        if (triggerAction) {
            if (!this.trigger.actions) {
                this.trigger.actions = [];
            }
            const idx = this.trigger.actions.findIndex(act => act.ref === triggerAction.ref);
            this.trigger.actions.splice(idx, 1);
            this.generalElements = [];
            this.selectedActionRef = '';
            this.selectedActionDisplayName = '';
            delete this.currentTriggerActionsValidity[triggerAction.ref];
            this.onValidateTrigger();
        } else {
            console.error('Something broke - cannot find existing trigger action to be removed');
        }

    }

    hasTimezone(trigger: AlResponderPlaybookTrigger): trigger is AlResponderCronScheduleTrigger | AlResponderDateTimeScheduleTrigger {
        return (trigger as AlResponderCronScheduleTrigger | AlResponderDateTimeScheduleTrigger).timezone != null;
    }

    isIntervalSchedule(trigger: AlResponderPlaybookTrigger): trigger is AlResponderIntervalScheduleTrigger {
        return (trigger as AlResponderIntervalScheduleTrigger).hasOwnProperty('unit') && (trigger as AlResponderIntervalScheduleTrigger).hasOwnProperty('delta');
    }

    isIncidentTrigger(trigger: AlResponderPlaybookTrigger): trigger is AlResponderIncidentTrigger {
        return (trigger as AlResponderIncidentTrigger).hasOwnProperty('escalated');
    }

    private findTriggerAction(action: AlTaskPaletteItem) {
        const actionRef = (<AlResponderAction>action.value).action.ref;
        return (this.trigger.actions || []).find(act => act.ref === actionRef);
    }

    private determineActionDisplayName(action: AlResponderActionLong) {
        const displayName = ((action.tags || []).find(tag => tag.name === 'display_name') || {}).value;
        const vendorName = ((action.tags || []).find(tag => tag.name === 'vendor') || {}).value;
        if (displayName) {
            if (vendorName) {
                return `${vendorName}: ${displayName}`;
            }
            return displayName;
        }
        return action.ref;
    }

    private determinePlaybooksForTriggerType() {
        if (['incident', 'observation'].includes((this.trigger.type || ''))) {
            this.playbooks = this.playbooksAll.filter(pb => {
                return pb.type === this.trigger.type;
            }).map(pb => this.convertPlaybookToSelectItem(pb));
        } else {
            this.playbooks = this.playbooksAll.map(pb => this.convertPlaybookToSelectItem(pb));
        }
    }

    private convertPlaybookToSelectItem(pb: AlResponderPlaybook) {
        return {label: pb.name, value: {playbook_id: pb.id}} as SelectItem;
    }

    private isDateTimeScheduleTrigger(trigger: AlResponderPlaybookTrigger): trigger is AlResponderDateTimeScheduleTrigger {
        return (trigger as AlResponderDateTimeScheduleTrigger).hasOwnProperty('date') &&
            (trigger as AlResponderDateTimeScheduleTrigger).hasOwnProperty('timezone');
    }

}
