import { Injectable } from '@angular/core';
import {
    AlResponderAction,
    AlResponderPlaybookParameter,
    AlResponderWorkflowActionWhen,
    AlResponderWorkflowTask,
} from '@al/responder';
import { AlDynamicFormControlElement, AlDynamicFormControlInputResponderOptions } from '@al/core';
import { AlSelectItem } from '@al/ng-generic-components';
import { AlDynamicFormUtilityService } from "./al-dynamic-form-utility.service";
import {
    AlFormElementBase,
    AlParameterConfiguration,
    AlPlaybookActionWhenForm,
    AlSuggestionGroupOption
} from '../types';

@Injectable({
    providedIn: 'root'
})
export class AlParametersUtilityService {
    public static QYL_EXP = '<%.*?%>';
    public static JINJA_EXP = '{{.*?}}';
    public static INTEGER_EXP = '^\\d+$';
    public static FLOAT_EXP = '^\\d+\\.?\\d*$';
    public static NUMBER_OR_EXPRESION = `${AlParametersUtilityService.QYL_EXP}|${AlParametersUtilityService.JINJA_EXP}|${AlParametersUtilityService.INTEGER_EXP}`;
    public static FLOAT_OR_EXPRESION = `${AlParametersUtilityService.QYL_EXP}|${AlParametersUtilityService.JINJA_EXP}|${AlParametersUtilityService.FLOAT_EXP}`;

    constructor() {
    }

    createGeneralElements(
        parametersDefinition: { [key: string]: AlResponderPlaybookParameter },
        workflowConfiguration: AlResponderWorkflowTask,
        config: AlParameterConfiguration) {
        // this is for dynamic forms
        const generalElements = [];
        if (parametersDefinition) {
            const parameters = parametersDefinition;
            const parameterKeys = Object.keys(parameters);

            for (const parameterKey of parameterKeys) {
                // if the param is immutable dont show it.
                if (!parameters[parameterKey].hasOwnProperty('immutable') || parameters[parameterKey].immutable === false) {
                    const element = this.transformElementBase(
                        parameterKey,
                        parameters[parameterKey],
                        workflowConfiguration,
                        config);
                    generalElements.push(element);
                }
            }
        }
        return generalElements;
    }

    createReadOnlyElements(
        parametersDefinition: { [key: string]: AlResponderPlaybookParameter },
        workflowConfiguration: AlResponderWorkflowTask,
        parametersConfig: AlParameterConfiguration) {
        // this is for dynamic forms
        const generalElements = [];
        if (parametersDefinition) {
            const parameters = parametersDefinition;
            const parameterKeys = Object.keys(parameters);

            for (const parameterKey of parameterKeys) {
                // if the param is immutable dont show it.
                if (!parameters[parameterKey].hasOwnProperty('immutable') || !parameters[parameterKey].immutable) {
                    const defaultValue = this.calculateDefault(
                        parameterKey,
                        parameters[parameterKey],
                        workflowConfiguration,
                        parametersConfig.alertDefaults);
                    const element = {label: parameterKey, value: defaultValue};
                    generalElements.push(element);
                }
            }
        }
        return generalElements;
    }

    createGeneralElementsInquiry(parametersDefinition: { [key: string]: AlResponderPlaybookParameter }) {
        // this is for dynamic forms
        const generalElements = [];
        if (parametersDefinition) {
            const parameters = parametersDefinition;
            const parameterKeys = Object.keys(parameters);

            for (const parameterKey of parameterKeys) {
                const element = this.transformElementBaseInquiry(
                    parameterKey,
                    parameters[parameterKey]);
                generalElements.push(element);
            }
        }
        return generalElements;
    }

    transformElementBaseInquiry(
        parameterKey: string,
        parameter: AlResponderPlaybookParameter) {

        let elementType = this.getFormElementType(parameter, false);

        const preBase: AlDynamicFormControlElement = {
            type: elementType,
            description: parameter.description,
            property: parameterKey,
            label: parameterKey,
            optional: !parameter.required,
            options: this.getOptions(parameter),
        };

        if (parameter.default) {
            preBase.defaultValue = parameter.default;
        }

        const base = AlDynamicFormUtilityService.generateBaseProperties(preBase);
        base.disable = parameter?.immutable === true;
        const element: unknown = AlDynamicFormUtilityService.generateDynamicElement(base, elementType);
        return element;
    }

