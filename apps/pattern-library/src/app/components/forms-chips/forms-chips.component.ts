import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'forms-chips',
    templateUrl: './forms-chips.component.html',
    styleUrls: ['./forms-chips.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class FormsChipsComponent {

    values1?: string[];
    values2?: string[];
}
