import { Injectable } from '@angular/core';
import { AlDynamicFormControlElement } from  '@al/core';
import { AlChipItem, AlSelectItem } from '@al/ng-generic-components';
import {
    AlFormElementInput,
    AlFormElementCheckbox,
    AlFormElementRadio,
    AlFormElementTextarea,
    AlFormElementCheckboxGroup,
    AlDynamicFormControlElementCommon,
    AlFormElementDropdown,
    AlFormElementMonacoEditor,
    AlFormElementInputSwitch,
    AlFormElementInputResponder,
    AlFormElementMultiSelectList,
    AlFormElementDownloadButton,
    AlFormElementTitle
} from '../types';

/**
 *  base taken from application registry
 */

@Injectable()
export class AlDynamicFormUtilityService {

    public static getRequiredValue(element: AlDynamicFormControlElement): boolean {
        let isRequired = true;

        if (element['optional']) {
            isRequired = false;
        }

        return isRequired;
    }

    public static generateBaseProperties(element: AlDynamicFormControlElement): AlDynamicFormControlElementCommon {
        const [dataType, elementType] = element['type'].split('/');

        let properties: AlDynamicFormControlElementCommon = {
            title: element['title'],
            cssClass:element['cssClass'],
            type: elementType,
            label: element['label'] ? element['label'] : '',
            key: element['property'],
            description: element['description'] ? element['description'] : '',
            options: [],
            placeholder: '',
            belowDescription: '',
            requiredError: element['requiredError'] ? element['requiredError'] : '',
            patternError: element['patternError'] ? element['patternError'] : '',
            minLengthError: element['minLengthError'] ? element['minLengthError'] : '',
            maxLengthError: element['maxLengthError'] ? element['maxLengthError'] : '',
            dataType: dataType,
            aboveDescription: element['aboveDescription'] ? element['aboveDescription'] : ''
        };

        // set validation pattern and required
        if (['input','password','hidden','textarea','inputResponder'].includes(elementType)) {
            properties['validationPattern'] = element['validationPattern'] ? element['validationPattern'] : '';
            properties['required'] = this.getRequiredValue(element);
            properties['minLength'] = element['minLength'];
            properties['maxLength'] = element['maxLength'];
            properties['minValue'] = element['minValue'];
            properties['maxValue'] = element['maxValue'];
        }
        if (element.placeholder){
            properties.placeholder = element.placeholder;
        }

        if (elementType === 'dropdown') {
            properties['required'] = this.getRequiredValue(element);
        }

        if ((['any[]','string[]'].includes(dataType)) && ['textarea','inputResponder'].includes(elementType)) {
            // this defaults are specific for application registry
            properties.joinExpresion = element.joinExpresion ? element.joinExpresion : '\n';
            properties.splitExpresion = element.splitExpresion ? element.splitExpresion : new RegExp(/[\r\n]/);
        }

        // set default value
        if (element.hasOwnProperty('defaultValue')) {
            properties['value'] = element['defaultValue'];
        } else {
            if (dataType === 'boolean') {
                properties['value'] = false;
            }
            if (dataType === 'string') {
                properties['value'] = '';
            }
            if (dataType === 'any[]' || dataType === 'string[]') {
                properties['value'] = [];
            }
            if (dataType === 'object') {
                properties['value'] = {};
            }
            if (['integer','number'].includes(dataType)) {
                properties['value'] = 0;
            }
        }

        // set options
        if (elementType === 'radio'
            || (elementType === 'checkbox' && dataType === 'any[]')
            || elementType === 'dropdown') {
            properties['options'] = element['options'];
        }

        if (elementType === 'inputResponder') {
            properties['responderOptions'] = element['responderOptions'];
            properties['options'] = element['options'];
        }

        if (elementType === 'multiSelectList') {
            properties['multiSelectOptions'] = element['multiSelectOptions'] as AlSelectItem<unknown>[] | AlChipItem<unknown>[] | undefined;
        }

        if (elementType === 'monaco-editor') {
            properties['editorOptions'] = element['editorOptions'];
        }

        if (element.hasOwnProperty('belowDescription')) {
            properties['belowDescription'] = element['belowDescription'];
        }
        if (element.hasOwnProperty('aboveDescription')) {
            properties['aboveDescription'] = element['aboveDescription'];
        }
        return properties;
    }

    public static generateDynamicElement(
        properties: AlDynamicFormControlElementCommon,
        baseElementType: string):
        AlFormElementInput | AlFormElementCheckboxGroup | AlFormElementCheckbox | AlFormElementTextarea | AlFormElementRadio
        | AlFormElementDropdown | AlFormElementMonacoEditor | AlFormElementInputSwitch | AlFormElementInputResponder | AlFormElementMultiSelectList
        | AlFormElementDownloadButton | AlFormElementTitle | undefined {
        const [dataType, elementType] = baseElementType.split('/');

        if (elementType) {
            if (['input','password','hidden'].includes(elementType)) {
                return new AlFormElementInput(properties);
            } else if (elementType === 'checkbox' && dataType === 'any[]') {
                return new AlFormElementCheckboxGroup(properties);
            } else if (elementType === 'checkbox' && dataType === 'boolean') {
                return new AlFormElementCheckbox(properties);
            } else if (elementType === 'textarea') {
                return new AlFormElementTextarea(properties);
            } else if (elementType === 'radio') {
                return new AlFormElementRadio(properties);
            } else if (elementType === 'dropdown') {
                return new AlFormElementDropdown(properties);
            } else if (elementType === 'monaco-editor') {
                return new AlFormElementMonacoEditor(properties);
            } else if (elementType === 'inputSwitch') {
                return new AlFormElementInputSwitch(properties);
            } else if (elementType === 'inputResponder') {
                return new AlFormElementInputResponder(properties);
            } else if (elementType === 'multiSelectList') {
                return new AlFormElementMultiSelectList(properties);
            } else if (elementType === 'link') {
                return new AlFormElementDownloadButton(properties);
            } else if (elementType === 'title') {
                return new AlFormElementTitle(properties);
            }
        }
        console.warn("Element type not supported in al dynamic form utility ", elementType);
        return undefined;
    }
}

