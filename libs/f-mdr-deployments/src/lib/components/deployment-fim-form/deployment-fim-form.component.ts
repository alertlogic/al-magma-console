import { OnInit,
        Component,
        ViewChild,
        Input,
        EventEmitter,
        Output, 
        OnChanges,
        ChangeDetectorRef } from '@angular/core';
import { AlBottomSheetComponent,
         AlViewHelperComponent,
         AlBottomSheetHeaderOptions, 
         AlChipItem, AlMultiSelectListComponent} from '@al/ng-generic-components';
import { AssetDescriptor } from '@components/technical-debt';

import {TitleCasePipe} from '@angular/common'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { emptyConfiguration, emptyFormControl } from './form-helpers';
import { AlFimConfiguration,
         AlFimAsset,
         fimConfigType,
         fimPathType,
         getFullPath,
         AlFimClient,
         windowsDirectoryRegex,
         windowsRegistryRegex,
         nixRegex, 
         fimAssetType} from '@al/fim';
import { fimType, fimFormMode as mode } from '../../types';

import { from as observableFrom} from 'rxjs'
import { SelectItem } from 'primeng/api';
import { InputTextarea } from 'primeng/inputtextarea';

@Component({
    selector: 'al-deployment-fim-form',
    templateUrl: './deployment-fim-form.component.html',
    styleUrls: ['./deployment-fim-form.component.scss']
})
export class DeploymentFimFormComponent implements OnChanges, OnInit {

    @ViewChild('alBottomSheet') alBottomSheet: AlBottomSheetComponent;

    @ViewChild('alViewHelper') alViewHelper: AlViewHelperComponent;

    @ViewChild('multiSelectList') multiSelectList: AlMultiSelectListComponent;

    @Input()
    headerOptions: AlBottomSheetHeaderOptions;

    @Input()
    accountId: string;

    @Input()
    deploymentId: string;

    @Input()
    assetsMap: {[i: string]:  {[i: string]: AssetDescriptor}};

    @Input()
    tagsMap: {[i: string]: AssetDescriptor};

    @Input()
    allowedAssetTypes: string[];

    @Input()
    mode:fimType = 'MONITORING';

    @Output()
    closeModal: EventEmitter<never> = new EventEmitter();

    @Output() 
    onChangedData: EventEmitter<any> = new EventEmitter();

    @Output()
    saveModal: EventEmitter<AlFimConfiguration> = new EventEmitter();

    @Output()
    apiError: EventEmitter<never> = new EventEmitter();

    fileTypes:Array<SelectItem>  = [
                   {label:'Select File Type', value: null},
                   {label:'GNU/Linux', value: 'nix_dir'},
                   {label: 'Windows Registry', value: 'win_reg'},
                   {label: 'Windows File', value: 'win_dir'}
                ];

    currentlySelectedOptions: AlChipItem[] = [];

    multiSelectWithListItems: AlChipItem[] = [];

    selectedFileTypeDropDown: {label: string, value: fimConfigType};

    baseDirectoryPath: string = '';

    pattern: string = '';

    description: string = '';

    monitor: boolean = true;

    form: FormGroup = null;

    configuration: AlFimConfiguration;

    writeMode: mode;

    fimType: fimType;

    readonly enableNotifyPanel: boolean = true;
  
    readonly descriptionInfo: string = "State the reason for adding this file path";

    readonly patternInfo: string = "Enter the file name search mask (for example: error -*.log, *.log, error.log). \
                                    You can use expressions like pass.txt or wildcards like *.txt.";

    readonly baseDirectoryPathInfo: string = 'Enter the full path to the share or system directory (for example: /var/www/logs). \
                                              The directory is not allowed to include characters *, ? or | .';

    private readonly errorAutoDismiss = 5000;

    selectorTypeMap:{ [i:string]:{ label: string, value: fimConfigType } } = {
        nix_dir: { label:'GNU/Linux', value:'nix_dir' },
        win_reg: { label:'Windows Registry', value:'win_reg' },
        win_dir: { label:'Windows File', value:'win_dir' }
     }

    constructor(private titleCasePipe: TitleCasePipe,
               private formBuilder: FormBuilder,
               private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.setFormValidations();
        this.setDefaultValues();
        this.cdr.detectChanges();
        this.subscribeToFormChanges();
    }

