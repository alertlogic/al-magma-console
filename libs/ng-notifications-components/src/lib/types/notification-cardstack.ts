import {
    AIMSClient,
    AIMSUser,
    AlCardstackCharacteristics,
    AlCardstackItem,
    AlCardstackView,
    SQXSearchQuery,
    AlCardstackValueDescriptor,
    AlCardstackActiveFilter,
} from '@al/core';
import {
    AlGenericAlertDefinition,
    ALGestaltNotifications,
    AlIncidentAlertProperties,
    AlScheduledReportProperties,
    CharacteristicsUtility,
} from '@al/gestalt';
import { AlHeraldSubscribersV2 } from '@al/herald';
import { AlCardstackViewCharacteristics } from '@al/ng-cardstack-components';
import {
    AlStateFilterDescriptor,
    AlToolbarContentConfig,
    AlFilterDescriptor,
} from '@al/ng-generic-components';
import { formatDate } from '@angular/common';
import { AssetFilterOption, AssetFilterUnpacker } from '../services/al-health-notification-utility';
import { AlNotificationDictionariesUtility } from '../services/al-notification-dictionaries-utility';

export class AlNotificationCardstack
    extends AlCardstackView<AlGenericAlertDefinition, AlIncidentAlertProperties & AlScheduledReportProperties, AlCardstackViewCharacteristics>
{
    public offset: string = 'initial';
    public actingAccountId?: string;

    public aggregatableList: AlGenericAlertDefinition[] = [];       //  This is the subset of the items in the current view that should be used for client-side filter aggregation
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


    public stateFiltersInitial: Array<{value:AlStateFilterDescriptor}> = [
        { value:{ label:'Active', key: true, iconClass: 'material-icons', icon: 'check_circle', showTotal: true, totalShowing:0, total:0 }},
        { value:{ label:'Inactive', key: false, iconClass: 'material-icons', icon: 'block', showTotal: true, totalShowing:0, total:0}},
    ];
    public alFilterConfig : AlFilterDescriptor = {
        showFiltersCount :false
    };

    public selectedStateInitial: AlStateFilterDescriptor = this.stateFiltersInitial[0].value;

    public dictionaries = new AlNotificationDictionariesUtility();

    public version:number = 0;

    private allUsersRelated: AIMSUser[] = [];

    constructor( public viewName?: string) {
        super();
        this.itemsPerPage = Number.MAX_SAFE_INTEGER;
    }

    async setAccount(accountId: string) {
        this.actingAccountId = accountId;
        this.aggregatableList = [];
        this.allUsersRelated = await this.getAllUsersRelated();
    }

    public alertCharacteristics():Promise<AlCardstackCharacteristics> {
        if(!this.actingAccountId){
            throw new Error("actingAccountId must be defined");
        }
        return ALGestaltNotifications.getNotificationsCharacteristics(this.actingAccountId, this.viewName || '');
    }

    /**
     * Create dictionary for users and accounts
     * @param characteristics
     */
    public createDictionaries(characteristics: AlCardstackCharacteristics): void {
        if (characteristics) {
            this.dictionaries = new AlNotificationDictionariesUtility();
            this.dictionaries.createDictionaries(characteristics);
        }
    }

    /** this is call in the start */
    public async generateCharacteristics(): Promise<AlCardstackViewCharacteristics> {
        const characteristics: AlCardstackViewCharacteristics = await this.alertCharacteristics();
        characteristics.definitions.users.values = CharacteristicsUtility.processWithIdAndName(this.allUsersRelated, characteristics.definitions.users.property);

        characteristics.header = {
            icon: characteristics.entity.metadata.icon ? characteristics.entity.metadata.icon : undefined,
            description: characteristics.entity.description ? characteristics.entity.description : undefined,
            title: characteristics.entity.caption,
            calendar: characteristics.entity.metadata.calendar ? characteristics.entity.metadata.calendar : false,
            addButton: characteristics.entity.metadata.addButton ? characteristics.entity.metadata.addButton : false
        };

        characteristics.toolbarConfig = this.toolbarDetails;
        characteristics.selectedState = this.selectedStateInitial;
        characteristics.stateFilters = this.stateFiltersInitial;
        characteristics.localPagination = true;

        characteristics.alFilterConfig = this.alFilterConfig;
        characteristics.alFilterConfig.filterValueIncrement = characteristics.filterValueIncrement;
        characteristics.alFilterConfig.filterValueLimit = characteristics.filterValueLimit;
        characteristics.alFilterConfig.hideEmptyFilterValues = characteristics.hideEmptyFilterValues;

        this.createDictionaries(characteristics);
        if (this.toolbarDetails.sort && this.toolbarDetails.sort.selectedOption && this.toolbarDetails.sort.order) {
            this.sortingBy = characteristics.definitions[this.toolbarDetails.sort.selectedOption];
            this.sortOrder = this.toolbarDetails.sort.order;
        }
        return characteristics;
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
        this.version = this.version + 1;
        if ( ! this.actingAccountId || ! this.characteristics ) {
            throw new Error("actingAccountId and characteristics must be defined before fetchData is called");
        }

        let notificationsList = ( await ALGestaltNotifications.getNotificationsList( this.actingAccountId, this.viewName || '', this.version ) )
                                .map( item => this.complementNotificationMetadata( new AlGenericAlertDefinition( item ) ) );

        this.preAggregateSummary( notificationsList );          //  Snapshot prefiltered aggregation details

        if ( this.characteristics && this.characteristics.selectedState && this.characteristics.stateFilters ) {
            //  Filter by selected state (active/inactive/whatever)
            notificationsList = notificationsList.filter( item => item.properties.active === this.characteristics!.selectedState!.key );
        }

        this.aggregatableList = [ ...notificationsList ];
        this.setReduceFilters( notificationsList );

        return notificationsList;
    }

    /**
     * Add complementary information to the account ids, user ids, etc
     * */
    public complementNotificationMetadata( item: AlGenericAlertDefinition ): AlGenericAlertDefinition {
        if ( ! item.properties ) {
            throw new Error("Internal error: cannot process notification item without properties." );
        }

        //  First, verify that certain properties we rely on exist and are valid
        item.properties.users = item.properties.users || [];
        item.properties.usersName = item.properties.usersName || [];
        item.properties.searchables = item.properties.searchables || [];
        item.properties.integrations = item.properties.integrations || [];
        item.properties.integrationsName = item.properties.integrationsName || [];

        //  Second, annotate server side data with client side data
        if (item.properties.createdBy) {
            item.properties.createdByName = this.dictionaries.getUserName(item.properties.createdBy);
        }
        if (item.properties.modifiedBy) {
            item.properties.modifiedByName = this.dictionaries.getUserName(item.properties.modifiedBy);
        }
        if (item.properties.subscribers) {
            this.complementSubscribers( item, item.properties.subscribers );
        }

        if ( item.properties.filters && ! item.properties.filtersParsed ) {
            try {
                item.properties.filtersParsed = SQXSearchQuery.fromJson( item.properties.filters );
            } catch ( e ) {
                console.warn(`Warning: failed to evaluate filters for item with ID '${item.id}'; ignoring filter data.`, e );
            }
        }

        if (item.properties.lastMessageSent ) {
            const date = formatDate(item.properties.lastMessageSent * 1000, 'MMM dd yyyy HH:mm:ss z', "en-US");
            item.properties.subtitle = `Most recent notification sent: ${date?date:'unknown'}`;
        } else {
            item.properties.subtitle = `Most recent notification sent: No notifications sent.`;
        }

        // Adding deployments related to the subscription
        if (item.properties.filters && item.properties.filters !== {} && item.properties.filters.hasOwnProperty('and')) {
            const unpacker = new AssetFilterUnpacker(item.properties.filters['and']);
            const assets: AssetFilterOption[] = unpacker.extractAssets() as AssetFilterOption[];
            item.properties.deployments = assets.map( asset => asset['asset.deployment_id']);
        }

        try {
            switch (item.type.group) {
                case 'alert':
                    this.dictionaries.complementIncident(item);
                    if(item.type.notificationType === 'observations/notification'){
                        item.properties.toptitle = 'Observation';
                    }
                    break;
                case 'scheduled':
                    this.dictionaries.complementSchedule(item, this.actingAccountId);
                    item.properties.toptitle = item.properties.viewName;
                    break;
                default:
                    break;
            }
        } catch( e ) {
            console.warn(`Failed to complement item '${item.id}'; ignoring complement properties.`, e );
        }

        return item;
    }

    public complementSubscribers( item: AlGenericAlertDefinition, subscribers:AlHeraldSubscribersV2[] ) {
        subscribers.forEach( subscriber => {
            if (subscriber.subscriber_type === "user") {
                let userName: string | undefined = "";
                const isCreator = subscriber.subscriber === item.properties.createdBy;
                // When the current user does not have permission to see some user names because they are users of a parent account
                // so we mask the user name with display_name
                if('display_name' in subscriber){
                    userName = ( subscriber as any ).display_name;
                } else if (this.dictionaries.userDictionary.hasOwnProperty(subscriber.subscriber)){
                    userName = this.dictionaries.getUserName(subscriber.subscriber);
                }
                if (userName) {
                    item.properties.users!.push(subscriber.subscriber);
                    item.properties.usersName!.push({isCreator, name: userName});
                    item.properties.searchables!.push(userName);
                }
            } else if ((subscriber.subscriber_type === "integration" || subscriber.subscriber_type === "connection") && this.dictionaries.webhookDictionary.hasOwnProperty(subscriber.subscriber)) {
                const webhookName = this.dictionaries.getWebhookName(subscriber.subscriber);
                if (webhookName) {
                    item.properties.integrations!.push(subscriber.subscriber);
                    item.properties.integrationsName!.push(webhookName);
                    item.properties.searchables!.push(webhookName);
                }
            }
            item.properties.recipientsTotal = item.properties.integrations!.length + item.properties.users!.length;
        });
    }

    /**
     * Convert a backend entity into a generic property set.
     * This allows sorting, filtering, grouping, and segmenting to be handled using a low-level class that doesn't need to know anything
     * about our particular entities or services.
     */
    public deriveEntityProperties(item: AlGenericAlertDefinition): AlIncidentAlertProperties {
        return item.properties;
    }

    public removeItems(ids: string[], hierarchyType: string): Promise<boolean> {
        if (!this.actingAccountId) {
            throw new Error("actingAccountId must be defined");
        }

        try {
            return ALGestaltNotifications.deleteEntity(this.actingAccountId, hierarchyType, ids);
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
