import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'al-time-input',
    templateUrl: './al-time-input.component.html',
    styleUrls: ['./al-time-input.component.scss']
})
export class AlTimeInputComponent implements OnInit {

    @Input() parentForm: FormGroup;

    constructor() { }

    ngOnInit() {}

}
