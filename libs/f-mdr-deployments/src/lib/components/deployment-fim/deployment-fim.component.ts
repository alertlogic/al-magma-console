import { Component,
        OnInit,
        EventEmitter,
        Output,
        Input,
        ViewChild } from '@angular/core';

import { AlToolbarContentConfig,
        AlBottomSheetHeaderOptions,
        AlViewHelperComponent,
        AlFilterListPipe,
        AlActionSnackbarElement,
        AlContentToolbarComponent, 
        AlSidebarConfig} from '@al/ng-generic-components';

import { AlSession, AIMSClient, AIMSUser } from '@al/core';
import { AlFimClient,
         fimAssetType,
         AlFimConfiguration,
         fimPathType,
         fimConfigType,
         AlFimAsset } from '@al/fim';
import {
    from as observableFrom,
    forkJoin as observableForkJoin,
    Observable, of as observableOf,
    pipe
} from 'rxjs';
import { share, catchError, map, groupBy, mergeMap, toArray } from 'rxjs/operators';
import { AssetsService, DeploymentDescriptor, AssetDescriptor } from '@components/technical-debt';
import { DeploymentFimFormComponent } from '../deployment-fim-form/deployment-fim-form.component';
import { MyClientInstance } from './mocks';
import cloneDeep from 'lodash/cloneDeep';
import { FimGroup, CardItem, GroupDescriptor, fimType } from '../../types';
import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';
import { Deployment } from '@al/deployments';
import { DeploymentFimBulkEditScopeFormComponent } from '../deployment-fim-bulk-edit-scope-form/deployment-fim-bulk-edit-scope-form.component';
import { SelectItem, ConfirmationService } from 'primeng/api';

import {
    DeploymentConfigurationNotificationMessage as NotificationMessage
} from '../../types';

@Component({
    selector: 'al-deployment-fim',
    templateUrl: './deployment-fim.component.html',
    styleUrls: ['./deployment-fim.component.scss'],
    providers: [ConfirmationService]
})
export class DeploymentFimComponent implements OnInit {

    @ViewChild('fimForm', { static: false })
    fimForm: DeploymentFimFormComponent;

    @ViewChild('fimEditScopeForm', { static: false })
    fimEditScopeForm: DeploymentFimBulkEditScopeFormComponent;

    @ViewChild('headerNavTool', { static: true })
    headerNavTool: AlContentToolbarComponent

    @Input() mode:fimType = 'EXCLUSIONS';

    @Output() onNextAction: EventEmitter<never> = new EventEmitter();

    @Output() notify: EventEmitter<NotificationMessage> = new EventEmitter();

    title = { page: '', header: '' };

    accountId: string;

    deployment: Deployment;

    allowedAssetTypes: fimAssetType[] = ['region', 'vpc', 'subnet', 'host', 'tag'];

    assetsMap: { [i: string]: { [i: string]: AssetDescriptor } } = {};

    tagsMap: {[i: string]: AssetDescriptor};

    apiError = false;

    loading = true;

    configurations: AlFimConfiguration[] = [];

    configurationsMap: {[i: string] : AlFimConfiguration} = {};

    confirmDialogHeaderText: string = "";

    sideBarConfig: AlSidebarConfig = {
        expand: true,
        expandable: false,
        headerColor: "#535353",
        header: null,
        enableButtonToolbar: true,
        primary: {
            text: 'Save',
            disabled: false
        },
        secondary: {
            text: 'Cancel',
            disabled: false
        },
        isloading: true,
        viewHelper: true,
        toolbarColor: "#FFFFFF"
    };

    toolbarConfig: AlToolbarContentConfig = {
        showSelectAll: true,
        selectAll: false,
        showGroupBy: true,
        showSearch: true,
        search: {
            maxSearchLength: 40,
            textPlaceHolder: "search"
        },
        group: {
            options: [
                {
                    label: 'All File Types',
                    value: 'all'
                },
                {
                    label: 'GNU/Linux Files',
                    value: 'nix_dir'
                },
                {
                    label: 'Windows Files',
                    value: 'win_dir'
                },
                {
                    label: 'Windows Registries',
                    value: 'win_reg'
                }
            ],
            selectedOption: 'all'
        }
    }

