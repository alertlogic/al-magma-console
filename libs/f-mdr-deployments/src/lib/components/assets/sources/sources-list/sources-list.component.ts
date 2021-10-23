/**
 *  SourcesListComponent provides the functionality for listing Sources
 *
 *  @author Bryan Tabarez <bryan.tabarez@alertlogic.com>
 *
 *  @copyright Alert Logic Inc, 2018
 */

import {
    Component,
    EventEmitter,
    OnDestroy,
    Output,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AxiosResponse } from 'axios';

import { SubscriptionLike as ISubscription } from 'rxjs';

import {
    BrainstemService,
    CollectionDescriptor,
    CollectionSource,
    CollectionsService,
    InsightUtilityService,
    O3BaseComponent,
    UtilityService,
} from '@components/technical-debt';

import { AlRightDrawerComponent } from '@components/technical-debt';

import { SourcesMassEditFormComponent } from '../../../../../shared/deployments/assets/sources/sources-mass-edit-form/sources-mass-edit-form.component';
import { SourcesDatacenterFormComponent } from '../../../../../shared/deployments/assets/sources/sources-datacenter-form/sources-datacenter-form.component';
import { SourcesAwsFormComponent } from '../../../../../shared/deployments/assets/sources/sources-aws-form/sources-aws-form.component';
import { SourcesAzureFormComponent } from '../../../../../shared/deployments/assets/sources/sources-azure-form/sources-azure-form.component';
import { DeploymentButtonDescriptor, DeploymentHeaderDescriptor } from '../../../../types'
import { AlNotification } from '@al/ng-generic-components';
import { Deployment } from '@al/deployments';
import { DeploymentsUtilityService } from '../../../../../shared/services/deployment-utility.service';

@Component({
    selector: 'al-sources-list',
    templateUrl: './sources-list.component.html',
    styleUrls: ['./sources-list.component.scss']
})

export class SourcesListComponent extends O3BaseComponent implements OnDestroy {

    /**
    * Right Drawer instance
    */
    @ViewChild(AlRightDrawerComponent, { static: true } )
    public rightDrawer: AlRightDrawerComponent;
    public isBusy: boolean = true;
    public defaultIconList: string = 'al al-collection';

    /** DOM instance */
    private rightDrawerDOM: any = document.getElementsByClassName("right-drawer-body");

    /**
     * Mass edit form reference
     */
    @ViewChild(SourcesMassEditFormComponent)
    public sourcessMassEditFormComponent: SourcesMassEditFormComponent;

    /**
     * Protect Sources form component instance
     */
    @ViewChild(SourcesDatacenterFormComponent)
    public sourcesDatacenterFormComponent: SourcesDatacenterFormComponent;
    @ViewChild(SourcesAwsFormComponent)
    public sourcesAwsFormComponent: SourcesAwsFormComponent;
    @ViewChild(SourcesAzureFormComponent)
    public sourcesAzureFormComponent: SourcesAzureFormComponent;

