/**
 * al-form-group-errors
 *
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2021
 *
 */
import { Component, Input} from '@angular/core';
import { AbstractControl } from '@angular/forms';


@Component({
    selector: 'al2-form-group-errors',
    templateUrl: './al-form-group-errors.component.html'
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
