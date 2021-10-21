/**
 * It allows the construction of an input type element supporting the input, hidden and password types
 *
 * @author Maryit <msanchez@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */

import { AlFormElementBase, AlDynamicFormControlElementCommon} from './al-form-element-base';
import { FormControl } from '@angular/forms';

export class AlFormElementDropdown extends AlFormElementBase<string> {
    public controlType = 'dropdown';
    public type: string;

    private formControl: FormControl;

    constructor(properties: AlDynamicFormControlElementCommon) {
        super(properties);
        this.type = properties['type'] || '';
        this.options = properties['options'] || [];
        if (!this.required) {
            this.options = [{label:"-- Select --", value: '' }, ...this.options];
        }
    }

    public getFormControl() {
        this.formControl = new FormControl(this.value || '');

        if(this.disable) {
            this.formControl.disable();
        }

        return this.formControl;
    }

    getAnswer(): any {
        return this.formControl.value;
    }

}