    @Output() next: EventEmitter<any> = new EventEmitter();
    public entities: CollectionSource[] = [];
    public isLoading: boolean = true;
    private accountId: string;
    private deploymentId: string;
    private searchType: string;
    public selectedSourceId: string = "";
    public entityType: string = 'collection';
    /** Info Form config */
    public entityInfo: any = null;
    public historyType: string = "detailsSources";
    /**
     * Notifications
     */
    static AUTO_DISMISS_SUCCESS: number = 3000; // We should to get this values from a global config, isn't? ¯\_(ツ)_/¯
    static AUTO_DISMISS_ERROR: number = 8000; // We should to get this values from a global config, isn't? ¯\_(ツ)_/¯
    public listNotifications = new EventEmitter();
    public deleteFormNotifications = new EventEmitter();
    public internalFormNotifications = new EventEmitter();
    /**
     * Default params values
     */
    public params = {
        limit: 20,
        sort: "name",
        order: "asc",
        offset: 0,
        search: "",
        filters: "",
        archived: false
    };
    /**
     * Delete Form config
     */
    public bodyMessageDeleteForm: string = "";
    /**
     * Info Form config
     */
    public infoFormProperties: any[] = [];
    /**
     * Pagination config
     */
    public elements: any = {
        provided: 0,
        total: 0
    };
    public isScrolling: boolean = false;
    /**
     * Subscriptions
     */
    private routeSubscription: ISubscription;
    /**
     * Nav tools config
     */
    public headerNavToolConfig = {
        title: "Add Sources",
        withIconTitle: true,
        iconTitle: {
            iconClass: 'material-icons',
            icon: 'add'
        },
        enableSortBySelect: false,
        textPlaceHolder: 'Type Search Terms',
        isArchiveEnable: true,
        archiveTitle: 'Show Archive',
        isSettingsEnable: true,
        settingsMenuOptions: [
            {
                name: "Mass Edit",
                value: "massEdit"
            },
            {
                name: "Export",
                value: "export"
            },
            {
                name: "Force Statistics Update",
                value: "force"
            }
        ],
        enableMultipleFilter: true,
        multiSelectConfig: {
            placeholder: "Select Filters",
            items: [],
            selectedItems: [],
            labelToBind: "text",
            valueToBind: "id",
            groupBy: "type"
        },
        topRowAligned: true
    };
    /**
     * Config sort options
     */
    public sortingConfig: any = {
        showTagsHeader: true,
        typeActionsHeader: 'x3',
        fields: [
            {
                active: false,
                type: 'status',
                order: 'asc',
                title: 'Current Status',
                sortable: true,
                sortBy: 'source.status.status',
                onOver: false
            },
            {
                active: false,
                type: 'status',
                order: 'asc',
                title: 'Collection Enabled',
                sortable: true,
                sortBy: 'source.enabled',
                onOver: false
            },
            {
              active: true,
              type: 'name',
              order: 'asc',
              title: 'Log Source',
              sortable: true,
              sortBy: 'source.name',
              onOver: true
          }
        ]
    };

    /**
     * Export form config
     */
    public exportConfig: object = {
        export: () => {},
        accountId: null,
        deploymentId: null,
        entityName: null,
        entity: null,
        itemsExported: null,
        params: null
    };

    /**
     * Types of sources (map)
     */
    private sourceTypes:object = {
        eventlog: 'Windows Event Log Source',
        syslog: 'Syslog Source',
        flatfile: 'Flat-File Collection Source',
        s3aws: 'AWS CloudTrail Source',
        s3: 'S3 Source',
        o365: 'Office 365',
        azure_table: 'Azure SQL Auditing',
        azure_events: 'Azure Audit Logs',
        azure_blob: 'App Service Web Server Logging',
        ehub: 'Event Hub',
        unknown: 'Unknown Source'
    }

    public addToCaseFormMessage: string = "Are you sure you want to add to case this source?";

    /**
     * Export form config
     */
    public massEditConfig: object = {
        accountId: null,
        deploymentId: null,
        items_count: null,
        params: null
    };

    public deploymentHeaderConfig: any = {
        title: 'Log Sources',
        buttons: DeploymentButtonDescriptor.import([
            {
                label: "NEXT",
                color: "mat-primary",
                onClick: () => this.next.emit()
            }
        ])
    };
    public entitlements = "cloud_insight|web_security_manager|cloud_defender|threat_manager|log_manager|assess|detect|respond|lmpro";

    public alDeploymentHeaderConfig: DeploymentHeaderDescriptor = new DeploymentHeaderDescriptor(this.deploymentHeaderConfig);

    public deployment: Deployment;
    public deploymentType: string;

    constructor(protected brainstem: BrainstemService,
        protected route: ActivatedRoute,
        protected _CollectionsService: CollectionsService,
        protected _InsightUtilityService: InsightUtilityService,
        protected _UtilityService: UtilityService,
        protected _DeploymentsService: DeploymentsUtilityService
    ) {
        super(brainstem);
        super.lifecycle({ init: this.onInit });
    }

    onInit = () => {
        this.routeSubscription = this.route.params.subscribe(params => {
            this.accountId     = params.hasOwnProperty("accountId") ? params["accountId"] : null;
            this.deploymentId  = params.hasOwnProperty("id") ? params["id"] : null;
            this.setDeploymentType('create');
            this.searchType = this.deploymentId;
            // Set search criteria for datacenter deployments
            if (this.deploymentType === 'datacenter') {
                this.searchType = 'dc-logsources';
            }
            if (this.deploymentType === 'azure') {
                delete this.params["limit"];
            }
            if (this.accountId && this.deploymentId) {
                this.setupMassEditConfig();
                this.setupExportConfig();
                this.getFilters();
                this.loadData('all');
            }
        });
    }

