import { Component, OnInit }     from '@angular/core';
import { AlNavigationService }   from '@al/ng-navigation-components';
import { TableViewService, Incident }      from './tableview.service';

@Component({
  selector: 'app-tableview',
  templateUrl: './tableview.component.html',
  styleUrls: ['./tableview.component.css']
})
export class TableViewComponent implements OnInit {

  data:Incident[];
  cols!:{field:string, header:string}[];

  constructor(
    public navigation:AlNavigationService,
    private tableViewService: TableViewService,
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
    this.tableViewService.getData().then(data => {
      this.data = data;
    });
  }



  ngOnInit() {
    this.getData();
    this.getCols();

  }

}
