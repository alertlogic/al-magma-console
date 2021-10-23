import { Component, Input } from '@angular/core';

@Component({
    selector: 'ald-label',
    templateUrl: './al-label.component.html',
	styleUrls: ['./al-label.component.scss']
})
export class AlLabelComponent {

    @Input() label: string = 'Label Text';
    @Input() for: string = 'labelFor';
    @Input() id?: string;
    @Input() name?: string;

    constructor() { }

}
