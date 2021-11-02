import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    ViewChild,
} from '@angular/core';
import {TitleCasePipe} from '@angular/common'
import { from as observableFrom } from 'rxjs';
import { AssetDescriptor } from '@components/technical-debt';
import { AlBottomSheetComponent,
         AlBottomSheetHeaderOptions,
         AlChipItem, AlViewHelperComponent } from '@al/ng-generic-components';
import { AlApplicationsClient, AlAssetScopeItem, AlRule, AlTagScopeItem } from '@al/applications';
import { ApplicationLogCardDescriptor as ApplicationLogItem } from '../../../../../types/application-log.types';

@Component({
    selector: 'al-deployment-application-logs-add-scope-rule-form',
    templateUrl: './deployment-application-logs-add-scope-rule-form.component.html',
    styleUrls: ['./deployment-application-logs-add-scope-rule-form.component.scss']
})
export class DeploymentApplicationLogsAddScopeRuleFormComponent implements OnChanges {

    @ViewChild('alBottomSheet', { static: true } )
    alBottomSheet: AlBottomSheetComponent;

    @ViewChild('alViewHelper', { static: true } )
    alViewHelper: AlViewHelperComponent;

    @Output()
    closeModal: EventEmitter<never> = new EventEmitter();

    @Output()
    saveModal: EventEmitter<AlRule> = new EventEmitter();

    @Output()
    apiError: EventEmitter<never> = new EventEmitter();

    @Input() headerOptions: AlBottomSheetHeaderOptions;

    @Input()
    accountId: string;

    @Input()
    deploymentId: string;

    @Input()
    onlyTagAssets: boolean = false;

    @Input()
    allowedAssetTypes: string[];

    @Input()
    assetsMap: {[i: string]:  {[i: string]: AssetDescriptor}};

    currentlySelectedOptions: AlChipItem[] = [];

    multiSelectWithListItems: AlChipItem[] = [];

    private appLogItem: ApplicationLogItem = null;

    private readonly errorAutoDismiss = 5000;

    constructor(private titleCasePipe: TitleCasePipe) { }

    ngOnChanges(): void {
        this.setSelectableItems();
    }

    setSelectableItems(){
        if (this.assetsMap && this.allowedAssetTypes) {
            this.multiSelectWithListItems = this.assetsToSelectItems();
        }
    }

    open(item: ApplicationLogItem) {
        this.appLogItem = item;
        this.alBottomSheet.open();
        this.setSelectedOptions();
    }

    save(): void {
        observableFrom(AlApplicationsClient
                       .updateRule(this.accountId,
                                  this.appLogItem.rule.id,
                                   {scope: this.calculateScope(),
                                    application_id: this.appLogItem.applicationId,
                                    enabled: this.appLogItem.rule.enabled,
                                    name: this.appLogItem.rule.name,
                                    config: this.appLogItem.rule.config}))
        .subscribe(
            (updatedRule: AlRule) => {
                this.currentlySelectedOptions = [];
                this.appLogItem = null;
                this.saveModal.emit(updatedRule);
                this.alBottomSheet.hide();
            },
            (error) => {
                console.error(error);
                this.saveModal.emit(null);
                this.alViewHelper
                    .notifyError("An error occurred while saving your changes",
                                 this.errorAutoDismiss,
                                 true);
            }
        );

    }

    cancel(): void {
        this.appLogItem = null;
        this.currentlySelectedOptions = [];
        this.alBottomSheet.hide();
        this.closeModal.emit();
    }

    private assetsToSelectItems(): AlChipItem[] {
        let items: AlChipItem[] = [];
        this.allowedAssetTypes.forEach((type: string) => {
            for (let key in this.assetsMap[type]) {
                if (key in this.assetsMap[type]) {
                    const asset: AssetDescriptor = this.assetsMap[type][key];
                    if (asset.type === 'tag') {
                        items.push({
                            id: asset.properties['tag_value'],
                            title: asset.name,
                            subtitle: this.titleCasePipe.transform('tag'),
                            separator: "AND",
                            value: {
                                id: asset.properties['tag_value'],
                                title: asset.name,
                                subtitle: this.titleCasePipe.transform('tag'),
                                checked: false,
                                value: asset.properties['tag_value'],
                                separator: "AND",
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

    private calculateScope(): (AlAssetScopeItem | AlTagScopeItem)[] {
        const scope: (AlAssetScopeItem | AlTagScopeItem)[] = [];
        this.currentlySelectedOptions.forEach(option => {
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
            } else if (asset.type === 'deployment') {
                scope.push({type: 'deployment', key: asset.properties['deployment_id']});
            }
        });
        return scope;
    }

    private setSelectedOptions(): void {
        const selectedOptions = [];
        const scope: (AlAssetScopeItem | AlTagScopeItem)[] = this.appLogItem.rule.scope;
        scope.forEach(element => {
            let id: string = (element as AlAssetScopeItem).key;

            if((element as AlTagScopeItem).type === 'tag') {
                id = (element as AlTagScopeItem).value;
            } else if((this.assetsMap && this.assetsMap['deployment']) && (element as AlAssetScopeItem).type === 'deployment') {
                id = Object.keys(this.assetsMap['deployment']).find((keyValue: string) =>
                        this.assetsMap['deployment'][keyValue].properties['deployment_id'] === (element as AlAssetScopeItem).key);
            }

            this.multiSelectWithListItems.forEach(option => {
                if (option.value.value === id) {
                    option.value.checked = true;
                    selectedOptions.push(option);
                }
            });
        });
        this.currentlySelectedOptions = selectedOptions;
    }

}
