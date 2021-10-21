import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AlPreviewData } from '../types/al-preview-data.types';

@Component({
    selector: 'al-preview',
    templateUrl: './al-preview.component.html',
    styleUrls: ['./al-preview.component.scss'],
})
export class AlPreviewComponent implements OnChanges {

    @Input() data:AlPreviewData;

    constructor() {
        this.data = new AlPreviewData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.data = changes.data.currentValue;
        this.data.properties.forEach(prop => {
            prop.value = Array.isArray(prop.value) ? this.normalizeValues(prop.value) : [{label: prop.value, icon: prop.icon}];
        });
    }

    /*
     * Simple helper to ensure all array value entries are constructed as objects with a label property at a minimum
     */
    private normalizeValues(vals: any[]) {
        vals = vals.filter(v =>  v !== null); // remove any null entries
        if(vals.every((value) => !value.hasOwnProperty('label'))) {
            return vals.map( v => {
                return {label: v};
            });
        }
        return vals;
    }
}
