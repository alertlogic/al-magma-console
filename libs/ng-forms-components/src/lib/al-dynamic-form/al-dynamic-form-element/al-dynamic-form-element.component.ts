/**
 * Know the elements to build (input, hidden, password and textarea)
 *
 * @author Juan Kremer <jkremer@alertlogic.com>
 * @author Maryit
 *
 * @copyright Alert Logic, Inc 2020
 */

import { Component, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { AlFormElementBase } from '../../types';

@Component({
    selector: 'al-dynamic-form-element',
    templateUrl: './al-dynamic-form-element.component.html',
    styleUrls: ['./al-dynamic-form-element.component.scss']
})
export class AlDynamicFormElementComponent {
    @Input() element: AlFormElementBase<string>;
    @Input() form: FormGroup;

    get isValid() {
        return this.form.controls[this.element.key].valid;
    }

    showMinLengthError(){
        return this.element.minLength
        && this.form.controls[this.element.key].hasError('minlength')
        && (this.form.controls[this.element.key].dirty
            || this.form.controls[this.element.key].touched);
    }

    showMaxLengthError(){
        return this.element.maxLength
        && this.form.controls[this.element.key].hasError('maxlength')
        && (this.form.controls[this.element.key].dirty
            || this.form.controls[this.element.key].touched);
    }

    showIsRequireError(){
        return this.element.required
        && this.form.controls[this.element.key].hasError('required')
        && (this.form.controls[this.element.key].dirty
            || this.form.controls[this.element.key].touched);
    }

    showPatternError(){
        return this.element.validationPattern
        && this.form.controls[this.element.key].hasError('pattern')
        && (this.form.controls[this.element.key].dirty
             || this.form.controls[this.element.key].touched);
    }

    /**
     * This is to handle special case with checkbox
     * https://www.primefaces.org/primeng/showcase/#/checkbox
     */
    getControls() {
        return (this.form.get(this.element.key) as FormArray).controls as FormControl[];
    }

    getControl() {
        return this.form.get(this.element.key) as FormControl;
    }

}