    deploymentFimFormHeaderOptions: AlBottomSheetHeaderOptions = {
        classIcon: 'al al-flatfile',
        iconStyle: { "font-size": "2.5em" },
        collapsibleFromTitle: true,
        primaryAction: {
            text: ' Save ',
            disabled: false,
        },
        secondaryAction: {
            text: 'Cancel',
            disabled: false
        }
    }

    deploymentFimBulkEditFormHeaderOptions: AlBottomSheetHeaderOptions = {
        title: 'Edit Asset Scope',
        icon: 'edit',
        collapsibleFromTitle: true,
        primaryAction: {
            text: ' Save ',
            disabled: false,
        },
        secondaryAction: {
            text: 'Cancel',
            disabled: false
        }
    }

    listGroupNames: GroupDescriptor = {
        nix_dir: {
            type: "nix_dir",
            icon: 'al al-linux',
            label: 'GNU/Linux Files'
        },
        win_reg: {
            type: "win_reg",
            icon: 'al al-windows',
            label: 'Windows Registries'
        },
        win_dir: {
            type: "win_dir",
            icon: 'al al-windows',
            label: 'Windows Files'
        }
    };

    actionSnackbarElements: AlActionSnackbarElement[];

    groups: Array<FimGroup> = []; // The full or unfiltered list of groups

    filteredGroups: Array<FimGroup> = []; // The list of groups to display and process.

    cardItems: Array<CardItem> = [];

    selectedItems: Array<CardItem> = [];

    selectItemGroups: Array<FimGroup> = [];

    groupSelected: boolean = false;

    actionSnackbarText: string;

    actionSnackbarVisible: boolean = false;

    infoText: string;

    private appliedFilter: fimConfigType | 'all' = 'all';

    private readonly unknownUser: AIMSUser = {
        name: 'Unknown User',
        id: '0',
        email: 'user@unknown.com',
        account_id: '0',
        created: null,
        modified: null,
        linked_users: []
    };

    private readonly systemUser: AIMSUser = {
        name: 'System',
        id: 'system',
        email: 'user@system.com',
        account_id: 'system',
        created: null,
        modified: null,
        linked_users: []
    };

    private readonly primaryAccoundId: string = AlSession.getPrimaryAccountId();

    private usersMap: { [i: string]: Observable<AIMSUser> } = {};

    private readonly filterListPipe: AlFilterListPipe = new AlFilterListPipe();


    constructor(protected deploymentsService: DeploymentsUtilityService,
        protected assetsService: AssetsService,
        private confirmationService: ConfirmationService) {
        this.deployment = this.deploymentsService.getDeploymentOnTracking();
        this.accountId = this.deployment.account_id;
        this.usersMap = { 'system': observableOf(this.systemUser)};
    }

    ngOnInit(): void {
        this.initialize();
    }

    initialize(): void {
        this.apiError = false;
        this.loading = true;
        this.setTitles();
        this.setInfoText();
        this.setSnackBar();
        this.setFilterOptions();
        this.setConfirmDialogHeader();
        this.clearSelectedItems();
        this.getObservables()
            .subscribe(this.processResponses,
                       this.processError);
    }

    create(): void {
        this.deploymentFimFormHeaderOptions.title = 'Add File Integrity Monitoring';
        this.fimForm.open(this.mode, 'CREATE');
    }

    afterSavingConfig(config: AlFimConfiguration): void {
        this.notify.emit({
            type: 'success',
            text: "FIM Changes saved successfully"
        });
        this.initialize();
    }

    next(): void {
        this.onNextAction.emit();
    }

    filter(filter: fimConfigType | 'all'): void {
        this.appliedFilter = filter;
        if (filter !== 'all') {
            this.filteredGroups = this.groups.filter(group => group.hasOwnProperty(filter));
        } else {
            this.filteredGroups = this.groups.slice();
        }
        this.clearSelectedItems();
        this.selectAllConfig();
    }

