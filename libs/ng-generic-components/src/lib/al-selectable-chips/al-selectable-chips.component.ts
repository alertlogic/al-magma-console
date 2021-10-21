import { Component, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { AlChipItem } from '../types';

@Component({
    selector: 'al-selectable-chips',
    templateUrl: './al-selectable-chips.component.html',
    styleUrls: ['./al-selectable-chips.component.scss']
})
export class AlSelectableChipsComponent implements OnChanges {

    @Input() options:AlChipItem[] = [];

    @Input() readonly:boolean = false;

    @Output() onSelectionChanged:EventEmitter<AlChipItem[]> = new EventEmitter<AlChipItem[]>();

    orChips: AlChipItem[] = [];
    andChips: AlChipItem[] = [];

    ngOnChanges() {
        if (this.options) {
           this.splitOptions();
        }
    }

    removeSelectedItemAt(index: number, list: 'and' | 'or'): void {
        let element: AlChipItem;
        if (list === 'and') {
            element = this.andChips[index];
        } else if (list === 'or') {
            element = this.orChips[index];
        }
        index = this.options.findIndex(opt => opt.id === element.id );
        this.options.splice(index, 1);
        this.onSelectionChanged.emit(this.options);
        this.splitOptions();
    }

    private splitOptions(): void {
        this.orChips = [];
        this.andChips = [];
        this.options.forEach(opt => {
            const element = {...{}, ...opt};
            if (opt.separator === 'AND' || opt.separator === 'and') {
                this.andChips
                    .push(element);
            } else if (opt.separator === 'OR' || opt.separator === 'or') {
                this.orChips
                    .push(element);
            }
        });
    }

}
