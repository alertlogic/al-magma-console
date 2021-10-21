/**
 * Allows the construction of checkbox type elements, support one checkbox
 *
 * @author Juan Kremer <jkremer@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */

import { AlFormElementBase, AlDynamicFormControlElementCommon } from './al-form-element-base';
import { FormControl } from '@angular/forms';

export class AlFormElementCheckbox extends AlFormElementBase<boolean> {

    public controlType = 'checkbox';
    public type: string;

    private formControl: FormControl;

    constructor(properties: AlDynamicFormControlElementCommon) {
        super(properties);
        this.type = properties['type'] || '';
    }

    public getFormControl() {
        this.formControl = new FormControl(this.value || false);

        if(this.disable) {
            this.formControl.disable();
        }

        return this.formControl;
    }

    getAnswer() {
        return this.formControl.value;
    }
}
