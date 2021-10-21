/**
 * Allows the construction of textarea type element.
 *
 * @author Juan Kremer <jkremer@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */

import { AlFormElementBase, AlDynamicFormControlElementCommon } from './al-form-element-base';
import { Validators, FormControl } from '@angular/forms';

export class AlFormElementTextarea extends AlFormElementBase<object> {
    public controlType = 'textarea';
    public type: string;

    private formControl: FormControl;

    constructor(properties: AlDynamicFormControlElementCommon) {
        super(properties);
        this.type = properties['type'] || '';
    }

    public getFormControl() {
        const validators = this.buildValidators();
        const value = this.transformValueToString(this.value);

        this.formControl = validators.length > 0 ? new FormControl(value || '', Validators.compose(validators))
        : new FormControl(value || '');

        return this.formControl;
    }

    getAnswer() {
        return this.transformStringToDataType(this.formControl.value);
    }
}
