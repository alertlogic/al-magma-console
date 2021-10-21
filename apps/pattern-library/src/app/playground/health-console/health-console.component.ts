import { Component, OnInit }     from '@angular/core';
import { AlNavigationService }   from '@al/ng-navigation-components';
import { HealthConsoleService, Incident }      from './health-console.service';

@Component({
  selector: 'health-console',
  templateUrl: './health-console.component.html',
  styleUrls: ['./health-console.component.scss']
})


export class HealthConsoleComponent implements OnInit {

  data:Incident[];
  cols:{field:string, header:string}[];

  constructor(
    public navigation:AlNavigationService,
    private dataViewService: HealthConsoleService,
  ) { 

    this.data = [];
    this.cols = [];
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
