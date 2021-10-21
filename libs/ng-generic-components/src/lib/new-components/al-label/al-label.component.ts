/**
 * al-label
 *
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2021
 *
 */
import { Component, Input } from '@angular/core';

@Component({
    selector: 'al2-label',
    templateUrl: './al-label.component.html'
})
export class AlLabelComponent {

    @Input() label: string = 'Label Text';
    @Input() for: string = 'labelFor';

    constructor() { }

}
