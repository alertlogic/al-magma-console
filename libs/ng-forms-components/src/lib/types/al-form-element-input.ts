/**
 * It allows the construction of an input type element supporting the input, hidden and password types
 *
 * @author Juan Kremer <jkremer@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */

import { AlFormElementBase, AlDynamicFormControlElementCommon} from './al-form-element-base';
import { Validators, FormControl } from '@angular/forms';

export class AlFormElementInput extends AlFormElementBase<string> {
    public controlType = 'inputText';
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

        if(this.disable) {
            this.formControl.disable();
        }

        return this.formControl;
    }

    getAnswer(): any {
        return this.transformStringToDataType(this.formControl.value);
    }
}
