
import { Component, Input} from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
    selector: 'ald-form-group-errors',
    templateUrl: './al-form-group-errors.component.html',
	styleUrls: ['./al-form-group-errors.component.scss']
})
export class AlFormGroupErrorsComponent {

    @Input() control?: AbstractControl;
    @Input() label: string = '';
    @Input() requiredError?: string;
    @Input() validationPattern?: string;
    @Input() patternError?: string;
    @Input() minValue?: number;
    @Input() maxValue?: number;
    @Input() minLength?: number;
    @Input() maxLength?: number;

    constructor() { }

}
