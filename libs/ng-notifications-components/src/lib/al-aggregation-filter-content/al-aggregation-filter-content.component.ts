import { Component, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'al-aggregation-filter-content',
    templateUrl: './al-aggregation-filter-content.component.html',
    styleUrls: ['./al-aggregation-filter-content.component.scss']
})

export class AlAggregationFilterContentComponent implements OnChanges{

    @Input() filtersSort: string[]= [];
    @Input() filters: {[key: string]: string[]} = {};
    @Input() columns: number = 2;

    filtersToShow: Array<{key:string; values:string[]}> = [];

    ngOnChanges(){
        if(!this.filters) {
            this.filtersToShow = [];
        } else {
            this.filtersToShow = this.filtersSort
            .map(item =>{
                return {key:item, values: this.filters[item]};
            })
            .filter(item => item.values !== undefined);
        }
    }

    keyValueTrackBy(index:number, item:{key:string;values:unknown}): string {
        return item.key;
    }

    stringTrackBy(index:number, item:string): string {
        return item;
    }
}
