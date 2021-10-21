import {
    AIMSAccount,
    AlCardstackCharacteristics,
    SQXComparatorEqual,
    SQXComparatorIn,
    SQXOperatorNegate,
    SQXSearchQuery,
    SQXComparatorNotEqual,
} from '@al/core';
import { AlGenericAlertDefinition } from '@al/gestalt';
import { startOfWeek } from 'date-fns';
import { CargoReportWeeklyScheduleV2, CargoReportMonthlyScheduleV2, CargoReportDailyScheduleV2 } from '@al/cargo';
import { AlHeraldClientV2, AlHeraldNotificationType } from '@al/herald';

/**
 * this is going to be used to complement information related to the alerts in the ui side
 */

export class AlNotificationDictionariesUtility {
    public subMenuDictionary: {[id: string]: string} = {};
    public workbookDictionary: {[id: string]: string} = {};
    public viewDictionary: {[id: string]: string} = {};
    public scheduleNameDictionary: {[id: string]: string} = {};
    public accountDictionary: {[id: string]: string} = {};
    public userDictionary: {[id: string]: string} = {};
    public webhookDictionary: {[id: string]: string} = {};
    public workbookBySubMenuDictionary: {[id: string]: string} = {};
    public workbookContentUrlDictionary: {[id: string]: string} = {};
    public workbookEmbedUrlDictionary: {[id: string]: string} = {};
    public viewFrequencyDictionary: {[id: string]: string[]} = {};
    public viewParentAccountOnlyDictionary: {[id: string]: boolean} = {};
    public notificationTypesMap: {[key: string]: AlHeraldNotificationType} = {};
    public viewFilterNames:{[id: string]: string[]} ={};

     /**
     * Create dictionary for users and accounts
     * @param characteristics
     */
    public createDictionaries(characteristics: AlCardstackCharacteristics): void {

        if (characteristics) {
            if (characteristics.definitions['accounts']) {
                 characteristics.definitions['accounts'].values.forEach((item) => this.accountDictionary[item.value] = item.caption);
            }
            if (characteristics.definitions['users']) {
                characteristics.definitions['users'].values.forEach((item) => this.userDictionary[item.value] = item.caption);
            }

            if (characteristics.definitions['integrations']) {
                characteristics.definitions['integrations'].values.forEach((item) => this.webhookDictionary[item.value] = item.caption);
            }

            if (characteristics.definitions['workbookId']) {
                characteristics.definitions['workbookId'].values.forEach((item) => {
                    this.workbookDictionary[item.value] = item.caption;
                    if (item.metadata !== undefined) {
                        this.workbookContentUrlDictionary[item.value] = item.metadata.content_url+"";
                    }
                });

            }
            if (characteristics.definitions['viewId']) {
                characteristics.definitions['viewId'].values.forEach((item) => {
                    this.viewDictionary[item.value] = item.caption;
                    if (item.metadata !== undefined) {
                        this.workbookEmbedUrlDictionary[item.value] = item.metadata.embed_url+"";
                        this.viewFrequencyDictionary[item.value] = item.metadata.scheduled_report ? item.metadata.scheduled_report as string[]: [];
                        this.viewParentAccountOnlyDictionary[item.value] = item.metadata.parent_account_only ? item.metadata.parent_account_only as boolean: false;
                        this.viewFilterNames[item.value] = item.metadata.filter_names ? item.metadata.filter_names as string[]: [];
                    }
                });
            }
            if (characteristics.definitions['workbookSubMenu']) {
                characteristics.definitions['workbookSubMenu'].values.forEach((item) => this.subMenuDictionary[item.value] = item.caption);
            }
            if (characteristics.definitions['workbookBySubmenu']) {
                characteristics.definitions['workbookBySubmenu'].values.forEach((item) => this.workbookBySubMenuDictionary[item.value] = item.caption);
            }
            if (characteristics.definitions['scheduleName']) {
                characteristics.definitions['scheduleName'].values.forEach((item) => this.scheduleNameDictionary[item.value] = item.caption);
            }
        }
    }

    /**
     * Return the value of a dictionary, in the case the value is not found return a default or undefined
     * @param id
     * @param dictionary
     * @param defaultValue
     */
    public getValueDictonary(id:string | undefined, dictionary:{[i:string]:string}, defaultValue?:string): string|undefined {
        if (!id) {
            return undefined;
        }
        if (dictionary.hasOwnProperty(id)) {
            return dictionary[id];
        }
        if (defaultValue) {
            return defaultValue;
        }
        return undefined;
    }

    public getUserName(userId:string):string|undefined {
        return this.getValueDictonary(userId, this.userDictionary);
    }

