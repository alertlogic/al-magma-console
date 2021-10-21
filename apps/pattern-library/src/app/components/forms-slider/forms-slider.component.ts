import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'forms-slider',
    templateUrl: './forms-slider.component.html',
    styleUrls: ['./forms-slider.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class FormsSliderComponent {

    val1: number;

    val1a: number;

    val2: number = 50;

    val3: number;

    val4: number;

    val5: number;

    rangeValues: number[] = [20,80];
}
