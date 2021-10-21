/**
 * Allows the construction of checkbox type elements, supports a variety of checkboxes
 *
 * @author Juan Kremer <jkremer@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */

import { AlFormElementBase, AlDynamicFormControlElementCommon } from './al-form-element-base';
import { FormArray, FormControl } from '@angular/forms';
import { AlDynamicFormControlElementOptions } from '@al/core';

export class AlFormElementCheckboxGroup extends AlFormElementBase<any[]> {
    public controlType = 'checkbox-group';
    public type: string;
    public options: AlDynamicFormControlElementOptions[] = [];

    private formArray: FormArray;

    constructor(properties: AlDynamicFormControlElementCommon) {
        super(properties);
        this.type = properties['type'] || '';
        this.options = properties['options'] || [];
    }

    public getFormControl() {
        this.formArray = new FormArray([]);
        this.options.forEach((v) => {
            if(this.value !== undefined){
                const control = new FormControl((this.value.indexOf(v.value) > -1) ? true : false);
                (this.formArray as FormArray).push(control);
            }
        });

        if(this.disable) {
            this.formArray.disable();
        }

        return this.formArray;
    }

    getAnswer() {
        return this.formArray.getRawValue().map((v, i) => v ? this.options[i].value : null).filter(v => v !== null);
    }
}
