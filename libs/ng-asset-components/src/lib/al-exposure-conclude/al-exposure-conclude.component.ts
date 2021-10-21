/**
 * Conclude exposure side nav panel
 *
 * @author Mohasin Nadaf
 *
 * @copyright Alert Logic, Inc 2020
 */
import { Component, EventEmitter, OnInit, ViewChild, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import * as pageConstants from '../constants/page-constants';
import { AlAssetsQueryClient } from '@al/assets-query';
import { AlSidebarComponent, AlSidebarConfig } from '@al/ng-generic-components';
import { ErrorService } from '../services/error.service';
import { ExposureUtilityService } from '../services/exposure-utility.service';
import { AffectedAssetDetails } from '../types';

@Component({
    selector: 'al-exposure-conclude',
    templateUrl: './al-exposure-conclude.component.html',
    styleUrls: ['./al-exposure-conclude.component.scss']
})
export class AlExposureConcludeComponent implements OnInit, OnChanges {

    public config: AlSidebarConfig;
    public pageConstants = pageConstants;

    @Input() selectionCount: number=0;
    @Input() page: string;
    @Input() accountId: string;
    @Input() filter: string[] | string[][] = [];
    @Input() itemIds: string[] = [];    // this can be exposures or remediations ids array
    @Input() deploymentIds: string[] = [];
    @Input() affectedAssetDetail!: AffectedAssetDetails;

    @Output() notificationsOut = new EventEmitter();
    @Output() onClosed = new EventEmitter();
    @Output() onConcludeSuccess = new EventEmitter();
    @Output() onConcludeFailure = new EventEmitter();

    @ViewChild(AlSidebarComponent, { static: false }) public rightDrawer: AlSidebarComponent;

    private autoDismiss = 5000;
    private pageSingular: string = '';

    constructor(private errorService: ErrorService, private exposureUtilityService: ExposureUtilityService) { }

    ngOnChanges( changes:SimpleChanges ) {
        if ( changes.selectionCount && this.config ) {
            this.config.header.title = "Conclude " + (changes.selectionCount.currentValue > 1 ? changes.selectionCount.currentValue:'') + ' ' + this.pageSingular + (changes.selectionCount.currentValue > 1 ? "s":"");
        }
    }

    ngOnInit() {
        this.pageSingular =  this.page === 'exposures'  ? 'Exposure' :  'Remediation';
        this.config = {
            expand: false,
            expandable: false,
            inline: false,
            modal: true,
            header: {
                title: "Conclude " + this.pageSingular,
                icon: {
                    name: 'check'
                },
                showClose: false,
                disableClose: false
            },
            primary: {
                text: "Conclude",
                disabled: false,
                icon: {
                    name: 'check'
                }
            },
            secondary: {
                text: "Cancel",
                disabled: false,
                icon: {
                    name: 'close'
                }
            },
            isloading: false,
            enableButtonToolbar: true,
            viewHelper: true
        };
    }

    close() {
        this.onClosed.emit();
    }

    conclude = async () => {
        this.config.isloading = true;
        this.config.primary!.disabled = true;
        let appliesToSpecificAssets = false;
        if(!this.affectedAssetDetail.allFutureAssetSelected && this.affectedAssetDetail.selectedAssetCount) {
            if(this.affectedAssetDetail.selectedAssetCount > 0) {
                appliesToSpecificAssets = true;
            }
        }
        try {
            let concludeResult = await AlAssetsQueryClient.concludeRemediations(this.accountId, {
                filters: this.filter,
                ...( this.exposureUtilityService.getOptionalField( this.page, this.itemIds ) ),
                ...(this.deploymentIds.length > 0 && {deployment_ids: this.deploymentIds}),
                ...(appliesToSpecificAssets && {filter_match_mode: 'any'})
            });
            if(concludeResult){
                this.handleSuccessfully();
            }
        } catch (e) {
            this.handleError(e);
        }
    }

    handleSuccessfully = () => {
        this.config.isloading = false;
        this.config.primary!.disabled = false;
        this.notificationsOut.emit(this.page+ " concluded successfully.");
        this.close();
        this.onConcludeSuccess.emit();
    }

    handleError = (error: any) => {
        this.config.isloading = false;
        this.config.primary!.disabled = false;
        console.error("Could not conclude. Reason:", error);
        let msg = this.errorService.getMessage('exposures', 'generic', 'error_' + error.status);
        this.rightDrawer.notifyError(msg, this.autoDismiss, true);
        this.onConcludeFailure.emit();
    }

}
