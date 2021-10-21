/**
 * al-form-group
 *
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2021
 *
 */
import { Component, Input, OnInit} from '@angular/core';


@Component({
    selector: 'al2-form-group',
    templateUrl: './al-form-group.component.html'
})
export class AlFormGroupComponent implements OnInit {

    @Input() label: string = '';
    @Input() verticalSpace?: boolean = true;
    @Input() id?: string;
    @Input() hint?: string;
    @Input() tip?: string;
    @Input() required? = false;

    constructor() { }

    ngOnInit(): void {
        this.id = this.id || this.label;
    }

}
