import { Component, Input, EventEmitter, Output } from '@angular/core';
import { SearchQuery, AlSubmitSearchData } from './data-models';
import { AlSearchResultsQueryParamsV2, AlSearchGetV2, AlAdditionalSubmitParams } from '@al/core';
import { MenuItem } from 'primeng/api';

export interface AlDownloadQueueDeleteResponse {
    searchQueueLength: number;
    index: number;
    isCancelled: boolean;
    uuid: string|undefined;
}

const maxConcurrentSearches = 6;
@Component({
    selector: 'al-download-queue',
    templateUrl: './al-download-queue.component.html',
    styleUrls: ['./al-download-queue.component.scss']
})

export class AlDownloadQueueComponent {
    /**
     * Inputs, properties to handle visual behaviour
     */
    @Input() queuePosition: string = "''";
    @Input() getResults: boolean = true;
    @Input() showPauseButton: boolean = false;
    @Input() showPlusButton: boolean = true;
    @Input() transformResults: boolean = true;
    // this will let us use this component logic without its visual presentation
    @Input() invisibleMode: boolean = false;

    /**
     * Outputs
     */
    @Output() onDownloadResults: EventEmitter<any> = new EventEmitter();
    @Output() onTabChange: EventEmitter<SearchQuery> = new EventEmitter();
    @Output() onGetResults: EventEmitter<{results: void|AlSearchGetV2,
                                          searchItemFetchParams: AlSearchResultsQueryParamsV2|undefined}> = new EventEmitter();
    @Output() onAddSearch: EventEmitter<number> = new EventEmitter();
    @Output() onDeleteSearch: EventEmitter<AlDownloadQueueDeleteResponse> = new EventEmitter();
    @Output() onContinueSearch: EventEmitter<{isOnError: boolean}> = new EventEmitter();
    @Output() onSharingSearch: EventEmitter<{searchId?: string, sharingType: string}> = new EventEmitter();

    /**
     * Public variables
     */
    public searchQueue: SearchQuery[] = [];
    public selectedIndex: number = 0;
    public activeSearch?: SearchQuery;

    public shareMenuItems: MenuItem[] = [];

    /**
     * Private variables
     */
    private accountId: string = '';

    constructor() {
    }

    ngOnInit() {
        this.shareMenuItems = [
            {
                label: 'Share Query',
                command: () => {
                    this.shareSearch('query');
                }
            },
            {
                label: 'Share Results',
                command: () => {
                    this.shareSearch('results');
                }
            }
        ];
    }

    /**
     * Resets component state to "factory defaults"
     */
    public reset() {
        this.searchQueue = [];
        this.selectedIndex = 0;
        this.activeSearch = undefined;
        this.accountId = '';
    }

    /**
     * Cancels the currently active search tab.
     */
    public async stopSearch( searchIndex:number = -1, remove:boolean = false ) {
        if ( searchIndex === -1 ) {
            searchIndex = this.selectedIndex;
        }
        if ( searchIndex >= this.searchQueue.length ) {
            throw new Error( `Cannot stop search #${searchIndex}: index does not exist` );
        }
        console.log("Cancelling searchIndex %s", searchIndex, this.searchQueue[searchIndex] );
        const isCancelled: boolean = await this.searchQueue[searchIndex].deleteSearch();
        const uuid: string|undefined = this.searchQueue[searchIndex].id;
        if ( remove ) {
            this.searchQueue.splice(searchIndex, 1);
            if (this.searchQueue.length > 0) {
                if (this.selectedIndex === searchIndex) {
                    let index: number = searchIndex - 1;
                    if (searchIndex === 0) {
                        index = searchIndex;
                        // to allow if the zero position is deleted select the next one
                        this.selectedIndex = -1;
                    }
                    this.viewResults(index);
                }
            } else {
                this.activeSearch = undefined;
            }
            this.onDeleteSearch.emit({
                searchQueueLength: this.searchQueue.length,
                index: searchIndex,
                isCancelled: isCancelled,
                uuid: uuid
            });
        }
    }

