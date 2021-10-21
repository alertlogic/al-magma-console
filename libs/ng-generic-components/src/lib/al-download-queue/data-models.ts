import { AlStopwatch,
         AlSearchResultsQueryParamsV2,
         AlSearchStylist,
         AlSearchGetV2,
         AlSearchClientV2,
         AlSearchStatusV2,
         AlAdditionalSubmitParams,
         AlSearchSubmitV2,
         AlSearchDetailsV2} from '@al/core';
import { AlGoogleAnalyticsService } from '../services/al-google-analytics.service';
import { AlTrackingMetricEventCategory } from '../types/tracking.types';

const LIMIT: number = 100000;

export interface AlSubmitSearchData {
    query: string;
    additionalParameters: AlAdditionalSubmitParams;
}

export interface AlSubmitSearchWorkflowData {
    originalUUID?: string;
    retryCount?: number;
    retriedByUUID?: string;
}

export class SearchSubmitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SearchSubmitError';
    }
}

export class SearchQuery {
    id?: string;
    accountId: string;
    name: string;
    progress: number;
    status?: 'pending'|'suspended'|'canceled'|'complete';
    nResults: number;
    remaining: number;
    selected: boolean;
    fetchParams?: AlSearchResultsQueryParamsV2;
    isDownloading: boolean;
    isOnError: boolean;
    isCancelled: boolean;
    errorMessage?: string;
    submitSearchData?: AlSubmitSearchData;
    submitSearchWorkflowData: AlSubmitSearchWorkflowData = {};
    shouldRetry: boolean = true;
    searchDetails?: AlSearchDetailsV2;

    constructor(name: string, accountId: string, id?: string) {
        this.id = id;
        this.accountId = accountId;
        this.name = name;
        this.progress = 0;
        this.nResults = 0;
        this.remaining = 0;
        this.selected = false;
        this.isDownloading = false;
        this.isOnError = false;
        this.isCancelled = false;
    }

    async startSearch(isSubmitting: boolean = false) {
        this.name = 'Searching...';
        this.status = 'pending';
        this.nResults = 0;
        this.progress = 0;
        this.isCancelled = false;
        this.isOnError = false;
        this.errorMessage = undefined;
        this.submitSearchWorkflowData = {
            originalUUID: undefined,
            retryCount: 0,
            retriedByUUID: undefined
        };

        // Let's check if we are performing an initial submit
        // or fetching the results directly as default behavior
        isSubmitting? await this.submitSearch(): this.fetchResults();
    }

    public async submitSearch(): Promise<boolean|undefined> {
        if (this.submitSearchData) {
            console.log(`Submitting search query: ${this.submitSearchData.query}`);
            try {
                let searchUUID = undefined;
                // if the search id is set means we are trying
                // to load results from an already executed uuid
                // otherwise we continue with the submit workflow
                if (this.id) {
                    searchUUID = this.id;
                } else {
                    const status: AlSearchSubmitV2 = await AlSearchClientV2.submit(this.submitSearchData.query,
                                                                            this.accountId,
                                                                            this.submitSearchData.additionalParameters);

                    searchUUID = status.search_uuid;
                }
                if (searchUUID) {
                    return this.checkSearchStatusTillCompletion(searchUUID);
                } else {
                    throw new SearchSubmitError('No uuid returned from submit endpoint');
                }
                return true;
            } catch(error) {
                console.log(error);
                this.setupError('Search failed', error.data?.error || 'Search submit has failed');
                throw error;
            }
        }
        return false;
    }

    async setQueryStatus() {
        if (!this.id) {
            return false;
        }
        const response: AlSearchStatusV2 = await AlSearchClientV2.status(this.accountId, this.id);
        this.status = response.search_status as ('pending'|'suspended'|'complete');
        this.nResults = response.total_found || 0;
        this.progress = (this.status !== 'pending')? response.progress || 100 : response.progress || 0;
        return true;
    }

    async continueSearch(): Promise<any> {
        this.progress =  0;
        if (!this.id) {
            return false;
        }
        try {
            // First let's execute the continue search
            await AlSearchClientV2.completeSuspendedSearch(this.accountId, this.id);
        } catch(error) {
            console.log(error);
            this.setupError('Continue failed');
            // Let's return this error to be handled on the consumer app
            return error;
        }
    }

