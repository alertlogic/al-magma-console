import { Component, ViewChild }  from '@angular/core';
import { AlNavigationService }   from '@al/ng-navigation-components';
import { AlBaseCardConfig, AlBaseCardFooterActions, AlActionFooterButtons, alEditDeleteFooterActions, AlBaseCardFooterActionEvent } from '@al/ng-cardstack-components';
import { AlActionSnackbarEvent, AlActionSnackbarElement} from '@al/ng-generic-components';
import { SelectItem }            from 'primeng/api';
import { MenuItem }              from 'primeng/api';

import { SuggestionsService }    from './suggestions.service';
import { Suggestion, SearchQuery, SearchResult, Operator, Field, Message, MessageType, Chicklet } from './data-models';

@Component({
  selector: 'app-search-console',
  templateUrl: './search-console.component.html',
  styleUrls: ['./search-console.component.scss']
})

export class SearchConsoleComponent {

  @ViewChild('chickletOptions', {static:false}) chickletOptions:any;

  suggestions:             Suggestion[];
  query:                   Chicklet[];
  freeSearch:              Suggestion;

  timeRangeOptions:        SelectItem[];
  timeRange:               SelectItem;

  searchQueue:             SearchQuery[];
  //newSearch:               SearchQuery;
  activeSearch:            SearchQuery;

  rowsPerPageOptions:      number[];
  displayNumberOfResults:  number;      // Default display value
  cols:                    {field: string, header: string}[];

  selectedResults:         SearchResult[];
  selectResultsOptions:    SelectItem[];
  selectNumberOfResults:   SelectItem;
  selectAll:               boolean;

  //chickletOptions:           MenuItem[];


  constructor(
    public navigation:AlNavigationService,
    private suggestionsService: SuggestionsService,
  ) {

    //let messageType:Chicklet = new MessageType();

    this.query = [
      new MessageType(),
      new Message()
    ];

    this.suggestions = [];
    this.freeSearch = {type: '', name: ''};

    // time range stuff
    this.timeRangeOptions = [
      {value: 'Last Hour'},
      {value: 'Last 24 Hours'},
      {value: 'Last 7 Days'},
      {value: 'Last 30 Days'}
    ];
    this.timeRange = this.timeRangeOptions[0];

    //this.newSearch = new SearchQuery(Date.now().toString(), 'new search', this.query);
    this.activeSearch = new SearchQuery(Date.now().toString(), 'New Search', this.query);
    this.activeSearch.selected = true;
    this.searchQueue = [this.activeSearch];

    this.cols = [
      {field: 'time_recv', header: 'Time Received'},
      {field: 'msg', header: 'Message'},
    ];

    this.rowsPerPageOptions = [10, 50, 100];
    this.displayNumberOfResults = this.rowsPerPageOptions[0];

    this.selectedResults = [];
    this.selectResultsOptions = [{label: 'Page', value: 'page'}, {label: 'All', value: 'all'}];
    this.selectNumberOfResults = this.selectResultsOptions[0];
    this.selectAll = false;
  
  }

  // Get suggestions
  filterSingle(event: any, chicklet: Chicklet | null) {
    let query = event.query;
    let type = chicklet ? chicklet.type : 'any';

    this.suggestionsService.getSuggestions().then(data => {
      this.suggestions = this.filterSuggestions(query, data.suggestions, type);
    });
  }

  //return filtered suggestion results
  filterSuggestions(query: string, suggestions: Suggestion[], type: string): Suggestion[] {
    let filtered: Suggestion[] = [];
    for(let i = 0; i < suggestions.length; i++) {
      let suggestion = suggestions[i];
      if (type != 'any') {
        if (suggestion.name.toLowerCase().indexOf(query.toLowerCase()) == 0 && suggestion.type == type) {
          filtered.push(suggestion);
        }
      } else {
        if (suggestion.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
          filtered.push(suggestion);
        }
      }
    }

    if (filtered.length) {
      return filtered;
    } else {
      return [{type: 'message CONTAINS', name: query}];
    }

  }

  // Commit the temporary ngModel value to the chicklet value
  selectSuggestion(value: Suggestion, chicklet: Chicklet, index: number) {
    chicklet.values[index] = value;
  }

  // The freesearch - needs to put the right things in the right places
  freeSearchSelect(value:Suggestion) {

    if (value.type == 'message CONTAINS') {

      let chicklet = this.activeSearch.query.find((chicklet) => chicklet.type === 'message');

      if (chicklet && chicklet.type == 'message') {
        chicklet.values.push({type: 'message', name:value.name});
      } else {
        let message: Message = new Message();
        message.operator = {label: Operator.containsAny};
        message.values.push({type: message.type, name: value.name});

        this.activeSearch.query.push(message);
      }

    } else {

      let chicklet = this.activeSearch.query.find((chicklet) => chicklet.type === value.type);

      if (chicklet && chicklet.type != 'field') {
        chicklet.values.push({type: value.type, name: value.name});
        // chicklet.operator = {label: Operator.is};

      } else {

        let newField: Field = new Field(value.name);
        this.activeSearch.query.push(newField);

        // set focus to the dropdown options to change to an IS rather than just defaulting to EXISTS
        // this.chickletOptions.focus();
      }
    }

    this.freeSearch = {type: '', name: ''};
  }

