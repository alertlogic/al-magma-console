/**
 *  AlBoxesSelectorComponent provides all functionality for selecting options from a list of boxes
 *
 *  @author Carlos Orozco <carlos.orozco@alertlogic.com>
 *
 *  @copyright Alert Logic, Inc 2018
 */
import { Component,
         OnInit,
         Input,
         Output,
         EventEmitter,
         forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { BoxDescriptor } from '../../types';

@Component({
    selector: 'al-boxes-selector',
    templateUrl: './al-boxes-selector.component.html',
    styleUrls: ['./al-boxes-selector.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AlBoxesSelectorComponent),
            multi: true
        }
    ]
})
export class AlBoxesSelectorComponent implements OnInit, ControlValueAccessor {

    /** Inputs */
    @Input() data: Array<BoxDescriptor> = [];
    @Input() uniqueElement: boolean = false;
    /** Outputs */
    @Output() onselectedItems: EventEmitter<Array<string>> = new EventEmitter();

    public isDisabled: boolean;
    selectedValues: string[];

    constructor() {}

    ngOnInit() {}

    onChangeFunction = (value: string[] | null) => {
        // empty intentional
    }

    onTouchFunction = () => {
        // empty intentional
    }

    writeValue(value: string[]): void {
        if (value) {
            this.selectedValues = value || null;
            this.data.forEach( boxItem => {
                boxItem.selected = value.includes(boxItem.id);
            });
        } else {
            this.selectedValues = null;
        }
    }

    registerOnChange(fn: any): void {
        this.onChangeFunction = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouchFunction = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
        if (this.isDisabled) {
            this.data = this.data.map(itemBox => {
                itemBox.selected = false;
                return itemBox;
            });
        }
    }

    selectBox(item: BoxDescriptor) {
        if (!this.isDisabled) {
            if (this.uniqueElement) {
                this.data = this.data.map(itemBox => {
                    itemBox.selected = false;
                    return itemBox;
                });
            }
            item.selected = !item.selected;
            this.selectedValues = this.data.filter(x => x.selected).map( x => x.id);
            this.onChangeFunction(this.selectedValues);
            this.onselectedItems.emit( this.selectedValues );
        }
    }

}