    setNumberPatern(base: AlDynamicFormControlElement) {
        base.validationPattern = AlParametersUtilityService.NUMBER_OR_EXPRESION;
        base.patternError = "This input needs to be an integer or an expression.";
    }

    getFormElementType(parameter: AlResponderPlaybookParameter, responderInputs: boolean) {
        const types: { [k: string]: string } = {
            boolean: 'boolean/inputSwitch',
            string: responderInputs ? 'string/inputResponder' : 'string/input',
            number: responderInputs ? 'string/inputResponder' : 'string/input',
            integer: responderInputs ? 'string/inputResponder' : 'string/input',
            enum: responderInputs ? 'dropdown/inputResponder' : 'string/dropdown',
            object: responderInputs ? 'object/inputResponder' : 'object/textarea',
            password: 'string/password',
            array: responderInputs ? 'string/inputResponder' : 'object/textarea',
        };

        if (parameter.secret) {
            return types.password;
        }

        if (parameter.enum) {
            return types.enum;
        }

        if (parameter.type && types.hasOwnProperty(parameter.type)) {
            return types[parameter.type];
        }
        return types.string; // default
    }

    getOptions(parameter: AlResponderPlaybookParameter): AlSuggestionGroupOption[] {
        if (parameter.enum && Array.isArray(parameter.enum)) {
            return parameter.enum.map(item => {
                return {
                    value: item,
                    label: typeof item === "string" ? item.replace(/_/g, " ") : String(item)
                };
            });
        }
        return [];
    }

    getDefaultValueByType(parameter: AlResponderPlaybookParameter): boolean | string | number | string[] | undefined {
        if (parameter == null) {
            return undefined;
        }
        const defaults: { [k: string]: boolean | number | string | Array<any> } = {
            boolean: false,
            string: '',
            number: 0, // TODO nncc forms need to super this
            integer: 0, // TODO nncc forms need to super this
            enum: '',
            object: "{}",
            password: '',
            array: []
        };

        if (parameter?.enum && parameter?.enum.length > 0 && parameter?.required) {
            return parameter.enum[0];
        }

        // set default value
        if (parameter.type && defaults.hasOwnProperty(parameter.type)) {
            return defaults[parameter.type];
        }

        return undefined;
    }

    /**
     * Get default values for thing that looks like alert logic inputs
     */
    getDefaultValuesLogic(parameterKey: string) {
        if (parameterKey === "account_id") {
            return '<% ctx().account_id %>';
        }

        if (parameterKey === "payload") {
            return '<% ctx().payload %>';
        }

        if (parameterKey === "incident_id") {
            return '<% ctx().payload.incidentId %>';
        }
        return undefined;
    }

    setMultiSelectDefault(allowValues: AlSuggestionGroupOption[], workflowConfiguration: AlResponderWorkflowTask, parameterKey: string): AlSelectItem[] {
        let values: AlSelectItem[] = [];
        if (workflowConfiguration.input && workflowConfiguration.input.hasOwnProperty(parameterKey)) {
            let selectedItems: string[] = workflowConfiguration.input[parameterKey] as string[];

            let foundValues: { value: string; label: string }[] = [];
            selectedItems.forEach(itemKey => {

                let itemFound = allowValues.find(listItem => listItem.value === itemKey);

                if (itemFound) {
                    foundValues.push(itemFound);
                }
            });

            values = this.getMultiSelectOptions(foundValues);

        }
        return values.map(item => {
            return item.value;
        });

    }

    calculateDefault(
        parameterKey: string,
        parameter: AlResponderPlaybookParameter,
        workflowConfiguration: AlResponderWorkflowTask,
        alertDefaults: boolean
    ): string[] | string | boolean | number | undefined {

        if (workflowConfiguration.input && workflowConfiguration.input.hasOwnProperty(parameterKey)) {
            return workflowConfiguration.input[parameterKey] as string[];
        }

        if (parameter.hasOwnProperty('default')) {
            return parameter.default as string;
        }

        if (alertDefaults) {
            const alertDefault = this.getDefaultValuesLogic(parameterKey);
            if (alertDefault) {
                return alertDefault;
            }
        }

        return this.getDefaultValueByType(parameter);
    }

    complementArrayFields(base: AlDynamicFormControlElement) {
        if (["string[]/textarea", "string[]/inputResponder"].includes(base.type)) {
            // lets assume all arrays are array of strings
            base.splitExpresion = ",";
            base.joinExpresion = ",";
        }
    }