    public getAccountName(accountId:string):string|undefined {
        return this.getValueDictonary(accountId, this.accountDictionary);
    }

    public getWebhookName(integrationId:string):string|undefined {
        return this.getValueDictonary(integrationId, this.webhookDictionary);
    }

    public getScheduleName(scheduleId:string):string|undefined {
        return this.getValueDictonary(scheduleId, this.scheduleNameDictionary);
    }

    public getBaseReportFiltersSort(){
        return ['Report Type'];
    }

    public getCadenceName(schedule: any){
        if (schedule.hasOwnProperty('monthly')) {
            return 'monthly';
        }
        if (schedule.hasOwnProperty('weekly')) {
            return 'weekly';
        }
        if (schedule.hasOwnProperty('daily')) {
            return 'daily';
        }
        if (schedule === 'every_15_minutes') {
            return 'every_15_minutes';
        }
        return undefined;
    }

    public complementScheduleAccounts( item:AlGenericAlertDefinition, accounts:string[] ) {
        let accountIds:string[] = [];
        const accountIdExtractor = new RegExp( /\([0-9]+\)/, "i" );
        accounts.forEach( ( account:string ) => {
            let matches = account.match( accountIdExtractor );
            if ( ! matches ) {
                return;
            }
            accountIds.push( matches[matches.length-1].slice(1, -1) );
        } );
        item.properties.accounts = item.properties.accounts ? item.properties.accounts.concat( accountIds ) : accountIds;
    }

    public complementSchedule(item:AlGenericAlertDefinition, accountId?:string){
        let parentAccountOnly: boolean = false;
        if ('viewId' in item.properties && item.properties.viewId) {
            item.properties.viewName = this.getValueDictonary(item.properties.viewId, this.viewDictionary);
            parentAccountOnly = this.viewParentAccountOnlyDictionary[item.properties.viewId as string] as boolean;

            item.properties.reportFiltersSort = this.getBaseReportFiltersSort();
            if (this.viewFilterNames.hasOwnProperty(item.properties.viewId)) {
                item.properties.reportFiltersSort = item.properties.reportFiltersSort.concat( this.viewFilterNames[item.properties.viewId] );
            }
        }
        if ('workbookId' in item.properties) {
            item.properties.workbookName = this.getValueDictonary(item.properties.workbookId, this.workbookDictionary);
        }
        if ('workbookName' in item.properties) {
            item.properties.workbookSubMenu = this.getValueDictonary(item.properties.workbookId, this.workbookBySubMenuDictionary);
        }
        if ('schedule' in item.properties) {
            item.properties.cadenceName = this.getCadenceName(item.properties.schedule);
            item.properties.runTime = this.getRunTime(item.properties.schedule);
        }
        item.properties.embedUrl = this.getValueDictonary(item.properties.viewId, this.workbookEmbedUrlDictionary);
        item.properties.contentUrl = this.getValueDictonary(item.properties.workbookId, this.workbookContentUrlDictionary);
        const reportType = { 'Report Type': [item.properties.viewName] };
        item.properties.reportFilters = { ... reportType, ... item.properties.reportFilters };

        // Add Customer accounts to properties.accounts to be able to filter.  Customer filters from tableau/cargo are strings consolidating the name and account ID into
        // a single pattern in the form "Account Name (Account ID)".

        if (item.properties.reportFilters && 'Customer Account' in item.properties.reportFilters) {
            this.complementScheduleAccounts( item, item.properties.reportFilters['Customer Account'] );
        } else if (!parentAccountOnly) {
            item.properties.accounts = Object.keys(this.accountDictionary);
        } else if (accountId) {
            item.properties.accounts = [accountId];
        }
    }

