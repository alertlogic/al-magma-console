/**
 * It allows the construction of an input type element supporting the input, hidden and password types
 *
 * @author <msanchez@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */

import { AlFormElementBase, AlDynamicFormControlElementCommon} from './al-form-element-base';
import { FormControl } from '@angular/forms';

export class AlFormElementMonacoEditor extends AlFormElementBase<string> {
    public controlType = 'monacoEditor';
    public type: string;

    private formControl: FormControl;

    constructor(properties: AlDynamicFormControlElementCommon) {
        super(properties);
        this.type = properties['type'] || '';
        this.editorOptions = properties['editorOptions'] || {};
    }

    public getFormControl() {
        this.formControl = new FormControl(this.value);
        return this.formControl;
    }

    getAnswer(): any {
        return this.formControl.value;
    }
}
