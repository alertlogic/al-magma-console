import {
    AlResponderAction,
    AlResponderExecutionsHistory,
    AlResponderInquiry,
    AlResponderPlaybookParameter,
    AlResponderWorkflowActionWhen,
    AlResponderWorkflowTask
} from '@al/responder';
import { formatDate } from '@angular/common';

export interface AlPlaybookCardIcon {
    name?: string;   // use this if you want materialIcon
    cssClasses?: string;  // use this if you want non-material icons
    color?: string;
}

export interface AlPlaybookCard {
    name?: string;
    label?: string;
    icon?: AlPlaybookCardIcon;
    taskJoin?: boolean;
    taskWith?: boolean;
    taskRetry?: boolean;
    taskDelay?: boolean;
}

export interface AlTaskPaletteItem extends AlPlaybookCard {
    value?: string | AlResponderAction;
}

export interface AlParameterConfiguration {
    alertDefaults: boolean;
    responderInputs: boolean;
    suggestions: AlSuggestionGroup[];
    allowedValues?: {
        [key: string]: AlSuggestionGroupOption[];
    };
}

export interface AlSuggestionGroupOption {
    label: string;
    value: string;
    description?: string;
}

export interface AlSuggestionGroup {
    group: string;
    description?: string;
    options: AlSuggestionGroupOption[];
}

export interface AlPlaybookActionModel {
    definition?: AlResponderAction; // action definition
    config: AlResponderWorkflowTask;
}

export interface AlPlaybookTaskConditionConfig {
    when: string;
    whenId: string;
}

export interface AlPlaybookActionTreeNode {
    id: string;
    model: AlPlaybookActionModel;
    card?: AlPlaybookCard;

    // only use in load wf //
    predecessor?: string[]; // used in load wf
    successors?: string[]; // used in load wf

    parallels?: string[];
    parallelsOut?: string[];
    conditions?: AlResponderWorkflowActionWhen[];
    joins?: string[];// this is a container for some joins
    joinInto?: string[];

    joinOptions?: AlTaskPaletteItem[];
}

// this is to manipulate the when in the al-playbook-action-next
export interface AlPlaybookActionWhenForm {
    x_alertlogic_condition_name?: string;
    whenId?: string;
    when?: string;
    do?: string[];
    publish?: {
        key: string,
        value: string;
    }[];
}

export interface TableColumnsSchema {
    field: string;
    header: string;
    subfield?: string;
    date?: boolean;
}

export type order = "asc" | "desc";


export class AlPlaybookExecutionDefinition {
    id: string;
    startTimestamp ?: number | string;
    endTimestamp ?: number | string;
    humanReadableStartTimestamp ?: string;
    humanReadableEndTimestamp ?: string;
    type ?: string;
    playbookType ?: string;
    playbookId ?: string;
    status ?: string;
    name ?: string;
    actionName ?: string;
    taskName ?: string;
    playbookName ?: string;
    playbookDescription ?: string;
    elapsedSeconds ?: string;
    created ?: {
        at: number;
        by: string;
    };
    modified ?: {
        at: number;
        by: string;
    };
    detailURL ?: string;
    action ?: AlResponderExecutionsHistory['action'];
    // {
    //     category?: string;
    //     display_name?: string;
    //     id?: string;
    //     name?: string;
    //     pack?: string;
    //     ref?: string;
    //     vendor?: string;
    // };
    taskId ?: string;

    constructor(data: AlResponderInquiry | AlResponderExecutionsHistory) {
        const format = 'MMM dd yyyy HH:mm:ss z';
        this.id = data.id;
        this.name = 'name' in data ? data.name : '';
        this.endTimestamp = data.end_timestamp;
        this.startTimestamp = data.start_timestamp;
        this.status = data.status;
        this.type = data.type;
        this.playbookId = data.playbook_id;
        this.taskName = data.task_name;
        this.created = data?.created;
        this.modified = data?.modified;
        // this.actionName = data['action']?.name || ''; // Update type in @al/responder
        this.elapsedSeconds = 'elapsed_seconds' in data ? (data.elapsed_seconds || '') as string : '';
        this.humanReadableStartTimestamp =
            data.start_timestamp &&
            formatDate(parseInt(data.start_timestamp + "", 10) * 1000, format, "en-US") || '';
        this.humanReadableEndTimestamp =
            data.end_timestamp &&
            formatDate(parseInt(data.end_timestamp + "", 10) * 1000, format, "en-US") || '';
        this.action = 'action' in data ? data.action : undefined;
        this.taskId = 'task_id' in data ? data.task_id : undefined;
    }
}

export interface AlPlaybookWorkflowHeaderButtonActions {
    iconClass?: string;
    label?: string;
    icon?: string;
    separator?: boolean;
    disabled?: boolean;
    visible?: boolean;
    buttonClass?: string;
}

export interface AlPlaybookCustomParameterContext extends AlResponderPlaybookParameter {
    property: string;
    allowEdit: boolean;
    allowDelete: boolean;
}

export interface AlPlaybookVariable {
    key?: string;
    value?: string;
}
