import { Component, OnInit }     from '@angular/core';
import { AlNavigationService }   from '@al/ng-navigation-components';
import { DataViewService, Incident }      from './dataview.service';

@Component({
  selector: 'app-dataview',
  templateUrl: './dataview.component.html',
  styleUrls: ['./dataview.component.css']
})


export class DataViewComponent implements OnInit {

  data:Incident[];
  cols:{field:string, header:string}[];

  constructor(
    public navigation:AlNavigationService,
    private dataViewService: DataViewService,
  ) { 

    this.data = [];
  }

  getCols() {
    this.cols = [
      {field: 'id', header: 'ID'},
      {field: 'date', header: 'Date'},
      {field: 'summary', header: 'Summary'},
      {field: 'class', header: 'class'},
      {field: 'attacker', header: 'attacker'},
      {field: 'target', header: 'target'},
      {field: 'account', header: 'account'},
      {field: 'deployment', header: 'deployment'}
    ];
  }

  // Get Data
  getData() {
    this.dataViewService.getData().then(data => {
      this.data = data;
    });
  }



  ngOnInit() {
    this.getData();
    this.getCols();

  }

}
