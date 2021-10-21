
import { AlFormElementBase, AlDynamicFormControlElementCommon} from './al-form-element-base';
import { FormControl } from '@angular/forms';

export class AlFormElementInputSwitch extends AlFormElementBase<string> {
    public controlType = 'inputSwitch';
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

    getAnswer(): any {
        return this.formControl.value;
    }
}