    public async fetchSelectedRows(selectedIndexes: number[]): Promise<any> {
        if (!this.id) {
            return false;
        }
        try {
            let fetchParams: AlSearchResultsQueryParamsV2 = {};
            if (this.fetchParams) {
                Object.assign(fetchParams, this.setFromEpochtimeParams());
            }
            fetchParams.selected = selectedIndexes.join(',');
            return await AlSearchStylist.searchStylist(this.accountId, this.id, 'csv', fetchParams);
        } catch(error) {
            console.log(error);
            this.setupError('Download failed');
            // Let's return this error to be handled on the consumer app
            return error;
        }
    }

    public async fetchResults(outputType: 'json'|'csv' = 'json', getResults: boolean = false, transformResults: boolean = true, continueSearching: boolean = false): Promise<AlSearchGetV2|boolean|undefined> {
        console.log(`Fetching results of type '${outputType}' (results: ${getResults})`);
        return new Promise<boolean|AlSearchGetV2|undefined>( ( resolve, reject ) => {
            let checker = AlStopwatch.later( async () => {
                // Let's check if the query was cancelled to avoid additional fetching
                if (this.isCancelled) {
                    resolve(undefined);
                } else {
                    let result = await this.checkFetchResults( outputType, getResults, transformResults, continueSearching );
                    if ( result !== false ) {
                        if (this.selected || this.isDownloading) {
                            // Let's perform a final status check in order to update statistics on pagination
                            if (!this.isDownloading && this.id) {
                                const response: AlSearchStatusV2 = await AlSearchClientV2.status(this.accountId, this.id);
                                this.searchDetails = response.details;
                            }
                            resolve( result );
                        }
                    } else {
                        checker.reschedule( 1000 );
                    }
                }
            } );
            checker.now();
        } );
    }

    public async deleteSearch(): Promise<boolean> {
        if (!this.id) {
            return false;
        }
        try {
            this.isCancelled = true;
            this.status = 'canceled';
            this.name = 'Canceled';
            this.progress = 0;
            await AlSearchClientV2.delete(this.accountId, this.id);
        } catch (error) {
            return false;
        }
        return true;
    }

    public setFromEpochtimeParams(): { [key: string]: string|undefined } {
        if (this.fetchParams && this.fetchParams.from_epochtime) {
            let fromEpochtime: { [key: string]: string|undefined } = {
                'from_epochtime.utc_offset': this.fetchParams.from_epochtime.utc_offset
            };
            // Let's check if we are setting a different date format type e.g. 'excel'
            if (this.fetchParams.from_epochtime.date_format) {
                fromEpochtime['from_epochtime.date_format'] = this.fetchParams.from_epochtime.date_format;
            }
            return fromEpochtime;
        }
        return {};
    }

    public setupError(errorName: string, errorMessage?: string) {
        this.name = errorName;
        this.isOnError = true;
        this.errorMessage = errorMessage;
        this.progress = 100;
    }

    public async checkSearchStatusTillCompletion(uuid?: string, isContinuing: boolean = false): Promise<boolean|undefined> {

        if (uuid) {
            // let's set the current query id as the one we just submitted,
            // this will be used as part of the following status check process
            this.id = uuid;
            this.submitSearchWorkflowData.originalUUID = uuid;
        }

        return new Promise<boolean|undefined>( ( resolve, reject ) => {
            let checker = AlStopwatch.once( async () => {
                // Let's check if the query was cancelled to avoid additional fetching
                if (this.isCancelled) {
                    resolve(undefined);
                } else {
                    let isComplete = await this.checkSubmitSearchStatus(isContinuing);
                    // if we have got a complete submit or some error then
                    // we will fetch the results or resolve with the error
                    if (isComplete !== false) {
                        resolve(isComplete);
                    } else { // otherwhise we will keep seeking for complete status
                        checker.reschedule( 1000 );
                    }
                }
            } );
        } );
    }