    ngOnChanges() {
        this.setSelectableItems();
       // this.multiSelectList.value = this.currentlySelectedOptions;
        // Deleting the "Windows Registry" Option from the form selector obj.
        if( this.mode === 'EXCLUSIONS' ) {
            const windowsRegistryPosition = this.fileTypes.map(( item ) => {
                return item.value;
            }).indexOf('win_reg');
            if (windowsRegistryPosition !== -1) {
                this.fileTypes.splice(windowsRegistryPosition, 1);
            }
        }

    }

    setSelectableItems(){
        if (this.assetsMap && this.allowedAssetTypes) {
            this.multiSelectWithListItems = this.assetsToSelectItems();
        }
    }

    setFormValidations(): void {
        this.form = this.formBuilder.group({
            monitor:  [false],
            baseDirectoryPath: ['', [Validators.required]],
            pattern: [''],
        });
    }

    // tslint:disable-next-line: no-shadowed-variable
    open(fimType: fimType = 'MONITORING',
         writeMode: mode = 'CREATE',
         configuration?: AlFimConfiguration): void {
            this.writeMode = writeMode;
            this.fimType = fimType;
            this.configuration = configuration;
            this.setDefaultValues();
            this.setFormExtraSettings();
            this.alBottomSheet.open();
            const isValid: boolean = this.isFormValid();
            this.disableSaveButton(isValid);
            this.disablePatternAndPath();
           
    }

    close(): void {
       this.selectedFileTypeDropDown = null;
        this.currentlySelectedOptions = [];
        this.alBottomSheet.hide();
        this.closeModal.emit();
    }

    save(): void {
       const payload: AlFimConfiguration = this.buildConfigPaylod();
       const apiFimPath = this.fimType === 'MONITORING' ? 'monitored_paths' : 'excluded_paths';
       observableFrom(
        (this.writeMode === 'CREATE' || this.writeMode === 'DUPLICATE') ?
            AlFimClient
            .createConfiguration(apiFimPath,
                                 this.accountId, this.deploymentId, payload)
            :
            AlFimClient
            .updateConfiguration(apiFimPath,
                                 this.accountId, this.deploymentId, this.configuration.id,
                                 { ...{version: this.configuration.version }, ...payload })
       ).subscribe(
           (config: AlFimConfiguration) => {
             this.saveModal.emit(config);
             this.close();
           },
           ({data}) => {
               console.error("Unexpected error ", data);
               this.alViewHelper
                    .notifyError(`Error while saving the configuration. Reason: ${data.errorinfo.description} `,
                                 this.errorAutoDismiss);
                this.close();
           }
       )
    }

    scopeChange(options: AlChipItem[]) {
        this.currentlySelectedOptions = options.reduce((option, current) => {
            const optionItem = option.find(item => item.id === current.id);
            if (!optionItem) {
                return option.concat([current]);
            } else {
                return option;
            }
        }, []);
        const isValid: boolean = this.isFormValid();
        this.disableSaveButton(isValid);
    }

    onInput(_, field: 'base' | 'pattern'): void {
        if (field === 'base') {
            const isValid = this.isFormValid();
            this.disableSaveButton(isValid);
        }
    }

    selectedFileTypeChange({value}): void {
        let validators = [Validators.required];
        const type: fimConfigType  = value.value;
        if (type === 'nix_dir') {
            validators.push(Validators.pattern(nixRegex));
        } else if (type === 'win_dir') {
            validators.push(Validators.pattern(windowsDirectoryRegex));
        } else if (type === 'win_reg') {
            validators.push(Validators.pattern(windowsRegistryRegex));
        }
        this.form.controls['baseDirectoryPath'].setValidators(validators);
        this.form.controls['baseDirectoryPath'].updateValueAndValidity();
        this.selectedFileTypeDropDown = value;
        const isValid: boolean = this.isFormValid();
        this.disableSaveButton(isValid);
    }

    private disablePatternAndPath(): void {
        ['baseDirectoryPath', 'pattern'].forEach(field => {
            this.configuration && this.configuration.system ? this.form.controls[field].disable() : this.form.controls[field].enable();
        })
    }

