import { Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'ald-form-group',
    templateUrl: './al-form-group.component.html',
	styleUrls: ['./al-form-group.component.scss']
})
export class AlFormGroupComponent implements OnInit {

    @Input() label: string = '';
    @Input() verticalSpace?: boolean = true;
    @Input() id?: string;
    @Input() name?: string;
    @Input() for?: string;
    @Input() hint?: string;
    @Input() tip?: string;
    @Input() required?: boolean = false;

    constructor() { }

    ngOnInit(): void {
        this.id = this.id || this.label;
    }

}
