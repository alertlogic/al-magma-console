//import { SelectItem } from 'primeng/api';
import { MenuItem }   from 'primeng/api';

// SELECT ITEM:
// export interface SelectItem {
//   label?: string;
//   value: any;
//   styleClass?: string;
//   icon?: string;
//   title?: string;
//   disabled?: boolean;
// }

export interface Suggestion {
  type: string,
  name: string
}

export interface SearchResult {
  time_recv: string,
  msg: string
}

export class SearchQuery {
  id: string;
  name: string;
  query: Chicklet[];
  nResults: number;
  resultLimit: number;
  estimated: boolean;
  estimatedTotal: number;
  selected: boolean;
  results: SearchResult[];
  started: boolean;
  complete: boolean;

  constructor(id: string, name: string, query: Chicklet[]) {
    this.id = id;
    this.name = name;
    this.query = query;
    this.nResults = 0;
    this.resultLimit = 1000;
    this.estimated = true;
    this.estimatedTotal = 0;
    this.selected = false;
    this.results = [];
    this.started = false;
    this.complete = false;
  }

  startSearch() {
    this.started = true;
    this.name = 'Searching...';
    this.nResults = 0;
    this.results = [];
    this.complete = false;
    this.estimatedTotal = Math.floor(Math.random() * 1000) * Math.floor(Math.random() * 10) + 100;

    if (this.estimatedTotal < this.resultLimit) {
      this.resultLimit = this.estimatedTotal
      this.estimated = false;
    }
    
    this.getResults();
  }

  continueSearch() {
    this.complete = false;
    this.resultLimit = this.estimatedTotal;
    this.getResults();
  }

  getResults() {
    let intervalID = setInterval(() => {

      if (this.nResults < this.resultLimit) {
        this.nResults++;

        let result: SearchResult = {
          time_recv: Date.now().toString(),
          msg: '<Log Message>'
        }

        this.results.push(result);
      } else {
        this.nResults = this.resultLimit;
        this.complete = true;

        if (this.nResults >= this.estimatedTotal) {
          this.estimated = false;
        }

        clearInterval(intervalID);
      }

    }, 1);
  }
}

export enum Operator {
  exists =            'exists',
  doesNotExist =      'does not exist',
  is =                'is',
  isNot =             'is not',
  in =                'in',
  notIn =             'not in',
  containsAll =       'contains all',
  containsAny =       'contains any',
  excludesAll =       'excludes all',
  excludesAny =       'excludes any',
  like =              'like',
  notLike =           'not like'
}

export class Chicklet {

  name: string;
  type: string;
  operator: MenuItem;
  values: Suggestion[];
  aggregation: MenuItem;

  options: MenuItem[];

  constructor(name:string, type:string) {
    this.name = name;
    this.type = type;
    this.operator = {label: Operator.exists};

    this.values = [];
    this.aggregation = {label: 'none'};

    this.options = [
      {
        label: 'Operations',
        items: [
          {label: Operator.exists, command: (event) => {this.operatorChange(event.item)}},
          {label: Operator.doesNotExist, command: (event) => {this.operatorChange(event.item)}},
          {label: Operator.is, command: (event) => {this.operatorChange(event.item)}},
          {label: Operator.isNot, command: (event) => {this.operatorChange(event.item)}},
          {label: Operator.in, command: (event) => {this.operatorChange(event.item)}},
          {label: Operator.notIn, command: (event) => {this.operatorChange(event.item)}},
          {label: Operator.containsAny, command: (event) => {this.operatorChange(event.item)}},
          {label: Operator.containsAll, command: (event) => {this.operatorChange(event.item)}},
          {label: Operator.excludesAny, command: (event) => {this.operatorChange(event.item)}},
          {label: Operator.excludesAll, command: (event) => {this.operatorChange(event.item)}}
        ]
      },
      {
        label: 'Aggregations',
        items: [
            {label: 'none', command: (event) => {this.aggregationChange(event.item)}},
            {label: 'group by', command: (event) => {this.aggregationChange(event.item)}},
            {label: 'count', command: (event) => {this.aggregationChange(event.item)}}
        ]
      }
    ];
  }

  operatorChange(selectedOperator: MenuItem): void {
    this.operator = selectedOperator;
    if (this.operator.label != Operator.exists && this.operator.label != Operator.doesNotExist &&  this.operator.label != '') {
      this.addValue();
    }

  }

  addValue(): void {

    this.values.push({type: this.type, name: ''});
    this.evaluateOperator();
  }

  removeValue(index: number): void {
    if (index !== -1) {
        this.values.splice(index, 1);
    }
    this.evaluateOperator();
  }

  evaluateOperator(): void {
    if (this.values.length > 1) {

      if (this.operator.label == Operator.is) {
        this.operator = {label: Operator.in}
      } else if (this.operator.label == Operator.isNot) {
        this.operator = {label: Operator.notIn};
      }

    } else if (this.values.length == 1) {

      if (this.operator.label == Operator.in) {
        this.operator = {label: Operator.is};
      }

    } else {

      this.operator = {label: Operator.exists};

    }
  }

  aggregationChange(selectedAggregation: MenuItem): void {
    this.aggregation = selectedAggregation;
  }


}


export class Field extends Chicklet {

  constructor(field:string) {
    super(field, 'field');

    // this.availableOperators = [
    //   {value: Operator.exists},
    //   {value: Operator.doesNotExist},
    //   {value: Operator.is},
    //   {value: Operator.isNot},
    //   {value: Operator.in},
    //   {value: Operator.notIn}
    // ];
  }
}

export class Message extends Chicklet {

  constructor() {
    super('Message', 'message');

    // this.availableOperators = [
    //   {value: Operator.exists},
    //   {value: Operator.doesNotExist},
    //   {value: Operator.is},
    //   {value: Operator.isNot},
    //   {value: Operator.in},
    //   {value: Operator.notIn},
    //   {value: Operator.containsAny},
    //   {value: Operator.containsAll},
    //   {value: Operator.excludesAny},
    //   {value: Operator.excludesAll}
    // ];

  }
}

export class MessageType extends Chicklet {

  constructor() {
    super('Message Type', 'message-type');

    // this.availableOperators = [
    //   {value: Operator.exists},
    //   {value: Operator.doesNotExist},
    //   {value: Operator.is},
    //   {value: Operator.isNot},
    //   {value: Operator.in},
    //   {value: Operator.notIn}
    // ];
  }
}

export class MessageContext extends Chicklet {

}

export class TimeReceived extends Chicklet {

  constructor() {
    super('TimeReceived', 'time' );
  }
}