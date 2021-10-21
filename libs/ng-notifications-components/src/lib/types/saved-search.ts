import {
    AIMSClient,
    AIMSUser,
    AlCardstackItem,
    AlCardstackView,
    AlCardstackValueDescriptor,
    AlCardstackActiveFilter
} from '@al/core';
import {
    AlGenericAlertDefinition,
    AlIncidentAlertProperties,
    AlScheduledReportProperties,
    CharacteristicsUtility,
} from '@al/gestalt';
import { AlSuggestionsClientV2, AlSavedQueryV2, AlSavedQueriesV2 } from '@al/suggestions';
import { AlCardstackViewCharacteristics } from '@al/ng-cardstack-components';
import {
    AlToolbarContentConfig, AlFilterDescriptor,
} from '@al/ng-generic-components';
import { ALCargoV2, ScheduledReportListV2, ScheduledReportV2, SearchReportDefinitionV2 } from '@al/cargo';

export class AlSavedSearchComponent
    extends AlCardstackView<AlGenericAlertDefinition, AlIncidentAlertProperties & AlScheduledReportProperties, AlCardstackViewCharacteristics>
{
    public offset: string = 'initial';
    public actingAccountId?: string;

    public aggregatableList: AlGenericAlertDefinition[] = [];// This is the subset of the items in the current view that should be used for client-side filter aggregation
    public toolbarDetails: AlToolbarContentConfig = {
        showSelectAll: true,
        selectAll: false,
        showGroupBy: true,
        group:{
            options:[]
        },
        showSortBy: true,
        sort: {
            options: [],
            selectedOption: 'caption',
            order: 'asc'
        },
        search: {
            textPlaceHolder: "search",
        },
    };

    private allUsersRelated: AIMSUser[] = [];
    private savedQueries!: AlSavedQueriesV2;
    private emptySavedQueries:AlSavedQueriesV2 = {
        queries: [],
        stats: {
            data_type: {},
            tags: {}
        }
    };

    constructor() {
        super();
        this.itemsPerPage = 20;
    }

    async setAccount(accountId: string) {
        this.actingAccountId = accountId;
        this.aggregatableList = [];
        this.savedQueries = Object.assign( {}, this.emptySavedQueries );
        this.allUsersRelated = await this.getAllUsersRelated();
        await this.start();
    }

    getSavedQueries = async() => {
        if ( ! this.actingAccountId ) {
            throw new Error("actingAccountId and characteristics must be defined before fetchData is called");
        }
        this.savedQueries = await AlSuggestionsClientV2.getSavedQueries(this.actingAccountId);
    }

    /** this is call in the start */
    public async generateCharacteristics(): Promise<AlCardstackViewCharacteristics> {
        const characteristics: AlCardstackViewCharacteristics = {
            entity: {
                property: "Saved Search",
                caption: "Saved Searches",
                values: [],
                metadata: {}
            },
            groupableBy: [
                "scheduled",
                "tags",
                "dataTypes"
            ],
            sortableBy: [
                "createdTime",
            ],
            filterableBy: [
                "scheduled",
                "tags",
                "dataTypes"
            ],
            searchableBy: [
                "caption",
                "id",
                "tags"
            ],
            definitions: {
                users: CharacteristicsUtility.getUsersDefinition(),
                "scheduled": {
                    "domain": "",
                    "metadata": {},
                    "property": "scheduled",
                    "caption": "Scheduled Search",
                    "captionPlural": "Scheduled Searches",
                    "values": [
                      {
                        "property": "scheduled",
                        "captionPlural": "",
                        "value": true,
                        "caption": "Scheduled",
                        "valueKey": "true"
                      },
                      {
                        "property": "scheduled",
                        "captionPlural": "",
                        "value": false,
                        "caption": "Not Scheduled",
                        "valueKey": "false"
                      }
                    ]
                },
                "tags": {
                    "domain": "",
                    "metadata": {},
                    "property": "tags",
                    "caption": "Tag",
                    "captionPlural": "Tags",
                    "values": await this.generateTagsCharacteristics()
                },
                "dataTypes": {
                    "domain": "",
                    "metadata": {},
                    "property": "dataTypes",
                    "caption": "Data Type",
                    "captionPlural": "Data Types",
                    "values": await this.generateDataTypesCharacteristics()
                },
                "createdTime": {
                    "domain": "",
                    "metadata": {},
                    "property": "createdTime",
                    "caption": "Date",
                    "captionPlural": "Dates",
                    "values": []
                }
            },
            greedyConsumer: false,
            filterValueLimit: 15,
            filterValueIncrement: 15,
            hideEmptyFilterValues: false,
            localPagination: true,
            remoteSearch: false,
        };

        characteristics.definitions.users.values = CharacteristicsUtility.processWithIdAndName(this.allUsersRelated, characteristics.definitions.users.property);

        characteristics.header = {
            icon: characteristics?.entity?.metadata?.icon,
            description: characteristics?.entity?.description,
            title: characteristics?.entity?.caption,
            calendar: characteristics?.entity?.metadata?.calendar || false,
            addButton: characteristics?.entity?.metadata?.addButton || false
        };

        characteristics.toolbarConfig = this.toolbarDetails;
        characteristics.localPagination = true;

        characteristics.alFilterConfig = {showFiltersCount: false} as AlFilterDescriptor;
        characteristics.alFilterConfig.filterValueIncrement = characteristics.filterValueIncrement;
        characteristics.alFilterConfig.filterValueLimit = characteristics.filterValueLimit;
        characteristics.alFilterConfig.hideEmptyFilterValues = characteristics.hideEmptyFilterValues;

        if (this.toolbarDetails.sort && this.toolbarDetails.sort.selectedOption && this.toolbarDetails.sort.order) {
            this.sortingBy = characteristics.definitions[this.toolbarDetails.sort.selectedOption];
            this.sortOrder = this.toolbarDetails.sort.order;
        }

        return characteristics;
    }

    public async generateTagsCharacteristics(): Promise<AlCardstackValueDescriptor[]> {
        // Let's check if we have not already loaded the information about the saved queries (queries and stats)
        if (!this.savedQueries) {
            await this.getSavedQueries();
        }
        let tags: AlCardstackValueDescriptor[] = [];
        for (const [tagName, value] of Object.entries(this.savedQueries.stats.tags)) {
            tags.push({
                property: "tags",
                captionPlural: tagName,
                value: tagName,
                caption: tagName,
                valueKey: tagName,
                count: value
            });
        }
        return tags;
    }

    public async generateDataTypesCharacteristics(): Promise<AlCardstackValueDescriptor[]> {
        // Let's check if we have not already loaded the information about the saved queries (queries and stats)
        if (!this.savedQueries) {
            await this.getSavedQueries();
        }
        let dataTypes: AlCardstackValueDescriptor[] = [];
        for (const [dataType, value] of Object.entries(this.savedQueries.stats.data_type)) {
            dataTypes.push({
                property: "dataTypes",
                captionPlural: dataType,
                value: dataType,
                caption: dataType,
                valueKey: dataType,
                count: value
            });
        }
        return dataTypes;
    }

    /**
     * This method is called to calculate status totals *before* filtering is applied.
     */
    public preAggregateSummary( alerts:AlGenericAlertDefinition[] ) {
        if ( this.characteristics && this.characteristics.stateFilters && this.characteristics.stateFilters.length >= 2 ) {
            this.characteristics.stateFilters[0].value!.total = alerts.filter(alert => alert.properties!.active).length;
            this.characteristics.stateFilters[1].value!.total = alerts.filter(alert => !alert.properties!.active).length;
        }
    }

    /**
     * This method is called to calcualte status totals *after* filtering is applied.
     */
    public postAggregateSummary( visibleItems:AlCardstackItem[] ) {
        if ( this.characteristics && this.characteristics.stateFilters && this.characteristics.stateFilters.length >= 2 ) {
            this.characteristics.stateFilters[0].value.totalShowing = visibleItems.filter( item => item.properties!.active ).length;
            this.characteristics.stateFilters[1].value.totalShowing = visibleItems.filter( item => !item.properties!.active ).length;
        }
    }

    public onCardsChanged() {
        this.postAggregateSummary( this.cards );
    }

    /**
     * Retrieve data from the API.
     * This method should resolve with a detailed model of the array of result data.
     */
    public async fetchData(): Promise<AlGenericAlertDefinition[]> {
        if ( ! this.actingAccountId || ! this.characteristics ) {
            throw new Error("actingAccountId and characteristics must be defined before fetchData is called");
        }
        await this.getSavedQueries();
        let savedQueries: AlSavedQueryV2[] = this.savedQueries.queries;

        const schedulesDict: {[id: string]: ScheduledReportV2[]} = await ALCargoV2.getAllSchedules(this.actingAccountId as string, "search_v2").then(
            (result: ScheduledReportListV2) => {
                let dict: {[id: string]: ScheduledReportV2[]} = {};
                result.schedules.forEach(schedule => {
                    const savedSearch = (schedule.definition as SearchReportDefinitionV2).saved_query_id;
                    if (!dict.hasOwnProperty(savedSearch)) { dict[savedSearch] = []; }
                    dict[savedSearch].push(schedule);
                });
                return dict;
            }
        );

        let itemList: AlGenericAlertDefinition[] = savedQueries.map((query: AlSavedQueryV2) => {
            let item = {
                id: query.id,
                caption: query.name,
                properties: query as any
            };
            item.properties.id = query.id;
            item.properties.caption = query.name;
            item.properties.createdTime = query.created.at;
            item.properties.tags = query.tags || [];
            item.properties.dataTypes = query.data_type || "";
            item.properties.schedulesTotal = (schedulesDict[item.properties.id] || []).length;
            item.properties.schedules = (schedulesDict[item.properties.id] || []);
            item.properties.scheduled = item.properties.schedulesTotal >= 1;
            return item as AlGenericAlertDefinition;
        });

        this.preAggregateSummary( itemList );// Snapshot prefiltered aggregation details

        if ( this.characteristics && this.characteristics.selectedState && this.characteristics.stateFilters ) {
            //  Filter by selected state (active/inactive/whatever)
            itemList = itemList.filter( (item: any) => item.properties.active === this.characteristics!.selectedState!.key );
        }

        this.aggregatableList = [ ...itemList ];

        this.setReduceFilters( itemList );

        return itemList;
    }

    /**
     * Convert a backend entity into a generic property set.
     * This allows sorting, filtering, grouping, and segmenting to be handled using a low-level class that doesn't need to know anything
     * about our particular entities or services.
     */
    public deriveEntityProperties(item: AlGenericAlertDefinition): AlIncidentAlertProperties {
        return item.properties;
    }

    public removeItems(ids: string[]): Promise<boolean> {
        if (!this.actingAccountId) {
            throw new Error("actingAccountId must be defined");
        }

        try {
            const deleteRequests = ids.map(id => AlSuggestionsClientV2.updateSavedQuery(
                this.actingAccountId as string,
                id,
                {deleted: true})
            );

            return Promise.all(deleteRequests).then(
                () => Promise.resolve(true),
                (error) => {
                    console.error(error);
                    return Promise.reject();
                }
            );
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    public applyFilterBy(vDescriptor: AlCardstackValueDescriptor) {
        return super.applyFilterBy(vDescriptor, this.customeFilterCb);
    }

    private customeFilterCb(entity: AlGenericAlertDefinition, properties: any, filter: AlCardstackActiveFilter<AlGenericAlertDefinition, AlIncidentAlertProperties>) {
        let value = filter.property.property in properties ? properties[filter.property.property] : null;
        return filter.values.find(vDescr =>  value instanceof Array  ? value.includes(vDescr.value) : vDescr.value === value) ? true : false;
    }

    private async getAllUsersRelated(): Promise<AIMSUser[]>{
        if (!this.actingAccountId) {
            throw new Error("actingAccountId must be defined");
        }
        const accountsIds = await AIMSClient.getAccountsIdsByRelationship(this.actingAccountId, 'managing');
        return await AIMSClient.getUsersFromAccounts(accountsIds);
    }

    private setReduceFilters(definitions: AlGenericAlertDefinition[]) {
        Object.keys(this.reduceFilters).forEach((filter) => {
            this.reduceFilters[filter] = [];
            definitions.forEach((item) => {
                if(filter in item.properties){
                    this.reduceFilters[filter] = this.reduceFilters[filter].concat((item.properties as any)[filter]);
                }
            });
        });
        // Removes duplicate values
        Object.keys(this.reduceFilters).forEach((filter) => {
            this.reduceFilters[filter] = Array.from(new Set(this.reduceFilters[filter]));
        });
    }

}