    getResponderOptions(parameter: AlResponderPlaybookParameter, parametersConfig: AlParameterConfiguration, allowedValues: AlSuggestionGroupOption[] | undefined) {
        let responderType = 'textarea';

        if (allowedValues || parameter.enum) {
            responderType = 'dropdown';
        } else if(['string', 'integer', 'number'].includes((parameter.type || ''))){
            responderType = 'input';
        }

        return {
            type: responderType,
            buttonLabel: "Select Variable",
            options: parametersConfig.suggestions
        } as AlDynamicFormControlInputResponderOptions;
    }

    getDefaultFromAllowValues(allowedValues: AlSuggestionGroupOption[], parameterKey: string, workflowConfiguration?: AlResponderWorkflowTask): string {
        let defaultValue: string = "";
        if (allowedValues.length > 0) {
            defaultValue = allowedValues[0].value;

            if (workflowConfiguration && workflowConfiguration?.input?.hasOwnProperty(parameterKey)) {
                return workflowConfiguration.input[parameterKey] as string;
            }

        } else {
            console.warn("No items configured " + parameterKey);
        }

        return defaultValue;
    }

    getMultiSelectOptions(allowedValues: AlSuggestionGroupOption[]): AlSelectItem[] {
        return (allowedValues).map(record => {
            return {
                title: record.label,
                subtitle: "",
                value: {
                    title: record.label,
                    subtitle: "",
                    id: record.value,
                    checked: false
                }
            };
        });
    }

    transformElementBase(
        parameterKey: string,
        parameter: AlResponderPlaybookParameter,
        workflowConfiguration: AlResponderWorkflowTask,
        parametersConfig: AlParameterConfiguration) {

        const allowedValues = parametersConfig.allowedValues?.[parameterKey];
        let elementType;
        let defaultValue: string | AlSelectItem[] | boolean | string[] | number | undefined;
        if (allowedValues) {

            if (parameter.type === "string") {
                elementType = parametersConfig.responderInputs ? 'string/inputResponder' : 'string/dropdown';
                defaultValue = this.getDefaultFromAllowValues(allowedValues, parameterKey, workflowConfiguration);
            } else {// array
                elementType = "string[]/multiSelectList";
                defaultValue = this.setMultiSelectDefault(allowedValues, workflowConfiguration, parameterKey);
            }
        } else {
            elementType = this.getFormElementType(parameter, parametersConfig.responderInputs);
            defaultValue = this.calculateDefault(parameterKey, parameter, workflowConfiguration, parametersConfig.alertDefaults);
        }

        const preBase: AlDynamicFormControlElement = {
            defaultValue, // this default can exist in inputs
            type: elementType,
            description: parameter.description,
            // aboveDescription: parameter.description,
            property: parameterKey,
            label: parameterKey,
            optional: !parameter.required,
            options: allowedValues ? allowedValues : this.getOptions(parameter),
            responderOptions: this.getResponderOptions(parameter, parametersConfig, allowedValues)
        };

        if (parameter.type === 'integer') {
            this.setNumberPatern(preBase);
        }
        if (elementType === "string[]/multiSelectList") {
            preBase.placeholder = "Select";
            preBase.multiSelectOptions = this.getMultiSelectOptions(allowedValues ?? []);
        }
        this.complementArrayFields(preBase);

        const base = AlDynamicFormUtilityService.generateBaseProperties(preBase);
        const element: any = AlDynamicFormUtilityService.generateDynamicElement(base, elementType);
        return element;
    }

    fromArrayToObject(varsArray: { key: string, value: unknown }[]): { [key: string]: string } [] {
        const out: { [key: string]: string } [] = [];

        varsArray.forEach(item => {
            out.push({[item.key]: item.value as string});
        });

        return out;
    }

    createArrayFromKeyValueObject(obj: { [key: string]: string }) {
        const key = Object.keys(obj)[0];
        return {
            key,
            value: obj[key]
        };
    }

    createArrayFromDictionary(dictionary: ({ [key: string]: string } | string) []): { key: string; value: string; }[] {
        const items = [];

        for (const value of dictionary) {
            let dictionaryItem: any;

            if (value instanceof Object) {
                dictionaryItem = this.createArrayFromKeyValueObject(value);
            } else {
                dictionaryItem = {
                    key: value,
                    value: ''
                };
            }
            items.push(dictionaryItem);
        }
        return items;
    }