    protected async checkSubmitSearchStatus(isContinuing: boolean = false): Promise<boolean> {
        // Let's instantiate GA service and related variables
        let googleAnlyticsService = new AlGoogleAnalyticsService();
        const actionName: string = 'Retry';
        const successLabel: string = 'Success';
        const failedLabel: string = 'Failed';

        if (!this.id) {
            return false;
        }
        try {
            const response: AlSearchStatusV2 = await AlSearchClientV2.status(this.accountId, this.id);
            const status: string = response.search_status;
            if (status === 'pending') {
                this.progress = response.progress || 0;
                return false;
            } else if (status === 'failed') {
                // if we do not want to perform the retry workflow then we just need to
                // break it and return the exception in order to show the backend message
                if (!this.shouldRetry) {
                    throw new SearchSubmitError(response.external_details);
                }
                // Otherwise we should start up the different status and verifications workflow
                let shouldWait: boolean = false;
                // If we are getting an authoritative_retry it means we have a successful retry
                // then we assign this to the id and fetch results using thie new uuid
                if (response.authoritative_retry) {
                    this.id = response.authoritative_retry;
                    // Let's send the particular event when retrying
                    googleAnlyticsService.sendEvent(actionName, AlTrackingMetricEventCategory.SearchAction, successLabel);

                    return true;
                // If we are not getting an authoritative_retry then we need to check for the last
                // retried_buy uuid and perform the whole workflow again, if not present then we need
                // to wait between 3-5 seconds but if still not present then we take it as a failure
                } else if (response.retried_by) {
                    const retriedByUUID: string|undefined = response.retried_by.pop();
                    if (retriedByUUID && !this.submitSearchWorkflowData.retriedByUUID) {
                        this.id = retriedByUUID;
                        // Let's track it after the first retry including retried_by property in order
                        // to full stop the process if this uuid fails again (only one retry attempt)
                        this.submitSearchWorkflowData.retriedByUUID = retriedByUUID;
                        return false;
                    } else {
                        shouldWait = true;
                    }
                } else {
                    shouldWait = true;
                }
                // if there's no retried_by field, check again for about 4 times tops
                // (meaning 5 seconds, we should not get there but it is a contingency measure)
                if (shouldWait && this.submitSearchWorkflowData.retryCount! <= 4) {
                    this.submitSearchWorkflowData.retryCount!++;
                    return false;
                }
                // Let's send the particular event when retrying
                googleAnlyticsService.sendEvent(actionName, AlTrackingMetricEventCategory.SearchAction, failedLabel);

                throw new SearchSubmitError(response.external_details);
            } else if (status === 'complete') {
                // Let's set the search details for outer access
                this.searchDetails = response.details;

                // if we do not want to perform the retry workflow then we just need
                // to break it and return true in order to use the latest valid uuid
                if (!this.shouldRetry) {
                    return true;
                }
                // if there is a failed with retried_by means we got into a failure
                // and we got a complete status from the new retried_by uuid so we
                // need to check the different cases in this particular workflow
                if (this.submitSearchWorkflowData.retriedByUUID) {
                    // NOTE: This conditional will be only valid when the next one is executed
                    // if the current uuid we are verifying after failure is the original one it means
                    // we need to check if this retried_by is equals the authoritative_retry if not we
                    // full stop and return the error structure
                    if (this.id === this.submitSearchWorkflowData.originalUUID) {
                        if (response.authoritative_retry === this.submitSearchWorkflowData.retriedByUUID) {
                            this.id = this.submitSearchWorkflowData.retriedByUUID;
                            return true;
                        }
                        // Let's send the particular event when retrying
                        googleAnlyticsService.sendEvent(actionName, AlTrackingMetricEventCategory.SearchAction, failedLabel);

                        throw new SearchSubmitError(response.external_details);
                    }
                    // if the authoritative_id is not equal to the retried_by uuid then we need
                    // to use the original uuid, get the status back and check all again. Previous
                    // conditional will be executed only after this one is met and this.id assigned
                    if (response.authoritative_retry !== this.submitSearchWorkflowData.retriedByUUID) {
                        this.id = this.submitSearchWorkflowData.originalUUID;
                        return false;
                    }
                    // Let's send the particular event when retrying
                    googleAnlyticsService.sendEvent(actionName, AlTrackingMetricEventCategory.SearchAction, successLabel);

                    // if none of the aboved are met then we can return and use current id to fetch results
                    return true;
                }

                // otherwise it means we are getting an initial successful submit
                // so we can return and use current id to fetch results
                return true;
            } else if (status === 'suspended') {
                // under suspended state we need to check if we are performing a continue proccess in order
                // to keep checking the status (false) otherwise is because it is an interactive partial search
                // so we need to break and return the results untill that moment (true)
                if (!isContinuing) {
                    // Let's set the search details for outer access
                    this.searchDetails = response.details;

                    return true;
                }
                return false;
            }
            return true;
        } catch (error) {
            console.log(error);
            this.setupError('Search failed', error.data?.error || 'Search submit has failed');
            return error;
        }
    }

