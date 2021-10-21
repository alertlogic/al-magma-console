import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'forms-radio-buttons',
    templateUrl: './forms-radio-buttons.component.html',
    styleUrls: ['./forms-radio-buttons.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class FormsRadioButtonsComponent {

    val1: string;

    val2: string = 'Option 2';
}