  removeChicklet(chickIndex: number, chicklet: Chicklet): void {
    if (chickIndex !== -1) {
        this.query.splice(chickIndex, 1);
    }
  }


  // ============================================
  // EXECUTE SEARCH and QUEUE

  executeSearch(): void {

    // const maxConcurrentSearches = 6;

    // if (this.searchQueue.length < maxConcurrentSearches) {

      // set the active search as a new searchquery instance with a copy of the current query 
      // this.activeSearch = new SearchQuery(Date.now().toString(), 'Searching...', [...this.query]);
      // this.activeSearch.selected = true;

      // start the search interval
      this.activeSearch.startSearch();
      
      // push this search to the queue
      // this.searchQueue.push(this.activeSearch);

      // set the selected search to the selected state
      // this.selectSearch(this.searchQueue.length -1);

    // } else {
    //   alert("Maximum number of " + maxConcurrentSearches + "concurrent searches reached. Please close any complete or running searches from the queue.");
    // }
  }

  // remove a search from the queue
  cancelSearch(searchIndex: number): void {
    this.searchQueue.splice(searchIndex, 1);
  }

  continueSearch(search: SearchQuery): void {
    search.continueSearch();
  }

  // Sets the selected search to the actively selected state, deactivating all the others.
  selectSearch(index: number) {
    for (var i = 0; i < this.searchQueue.length; ++i) {
      this.searchQueue[i].selected = false;
    }
    this.searchQueue[index].selected = true;
  }

  addSearch(): void {
    this.query = [new MessageType(), new Message()]

    this.activeSearch = new SearchQuery(Date.now().toString(), 'New Search', this.query);
    
    // push this search to the queue
    this.searchQueue.push(this.activeSearch);

    // set the selected search to the selected state
    this.selectSearch(this.searchQueue.length -1);
  }

  addValue(): void {
  }

  // ============================================
  // RESULTS

  // View the results and query of a selected search
  viewResults(index:number): void {
  
    // set the selected state of the search in the queue     
    this.selectSearch(index);

    // the active displayed search becomes the selected search in the queue (by index)
    this.activeSearch = this.searchQueue[index];

    // change the query to show the seelcted search's query (a copy of it)
    this.query = this.activeSearch.query;

    this.selectAllResults(false);

    // need to create a new searchquery instance for iterating on the query independently of the active search
    //this.activeSearch = new SearchQuery(Date.now().toString(), 'new search', this.query);

  }

  onRowSelect(): void {
    this.actionSnackbarVisible = true;
    this.resultsSelected();  
  }

  onRowUnselect(): void {
    this.actionSnackbarVisible = this.selectedResults.length ? true : false;
    this.resultsSelected();
  }

  resultsSelected(): void {
    this.actionSnackbarText = this.selectedResults.length + (this.selectedResults.length > 1 ? ' results selected' : ' result selected') + ' of ' + this.activeSearch.nResults + (this.activeSearch.estimated ? ' of ' + this.activeSearch.estimatedTotal + ' estimated' : '');
  }

  selectAllResults(checked: boolean): void {
    if (checked) {
      this.selectAll = true;
      const nResults: number = this.selectNumberOfResults.value == 'all' ? this.activeSearch.nResults : this.displayNumberOfResults;

      this.selectedResults = [];

      for (let i = 0; i < nResults; i++) {
        this.selectedResults.push(this.activeSearch.results[i]);
      }

      this.onRowSelect();
    } else {
      this.selectAll = false;
      this.selectedResults = [];
      this.onRowUnselect();
    }
  }

  changeSelectResults(): void {
    this.selectAll = true;
    this.selectAllResults(true);
  }

  public actionSnackbarButtons: AlActionSnackbarElement[] = [
    {
        event: "download",
        icon: "get_app",
        text: "DOWNLOAD",
        visible: true,
        type: 'button'
    }
  ];
  public actionSnackbarVisible: boolean = false;
  public actionSnackbarText: string = 'some results';
  public actionSnackbarSelectedOption: AlActionSnackbarEvent = '';

  public actionSnackbarEvent(event: AlActionSnackbarEvent) {
      this.actionSnackbarSelectedOption = event;
  }


  ngOnInit() {
      //  Always called at initialization time
  }


}
