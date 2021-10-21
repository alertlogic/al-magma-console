/**
 * Allows the construction of textarea type element.
 *
 * @author Andres Echeverri <andres.echeverri@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */

import { AbstractControl, FormControl } from '@angular/forms';
import { AlDynamicFormControlElementCommon, AlFormElementBase } from './al-form-element-base';

export class AlFormElementDownloadButton extends AlFormElementBase<object> {
    public controlType = 'downloadButton';
    public type: string;

    private formControl: FormControl;

    constructor(public properties: AlDynamicFormControlElementCommon) {
        super(properties);
        this.type = properties['type'] || '';
    }

    getFormControl(): AbstractControl {
        this.formControl = new FormControl(this.value || '');
        return this.formControl;
    }

    getAnswer() {
        return this.properties.value;
    }
}