    search(term: string): void {
        this.loading = true;
        this.filteredGroups = this.createListGroups(this.filterListPipe.transform(this.cardItems, term));
        if (this.appliedFilter !== 'all') {
            this.filteredGroups = this.filteredGroups.filter(group => group.hasOwnProperty(this.appliedFilter));
        }
        this.selectAllConfig();
        this.clearSelectedItems();
        this.selectAllConfig();
        this.loading = false;
    }

    edit(configuration: AlFimConfiguration): void {
        configuration = cloneDeep(configuration);
        this.deploymentFimFormHeaderOptions.title = 'Edit File Integrity Monitoring';
        this.fimForm.open(this.mode, 'EDIT', configuration);
    }

    delete(configuration: AlFimConfiguration): void {
       this.confirmationService.confirm({
        message: 'Are you sure that you want to delete this ?',
        accept: () => {
            observableFrom(
                AlFimClient
                .deleteConfiguration(this.mode === 'MONITORING' ? 'monitored_paths' : 'excluded_paths',
                                    this.accountId, this.deployment.id, configuration.id)
            ).subscribe(
                () => {
                    this.notify.emit({
                        type: 'success',
                        text: "The FIM configuration was successfully deleted"
                    });
                    this.initialize();
                },
                ({errorinfo}) => {
                    console.error("Unexpected error ", errorinfo);
                    this.notify.emit({
                        type: 'error',
                        text: "The FIM configuration could not be deleted"
                    });
                }
            )
        },
        reject: () => {
        }
    });
    }

    duplicate(configuration: AlFimConfiguration): void {
        this.deploymentFimFormHeaderOptions.title = 'Duplicate File Integrity Monitoring';
        configuration = cloneDeep(configuration);
        configuration.system = false;
        this.fimForm.open(this.mode, 'DUPLICATE', configuration);
    }

    doBulk(action: string): void {
        if (action === 'edit') {
            this.fimEditScopeForm.open(this.selectedItems.map(item => item.item));
        } else if (action === 'monitor') {
            const enabled: boolean = this.actionSnackbarElements[1].checked;
            const configurations =
                 this.selectedItems
                 .map(item => {
                     item.item.enabled = enabled;
                     return item.item
                 });
            this.monitor(configurations);
         } else if (action === 'delete') {
            this.handleBulkDelete();
        }

    }

    monitor(configs: AlFimConfiguration[]): void {
        const requests:  Observable<AlFimConfiguration>[] = configs.map(this.handleMappingForMonitoring);
        this.handleMonitorRequests(requests);
    }


    /**
     * selectGroupFromCheckbox Function
     *
     * Adding Card Items to the SelectedItems array when the user clicks on the Checkbox group.
     *
     * @param type groupType: fimConfigType param: nix_dir | win_dir | win_reg.
     * @param event Checkbox event: true|false
     */
    selectGroupFromCheckbox(groupType: fimConfigType, event: boolean): void {

        this.filteredGroups.forEach((itemgroup: FimGroup) => {
            if (itemgroup[groupType]) {
                itemgroup[groupType].selected = event;
                itemgroup[groupType].list.forEach((item: CardItem) => {
                    item.selected = event;
                    this.addSelectedItem(item);
                }
                )
            }
        });
        this.snackBarConfig();
        this.selectAllConfig();
        this.selectItemGroups = this.createListGroups(this.selectedItems);
    }

    /**
     * createListGroups Function
     *
     * Process the list, and create the groups using RXJS grouping stuff.
     *
     * @returns an Array of Objects with the groups inside.
     */
    createListGroups(cardItems: Array<CardItem>): Array<FimGroup> {

        let groups: Array<FimGroup> = [];

        observableFrom(cardItems).pipe(
            groupBy(group_by => group_by.item.type), // Group By Criteria, merge all the objects that have the same 'type'.
            mergeMap(group => group.pipe(toArray())) // Convert the groups to Array of Objects.
        ).subscribe((value) => {
            let group: FimGroup = {
                [this.listGroupNames[value[0]['item']['type']]['type']]: {
                    selected: false,
                    type: this.listGroupNames[value[0]['item']['type']]['type'],
                    label: this.listGroupNames[value[0]['item']['type']]['label'],
                    list: value
                }
            };
            groups.push(group);
        });
        this.loading = false;
        return groups.sort((a: FimGroup, b: FimGroup) =>  Object.keys(a)[0] <= Object.keys(b)[0] ? 0 : 1);
    }