    private setFormExtraSettings() {
        switch(this.writeMode) {
            case 'CREATE':
                this.baseDirectoryPath = '';
                if (this.fimType === 'MONITORING') {
                    this.headerOptions.title = 'Add File Integrity Monitoring';
                } else {
                    this.headerOptions.title = 'Add File Integrity Exclusion';
                }
                break;
            case 'EDIT':
                if (this.fimType === 'MONITORING') {
                    this.headerOptions.title = 'Edit File Integrity Monitoring';
                } else {
                    this.headerOptions.title = 'Edit File Integrity Exclusion';
                }
                this.setAttributes();
                break;
            case 'DUPLICATE':
                if (this.fimType === 'MONITORING') {
                    this.headerOptions.title = 'Duplicate File Integrity Monitoring';
                } else {
                    this.headerOptions.title = 'Duplicate File Integrity Exclusion';
                }
                this.setAttributes();
                 break;
        }
        
    }

    private setAttributes(): void {
        this.baseDirectoryPath = this.configuration.base;
        this.pattern = this.configuration.pattern ? this.configuration.pattern : "";
        this.description = this.configuration.description ? this.configuration.description: "";
        this.selectedFileTypeChange({
            value : {
                label:this.selectorTypeMap[this.configuration.type].label,
                value:this.selectorTypeMap[this.configuration.type].value
            }
        });
        this.monitor = this.configuration.enabled;
        this.setSelectedOptions();
    }

    private setSelectedOptions(): void {
        const selectedOptions = [];
        const scope: AlFimAsset[] = this.configuration.scope;
        if(scope && scope.length > 0) {
            scope.forEach((fimAsset: AlFimAsset) => {
                    let id: string;
                    try {
                        if (fimAsset.type === 'tag') {
                            const tagAsset: AssetDescriptor = this.tagsMap[`${fimAsset.value}/${fimAsset.name}`];
                            if (tagAsset){ 
                               id =  tagAsset.key 
                            } else {
                                throw Error(`Couln't find tag with value: ${fimAsset.value} And key: ${fimAsset.key}`);
                            }
                        } else {
                            id = fimAsset.key;
                        }
                    } catch(error) {
                        console.warn(error);
                        console.log(this.tagsMap);
                        id = '';
                    }
                    this.multiSelectWithListItems.forEach(option => {
                        if (option.value.value === id) {
                            option.value.checked = true;
                            selectedOptions.push(option);
                        }
                    });
            });
        }
        this.currentlySelectedOptions = selectedOptions;
        this.multiSelectList.value = this.currentlySelectedOptions;
    }

    private buildConfigPaylod(): AlFimConfiguration {
        const type: fimConfigType = this.selectedFileTypeDropDown.value;
        const scope: AlFimAsset[] = this.calculateScope();
        return {
            enabled: this.monitor,
            base: this.baseDirectoryPath,
            type,
            ...(scope.length > 0 && {scope}),
            ...(this.pattern && {pattern: this.pattern}),
            ...(this.description && {description: this.description })
        } as AlFimConfiguration;
    }

    private calculateScope(): AlFimAsset[] {
        const scope: AlFimAsset[] = [];
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
            } else if (asset.type === 'region') {
                scope.push({type: 'region', key: asset.key});
            } else if (asset.type === 'host') {
                scope.push({type: 'host', key: asset.key});
            }
        });
        return scope;
    }

    private setDefaultValues(): void {
        if (!this.configuration) {
            this.configuration = emptyConfiguration;
            this.form.setValue(emptyFormControl);
            this.headerOptions.primaryAction.disabled = true;
        }
       this.description = '';
    }

    private subscribeToFormChanges = (): void => {
        this.form.valueChanges.subscribe(changes => {
            const isValid: boolean = this.isFormValid(changes['pattern'], changes['baseDirectoryPath']);
            this.disableSaveButton(isValid);
            this.onChangedData.emit(isValid);
        });
    }

    private isFormValid = (newPattern?: string, newBasePath?: string): boolean => {
        return !!( newBasePath || this.baseDirectoryPath)
                && ( this.selectedFileTypeDropDown && this.selectedFileTypeDropDown.value)  
                && !!this.currentlySelectedOptions
                && this.form.valid;
    }

    private disableSaveButton(isValid: boolean): void {
        this.headerOptions.primaryAction.disabled = !isValid;
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