    /**
     * Entry point to execute the search submit
     * @param accountId The account id under which the query is going to be submitted
     * @param query The raw query EM/SQL like string
     * @param additionalParameters Additional query params such as timerange, formatting, etc...
     */
    async submitSearch(accountId: string,
                       query: string,
                       additionalParameters: AlAdditionalSubmitParams,
                       resultsFetchParams: AlSearchResultsQueryParamsV2,
                       shouldRetry: boolean = true,
                       uuid?: string): Promise<string|undefined> {
        // Let's verify if we are changing accounts
        // in order to reset to the initial values
        if (accountId !== this.accountId) {
            this.accountId = accountId;
            this.searchQueue = [];
            this.activeSearch = undefined;
        }
        const submitSearchData: AlSubmitSearchData = {
            query: query,
            additionalParameters: additionalParameters
        };
        if (!this.activeSearch) {
            this.addSearch('Searching...');
        }
        if (this.activeSearch) {
            // This setter will be used if you want to load a particular
            // uuid which will bypass the initial submit process
            this.activeSearch.id = uuid;

            this.activeSearch.submitSearchData = submitSearchData;
            this.activeSearch.fetchParams = resultsFetchParams;
            this.activeSearch.shouldRetry = shouldRetry;
            // Let's await for the search status to be completed
            await this.activeSearch.startSearch(true);
            // And finally let's present the results
            if (this.getResults) {
                this.viewResults();
            } else {
                await this.activeSearch.setQueryStatus();
            }
        }
        return this.activeSearch?.id;
    }

    // ============================================
    // EXECUTE SEARCH and QUEUE

    executeSearch(accountId: string, queryId: string, resultsFetchParams: AlSearchResultsQueryParamsV2): void {

        if (this.searchQueue.length <= maxConcurrentSearches) {

            if ( accountId !== this.accountId ) {
                this.accountId = accountId;
                this.searchQueue = [];
                this.activeSearch = undefined;
            }
            // set the active search
            if (!this.activeSearch) {
                this.activeSearch = new SearchQuery('Searching...', accountId, queryId);

                // push this search to the queue
                this.selectedIndex = this.searchQueue.push(this.activeSearch) - 1;
            }
            this.activeSearch.id = queryId;
            this.activeSearch.fetchParams = resultsFetchParams;
            // start the search interval
            this.activeSearch.startSearch();

            if (this.getResults) {
                this.viewResults();
            }

            // set the selected search to the selected state
            this.selectSearch(this.selectedIndex);

        } else {
            console.log("Maximum number of " + maxConcurrentSearches + "concurrent searches reached. Please close any complete or running searches from the queue.");
        }
    }

    // remove a search from the queue
    async cancelSearch(event: Event, searchIndex: number): Promise<void> {
        event.stopPropagation();
        await this.stopSearch( searchIndex, true );
    }

    // pause a search from the queue
    pauseSearch(event: Event, search: SearchQuery): void {
        event.stopPropagation();
        console.log(search);
    }

    // download search results as CSV
    async downloadResults(event?: Event, search?: SearchQuery): Promise<void> {
        // When called outside a DOM element action (e.g. the export button in Search)
        if (event) {
            event.stopPropagation();
        }
        // This will be used when downloading the current
        // active search results instead of an explicit one
        if (!search) {
            if (this.activeSearch) {
                search = this.activeSearch;
            } else {
                return;
            }
        }
        search.isDownloading = true;
        // let's keep previous name value
        const prevName: string = search.name;
        search.name = 'Downloading...';
        const results = await search.fetchResults('csv');
        search.isDownloading = false;
        // let's go back to the previous name value
        search.name = prevName;
        this.onDownloadResults.emit({results, searchId: search.id});
    }

    // download selected search results as CSV
    async downloadSelectedRows(selectedIndexes: number[], search?: SearchQuery): Promise<void> {
        if (!search) {
            if (this.activeSearch) {
                search = this.activeSearch;
            } else {
                return;
            }
        }
        search.isDownloading = true;
        const previousStateLabel: string = search.name;
        search.name = 'Downloading selection...';
        const results = await search.fetchSelectedRows(selectedIndexes);
        search.isDownloading = false;
        search.name = previousStateLabel; // go back to the first value
        this.onDownloadResults.emit({results, searchId: search.id});
    }