    protected async checkFetchResults(outputType: 'json'|'csv' = 'json', getResults: boolean = false, transformResults: boolean = true, continueSearching: boolean = false): Promise<boolean|AlSearchGetV2> {
        if (!this.id) {
            return false;
        }
        let fetchParams: AlSearchResultsQueryParamsV2 = {};

        // Let's check if we want to get results from pagination
        // or if we are just fetching the whole available ones
        if (getResults) {
            // Let's set only the required fetch params
            if (this.fetchParams) {
                fetchParams.limit = this.fetchParams.limit;
                fetchParams.offset = this.fetchParams.offset;
            }
            Object.assign(fetchParams, this.setFromEpochtimeParams());
        } else {
            // Let's set the limit fetch param only if we are not
            // trying to export the csv version for the results
            if (outputType !== 'csv') {
                fetchParams.limit = LIMIT;
            }
            if (this.fetchParams) {
                Object.assign(fetchParams, this.setFromEpochtimeParams());
            }
        }
        // Fallback status call to use the export endpoint instead
        // of the transform one to get the csv results (all of them)
        let exportResults: boolean = false;
        if (outputType === 'csv') {
            // Let's check if status is already complete to avoid additional call to status endpoint
            const status: string|undefined = (this.status === 'complete')?
                                                (await AlSearchClientV2.status(this.accountId, this.id)).search_status :
                                                this.status;
            // when complete we will use export endpoint
            if (status === 'complete') {
                exportResults = true;
            }
        }
        try {
            let promise: Promise<AlSearchGetV2|any>;
            if (getResults && !transformResults) {
                promise = AlSearchClientV2.get(this.accountId, this.id, fetchParams);
            } else {
                promise = AlSearchStylist.searchStylist(this.accountId, this.id, outputType, fetchParams, exportResults);
            }
            let response: any|AlSearchGetV2 = await promise;
            // Let's check if we are getting a success response but the search status is failed
            // in order to handle the error as any other http one (throwing exception)
            if ((response as AlSearchGetV2).search_status === 'failed') {
                // Here we are setting up a custom error response with the same
                // structure as the http ones we get from the backend
                throw { status: 999, data: { error: (response as AlSearchGetV2).external_details } };
            }

            if (outputType !== 'csv') {
                this.status = response.search_status;
                this.nResults = (response.total_found) ? response.total_found :
                                (response.search_status === 'suspended') ? this.fetchParams?.offset + response.results?.records.length : 0;
                this.progress =  (this.status !== 'pending')? response.progress || 100 : response.progress || 0;
                this.remaining = (this.fetchParams?.offset || 0) + response.results?.records.length + response.remaining;
                if (!getResults) {
                    return [ 'suspended', 'complete' ].includes( response.search_status );
                }
            }
            // Let's emit the response in case
            // we are requesting the CSV export
            if (outputType === 'csv') {
                return response;
            }
            // Let's handle the recursive calls in order
            // to loop until first suspended/complete and
            // if required return the results to be viewed
            if (['suspended', 'complete'].includes(response.search_status)) {
                if ((getResults && !continueSearching) || (continueSearching && response.search_status === 'complete')) {
                    return response;
                }
            }
            return false;
        } catch(error) {
            // Let's check if we are getting one error different from
            // timeout (which is needed by the FIM big fat-ass CSVs)
            // and return this error to be handled on the consumer app
            if (error?.status) {
                let action: string = "Search";
                if (outputType === 'csv') {
                    action = "Download";
                }
                this.setupError(`${action} failed`, error.data?.error || 'Search fetching has failed');
                return error;
            }
            return false;
        }
    }
}
