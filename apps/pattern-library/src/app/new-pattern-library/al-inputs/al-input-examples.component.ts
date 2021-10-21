import { AlOptionItem } from '@al/ng-generic-components';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    templateUrl: './al-input-examples.component.html'
})
export class AlInputExamplesComponent implements OnInit {

    monsterName: string = '';
    monsterAge: number = 1;
    monsterDesc: string = '';

    radioOption = 'one';
    isFriendly = true;

    radioOptions: AlOptionItem[] = [
        { label: 'Option One', value: 'one' },
        { label: 'Option Two', value: 'two' },
        { label: 'Option Three', value: 'three' },
        { label: 'Option Four is disabled', value: 'four', disabled: true },
        { label: 'Option Five', value: 'five' }
    ];

    checkboxGroup: AlOptionItem[] = [
        { label: 'Option One', value: 'one' },
        { label: 'Option Two', value: 'two', selected: true },
        { label: 'Option Three', value: 'three' },
        { label: 'Option Four', value: 'four' },
        { label: 'Option Five', value: 'five' }
    ];

    multiselectOptions: AlOptionItem[] = [
        { label: 'Multiselect One', value: 'one' },
        { label: 'Multiselect Two', value: 'two', selected: true },
        { label: 'Multiselect Three', value: 'three' },
        { label: 'Multiselect Four', value: 'four' },
        { label: 'Multiselect Five', value: 'five' }
    ];

    form: FormGroup;

    ngOnInit() {
        this.form = new FormGroup({
            monster: new FormControl(this.monsterName, [Validators.required, Validators.minLength(3), Validators.maxLength(50)])
          });
    }

    onRadioChange(event: Event): void {
        console.log('radio option selected:', event);
    }

    onCheckBoxChange(event: Event): void {
        console.log('checkbox change', event);
    }

    checkboxGroupChange(event: Event): void {
        console.log('checkbox group change', event);
    }
}