    ngOnDestroy() {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }

    loadArchive(event){
        if(event){
            this.params.archived = true;
            this.entityType      = 'collection_deleted';
        }else{
            this.params.archived = false;
            this.entityType      = 'collection';
        }
        this.loadData('all');
    }

    onFilter(filterIds: Array<string>) {
        this.params.offset = 0;
        this.params.filters = this._UtilityService.getFiltersParam(filterIds);
        this.loadData('all');
    }

    getFilters() {
        this._UtilityService.getFiltersByEntityType(this.accountId, 'collection').subscribe(
            response => {
                this.headerNavToolConfig.multiSelectConfig.items = this._UtilityService.processFilterDataItems(response.filters);
                this.loadData('all');
            }, error => {
                this.handleError('loadFilters', error);
            }
        );
    }

    onSettingOptions(option: string) {
        switch(option) {
            case 'massEdit':
                this.rightDrawer.isDisabledSubmitButton = false;
                this.isBusy = false;
                this.setUpRightDrawerOptions(null, "SAVE", "Mass Edit", 'massEdit');
                this.rightDrawer.open();
                break;
            case 'export':
                this.rightDrawer.isDisabledSubmitButton = false;
                this.isBusy = false;
                this.setUpRightDrawerOptions(null, "EXPORT", "Export Sources", 'export');
                this.rightDrawer.open();
                break;
            case 'force':
                this.params.offset = 0;
                this.params['force'] = 'stats';
                this.loadData('all');
                break;
        }
    }

    loadData(typeLoadData) {
        this.isLoading = true;
        this.setDeploymentType('create');

        this._CollectionsService.getAll(this.accountId, this.searchType, this.params, this.entityType).subscribe(
            response => {
                if (typeLoadData !== 'all') {
                    this.entities = typeLoadData === "pagination-false" ? this.entities : [];
                    response.sources.forEach(
                        source => {
                            this.entities.push(source);
                        }
                    );
                } else {
                    this.entities = response.sources;
                }
                this.elements.provided = this.entities.length;
                this.elements.total = response.total_count;
                this.isLoading = false;
                this.isScrolling = false;
            },
            error => {
                this.handleError('load', error);
            }
        );
    }

    setDeploymentType(action: string, source: any = null){
        if (action === 'create') {
            // Validate the deployment type
            if (this.deploymentId === 'all') {
                this.headerNavToolConfig.withIconTitle = false;
                this.deploymentType = 'all';
            }else if (this.deploymentId === 'datacenter') {
                this.deploymentType = 'datacenter';
            }else{
                this.deployment        = this._DeploymentsService.getDeploymentOnTracking();
                this.deploymentType    = this.deployment ? this.deployment.platform.type : 'datacenter';
            }
        }

        if (action === 'edit') {
            if (source.config.collection_type === 'azure_table' ||
                source.config.collection_type === 'azure_blob' ||
                source.config.collection_type === 'azure_events') {
                this.deploymentType = 'azure';
            } else if (source.config.collection_type === 's3' || source.config.collection_type === 's3aws') {
                this.deploymentType = 'aws';
            } else {
                // o365 and ehub sources get here
                this.deploymentType = 'datacenter';
            }
        }
    }

    deleteSource(sourceId: string) {
        this.isBusy = true;
        this.rightDrawer.isDisabledSubmitButton = true;
        this._CollectionsService.deleteOne(this.accountId, this.deploymentId, sourceId, this.entityType).subscribe(
            response => {
                if (this.entityType === 'collection') {
                    this.handleSuccessOperation('delete');
                }else{
                    this.handleSuccessOperation('restore');
                }
            },
            error => {
                this.handleError('delete', error);
            }
        );
    }

    onSort(sortField) {
        this.params.offset = 0;
        this.params.order = sortField.hasOwnProperty('order') ? sortField.order : "asc";
        this.params.sort = sortField.hasOwnProperty('sortBy') ? sortField.sortBy : "source.name";
        this.loadData('all');
    }

