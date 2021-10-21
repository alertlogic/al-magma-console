import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'forms-switch',
    templateUrl: './forms-switch.component.html',
    styleUrls: ['./forms-switch.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class FormsSwitchComponent {

    checked1: boolean = false;

    checked2: boolean = true;

    rangeValues: number[] = [20, 80];
}
