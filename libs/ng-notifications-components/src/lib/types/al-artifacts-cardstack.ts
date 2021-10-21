import {
    ALCargoV2,
    ExecutionRecordsQueryParamsV2,
    ExecutionRecordV2,
} from '@al/cargo';
import {
    AlCardstackCharacteristics,
    AlCardstackView,
    AlSearchClientV2,
} from '@al/core';
import { ALGestaltNotifications } from '@al/gestalt';
import { AlCardstackViewCharacteristics } from '@al/ng-cardstack-components';
import { AlToolbarContentConfig, AlFilterDescriptor } from '@al/ng-generic-components';
import { AlNotificationDictionariesUtility } from '../services/al-notification-dictionaries-utility';
import {
    AlArtifactsDefinition,
    AlArtifactsProperties,
} from './al-artifacts-definition';
import { subDays } from 'date-fns';

export class AlArtifactsCardstack
    extends AlCardstackView<AlArtifactsDefinition, AlArtifactsProperties, AlCardstackViewCharacteristics>
{
    public actingAccountId?: string;

    public toolbarDetails: AlToolbarContentConfig = {
        showSelectAll: true,
        selectAll: false,
        showGroupBy: false,
        showSortBy: true,
        showSearch: true,
        sort:{
            options: [],
            selectedOption: 'scheduledTime',
            order: 'desc'
        },
        search: {
            textPlaceHolder: "Search by Report ID",
        },
    };
    public filterConfig : AlFilterDescriptor = {
        showFiltersCount :false,
        hideNotSelectedValues: true
    };
    public dictionaries = new AlNotificationDictionariesUtility();
    public filterByReportId: string = '';

    constructor(public type:string = 'artifacts') {
        super();
        if(type === 'scheduled_search' && this.toolbarDetails.search){
            this.toolbarDetails.search.textPlaceHolder = "search by search result ID";
        }
    }

    setAccount(accountId: string) {
        this.actingAccountId = accountId;
        this.generateCharacteristics();
    }

    public artifactsCharacteristics():Promise<AlCardstackCharacteristics> {
        if( ! this.actingAccountId ) {
            throw new Error("actingAccountId must be defined");
        }

        return ALGestaltNotifications.getNotificationsCharacteristics(this.actingAccountId, this.type);
    }

    /** Build an array with 2 dates: today and date corresponding to last 30 days */
    public getDefaultDateRange():Date[] {
        let endTime =  new Date();
        endTime.setHours(23);
        endTime.setMinutes(59);
        endTime.setSeconds(59);

        let startTime = subDays(endTime,30);
        startTime.setHours(0);
        startTime.setMinutes(0);
        startTime.setSeconds(0);

        return [startTime, endTime];
    }

    /** this is call in the start */
    public async generateCharacteristics(): Promise<AlCardstackViewCharacteristics> {
        const defaultDate= this.getDefaultDateRange();
        const characteristics: AlCardstackViewCharacteristics = await this.artifactsCharacteristics();

        characteristics.header = {
            icon: undefined,
            title: characteristics.entity.caption,
            descriptionBelowHeader: characteristics.entity.description ? characteristics.entity.description : undefined,
            calendar:  'range',
            addButton: false,
            defaultDate: this.getDefaultDateRange()
        };
        characteristics.toolbarConfig = this.toolbarDetails;
        this.sortOrder = 'desc' ;
        this.dateRange = defaultDate;

        this.dictionaries = new AlNotificationDictionariesUtility();
        this.dictionaries.createDictionaries(characteristics);
        characteristics.alFilterConfig = this.filterConfig;
        characteristics.alFilterConfig.filterValueIncrement = characteristics.filterValueIncrement;
        characteristics.alFilterConfig.filterValueLimit = characteristics.filterValueLimit;
        characteristics.alFilterConfig.hideEmptyFilterValues = characteristics.hideEmptyFilterValues;

        return characteristics;
    }

    /**
     * build the query to call list execution record
     */
    public buildExecutionQueryParams(): ExecutionRecordsQueryParamsV2 {
        let listType:string = this.type === 'artifacts' ? 'tableau' : 'search_v2';
        let queryParams = {
            limit: this.itemsPerPage,
            type: listType,
            status: 'completed',
            order: this.sortOrder
        } as ExecutionRecordsQueryParamsV2;

        if ( this.dateRange && this.dateRange.length > 0 ) {

            if ( this.dateRange.length === 2 && this.dateRange[0] instanceof Date && this.dateRange[1] instanceof Date ) {
                queryParams.start_time= Math.round(this.dateRange[0].getTime() / 1000);
                queryParams.end_time= Math.round(this.dateRange[1].getTime() / 1000);
            } else {
                if ( this.dateRange[0] instanceof Date ) {
                    queryParams.start_time= Math.round(this.dateRange[0].getTime() / 1000);
                    queryParams.end_time= Math.round(( this.dateRange[0].getTime() + (1000*60*60*24) )/ 1000); // next day
                }
            }
        }
        // this need a bit refactoring...
        this.activeFilters.forEach(filter=>{
            if(filter.propField === 'scheduleName'){
                queryParams.schedule_id = filter.rawValues[0];
            }
            if(filter.propField === 'display'){
                queryParams.latest_only = filter.rawValues[0] === "true" ? true: undefined;
            }
        });

        if (this.continuation ) {
            queryParams.continuation = this.continuation;
        }

        return queryParams;
    }

    /**
     * Retrieve data from the API.
     * This method should resolve with a detailed model of a single execution record.
     */
    public getOneExecutionRecordById(actingAccountId: string, reportId: string): Promise<AlArtifactsDefinition[]> {
        return ALCargoV2.getExecutionRecord(
            actingAccountId,
            reportId
        ).then(
            (item:ExecutionRecordV2): AlArtifactsDefinition[] => {
                this.continuation = undefined;
                this.remainingPages = 0;
                return [this.complementIds( new AlArtifactsDefinition(item) )];
            }
        ).catch(_ => {
            return [];
        });
    }

    /**
     * Retrieve data from the API.
     * This method should resolve with a detailed model of the array of result data.
     */
    public fetchData(): Promise<AlArtifactsDefinition[]> {
        if(!this.actingAccountId){
            throw new Error("actingAccountId must be defined");
        }
        if (this.filterByReportId) {
            return this.getOneExecutionRecordById(this.actingAccountId, this.filterByReportId);
        }
        let queryParams = this.buildExecutionQueryParams();

        return ALCargoV2.getListExecutionRecords(
            this.actingAccountId,
            queryParams
        ).then(
            (results:any): AlArtifactsDefinition[] => {
                if( results.continuation ){
                    this.continuation = results.continuation;
                    this.remainingPages = 1;
                } else{
                    this.continuation = undefined;
                    this.remainingPages = 0;
                }
                const items = results.execution_records;
                return items.map((item:ExecutionRecordV2): AlArtifactsDefinition => {
                    let artifact = new AlArtifactsDefinition(item);
                    const resultId = artifact.properties.artifactData?.result_id;
                    if (this.type === 'search_v2' && resultId && artifact.properties.subtitle) {
                        AlSearchClientV2.get(this.actingAccountId!, resultId).then(test => {
                            artifact.properties.subtitle! += ` (${test.total_found} result${test.total_found !== 1 ? 's' : ''})`;
                        });
                    }
                    this.complementIds(artifact);
                    return artifact;
                });
            } );
    }

    /**
     * Add complementary information to the account ids, user ids, etc
     * */
    public complementIds(item: AlArtifactsDefinition ): AlArtifactsDefinition {
        if (item.properties) {
            if (item.properties.viewId) {
                item.properties.toptitle = this.dictionaries.getValueDictonary(item.properties.viewId, this.dictionaries.viewDictionary);
            }
        }
        return item;
    }

    /**
     * Convert a backend entity into a generic property set.
     * This allows sorting, filtering, grouping, and segmenting to be handled using a low-level class that doesn't need to know anything
     * about our particular entities or services.
     */
    public deriveEntityProperties(item: AlArtifactsDefinition): AlArtifactsProperties {
        return item.properties;
    }

    public async batchDelete(ids: string[]): Promise<boolean> {
        try {
            if(!this.actingAccountId){
                throw new Error("actingAccountId must be defined");
            }
            await ALCargoV2.batchDeleteExecutionRecords(this.actingAccountId, ids);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    public applyTextFilter(searchValue: string): boolean {
        if (!this.filterByReportId) {
            this.filterByReportId = searchValue;
            this.start();
        }
        this.filterByReportId = '';
        return true;
    }
}