    onSearch(value: string) {
        this.params.offset = 0;
        this.params.search = value;
        this.loadData('all');
    }

    handleSuccessOperation(typeSuccess: string) {
        let message: string = "";
        let sufix = "";
        let haveSufix = "";
        switch (typeSuccess) {
            case 'delete':
                message = "The Source was archived successfully";
                break;
            case 'restore':
                message = "The Source was restored successfully";
                break;
            case 'create':
                message = "The Source was created successfully";
                break;
            case 'update':
                message = "The Source was updated successfully";
                break;
            case 'export':
                sufix     = this.exportConfig['exportedItems'] > 1 ? "s" : "";
                haveSufix = this.exportConfig['exportedItems'] > 1 ? "ve" : "s";
                message   = this.exportConfig['exportedItems'] + " Source"+sufix+ " ha"+haveSufix + " been successfully exported.";
                break;
            case "addToCase":
                message = "The Case was added successfully";
                break;
            case 'massEdit':
                sufix = this.massEditConfig['items_count'] > 1 ? "s" : "";
                haveSufix = this.massEditConfig['items_count'] > 1 ? "ve" : "s";
                message = this.massEditConfig['items_count'] + " Source"+sufix+ " ha"+haveSufix + " been successfully updated.";
                break;
        }
        this.closeSideNav();
        this.emitNotificationsValues('success', message);
        this.params.offset = 0;
        this.getFilters(); // This for refreshing the filters and also loading the list
    }

    handleError(typeError: string, error: AxiosResponse) {

        let body = error.data;
        let reason_text = this._InsightUtilityService.nestedGet(body, "message", null);
        let message: string = "";

        switch (typeError) {
            case "load":
                message = "An internal error getting the Sources list";
                break;
            case "delete":
                message = "An internal error archiving the source";
                break;
            case "addToCase":
                message = "Item could not be added. Reason: Item is already in your case cart.";
                break;
        }

        if (error.status !== 500 && reason_text) {
            message = reason_text;
        }

        if (typeError === 'delete') {
            this.isBusy = false;
            this.deleteFormNotifications.emit(AlNotification.error(message, SourcesListComponent.AUTO_DISMISS_ERROR, true));
        } else if (typeError === 'addToCase') {
            this.isBusy = false;
            this.internalFormNotifications.emit(AlNotification.error(message, SourcesListComponent.AUTO_DISMISS_ERROR, true));
        } else {
            this.isLoading = false;
            this.emitNotificationsValues('error', message);
        }
    }

    emitNotificationsValues(typeAlertMessage: string, message: string) {
        switch (typeAlertMessage) {
            case 'success':
                this.listNotifications.emit(AlNotification.success(message, SourcesListComponent.AUTO_DISMISS_SUCCESS, true));
                break;
            case 'error':
                this.listNotifications.emit(AlNotification.error(message, SourcesListComponent.AUTO_DISMISS_ERROR, true));
                break;
        }
    }

    onCreateForm(event: any) {
        this.setDeploymentType('create');
        this.setUpRightDrawerOptions(null, "SAVE", "New Source", 'create');
        this.rightDrawer.open();
    }

    onAddToCaseForm(event: any, source: any) {
        this.isBusy = false;
        this.setUpRightDrawerOptions(source.id, "ADD", source.name, 'addToCase');
        this.rightDrawer.isDisabledSubmitButton = false;
        this.rightDrawer.open();
        event.stopPropagation();
    }

    onEditForm(event: any, source: any) {
        this.setDeploymentType('edit', source);
        this.setUpRightDrawerOptions(source.id, "SAVE", source.name, 'edit');
        this.rightDrawer.open();
        event.stopPropagation();
    }

    onDeleteForm(event: any, source: any) {
        event.stopPropagation();
        this.isBusy = false;
        if (this.entityType === 'collection') {
            this.setUpRightDrawerOptions(source.id, "ARCHIVE", source.name, 'delete');
            this.bodyMessageDeleteForm = "Are you sure you want to archive this source?";
        } else {
            this.setUpRightDrawerOptions(source.id, "RESTORE", source.name, 'delete');
            this.bodyMessageDeleteForm = "Are you sure you want to restore this source?";
        }
        this.rightDrawer.isDisabledSubmitButton = false;
        this.onOpenDeleteForm();
    }

