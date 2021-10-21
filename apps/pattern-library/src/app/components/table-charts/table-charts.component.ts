import { Component } from '@angular/core';
import { TableListConfig } from '@al/ng-visualizations-components';

@Component({
  selector: 'app-table-charts',
  templateUrl: './table-charts.component.html',
  styleUrls: ['./table-charts.component.scss']
})
export class TableChartsComponent {

    public config2: TableListConfig = {
        headers: [
            { name: 'Host Name', field: 'summary'},
            { name: 'Count', field: 'count'},
            { name: 'Deployment1', field: 'deployment'},
            { name: 'Link', field: 'recordLink'},
            { name: 'Worst Status', field: 'status' ,style:'highlight'}
        ],
        body: [
            { summary: '123.234.45', count: '12.3k', deployment: 'AWS Account', recordLink: 'bla/123' , status: 'high'},
            { summary: '123.234.456', count: '12.36', deployment: 'AWS Account2',recordLink: 'bla/128', status: 'medium' },
            { summary: '123.4.45', count: '12', deployment: 'AWS Account 1',recordLink: 'bla/129', status: 'acceptable' }
        ],
        sortable: true
    };

    public config1: TableListConfig = {
        headers: [
            { name: 'Host Name', field: 'summary 5' },
            { name: 'Count', field: 'count' },
            { name: 'Deployment1', field: 'deployment' },
            { name: 'Worst Status', field: 'status',style:'highlight' }
        ],
        body: [
            { summary: '123.234.45', count: '12.3k', deployment: 'AWS Account', status: 'high' },
            { summary: '123.234.456', count: '12.36', deployment: 'AWS Account2', status: 'medium' },
            { summary: '123.4.45', count: '12', deployment: 'AWS Account 1', status: 'low' }
        ]
    };

    public config3: TableListConfig = {
        headers: [
            { name: 'Name', field: 'name', class: 'multiline-content' },
            { name: 'Count', field: 'count', style: 'right' },
        ],
        body: [{
              name: 'A very long massive piece of test that goes on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on',
              count: '12.3k'
            }, {
              name: 'A not so long piece of text that fits onto two lines just fine',
              count: '12.36'
            }, {
              name: 'A single line piece of text',
              count: '12'
            }, {
              name: 'A very long massive piece of test that goes on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on',
              count: '12'
            }, {
              name: 'A very long massive piece of test that goes on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on',
              count: '12'
            }, {
              name: 'A single line piece of text',
              count: '12'
            }]
    };

}