    processNextItem(next: AlPlaybookActionWhenForm): AlResponderWorkflowActionWhen {
        if (next == null) {
            return {} as AlResponderWorkflowActionWhen;
        }
        const nextOut: AlResponderWorkflowActionWhen = {};
        if (next.x_alertlogic_condition_name) {
            nextOut.x_alertlogic_condition_name = next.x_alertlogic_condition_name;
        }
        if (next.whenId) {
            nextOut.whenId = next.whenId;
        }
        if (next.do!.length > 0) {
            nextOut.do = next.do;
        }
        if (next.when) {
            nextOut.when = next.when;
        }
        if (next.publish && next.publish.length > 0) {
            nextOut.publish = this.fromArrayToObject(next.publish) as { [key: string]: string; }[];
        }
        return nextOut;
    }

    processNextValues(nextArray: AlPlaybookActionWhenForm []): AlResponderWorkflowActionWhen[] {
        return nextArray.map(next =>
            this.processNextItem(next));
    }

    inputFromObjectToArray(
        dictionary: { [key: string]: unknown; },
        parameters: { [key: string]: AlResponderPlaybookParameter }
    ) {
        const objectToArray: ({ [key: string]: unknown } | string) [] = [];

        if (parameters) {
            for (const parameterKey of Object.keys(parameters)) {

                if (dictionary.hasOwnProperty(parameterKey)) {
                    objectToArray.push({[parameterKey]: dictionary[parameterKey]});
                } else {
                    objectToArray.push(parameterKey);
                }
            }
        }
        return objectToArray;
    }

    createArrayParametersFromObject(
        parametersDictionary: { [key: string]: AlResponderPlaybookParameter }
    ): { key: string, value: AlResponderPlaybookParameter }[] {
        // this is for dynamic forms
        const parameters: { key: string, value: AlResponderPlaybookParameter }[] = [];
        if (parametersDictionary) {
            const parameterKeys = Object.keys(parametersDictionary);

            for (const parameterKey of parameterKeys) {
                // if the param is immutable dont show it.
                if (!parametersDictionary[parameterKey].hasOwnProperty('immutable')
                    || !parametersDictionary[parameterKey].immutable) {
                    parameters.push({key: parameterKey, value: parametersDictionary[parameterKey]});
                }
            }
        }
        return parameters;
    }

    getParametersTypeArray(actionData: AlResponderAction): string[] {
        const parameters: { [key: string]: AlResponderPlaybookParameter } | undefined = actionData.action?.parameters;
        const allowedValues = actionData.allowed_values ?? null;
        if (parameters == null || allowedValues == null) {
            return [];
        }

        return Object.entries(parameters).filter(
            ([key, value]) => value.type === "array" && !allowedValues[key]
        ).map(obj => obj[0]);
    }


    convertFromStringToArray(input: { [key: string]: string; }, parameters: string[]): void {
        parameters?.forEach(key => {
            if (input?.hasOwnProperty(key)) {
                input[key] = this.convertValueFromStringToArray(input[key]);
            }
        });
    }

    convertValueFromStringToArray(input: string) {
        let value = (input as string).trim();
        if (value.startsWith("[") && value.endsWith("]")) {
            try {
                return JSON.parse(value);
            } catch (error) {
                console.error('we could not convert this as an array');
            }
        }
        return value;
    }

    convertFromArrayToString(input: { [key: string]: unknown; }, parameters: string[]): void {
        parameters?.forEach(key => {
            if (input?.hasOwnProperty(key)) {
                let value = input[key];
                input[key] = this.convertValueFromArrayToString(value);
            }
        });
    }

    convertValueFromArrayToString(value: any): string {
        if (Array.isArray(value)) {
            return JSON.stringify(value);
        }
        return value;
    }


    // if the param is a muti list then the get values should be taking just the value.details
    extractMultiSelectValues(input: { [key: string]: unknown; }, generalElements: AlFormElementBase<any>[]) {
        const multiSelectParameterKeys = generalElements.filter(element => element.type === "multiSelectList");
        multiSelectParameterKeys.forEach(element => {
            if (input.hasOwnProperty(element.key)) {

                let values = input[element.key] as AlSelectItem<unknown>[] | undefined;
                input[element.key] = values?.map(item => item.id);
            }
        });
    }
}