    onInfoForm(source: CollectionDescriptor) {
        this.entityInfo = source;
        this.isBusy = false;
        if(this.rightDrawer.isClosed()) {
            this.setUpRightDrawerOptions(source.id, "INFO", source.name, 'info');
            this.rightDrawer.open();
        } else {
            this.setUpRightDrawerOptions(source.id, "INFO", source.name, 'info', this.rightDrawer.expanded);
        }
    }

    addToCase(entityId: string){
        this.isBusy = true;
        let entityObject = {id: this.selectedSourceId, type: 'log_source'};
        this.rightDrawer.isDisabledSubmitButton = true;
        this._UtilityService.addToCaseEntities(this.accountId, entityObject).subscribe(
            response => {
                this.handleSuccessOperation("addToCase");
            },
            error => {
                this.handleError('addToCase', error);
            }
        );
    }

    isSelected(sourceId: string) {
        if (this.selectedSourceId === sourceId) {
            return true;
        }
        return false;
    }

    setUpRightDrawerOptions(selectedSourceId: string, buttonText: string, righDrawerTitle: string, action: string, expanded:boolean = true) {
        this.selectedSourceId = selectedSourceId;
        this.rightDrawer.defaultIcon = this.defaultIconList;
        this.rightDrawer.expanded = expanded;
        this.rightDrawer.submitButtonText = buttonText;
        this.rightDrawer.rightDrawerTitle = righDrawerTitle;
        this.rightDrawer.action = action;
        if (action === "info") {
            this.rightDrawerDOM[0]['style'].padding = 0;
        } else {
            this.rightDrawerDOM[0]['style'].padding = "24px";
        }
    }

    closeSideNav() {
        this.rightDrawer.closeOnly();
        this.rightDrawer.action = null;
        this.selectedSourceId = "";
        this.rightDrawer.isDisabledSubmitButton = true;
        this.isBusy = false;
    }

    save() {
        if (this.rightDrawer.action === 'delete') {
            this.deleteSource(this.selectedSourceId);
        } if (this.rightDrawer.action === 'export') {
            if (this.exportConfig.hasOwnProperty('export')) {
                this.rightDrawer.isDisabledSubmitButton = true;
                this.exportConfig['export']();
            }
        } if (this.rightDrawer.action === 'addToCase') {
            this.addToCase(this.selectedSourceId);
        } if (this.rightDrawer.action === 'massEdit') {
            this.sourcessMassEditFormComponent.save();
        } else {
            if (this.deploymentType === 'aws' && this.sourcesAwsFormComponent) {
                this.sourcesAwsFormComponent.onSubmit();
            } else if (this.deploymentType === 'azure' && this.sourcesAzureFormComponent) {
                this.sourcesAzureFormComponent.onSubmit();
            }else{
                if (this.sourcesDatacenterFormComponent) {
                    this.sourcesDatacenterFormComponent.onSubmit();
                }
            }
        }
    }

    onOpenDeleteForm() {
        this.rightDrawer.open();
    }

    onSuccess(successType) {
        this.handleSuccessOperation(successType);
    }

    onShowMore(event: boolean) {
        this.isScrolling = true;
        if (!event) {
            this.entities = [];
        }
        this.loadData('pagination-' + !event);
    }

    onValidating(isValid: boolean) {
        this.rightDrawer.isDisabledSubmitButton = isValid ? false : true;
    }

    onLoading(isFormLoading: boolean) {
        setTimeout(() => {
            this.isBusy = isFormLoading;
        });
    }

    setupExportConfig() {
        this.exportConfig = {
            export: () => {},
            accountId: this.accountId,
            deploymentId: this.searchType,
            entityName: 'Sources',
            entity: 'collection_export',
            exportedItems: 0,
            params: this.params
        };
    }

    setupMassEditConfig() {
        this.massEditConfig = {
            accountId: this.accountId,
            deploymentId: this.searchType,
            items_count: 0,
            params: this.params
        };
    }

    strSource(type) {
        return this.sourceTypes.hasOwnProperty(type) ? this.sourceTypes[type] : this.sourceTypes['unknown'];
    }

}
