import { Component, OnInit } from '@angular/core';
import { AlDefaultClient } from '@al/core';

@Component({
    selector: 'app-dynamic-table',
    templateUrl: './dynamic-table.component.html',
    styleUrls: ['./dynamic-table.component.css']
})
export class DynamicTableComponent implements OnInit {

    public rows:any[] = [];
    public columns:any[] = [];
    public actionSnackbarSelectedOption: any;

    constructor() { }

    ngOnInit(): void {
        this.loadMockData();
    }

    async loadMockData() {
        let [ columns, rows ] = await Promise.all( [
            AlDefaultClient.get( { url: '/assets/demo/data/columns.json' } ),
            AlDefaultClient.get( { url: '/assets/demo/data/rows.json' } )
        ] );
        this.rows = rows;
        this.columns = columns;
    }
}