    async continueSearch(event?: Event, search?: SearchQuery): Promise<void> {
        // When called outside a DOM element action (e.g. the play button in Search)
        if (event) {
            event.stopPropagation();
        }
        // This will be used when continuing the current
        // active search results instead of an explicit one
        if (!search) {
            if (this.activeSearch) {
                search = this.activeSearch;
            } else {
                return;
            }
        }
        await search.continueSearch();
        // Let's await for the search status to be completed
        await search.checkSearchStatusTillCompletion(undefined, true);
        // And finally let's present the results
        if (this.getResults) {
            await this.viewResults(undefined, search.fetchParams, true);
        } else {
            await search.setQueryStatus();
        }
        this.onContinueSearch.emit({ isOnError: search.isOnError });
    }

    // Sets the selected search to the actively selected state, deactivating all the others.
    selectSearch(index: number) {
        for (let i = 0; i < this.searchQueue.length; ++i) {
            this.searchQueue[i].selected = false;
        }
        this.searchQueue[index].selected = true;
        this.selectedIndex = index;
    }

    // ============================================
    // RESULTS

    // View the results and query of a selected search
    async viewResults(index?: number, resultsFetchParams?: AlSearchResultsQueryParamsV2, continueSearching: boolean = false): Promise<void> {
        if (index === this.selectedIndex) {
            return;
        }
        // Let's check if we are trying to request the results
        // from one particular tab or for the current selected
        if (index !== undefined) {
            // set the selected state of the search in the queue
            this.selectSearch(index);

            // the active displayed search becomes the selected search in the queue (by index)
            this.activeSearch = this.searchQueue[index];
        }
        if (this.activeSearch) {
            // Let's emit to handle the tab change if required
            if (index !== undefined) {
                this.onTabChange.emit(this.activeSearch);
            }
            if (this.activeSearch.id) {
                if (this.getResults) {
                    // If we are performing pagination we need to update
                    // the fetch params in order to move back or forward
                    if (resultsFetchParams) {
                        this.activeSearch.fetchParams = resultsFetchParams;
                    }
                    let searchItemFetchParams = this.activeSearch.fetchParams;
                    // Let's check if the active search is on error state in order to avoid additional calls otherwise
                    // let's check for the search id (search_uuid) if not present then just return null as results response
                    let results = (!this.activeSearch.isOnError && this.activeSearch.id)?
                                        await this.activeSearch.fetchResults('json', true, this.transformResults, continueSearching) as AlSearchGetV2 :
                                        undefined;
                    this.onGetResults.emit({results: results, searchItemFetchParams: searchItemFetchParams});
                } else {
                    await this.activeSearch.setQueryStatus();
                }
            } else {
                // If we are selecting a search item not yet executed let's return undefined
                this.onGetResults.emit(undefined);
            }
        }
    }

    addSearch(statusLabel: string = 'New Search'): void {
        if (this.searchQueue.length < maxConcurrentSearches) {
            this.activeSearch = new SearchQuery(statusLabel, this.accountId);

            // push this search to the queue
            this.searchQueue.push(this.activeSearch);

            // set the selected search to the selected state
            this.selectSearch(this.searchQueue.length - 1);

            this.onAddSearch.emit(this.selectedIndex);
        } else {
            console.log("Maximum number of " + maxConcurrentSearches + " concurrent searches reached. Please close any complete or running searches from the queue.");
        }
    }

    setFetchParams(resultsFetchParams: AlSearchResultsQueryParamsV2): void {
        if (this.activeSearch) {
            this.activeSearch.fetchParams = resultsFetchParams;
        }
    }

    shareSearch(type: string): void {
        this.onSharingSearch.emit({
            searchId: this.activeSearch?.id,
            sharingType: type
        });
    }
}
