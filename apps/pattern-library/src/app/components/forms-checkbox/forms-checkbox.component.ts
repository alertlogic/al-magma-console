import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'forms-checkbox',
    templateUrl: './forms-checkbox.component.html',
    styleUrls: ['./forms-checkbox.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class FormsCheckboxComponent {

    selectedCities: string[] = [];

    selectedCategories: string[] = ['Technology', 'Sports'];

    checked: boolean = false;

    checkboxValues: boolean = false;
}