    public getRunTime(schedule: 'every_15_minutes' | { daily ?: CargoReportDailyScheduleV2; } | { weekly?: CargoReportWeeklyScheduleV2; }
        | { monthly?: CargoReportMonthlyScheduleV2; } ) : undefined | number {

        let nextExecution = new Date();

        if (schedule === 'every_15_minutes') {
            return undefined;// this case is not supported
        } else if ('daily' in schedule && schedule.daily) {
            const daily = schedule.daily;
            nextExecution.setUTCHours( daily.hour );
            nextExecution.setUTCMinutes( daily.minute );
            nextExecution.setUTCSeconds( 0 );
        } else if ('weekly' in schedule && schedule.weekly) {
            const weekly = schedule.weekly;
            const daysOfWeek:{ [id:string]: 0 | 1 | 2 | 3 | 4 | 5 | 6 } = {
                'sunday': 0,
                'monday': 1,
                'tuesday': 2,
                'wednesday': 3,
                'thursday': 4,
                'friday': 5,
                'saturday': 6
            };
            if (daysOfWeek[weekly.day]) {
                nextExecution = startOfWeek( nextExecution, { weekStartsOn: daysOfWeek[weekly.day]});
            }
            nextExecution.setUTCHours( weekly.hour );
            nextExecution.setUTCMinutes( weekly.minute );
            nextExecution.setUTCSeconds( 0 );
        } else if ( 'monthly' in schedule && schedule.monthly){
            const monthly = schedule.monthly;
            nextExecution.setUTCDate( monthly.day );
            nextExecution.setUTCHours( monthly.hour );
            nextExecution.setUTCMinutes( monthly.minute );
            nextExecution.setUTCSeconds( 0 );
        } else {
            return undefined;
        }
        return nextExecution.getTime();
    }

    /**
     * Retrieves an array with the value of the threat levels.
     * @param conditions SQXSearchQuery The query used.
     */
    public getFilterslistFromConditions(conditions:SQXSearchQuery):Array<string> {
        let filtersList:string[] = [];
        const opThreatLevel = conditions.getPropertyCondition("notification.threat_level");
        if (opThreatLevel) {
            filtersList = opThreatLevel.getValues() as string[];
        }
        return filtersList;
    }

    /**
     * Retrieves escalated value
     * @param conditions SQXSearchQuery The query used.
     */
    public getEscalatedFromConditions(conditions:SQXSearchQuery):boolean {
        const opEscalated = conditions.getPropertyCondition("notification.escalated");
        if ( opEscalated ) {
            const values = opEscalated.getValues();
            if ( values.length === 1 ) {
                return values[0] as boolean;
            }
        }
        return false;
    }

    /**
     * Retrieves an array with the value of the accounts, also include fake ids in order
     * to propertly select options in the screen.
     * @param conditions SQXSearchQuery The query used.
     */
    public getAccountsFromConditions(conditions:SQXSearchQuery):Array<string> {
        let accountsList:string[] = [];
        const opAccountId = conditions.getPropertyCondition("account.id");
        if ( opAccountId ) {
            if ( opAccountId instanceof SQXComparatorEqual ) {
                if ( opAccountId.parent && opAccountId.parent instanceof SQXOperatorNegate ) {
                    accountsList.push(this.getManagedAccountsFakeId());
                } else {
                    accountsList = opAccountId.getValues() as string[];
                }

            } else if ( opAccountId instanceof SQXComparatorNotEqual ) {
                accountsList.push(this.getManagedAccountsFakeId());
            } else if ( opAccountId instanceof SQXComparatorIn ) {
                accountsList = opAccountId.getValues() as string[];
            } else {
                console.warn(`Warning: filter condition for 'account.id' uses an unsupported operator`, opAccountId );
            }
        } else {
            accountsList.push(this.getMyAccountsAndManagedFakeId());
        }
        return accountsList;
    }

    public incidentNotificationSetAccounts(item:AlGenericAlertDefinition){
        if (item.properties.accounts) {
            item.properties.accounts.forEach((accountFilter:any) => {
                const accountName = this.getAccountName(accountFilter);
                if (accountName) {
                    const isCreator = accountFilter === item.properties.accountId;
                    item.properties.accounts!.push(accountFilter);
                    item.properties.accountsName!.push({isCreator, name: accountName});
                    item.properties.searchables!.push(accountName);
                }
            });
        }
    }

    public complementIncident(item:AlGenericAlertDefinition){
        if (item.properties.filters) {
            if (!item.properties.accountsName) {
                item.properties.accountsName = [];
            }
            if(!item.properties.threatLevel){
                item.properties.threatLevel = [];
            }

            let filters = item.properties.filtersParsed as SQXSearchQuery;
            const opAccountId = filters.getPropertyCondition("account.id");
            if ( opAccountId ) {
                if ( opAccountId instanceof SQXComparatorEqual ) {
                    if ( opAccountId.parent instanceof SQXOperatorNegate ) {
                        item.properties.accountsName = [ {isCreator: false, name: this.getTextManagedAccounts()} ];
                        item.properties.searchables!.push(this.getTextManagedAccounts());
                    } else{
                        item.properties.accounts = opAccountId.getValues() as string[];
                        this.incidentNotificationSetAccounts(item);
                    }
                } else if ( opAccountId instanceof SQXComparatorNotEqual ) {
                    item.properties.accountsName = [ {isCreator: false, name: this.getTextManagedAccounts()} ];
                    item.properties.searchables!.push(this.getTextManagedAccounts());
                } else if ( opAccountId instanceof SQXComparatorIn ) {
                    item.properties.accounts = opAccountId.getValues() as string[];
                    this.incidentNotificationSetAccounts(item);
                } else {
                    console.warn(`Warning: filter condition for 'account.id' uses an unsupported operator`, opAccountId );
                }
            } else {
                item.properties.accountsName = [ {isCreator: false, name: this.getTextMyAccountsAndManaged()} ];
                item.properties.searchables!.push(this.getTextMyAccountsAndManaged());
            }
            const notThreatLvl = filters.getPropertyCondition("notification.threat_level");
            if (notThreatLvl && 'threatLevel' in item.properties) {
                item.properties.threatLevel = notThreatLvl.getValues() as string[];
            }
            const escalated = this.getEscalatedFromConditions(filters);
            item.properties.escalated = escalated;
            if ( escalated ) {
                item.properties.searchables!.push("Escalations");
            }
        }
    }