    /**
     * toggleCard Function
     *
     * Adding Card Items to the SelectedItems Array.
     *
     * @param item CardItem.
     * @param type Group Type: fimConfigType nix_dir | win_dir | win_reg.
     */
    toggleCard(item: CardItem, type: fimConfigType): void {
        item.selected = !item.selected;
        this.addSelectedItem(item);
        this.snackBarConfig();
        this.selectItemGroups = this.createListGroups(this.selectedItems);

        this.filteredGroups.forEach((itemgroup: FimGroup) => {
            if (itemgroup[type]) {
                this.selectItemGroups.forEach((selectedGroup: FimGroup) => {
                    if (selectedGroup[type]) {
                        if (itemgroup[type].type === selectedGroup[type].type &&
                            itemgroup[type].list.length === selectedGroup[type].list.length) {
                            itemgroup[type].selected = true;
                        } else {
                            itemgroup[type].selected = false;
                        }
                    }
                });
            }
        });

        this.snackBarConfig();
        this.selectAllConfig();
    }

    /**
    * selectAll Function
    *
    * Selects All the Items.
    *
    * @param event true|false
    */
    selectAll(event: boolean): void {

        this.filteredGroups.forEach((itemgroup: FimGroup) => {
            for (const group in itemgroup) {
                if (itemgroup.hasOwnProperty(group)) {
                    itemgroup[group].selected = event;
                    itemgroup[group].list.forEach((cardItem: CardItem) => {
                        cardItem.selected = event;
                        this.addSelectedItem(cardItem);
                    });
                }
            }
        });

        this.snackBarConfig();
        this.selectItemGroups = this.createListGroups(this.selectedItems);
    }

    private handleMonitorRequests(observables: Observable<AlFimConfiguration>[]) {
        observableForkJoin(observables)
        .subscribe(
            (_) => {
                this.notify.emit({
                    type: 'success',
                    text: "FIM Changes saved successfully"
                });
                this.initialize();
            },
            ({data}) => {
                this.notify.emit({
                    type: 'error',
                    text: `Cannot perform operation. Reason: ${data.errorinfo.description}`
                });
                console.error("Unepxected error ", data);
                this.initialize();
            }
        )
    }

    private handleMappingForMonitoring = (config: AlFimConfiguration): Observable<AlFimConfiguration> => {
        return observableFrom(
                    AlFimClient
                    .updateConfiguration('monitored_paths',
                                        this.accountId,
                                        this.deployment.id,
                                        config.id,
                                        {
                                            version: config.version,
                                            enabled: config.enabled,
                                            type: config.type,
                                            base: config.base,
                                            pattern: config.pattern,
                                            scope: config.scope
                                        } as AlFimConfiguration)
    )}

