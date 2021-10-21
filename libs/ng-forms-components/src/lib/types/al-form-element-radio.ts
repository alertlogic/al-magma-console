/**
 * It allows the construction a radio button element
 *
 * @author Juan Kremer <jkremer@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */

import { AlFormElementBase, AlDynamicFormControlElementCommon } from './al-form-element-base';
import { FormControl } from '@angular/forms';
import { AlDynamicFormControlElementOptions } from '@al/core';

export class AlFormElementRadio extends AlFormElementBase<string> {
    public controlType = 'radio';
    public type: string;
    public options: AlDynamicFormControlElementOptions[] = [];

    private formControl: FormControl;

    constructor(properties: AlDynamicFormControlElementCommon) {
        super(properties);
        this.type = properties['type'] || '';
        this.options = properties['options'] || [];
    }

    public getFormControl() {
        let value = this.value;

        if(!value && this.options && this.options.length > 0) {
            value = this.options[0].value;
        }

        this.formControl = new FormControl(value);

        if(this.disable) {
            this.formControl.disable();
        }

        return this.formControl;
    }

    getAnswer() {
        return this.formControl.value;
    }
}
