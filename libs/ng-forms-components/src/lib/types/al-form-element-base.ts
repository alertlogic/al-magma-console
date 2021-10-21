import { AbstractControl, Validators } from "@angular/forms";
import { AlDynamicFormControlElementOptions, AlDynamicFormControlInputResponderOptions } from '@al/core';
import { AlChipItem, AlSelectItem } from "@al/ng-generic-components";
/**
 * @author Juan Kremer <jkremer@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */

export interface AlDynamicFormControlElementCommon {
    title?: string;
    cssClass?: string;
    value?: any;
    key: string;
    label?: string;
    required?: boolean;
    controlType?: string;
    type?: string;
    disable?: boolean;
    options?: AlDynamicFormControlElementOptions[];
    validationPattern?: string;
    description?: string;
    editorOptions?: any; // monaco editor
    responderOptions?: AlDynamicFormControlInputResponderOptions; // responder options
    placeholder?: string;
    belowDescription?: string;
    aboveDescription?: string;
    patternError?: string;
    requiredError?: string;
    minLengthError?: string;
    maxLengthError?: string;
    dataType?: string;
    joinExpresion?: string;
    splitExpresion?: RegExp | string;
    multiSelectOptions?: AlSelectItem<unknown>[] | AlChipItem<unknown>[];
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
}

export abstract class AlFormElementBase<T> implements AlDynamicFormControlElementCommon {
    title?: string;
    cssClass?: string;
    value?: T;
    key: string;
    label?: string;
    required?: boolean;
    controlType: string;
    type: string;
    disable?: boolean;
    options?: AlDynamicFormControlElementOptions[];
    validationPattern?: string;
    description?: string;
    editorOptions?: any;
    responderOptions?: AlDynamicFormControlInputResponderOptions;
    placeholder?: string;
    belowDescription?: string;
    aboveDescription?: string;
    patternError?: string;
    requiredError?: string;
    minLengthError?: string;
    maxLengthError?: string;
    dataType?: string;
    joinExpresion?: string;
    splitExpresion?: RegExp | string;
    multiSelectOptions?: AlSelectItem<T>[] | AlChipItem<T>[];
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;

    constructor(options: {
        title?: string,
        cssClass?: string,
        value?: T,
        key?: string,
        label?: string,
        required?: boolean,
        controlType?: string,
        type?: string,
        disable?: boolean,
        validationPattern?: string,
        description?: string,
        options?: AlDynamicFormControlElementOptions[],
        responderOptions?: AlDynamicFormControlInputResponderOptions,
        placeholder?: string,
        belowDescription?: string;
        aboveDescription?: string;
        patternError?: string;
        requiredError?: string;
        minLengthError?: string;
        maxLengthError?: string;
        dataType?: string;
        joinExpresion?: string;
        splitExpresion ?: RegExp | string;
        minLength?: number;
        maxLength?: number;
        minValue?: number;
        maxValue?: number;
    } = {}) {
        this.title = options.title || '';
        this.cssClass = options.cssClass || '';
        this.value = options.value!;
        this.key = options.key || '';
        this.label = options.label || '';
        this.required = !!options.required;
        this.controlType = options.controlType || '';
        this.type = options.type || '';
        this.disable = !!options.disable;
        this.validationPattern = options.validationPattern ? options.validationPattern : '';
        this.belowDescription = options.belowDescription ? options.belowDescription : '';
        this.aboveDescription = options.aboveDescription ? options.aboveDescription : '';
        this.description = options.description ? options.description : '';
        this.options = options.options ? options.options : [];
        this.placeholder = options.placeholder ? options.placeholder : '';
        this.belowDescription = options.belowDescription ? options.belowDescription : '';
        this.aboveDescription = options.aboveDescription ? options.aboveDescription : '';
        this.patternError = options.patternError ? options.patternError : '';
        this.requiredError = options.requiredError ? options.requiredError : '';
        this.minLengthError = options.minLengthError ? options.minLengthError : '';
        this.maxLengthError = options.maxLengthError ? options.maxLengthError : '';
        this.dataType = options.dataType;
        this.joinExpresion = options.joinExpresion || "";
        this.splitExpresion = options.splitExpresion || "";
        this.responderOptions = options.responderOptions || {};
        this.minLength = options.minLength;
        this.maxLength = options.maxLength;
        this.minValue = options.minValue ? +options.minValue : undefined;
        this.maxValue = options.maxValue ? +options.maxValue : undefined;
    }

    /**
     * Delivers the definition of FromControl for the element to be represented
     * @returns AbstractControl: Definition of FormControl/FormArray with its validations.
     */
    abstract getFormControl(): AbstractControl;

    /**
     * Deliver the values assigned by the user in the form
     * @returns Object: The values assigned in the element returned by formcontol defined
     */
    abstract getAnswer(): T;

    /**
     * Return an array with all the validators the configuration has
     */
    buildValidators(){
        const validators = [];
        if (this.required) {
            validators.push(Validators.required);
        }
        if (this.validationPattern) {
            validators.push(Validators.pattern(this.validationPattern));
        }

        if (this.minLength) {
            validators.push(Validators.minLength(this.minLength));
        }

        if (this.maxLength) {
            validators.push(Validators.maxLength(this.maxLength));
        }

        if(!Number.isNaN(this.minValue!)) {
            validators.push(Validators.min(this.minValue!));
        }

        if (!Number.isNaN(this.maxValue!)) {
            validators.push(Validators.max(this.maxValue!));
        }

        return validators;
    }


    /**
     * Return a string
     */
    public transformValueToString(value ?: T){
        if (value !== undefined) {
            if( this.dataType === 'object') {
                return JSON.stringify(value, null, 2);
            }

            if( value instanceof Array &&
                (this.dataType === "string[]"
                ||  this.dataType === "any[]")
                ) {
                return value.join(this.joinExpresion);
            }

            if (this.dataType === "string" && typeof value === "string") {
                return value.toString();
            }

            if (this.dataType && ["integer","number"].includes(this.dataType) && typeof value === "number") {
                return value.toString();
            }
        }

        return  value;
    }

    /**
     * Convert an string to an array or to an object
     */
    public transformStringToDataType( value:string ){
        if (this.dataType === 'object') {
            try{
                return JSON.parse(value);
            } catch(error) {
                console.warn("We are trying to parse as an object the following string", value, error);
            }
        }
        if ((this.dataType === "string[]"
            ||  this.dataType === "any[]")
            && this.splitExpresion) {
            return value.split(this.splitExpresion);
        }

        if (this.dataType === "integer" && !isNaN(Number(value))) {
            return parseInt(value, 10);
        }

        if (this.dataType === "number" && !isNaN(Number(value)) ) {
            return Number(value);
        }
        return value;
    }
}