    private handleBulkDelete(): void {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to delete these ?',
            accept: () => {
                const observables: (Observable<void>)[] =
                    this.selectedItems.map(item => {
                        return observableFrom(
                            AlFimClient
                                .deleteConfiguration(this.mode === 'MONITORING' ? 'monitored_paths' : 'excluded_paths',
                                    this.accountId, this.deployment.id, item.item.id))
                    });
                observableForkJoin(observables)
                    .subscribe(
                        () => {
                            this.notify.emit({
                                type: 'success',
                                text: "The FIM configuration was successfully deleted"
                            });
                            this.initialize();
                        },
                        ({info}) => {
                            console.error("Unexpected error " + info);
                            this.notify.emit({
                                type: 'error',
                                text: "The FIM configuration could not be deleted"
                            });
                        }
                    )
            },
            reject: () => {
            }
        });
    }

    private getObservables(): Observable<[AlFimConfiguration[], ({ [i: string]: AssetDescriptor })[]]> {
        const fimPath: fimPathType = this.mode === 'EXCLUSIONS' ? 'excluded_paths' : 'monitored_paths';
        const configurations$: Observable<AlFimConfiguration[]> =
            observableFrom(AlFimClient
                .getAllConfigurations(fimPath,
                    this.accountId,
                    this.deployment.id))
        let assetsMapObs$: Observable<({ [i: string]: AssetDescriptor })[]> = observableOf(null);
        if (this.shouldFetchAssets()) {
            assetsMapObs$ = observableForkJoin(this.calculateAssetsObservables());
        }
        return observableForkJoin([configurations$, assetsMapObs$]);
    }

    private calculateAssetsObservables(): (Observable<{ [i: string]: AssetDescriptor }>)[] {
        let observables: Observable<{ [i: string]: AssetDescriptor }>[] = [];
        this.allowedAssetTypes.forEach((type: string) => {
            observables.push(
                this.assetsService
                    .byType(type, null, this.deployment.id)
                    .pipe(map(assetObjs => {
                        return assetObjs['assets'].reduce((assets: { [i: string]: AssetDescriptor }, ari) => {
                            const asset: AssetDescriptor = AssetDescriptor.import(ari[0]);
                            const key: string = asset.key;
                            assets[key] = asset;
                            return assets;
                        }, {})
                    })));
        });
        return observables;
    }

    private setConfirmDialogHeader(): void {
        if (this.mode === "MONITORING") {
            this.confirmDialogHeaderText = "Delete File Integrity Monitoring";
        } else {
            this.confirmDialogHeaderText = "Delete File Integrity Exclusion";
        }
    }

    private setFilterOptions(): void {
         // Deleting the "Windows Registry" Option from the ToolbarConfig obj.
         if( this.mode === 'EXCLUSIONS' ) {
            const windowsRegistryPosition = this.toolbarConfig.group.options.map(( item:SelectItem ) => {
                return item.value;
            }).indexOf('win_reg');
            if (windowsRegistryPosition !== -1) {
                this.toolbarConfig.group.options.splice(windowsRegistryPosition, 1);
            }
        }
    }

    private shouldFetchAssets(): boolean {
        for (let assetType of this.allowedAssetTypes) {
            if (!this.assetsMap[assetType]) {
                return true;
            }
        }
        return false;
    }

    private setTitles(): void {
        if (this.mode === 'EXCLUSIONS') {
            this.title.header = '';
            this.title.page = 'File Integrity Exclusions';
        } else {
            this.title.header = '';
            this.title.page = 'File Integrity Monitoring';
        }
    }

    private setInfoText(): void {
        if (this.mode === 'MONITORING') {
            this.infoText = ` You can configure file monitoring for specific paths of an asset or a
            group of assets from the default files and directories listed below.
            Click the "All File Types" drop-down menu to filter the file types you want to see.`
        } else {
            this.infoText = `You can exclude file monitoring for specific paths of an asset or a group of assets.`
        }
    }

    private setSnackBar() {
        if (this.mode === 'MONITORING') {
            this.actionSnackbarElements = [
                {
                    event: "edit",
                    icon: "edit",
                    text: "SCOPE",
                    visible: true,
                    type: 'button'
                },
                {
                    event: "monitor",
                    text: "MONITOR",
                    visible: true,
                    type: 'input_switch',
                    checked: false,
                }
            ];
        } else {
            this.actionSnackbarElements = [
                {
                    event: "delete",
                    icon: "delete",
                    text: "DELETE",
                    visible: true,
                    type: 'button'
                },
                {
                    event: "edit",
                    icon: "edit",
                    text: "SCOPE",
                    visible: true,
                    type: 'button'
                }
            ];
        }
    }

    private processResponses = ([configurations, assets]: [AlFimConfiguration[],
        ({ [i: string]: AssetDescriptor })[]]) => {
        if (assets) {
            this.storeAssets(assets);
        }
        configurations.forEach(this.fetchUser);
        this.configurations = configurations;
        this.cardItems = [];
        this.configurations.sort((a:AlFimConfiguration, b: AlFimConfiguration) => {
            if(a.base < b.base) { return -1; }
            if(a.base > b.base) { return 1; }
            return 0;
        });
        this.configurations.forEach((configuration: AlFimConfiguration) => {
            this.configurationsMap[configuration.id] = configuration;
            this.cardItems.push({
                item: configuration,
                selected: false,
                searchableVals: this.getSearchableVals(configuration)
            });
        });
        this.groups = this.createListGroups(this.cardItems);
        this.filteredGroups = this.groups.slice();
        this.apiError = false;
        this.loading = false;
    }

    private processError = (error): void => {
        this.apiError = true;
        this.loading = false;
        this.groups = [];
        this.filteredGroups = [];
        this.notify.emit({
            type: 'error',
            text: "An error occured while fetching the data"
        });
        console.error(error);
    }

    private getSearchableVals({ description, base, pattern, scope, type }: AlFimConfiguration): Array<number | string> {
        const searchableVals: Array<string | number> = [];
        [description, base, pattern, type].forEach((val: string) => {
            if (val) {
                searchableVals.push(val);
            }
        });
        if (scope) {
            scope.forEach((asset: AlFimAsset) => {
                const val: string =
                    asset.type === 'tag' ? asset.value : asset.name ? asset.name : asset.key;
                searchableVals.push(val);
            });
        }
        return searchableVals;
    }

    private storeAssets(assets: ({ [i: string]: AssetDescriptor })[]): void {
        this.assetsMap = {};
        this.tagsMap = {};
        assets.forEach((assetsDict, index) => {
            const type = this.allowedAssetTypes[index];
            this.assetsMap[type] = assetsDict;
            if (type === 'tag') {
                Object.values(assetsDict).forEach(tag => {
                    this.tagsMap[`${tag.properties['tag_value']}/${tag.properties['tag_key']}`] = tag;
                });
            }
        });
    }

    private fetchUser = (config: AlFimConfiguration): void => {
        const modifiedBy: string = config.hasOwnProperty('modified')? config.modified.by : '0';
        const createdBy: string = config.hasOwnProperty('created') ? config.created.by : '0';
        [createdBy, modifiedBy].forEach((userId: string) => {
            if (!this.usersMap[userId]) {
                this.usersMap[userId] =
                    observableFrom(AIMSClient.getUserDetails(this.primaryAccoundId, userId))
                        .pipe(share(),
                            catchError(() => observableOf(this.unknownUser)));
            }
        });
    }

    /** Configuration Data for SnackBar. **/
    private snackBarConfig(): void {
        this.actionSnackbarVisible = this.selectedItems.length > 0;
        this.actionSnackbarText = this.selectedItems.length + ' File Path(s) Selected';
        if (this.mode === 'MONITORING') {
            if (this.selectedItems.find(item => !item.item.enabled)) {
                this.actionSnackbarElements[1].checked = false;
            } else {
                this.actionSnackbarElements[1].checked = true;
            }
        }
    }

    /** Configuration Data for SelectAll Checkbox. **/
    private selectAllConfig(): void {
        this.toolbarConfig.selectAll = this.cardItems.length === this.selectedItems.length ? true : false;
        this.toolbarConfig = cloneDeep(this.toolbarConfig);
    }

    /**
     * addSelectedItem Function
     *
     * Adding new items to the SelectedItems array, this funcion also check if the item is already added.
     *
     * @param item CardItem
     */
    private addSelectedItem(item: CardItem): void {
        if (!item.selected) {
            const removeIndex = this.selectedItems
                .map((cardItem: CardItem) => cardItem.item.id)
                .indexOf(item.item.id);
            this.selectedItems.splice(removeIndex, 1);
        } else if (!this.selectedItems.find(card => card.item.id === item.item.id)) { // FIM ID is missing
            this.selectedItems.push(item);
        }

    }

    /**
     * clearSelectedItems Function
     *
     * Clear all the Selected Items.
     */
    private clearSelectedItems(): void {
        this.selectedItems = [];
        this.snackBarConfig();
        this.filteredGroups.forEach((itemgroup: FimGroup) => {
            for (const group in itemgroup) {
                if (itemgroup.hasOwnProperty(group)) {
                    itemgroup[group].selected = false;
                    itemgroup[group].list.forEach((cardItem: CardItem) => {
                        cardItem.selected = false;
                    });
                }
            }
        });
        this.headerNavTool.state.selectAll = false;
    }

}

