import { AlLocation } from '@al/core';
import {
    AlBottomSheetComponent,
    AlBottomSheetHeaderOptions,
    AlViewHelperComponent,
} from '@al/ng-generic-components';
import {
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { AlNavigationService } from '@al/ng-navigation-components';
import { AlCreateSavedQueryParamsV2, AlSavedQueryV2, AlSuggestionsClientV2, AlUpdateSavedQueryParamsV2 } from '@al/suggestions';
import { ScheduledReportV2 } from '@al/cargo';

interface SavedSearchProperties {
    id: string;
    name: string;
    description: string;
    tags: string[];
    createScheduledSearch: boolean;
    schedules?: ScheduledReportV2[];
    search_request: string;
}

@Component({
    selector: 'al-saved-searches-form',
    templateUrl: './al-saved-searches-form.component.html',
    styleUrls: ['./al-saved-searches-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AlSavedSearchesFormComponent implements OnInit {

    @Input() public accountId:string = "";

    @Output() public goToSchedule = new EventEmitter<AlSavedQueryV2>();
    @Output() public onSuccess = new EventEmitter<string>();
    @Output() public onError = new EventEmitter<string>();
    @Output() public onCancel = new EventEmitter<void>();

    headerOptions: AlBottomSheetHeaderOptions  = {
        icon:  'date_range',
        title:  'Save Search',
        primaryAction: {
            text: 'Save',
            disabled:  true,
        },
        secondaryAction:{
            text:  'Cancel',
            disabled:  false,
        },
    };

    public editorOptions = {
        theme: 'emsqlTheme',
        language: 'emsql',
        automaticLayout: true,
        minimap: {
            enabled: false
        }
    };

    @ViewChild("alBottomSheet") alBottomSheet!:AlBottomSheetComponent;
    @ViewChild(forwardRef(() => AlViewHelperComponent)) viewHelper?: AlViewHelperComponent;
    @ViewChild("editor") editor: any;

    public saveSearchID:string = "";
    public loading:boolean = true;
    public editMode:boolean = false;
    public editedSearchQuery?: string;

    public savedSearchProperties: SavedSearchProperties = {
        id: '',
        name: '',
        description: '',
        tags: [],
        createScheduledSearch: false,
        search_request: '',
    };

    public availableTags: string[] = [];
    public suggestedTags: string[] = [];
    public scheduleCadence: string[] = [];

    constructor(
        private navigation: AlNavigationService
    ) { }

    ngOnInit() {
        this.resetComponent();
    }

    /**
     * Reset the component.
     */
    public resetComponent() {
        this.saveSearchID = "";
        this.savedSearchProperties = {
            id: '',
            name: '',
            description: '',
            tags: [],
            createScheduledSearch: false,
            search_request: '',
        };
        this.availableTags = [];
        this.suggestedTags = [];
        if (this.headerOptions.primaryAction) {
            this.headerOptions.primaryAction.text = "Save";
        }
    }

    /**
     * TODO: This could be improved using reactive forms, this
     * could be achieve when all controllers implement value accessor.
     */
    public validateForm() {
        this.savedSearchProperties.name = this.savedSearchProperties.name.trim();
        if (this.headerOptions.primaryAction) {
            this.headerOptions.primaryAction.disabled = ! this.savedSearchProperties.name;
        }
    }

    public showErrorMessage (message:string) {
        this.onError.emit(message);
        this.loading = false;
    }

    public updateSavedSearch() {
        console.log("Updating saved search");
    }

    public save() {
        this.validateForm();
        this.loading = true;
        if (!this.editMode) {
            AlSuggestionsClientV2.createSavedQuery(
                this.accountId,
                {
                    name: this.savedSearchProperties.name,
                    description: this.savedSearchProperties.description,
                    search_request: this.savedSearchProperties.search_request,
                    tags: this.savedSearchProperties.tags,
                } as AlCreateSavedQueryParamsV2).then(
                    (savedQuery: AlSavedQueryV2) => {
                        this.onSuccess.emit(`"${this.savedSearchProperties.name}" saved query was created successfully.`);
                        this.loading = false;
                        if (this.savedSearchProperties.createScheduledSearch) {
                            this.goToSchedule.emit(savedQuery);
                        }
                        this.alBottomSheet.hide();
                    },
                    (error) => {
                        console.error(error);
                        this.showErrorMessage(this.getErrorMessage(error) || 'We are sorry, there was an internal error creating the saved search.');
                    }
                );
        } else {
            AlSuggestionsClientV2.updateSavedQuery(
                this.accountId,
                this.savedSearchProperties.id,
                {
                    name: this.savedSearchProperties.name,
                    description: this.savedSearchProperties.description,
                    search_request: this.editedSearchQuery || this.savedSearchProperties.search_request,
                    tags: this.savedSearchProperties.tags,
                } as AlUpdateSavedQueryParamsV2
            ).then(
                (savedQuery: AlSavedQueryV2) => {
                    this.onSuccess.emit(`"${this.savedSearchProperties.name}" saved query was updated successfully.`);
                    this.loading = false;
                    if (this.savedSearchProperties.createScheduledSearch) {
                        this.goToSchedule.emit(savedQuery);
                    }
                    this.alBottomSheet.hide();
                    if (this.editedSearchQuery) {
                        const relativeUrl: string = `/#/saved-searches/${this.accountId}`;
                        this.navigation.navigate.byLocation(AlLocation.SearchUI, relativeUrl, { savedSearchId: this.savedSearchProperties.id } );
                    }
                },
                (error) => {
                    console.error(error);
                    this.showErrorMessage(this.getErrorMessage(error) || 'We are sorry, there was an internal error updating the saved search.');
                }
            );
        }
    }

    public cancel() {
        this.alBottomSheet.hide();
        if (this.editMode && this.editedSearchQuery) {
            const relativeUrl: string = `/#/saved-searches/${this.accountId}`;
            this.navigation.navigate.byLocation(AlLocation.SearchUI, relativeUrl);
        }
        this.onCancel.emit();
    }

    setTitle = ( title: string ) => {
        this.headerOptions.title = title;
    }

    editModalCollapsed = (properties: SavedSearchProperties|AlSavedQueryV2) => {
        this.editModal(properties);
        this.alBottomSheet.collapse();
    }

    editModal = (properties: SavedSearchProperties|AlSavedQueryV2) => {
        this.resetComponent();
        this.setAvailableTags();
        this.editMode = true;

        if (this.headerOptions.primaryAction) {
            this.headerOptions.primaryAction.text = "Update";
        }

        this.savedSearchProperties = this.normalize( properties );
        this.scheduleCadence = [];
        if ( `schedules` in properties && Array.isArray( properties.schedules ) ) {
            this.scheduleCadence = properties.schedules.map( (schedule:any) => schedule.name);
        }

        this.loading = false;
        this.alBottomSheet.open();
        this.validateForm();
    }

    /**
     * If we ever find who let SavedSearchProperties diverge from AlSavedQueryV2 without using interface extension, please tell them I would like to speak to them.
     * -- Kevin
     */
    normalize = ( properties:SavedSearchProperties|AlSavedQueryV2 ):SavedSearchProperties => {
        return {
            id: properties.id,
            name: properties.name,
            description: properties.description || '',
            tags: properties.tags || [],
            createScheduledSearch: `createScheduledSearch` in properties ? properties.createScheduledSearch : false,
            schedules: `schedules` in properties ? properties.schedules : undefined,
            search_request: properties.search_request
        };
    }

    openModal(searchRequest: string) {
        this.resetComponent();
        this.setAvailableTags();
        this.loading = true;

        this.savedSearchProperties.search_request = searchRequest;

        this.alBottomSheet.open();
        this.loading = false;
    }

    public onMonacoEditorInit(editor: any) {
        this.editor = editor;
        this.editor.updateOptions({ readOnly: true });
    }

    setAvailableTags = async() => {
        this.availableTags = (await AlSuggestionsClientV2.getPropertyValues(this.accountId, ['tags'])).tags;
    }

    onKeyUpTags(event: KeyboardEvent) {
        const removeUnnecesarySpaces = (s: string) => s.replace(/\s+/g, ' ').replace(/^\s/, '').replace(/\s$/g, '');
        if (event.key === "Enter") {
            let tokenInput = event.target as any;
            if (tokenInput.value) {
                const tag = removeUnnecesarySpaces(tokenInput.value);
                if (!this.savedSearchProperties.tags.includes(tag)) this.savedSearchProperties.tags.push(tag);
                tokenInput.value = "";
            }
        }
    }

    setSuggestedTags(event: {query: string}) {
        const query = event.query;
        this.suggestedTags = this.availableTags
            .filter(tag => tag.search(RegExp(query,'gi')) + 1 )
            .filter(tag => !this.savedSearchProperties.tags.includes(tag));
    }

    updateSaveButton = () => {
        let text = undefined;
        if (this.savedSearchProperties.createScheduledSearch) {
            text = "SAVE AND CONTINUE";
        } else {
            text = this.editMode ? "UPDATE" : "SAVE";
        }
        if (this.headerOptions.primaryAction && text) {
            this.headerOptions.primaryAction.text = text;
        }
    }

    editInSearch = () => {
        const relativeUrl: string = `/#/search/expert/${this.accountId}?editSearchId=${this.savedSearchProperties.id}`;
        this.navigation.navigate.byLocation(AlLocation.SearchUI, relativeUrl);
    }

    public getErrorMessage(error: any): string {
        return error.data?.errors[0]?.error_text;
    }
}
