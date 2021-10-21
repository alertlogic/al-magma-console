/**
 * It allows the construction of an multi select list
 *
 * @author Maryit <msanchez@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2021
 */

import { AlFormElementBase, AlDynamicFormControlElementCommon} from './al-form-element-base';
import { FormControl } from '@angular/forms';

export class AlFormElementMultiSelectList extends AlFormElementBase<string> {
    public controlType = 'multiSelectList';
    public type: string;

    private formControl: FormControl;

    constructor(properties: AlDynamicFormControlElementCommon) {
        super(properties);
        this.type = properties['type'] || '';
        this.multiSelectOptions = properties['multiSelectOptions'] || [];
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
