import {
    OnInit,
    Component,
    ViewChild,
    Input,
    EventEmitter,
    Output,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import {
    AlBottomSheetComponent,
    AlViewHelperComponent,
    AlBottomSheetHeaderOptions,
    AlChipItem,
    AlSelectItem,
    AlMultiSelectListComponent,
    AlSelectableListComponent
} from '@al/ng-generic-components';
import { AssetDescriptor } from '@components/technical-debt';
import { TitleCasePipe } from '@angular/common'
import { AlFimConfiguration, getFullPath, AlFimAsset, AlFimClient } from '@al/fim';

import { from as observableFrom, Observable, forkJoin as observableForkJoin } from 'rxjs'
import { fimType } from '../../types';

@Component({
    selector: 'al-deployment-fim-bulk-edit-scope-form',
    templateUrl: './deployment-fim-bulk-edit-scope-form.component.html',
    styleUrls: ['./deployment-fim-bulk-edit-scope-form.component.scss']
})
export class DeploymentFimBulkEditScopeFormComponent implements OnChanges, OnInit {

    @ViewChild('alBottomSheet', { static: false }) alBottomSheet: AlBottomSheetComponent;

    @ViewChild('alViewHelper', { static: true }) alViewHelper: AlViewHelperComponent;

    @ViewChild('assetsMultiSelect', { static: false }) assetsMultiSelect: AlMultiSelectListComponent;

    @Input()
    headerOptions: AlBottomSheetHeaderOptions;

    @Input()
    accountId: string;

    @Input()
    assetsMap: { [i: string]: { [i: string]: AssetDescriptor } };

    @Input()
    tagsMap: {[i: string]: AssetDescriptor};

    @Input()
    allowedAssetTypes: string[];

    @Input()
    configurations: AlFimConfiguration[];

    @Input()
    configurationsMap: {[i: string]: AlFimConfiguration};

    @Input()
    deploymentId: string;

    @Input()
    mode:fimType = 'EXCLUSIONS';

    @Output()
    closeModal: EventEmitter<never> = new EventEmitter();

    @Output()
    onChangedData: EventEmitter<any> = new EventEmitter();

    @Output()
    saveModal: EventEmitter<AlFimConfiguration> = new EventEmitter();

    @Output()
    apiError: EventEmitter<never> = new EventEmitter();

    pathOptions: AlSelectItem[] = [];

    changedPaths:  AlSelectItem[] = null;

    selectedPaths: AlSelectItem[] = [];

    selectedConfigs: AlFimConfiguration[] = [];

    filteredSelectedPaths: AlSelectItem[] = [];

    scopeOptions: AlChipItem[] = [];

    scopeRadioSelect: 'add' | 'replace' = 'add';

    addRadioButtonFormLabel:string = '';

    replaceRadioButtonFormLabel:string = '';

    readonly enableNotifyPanel: boolean = true;

    private selectedScope: AlChipItem[] = [];

    private readonly errorAutoDismiss = 5000;

    constructor(protected titleCasePipe: TitleCasePipe) { }

    ngOnInit(): void {
    }

    ngOnChanges(): void {
        this.setSelectableItems();
    }

    setSelectableItems(): void {
        if (this.assetsMap && this.allowedAssetTypes && this.configurations) {
            this.scopeOptions = this.assetsToSelectItems();
            this.pathOptions = this.configurationsToSelecItems();
        }
    }

    open(selectedConfigurations: AlFimConfiguration[]): void {
        this.alBottomSheet.open();
        this.setSelectedPathOptions(selectedConfigurations);
        this.selectedConfigs = selectedConfigurations;
        this.headerOptions.primaryAction.disabled = true;
        this.addRadioButtonFormLabel = this.mode === 'MONITORING' ? 'Apply additional assets to the selected file paths':
            'Exclude additional assets for monitoring from the selected file paths';
        this.replaceRadioButtonFormLabel = this.mode === 'MONITORING' ?
                'Replace the existing assets with a new scope (this will override any existing monitoring policies in file paths that you previously scoped)':
                    'Replace the existing assets with new exclusions (this will override any existing exclusion policies in file paths that you previously scoped)';
    }

    close(): void {
        if (this.assetsMultiSelect) {
            this.assetsMultiSelect.value = [];
        }
        this.changedPaths = null;
        this.scopeRadioSelect = 'add';
        this.alBottomSheet.hide();
        this.closeModal.emit();
    }

    save(): void {
        const paths: AlSelectItem[] = this.getPathsToUpate();
        const configs: AlFimConfiguration[] = paths.map(option => this.configurationsMap[option.id]);
        const scope: AlFimAsset[] = this.calculateScope();
        const observables: Observable<AlFimConfiguration>[] =
            configs.map((config: AlFimConfiguration) => {
                let newScope: AlFimAsset[] = this.scopeRadioSelect === 'replace' ?
                                                    scope : scope.concat(config.scope ? config.scope : [])
                newScope = newScope.reduce((scopeItem: AlFimAsset[], current: AlFimAsset): AlFimAsset[] => {
                    const scopeElement = scopeItem.find(item => item.type !== 'tag' && item.key === current.key);
                    return scopeElement ? scopeItem : scopeItem.concat([current]);
                },[]);
                return observableFrom(
                    AlFimClient
                        .updateConfiguration(
                            this.mode === 'EXCLUSIONS' ? 'excluded_paths' : 'monitored_paths',
                            this.accountId,
                            this.deploymentId,
                            config.id,
                            {
                                version: config.version,
                                type: config.type,
                                base: config.base,
                                ...( config.pattern && { pattern: config.pattern }),
                                ...( newScope.length > 0 && { scope: newScope }),
                                enabled:config.enabled
                            } as AlFimConfiguration)
                )
            });
        this.processSaveRequests(observables);
    }

    searchPaths(term: string): void {
        const regex: RegExp = new RegExp(term, 'i');
        this.filteredSelectedPaths
            = this.selectedPaths.filter(path => regex.test(path.title) || regex.test(path.subtitle))
    }

    removePath(path: AlSelectItem): void {
        let index: number = this.filteredSelectedPaths.indexOf(path);
        this.filteredSelectedPaths.splice(index, 1);
        index = this.selectedPaths.indexOf(path);
        this.selectedPaths.splice(index, 1);
        this.changedPaths =
            this.filteredSelectedPaths.length > 0 ? this.filteredSelectedPaths.slice() : null;
        this.disableSaveButton(
            this.areSettingsValid()
        );
    }

    scopeChange(options: AlChipItem[]): void {
        this.selectedScope = options.reduce((option, current) => {
            const optionItem = option.find(item => item.id === current.id);
            if (!optionItem) {
                return option.concat([current]);
            } else {
                return option;
            }
        }, []);
        this.disableSaveButton(
            this.areSettingsValid()
        );
    }

    private disableSaveButton(isValid: boolean): void {
        this.headerOptions.primaryAction.disabled = !isValid;
    }

    private areSettingsValid(): boolean {
        const paths: AlSelectItem[] = this.getPathsToUpate();
        return !(paths.length === 0 || this.selectedScope.length === 0);
    }

    private processSaveRequests(observables: Observable<AlFimConfiguration>[]): void {
        observableForkJoin(observables)
        .subscribe(
            (_) => {
                this.saveModal.emit(null);
                this.close();
            },
            ({data}) => {
                this.alViewHelper
                    .notifyError(`Cannot save the scope changes. Reason: ${data.errorinfo.description}`,
                                 this.errorAutoDismiss);
                console.error("Unexpected error ", data);
                this.close();
            }
        )
    }

    private getPathsToUpate(): AlSelectItem[] {
        return this.changedPaths ? this.changedPaths : this.selectedPaths
    }

    private calculateScope(): AlFimAsset[] {
        const scope: AlFimAsset[] = [];
        this.selectedScope.forEach(option => {
            const key = (typeof option.value === "string") ? option.value : option.value.value;
            let asset: AssetDescriptor;
            this.allowedAssetTypes.forEach((type: string) => {
                if (this.assetsMap[type][key]) {
                    asset = this.assetsMap[type][key];
                }
            });

            if (asset.type === 'tag') {
                scope.push({
                    type: 'tag',
                    name: asset.properties['tag_key'],
                    value: asset.properties['tag_value']
                });
            } else if (asset.type === 'subnet') {
                scope.push({type: 'subnet', key: asset.key});
            } else if (asset.type === 'vpc') {
                scope.push({type: 'vpc', key: asset.key});
            } else if (asset.type === 'region') {
                scope.push({type: 'region', key: asset.key});
            } else if (asset.type === 'host') {
                scope.push({type: 'host', key: asset.key});
            }
        });
        return scope;
    }

    private configurationsToSelecItems(): AlSelectItem[] {
        let items: AlSelectItem[] = []
        this.configurations.forEach((config: AlFimConfiguration) => {
            const path: string = getFullPath(config);
            items.push({
                id: config.id,
                title: path,
                subtitle: config.description ? config.description.slice(0, 15) : '',
                value: {
                    id: config.id,
                    title: path,
                    subtitle: config.description,
                    checked: false
                }
            })
        });
        return items
    }

    private setSelectedPathOptions(selectedConfigs: AlFimConfiguration[]): void {
        const selectedOptions: AlSelectItem[] = [];
        selectedConfigs.forEach(config => {
            this.pathOptions.forEach(option => {
                if (option.value.id === config.id) {
                    option.checked = true;
                    selectedOptions.push(option);
                }
            })
        });
        this.selectedPaths = selectedOptions;
        this.filteredSelectedPaths = this.selectedPaths.slice();
    }

    private assetsToSelectItems(): AlChipItem[] {
        let items: AlChipItem[] = [];
        this.allowedAssetTypes.forEach((type: string) => {
            for (let key in this.assetsMap[type]) {
                if (key in this.assetsMap[type]) {
                    const asset: AssetDescriptor = this.assetsMap[type][key];
                    if (asset.type === 'tag') {
                        items.push({
                            id: asset.key,
                            title: asset.name,
                            subtitle: this.titleCasePipe.transform('tag'),
                            separator: "OR",
                            value: {
                                id: asset.key,
                                title: asset.name,
                                subtitle: this.titleCasePipe.transform('tag'),
                                checked: false,
                                value: asset.key,
                                separator: "OR",
                            }

                        });
                    } else {
                        items.push({
                            id: asset.key,
                            title: asset.name,
                            subtitle: this.titleCasePipe.transform(asset.type),
                            separator: "OR",
                            value: {
                                id: asset.key,
                                title: asset.name,
                                subtitle: this.titleCasePipe.transform(asset.type),
                                checked: false,
                                value: asset.key,
                                separator: "OR",
                            }
                        });
                    }
                }
            }
        });
        return items;
    }

}
