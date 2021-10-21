import { ALCargoV2 } from '@al/cargo';
import {
    AlCardstackItem,
    AlErrorHandler,
    AlSearchStylist,
    AlLocation,
    AlWrappedError
} from '@al/core';
import {
    AlBaseCardConfig,
    AlBaseCardItem,
    AlCardstackComponent
} from '@al/ng-cardstack-components';
import {
    AlActionSnackbarElement,
    AlActionSnackbarEvent,
    AlToastMessage,
    AlToastService,
    AlUiFilterValue,
    AlTrackingMetricEventName,
    AlTrackingMetricEventCategory
} from '@al/ng-generic-components';
import { AlNavigationService } from '@al/ng-navigation-components';
import { AlSuggestionsClientV2 } from '@al/suggestions';
import {
    AfterViewInit,
    Component,
    OnInit,
    QueryList,
    ViewChildren,
    Input,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { combineLatest } from 'rxjs';
import { AlBlobService } from '../services/al-blob-service';
import { AlArtifactsCardstack } from '../types/al-artifacts-cardstack';
import {
    AlArtifactsDefinition,
    AlArtifactsProperties,
} from '../types/al-artifacts-definition';

@Component({
    selector: 'al-artifacts-list',
    templateUrl: './al-artifacts-list.component.html',
    styleUrls: ['./al-artifacts-list.component.scss'],
})
export class AlArtifactsListComponent implements OnInit, AfterViewInit {

    @Input()
    public type:string = 'artifacts';
    @ViewChildren('alCardstack') cardstack!: QueryList<AlCardstackComponent>;
    // action snackbar variables
    public actionSnackbarText = '';
    public actionSnackbarVisible = false;
    public actionSnackbarButtons: AlActionSnackbarElement[] = [
        {
            event: "download",
            icon: "get_app",
            text: "DOWNLOAD",
            visible: true,
            type: 'button',
        },
        {
            type: 'button',
            event: "delete",
            icon: "delete",
            text: "DELETE",
            visible: true,
        },
    ];

    // al-base-card variables
    public configAlBaseCard: AlBaseCardConfig = {
        toggleable: false,
        toggleableButton: false,
        checkable: true,
        hasIcon: true
    };

    public artifactsCardstack!: AlArtifactsCardstack;
    public accountId: string = "";
    public timeoutShowMsg: number = 5000;
    public currentSelection: Array<AlCardstackItem<AlArtifactsDefinition, AlArtifactsProperties>> = [];

    public alCardstack?: AlCardstackComponent;

    constructor(
        private alToastService: AlToastService,
        private confirmationService: ConfirmationService,
        private navigation: AlNavigationService,
        private route: ActivatedRoute,
        private blobService: AlBlobService
    ) {
    }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            if (params.hasOwnProperty('accountId')) {
                this.loadCardstack(params.accountId);
            } else {
                console.error('idk');
            }
        }, (e) => {
            console.error(e);
        });
    }

    loadCardstack(accountId:string){
        if (this.alCardstack) {
            this.alCardstack.clearState();
        }
        if (!this.artifactsCardstack) {
            this.artifactsCardstack = new AlArtifactsCardstack(this.type);
        }
        this.artifactsCardstack.loading = true;
        this.closeActionSnackbar();
        this.currentSelection = [];

        this.artifactsCardstack.setAccount(accountId);
        this.accountId = accountId;

        this.artifactsCardstack.start().then(() => {
            this.artifactsCardstack.loading = false;
            if (this.cardstack.first) {
                this.cardstack.first.setCharacteristics();
            }
        });
    }

    ngAfterViewInit() {
        if(this.type === 'scheduled_search'){
            this.actionSnackbarButtons.shift();
        }
        combineLatest([
            this.cardstack.changes,
            this.route.queryParamMap,
        ]).subscribe(([cardstack, queryParam]) => {
            if (!this.alCardstack && cardstack.first) {
                this.alCardstack = cardstack.first;

                if(this.alCardstack){
                    if (queryParam.has('scheduleId')) {
                        let value = this.alCardstack.view.getValue( "scheduleName", queryParam.get( "scheduleId" ));
                        let cardstack = this.alCardstack;
                        setTimeout(() => {
                            cardstack.setActiveFilter( value as AlUiFilterValue);
                        }); // setTimeout is added as we have getting error 'ExpressionChangedAfterItHasBeenCheckedError';
                    }
                    if (queryParam.has('reportId')) {
                        const searchReportId = queryParam.get('reportId') || '';
                        this.alCardstack.setInputTextFilter(searchReportId);
                        // this.artifactsCardstack.filterByReportId = searchReportId;
                        this.artifactsCardstack.applyTextFilter(searchReportId);
                    }
                }
            }
        }, (error) => console.log(error));
    }

    onDeleteArtifactCorfimation(artifacts: AlCardstackItem<AlArtifactsDefinition, AlArtifactsProperties>[]) {
        let entity = { singular: "", plural: ""};
        entity.plural = this.type === 'artifacts' ? 'reports' : 'scheduled searches';
        entity.singular = this.type === 'artifacts' ? 'report' : 'scheduled search';
        let message = `Are you sure you want to delete ${artifacts.length} ${entity.plural}?`;
        if (artifacts.length === 1) {
            message = `Are you sure you want to delete this ${entity.singular}?`;
        }
        this.confirmationService.confirm({
            message,
            accept: async () => {
                let success = false;
                const ids = this.currentSelection.map((alert) => alert.entity.id);
                success = await this.artifactsCardstack.batchDelete(ids);
                message = `${artifacts.length} artifacts were deleted successfully`;

                this.closeActionSnackbar();
                if (success) {
                    this.artifactsCardstack.start();
                    this.artifactsCardstack.continuation = undefined;
                    this.artifactsCardstack.remainingPages = 1;
                    if (this.alCardstack) {
                        this.alCardstack.uncheckToolbarAllOption();
                    }
                    this.showMessage(message);
                } else {
                    this.showGeneralErrorMessage("Something went wrong. Refresh the page and try again.");
                    this.actionSnackbarProccess();
                }
            },
        });
    }

    async batchDeleteAlert(ids: string[]): Promise<boolean> {
        try {
            await this.artifactsCardstack.batchDelete(ids);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    showMessage = (mgs: string) => {
        const alToastMessage: AlToastMessage = {
            sticky: true,
            closable: false,
            life: this.timeoutShowMsg,
            data: {
                message: mgs,
            },
        };
        this.alToastService.showMessage('notifications', alToastMessage);
        setTimeout(() => {
            this.alToastService.clearMessages('notifications');
        }, this.timeoutShowMsg);
    }

    /**
     * Show an error
     * @param msg
     */
    showGeneralErrorMessage(msg: string) {
        if (!this.alCardstack) {
            throw new Error('alCardstack view must be defined');
        }
        if (!this.alCardstack.viewHelper) {
            throw new Error('alCardstack.viewHelper view must be defined');
        }
        this.alCardstack.viewHelper.notifyError(msg, this.timeoutShowMsg);
    }

    changeAllSelection(checked: boolean = false) {
        if (!this.alCardstack) {
            throw new Error('alCardstack view must be defined');
        }
        this.updateCurrentSelection(checked);
        this.alCardstack.updateCheckState();
        this.actionSnackbarProccess();
    }

    changeSimpleSelection(item: AlBaseCardItem) {
        if (!item.checked && this.alCardstack) {
            this.alCardstack.uncheckToolbarAllOption();
        }
        for (let i = 0; i < this.artifactsCardstack.cards.length; i++) {
            const card = this.artifactsCardstack.cards[i];
            if (item.id === card.id) {
                card.checked = item.checked;
                break;
            }
        }
        this.updateCurrentSelection(false);
        this.actionSnackbarProccess();
    }

    updateCurrentSelection(checked: boolean = false) {
        this.currentSelection = checked ? [...this.artifactsCardstack.cards] : this.artifactsCardstack.cards.filter((c) => c.checked);
    }

    actionSnackbarProccess() {
        if (this.currentSelection.length > 0) {
            this.openActionSnackbar(`${this.currentSelection.length} Selected`);
        } else {
            this.closeActionSnackbar();
        }
    }

    changeVisibleAlSnackbarButtons(event: string, value: boolean) {
        for (let i = 0; i < this.actionSnackbarButtons.length; i++) {
            const button = this.actionSnackbarButtons[i];
            if (event === button.event) {
                button.visible = value;
                break;
            }
        }
    }

    async actionSnackbarEvent(event: AlActionSnackbarEvent) {
        switch (event) {
            case 'download':
                this.artifactDownloadBulk(this.currentSelection);
                break;
            case 'delete':
                this.onDeleteArtifactCorfimation(this.currentSelection);
                break;
            default:
                break;
        }
    }

    closeActionSnackbar() {
        this.actionSnackbarVisible = false;
        this.actionSnackbarText = '';
    }

    openActionSnackbar(text: string) {
        this.actionSnackbarVisible = true;
        this.actionSnackbarText = text;
    }

    iconCardFunction = (item: AlCardstackItem<AlArtifactsDefinition, any>): Object => {
        let name:string = '';
        if (item.properties.format === 'gz' || item.properties.format === 'combined') {
            name = 'archive';
        } else if (item.properties.format === 'csv') {
            name = 'grid_on';
        } else {
            name = 'picture_as_pdf';
        }
        return {
            name: name
        };
    }

    goToSearch(item:AlArtifactsDefinition) {
        const queryId = item.properties.artifactData?.metadata?.query_id;
        if (queryId) {
            this.artifactsCardstack.loading = true;
            AlSuggestionsClientV2.getSavedQuery(this.accountId, queryId as string).then(savedSearch => {
                const relativeUrl = `/#/search/expert/${this.accountId}`;
                const params = {
                    sql: savedSearch.search_request,
                    mode: "expert",
                    autosearch: "true"
                };
                this.navigation.navigate.byLocation( AlLocation.SearchUI, relativeUrl, params );
            });
        }

        // Let's track the open search query event
        this.trackSavedSearchEvent(undefined, { label: 'Load saved search from other tab' });
    }

    goToSchedule(item:AlArtifactsDefinition) {
        const reportId = item.properties.scheduleId;
        if (reportId) {
            this.artifactsCardstack.loading = true;
            const relativeUrl = `/#/saved-searches/${this.accountId}`;
            this.navigation.navigate.byLocation( AlLocation.SearchUI, relativeUrl, { scheduleId: reportId } );
        }
    }

    async artifactDownload(item:AlArtifactsDefinition) {
        item.properties.downloading = true;
        if ( this.type === 'artifacts' ) {
            await this.artifactDownloadCargo( item );
        } else if ( this.type === 'scheduled_search' ) {
            await this.artifactDownloadScheduledSearch( item );
        }
        item.properties.downloading = false;
    }

    async artifactDownloadCargo( item:AlArtifactsDefinition ) {
        try {
            let successResponse = await ALCargoV2.getExecutionRecordResult(this.accountId,item.id);
            const downloads = item.properties.artifactData?.attachments;
            if (downloads) {
                let fileName = downloads[0].name;
                this.blobService.donwloadFile(successResponse as BlobPart, fileName);
            } else {
                let fileName = '';
                if (item.properties.subtitle) {
                    fileName = fileName+item.properties.subtitle; // schedule name
                }
                fileName = fileName+item.caption;
                let format = item.properties.format ? "."+item.properties.format : '.pdf';
                this.blobService.donwloadFile(successResponse as BlobPart, fileName+format);
            }
        } catch( error ) {
            AlErrorHandler.log( error, "Failed to retrieve execution record result" );
            this.showGeneralErrorMessage("Something went wrong. Refresh the page and try again.");
        }
    }

    async artifactDownloadScheduledSearch( item:AlArtifactsDefinition ) {
        try {
            if ( ! item.properties.artifactData || ! item.properties.artifactData.attachments || ! item.properties.artifactData.result_id ) {
                throw new AlWrappedError( "The artifact does not contain any data or attachments", item.properties );
            }
            let resultId = item.properties.artifactData.result_id;
            for ( let i = 0; i < item.properties.artifactData.attachments.length; i++ ) {
                let attachment = item.properties.artifactData.attachments[i];
                /** If we want to convert the result to the user timezone we would need to convert file name as well. getUserTimezone from @al/core
                /* const fetchParams: {utc_offset?:string } = {utc_offset: getUserTimezone()}; */
                let response:BlobPart = await AlSearchStylist.searchStylist(this.accountId, resultId, 'csv', undefined, true);
                this.blobService.donwloadFile(response as BlobPart, attachment.name);
            }
        } catch( error ) {
            AlErrorHandler.log( error, "Failed to retrieve execution record result" );
            this.showGeneralErrorMessage("Something went wrong. Refresh the page and try again.");
        }
    }

    artifactDownloadBulk(artifacts: AlCardstackItem<AlArtifactsDefinition, AlArtifactsProperties>[]) {
        if (artifacts.length === 1) {
            this.artifactDownload(artifacts[0]);
        } else if (artifacts.length > 1) {
            const ids = artifacts.reduce((ids, artifact, i) => ids + (i ? "," : "") + artifact.id, "");
            ALCargoV2.getExecutionRecordResultsArchive(this.accountId, ids).then(
                response => this.blobService.donwloadFile(response as BlobPart, "Downloads.tar"),
                (error) =>{
                    console.error('getExecutionRecordResult', error);
                    this.showGeneralErrorMessage("Something went wrong. Refresh the page and try again.");
                }
            );
        }
    }

    /**
     * This function will handle the tracking for all artifacts related events
     *
     * @param eventData Object representing the available properties to be overwritten
     */
    public trackSavedSearchEvent(category: string = AlTrackingMetricEventCategory.SearchAction,
                            eventData: {action?: string, label: string, value?: any}): void {
        // Let's merge the incoming event data object into the default
        // one in order to overwrite what we need from the caller event
        let data: {[key: string]: any} = {
            ...{
                category: category,
                action: 'Download Artifact Actions'
            },
            ...eventData
        };
        this.navigation.track(AlTrackingMetricEventName.UsageTrackingEvent, data);
    }
}
