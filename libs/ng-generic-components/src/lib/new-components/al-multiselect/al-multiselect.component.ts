/**
 * al-select
 *
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2021
 *
 */

import { Component, Input, Output, EventEmitter, OnInit, ElementRef } from '@angular/core';
import { AlOptionItem } from '../../types';

@Component({
    selector: 'al2-multiselect',
    templateUrl: './al-multiselect.component.html',
    host: {
        '(document:click)': 'clickOut($event)'
    }
})
export class AlMultiSelectComponent implements OnInit {

    @Input() label?: string = '';
    @Input() default?: string = 'Select Options';
    @Input() options: AlOptionItem[] = [];
    @Input() inputModel: AlOptionItem[] = [];
    @Input() search: boolean = true;

    @Output() itemSelected: EventEmitter<AlOptionItem[]> = new EventEmitter();

    searchText: string = '';
    optionsVisible: boolean = false;

    constructor(
        private eref: ElementRef
    ) { }

    ngOnInit(): void {

    }

    clickOut(event: Event) {
        if (!this.eref.nativeElement.contains(event.target)) {
            this.optionsVisible = false;
        }
    }

    closeOptions() {
        this.optionsVisible = !this.optionsVisible;
    }

    multiselectOption(checked: boolean, option: AlOptionItem) {

        // make the option selected = to the checkbox state
        option.selected = checked;

        // reset the input model
        this.inputModel = [];

        // add only the selected things to the inputmodel
        this.options.forEach(element => {
            if (element.selected) {
                this.inputModel.push(element);
            }
        });

    }

}