    public getNoSubscribersWarningMessage() {
        return "You must select at least one recipient.";
    }

    public getTextMyAccountsAndManaged() {
        return 'My Account and Managed Accounts';
    }

    public getTextManagedAccounts() {
        return 'Managed Accounts';
    }

    public getMyAccountsAndManagedFakeId() {
        return "ALL_CUSTOMERS";
    }

    public getManagedAccountsFakeId() {
        return "MANAGED_ACCOUNTS";
    }

    public getFakeMyAccountsAndManagedAccount():AIMSAccount {
        return {
            name: this.getTextMyAccountsAndManaged(),
            id: this.getMyAccountsAndManagedFakeId(),
        } as AIMSAccount;
    }

    public getFakeManagedAccount():AIMSAccount {
        return {
            name: this.getTextManagedAccounts(),
            id: this.getManagedAccountsFakeId(),
        } as AIMSAccount;
    }

    // Let's load all notification types information as map
    // to be accessed by demand, useful even in case we want
    // to validate the types we use across the notifications
    // workflow which would be the ideal
    public async setNotificationTypesMap() {
        const notificationTypes = await AlHeraldClientV2.getAllNotificationTypes();
        notificationTypes.forEach(notificationType => {
            this.notificationTypesMap[notificationType.notification_type] = notificationType;
        });
    }

    public async getEmailSubjectTemplate(type: string): Promise<string> {
        await this.setNotificationTypesMap();
        return (this.notificationTypesMap[type])? this.notificationTypesMap[type].default_email_subject || '' : '';
    }

    public getWebhookPayload(type: string): unknown {
        const defaultType = 'tableau/notifications';
        const alertPayload = {
            "data": {
                "threat": "Critical",
                "status": "closed",
                "location_ip": "1.2.3.4",
                "investigation_report": "Sample report",
                "deployment_name": "A Deployment Name",
                "customer_name": "My Customer Name",
                "create_date": "18th Feb 2020 20:28:47 GMT",
                "class": "postcomp",
                "cid": 12345678,
                "attack_summary": "A short description",
                "analyst_notes": "[]",
                "target_host": "10.9.8.7",
                "start_date": "18th Feb 2020 20:29:43 GMT",
                "recommendations": "Sample recommendation",
                "long_incident_id": "1234567890123456",
                "incident_id": "abc123",
            },
            "attachments": [] as any[]
        };
        const schedulePayload = {
            "data": {
                "artifact_create_date": "2020-04-21 08:00",
                "cadence": "Every 15 Minutes",
                "cid": "12345678",
                "customer_name": "Name of Customer",
                "report_description": "This report provides a summary of the most vulnerable hosts in your environment, including total host and vulnerability counts, hosts by CVSS severity ratings, and top 10 lists.",
                "report_id": "20200421-080000-B2107B3C-A345-1005-8001-0242AC110020",
                "report_type": "Monthly Vulnerable Hosts Explorer",
                "result_count": 1,
                "schedule_id": "B2107B3C-A345-1005-8001-0242AC110020",
                "scheduled_report_name": "Test Report"
            },
            "attachments": [{
                "name": "Test Report.pdf",
                "url": "https://api.product.dev.alertlogic.com/cargo/v2/12345678/execution_record/20200421-080000-B2107B3C-A345-1005-8001-0242AC110020/result"
            }]
        };
        const availablePayloads: any = {
            'incidents/alerts': alertPayload,
            'observations/notification': undefined,
            'search/notifications': undefined,
            'tableau/notifications': schedulePayload,
        };

        return availablePayloads[type] ? availablePayloads[type] : availablePayloads[defaultType];
    }

}
