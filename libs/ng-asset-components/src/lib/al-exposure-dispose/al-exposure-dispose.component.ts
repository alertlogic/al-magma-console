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
import { OverlayPanel } from 'primeng/overlaypanel';
import { AlSidebarConfig, AlSidebarComponent } from '@al/ng-generic-components';
import { ErrorService } from '../services/error.service';
import { ExposureUtilityService } from '../services/exposure-utility.service';
import { AffectedAssetDetails } from '../types';

@Component({
    selector: 'al-exposure-dispose',
    templateUrl: './al-exposure-dispose.component.html',
    styleUrls: ['./al-exposure-dispose.component.scss']
})
export class AlExposureDisposeComponent implements OnInit, OnChanges {

    public config: AlSidebarConfig;
    public pageConstants = pageConstants;

    public disposition = {
        reasons: pageConstants.REASON_DISPOSITIONS,
        expirations: [
            {
                label: "A Day",
                value: {
                    seconds: 86400,
                    value: 'tomorrow'
                }
            },
            {
                label: "1 Week",
                value: {
                    seconds: 604800,
                    value: 'week'
                }
            },
            {
                label: "1 Month",
                value: {
                    seconds: 2592000,
                    value: 'month'
                }
            },
            {
                label: "3 Months",
                value: {
                    seconds: 7776000,
                    value: 'threemonths'
                }
            },
            {
                label: "6 Months",
                value: {
                    seconds: 15552000,
                    value: 'sixmonths'
                }
            },
            {
                label: "1 Year",
                value: {
                    seconds: 31536000,
                    value: 'year'
                }
            },
            {
                label: "Forever",
                value: {
                    seconds: 0,
                    value: 'none'
                }
            }
        ],
        reason: 'acceptable_risk', // default checked
        expires: -1,
        comment: ''
    };

    @Input() selectionCount: number = 0;
    @Input() page: string;
    @Input() accountId: string;
    @Input() filter: string[] |string[][] = [];
    @Input() itemIds: string[] = [];    // this can be exposures or remediations ids array
    @Input() deploymentIds: string[] = [];
    @Input() affectedAssetDetail!: AffectedAssetDetails;

    @Output() notificationsOut = new EventEmitter();
    @Output() onClosed = new EventEmitter();
    @Output() onDisposeSuccess = new EventEmitter();
    @Output() onDisposeFailure = new EventEmitter();

    @ViewChild(AlSidebarComponent, { static: false }) public rightDrawer: AlSidebarComponent;
    @ViewChild('popHelper', { static: false }) popHelper: OverlayPanel;

    private autoDismiss = 5000;
    private pageSingular: string = '';

    constructor(private errorService: ErrorService, private exposureUtilityService: ExposureUtilityService) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.selectionCount && this.config) {
            this.config.header.title = "Dispose " + (changes.selectionCount.currentValue > 1 ? changes.selectionCount.currentValue : '') + ' ' + this.pageSingular + (changes.selectionCount.currentValue > 1 ? "s" : "");
        }
    }

    ngOnInit() {
        this.pageSingular = this.page === 'exposures' ? 'Exposure' : 'Remediation';
        this.config = {
            expand: false,
            expandable: false,
            inline: false,
            modal: true,
            header: {
                title: "Dispose " + this.pageSingular,
                icon: {
                    name: 'block'
                },
                showClose: false,
                disableClose: false
            },
            primary: {
                text: "Dispose",
                disabled: false,
                icon: {
                    name: 'block'
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

        this.setDefaultDispositionProperties();
    }

    setDefaultDispositionProperties(){
        this.disposition.comment = '';
        this.disposition.reason = this.disposition.reasons[0].value;
        this.disposition.expires = this.disposition.expirations[0].value.seconds;
    }

    setExpiry(event: any) {
        this.disposition.expires = event.value.seconds;
    }

    close() {
        this.setDefaultDispositionProperties();
        this.onClosed.emit();
    }

    dispose = async () => {
        this.config.isloading = true;
        this.config.primary!.disabled = true;
        let secondsToExpire = this.getSecondsToExpire(this.disposition.expires);
        this.setDefaultComment();
        let appliesToSpecificAssets = false;
        if(!this.affectedAssetDetail.allFutureAssetSelected && this.affectedAssetDetail.selectedAssetCount) {
            if(this.affectedAssetDetail.selectedAssetCount > 0) {
                appliesToSpecificAssets = true;
            }
        }
        try {
            let concludeResult = await AlAssetsQueryClient.disposeRemediations(this.accountId, {
                filters: this.affectedAssetDetail.allFutureAssetSelected ? this.filter : this.affectedAssetDetail.selectedAssetKeys ?? this.filter,
                reason: this.disposition.reason,
                comment: this.disposition.comment,
                expires: secondsToExpire,
                ...( this.exposureUtilityService.getOptionalField( this.page, this.itemIds ) ),
                ...(this.deploymentIds.length > 0 && {deployment_ids: this.deploymentIds}),
                ...(appliesToSpecificAssets && {filter_match_mode: 'any'})
            });
            if (concludeResult) {
                this.handleSuccessfully();
            }
        } catch (e) {
            this.handleError(e);
        }
    }

    handleSuccessfully = () => {
        this.config.isloading = false;
        this.config.primary!.disabled = false;
        this.notificationsOut.emit(this.page + " disposed successfully.");
        this.close();
        this.onDisposeSuccess.emit();
    }

    handleError = (error: any) => {
        this.config.isloading = false;
        this.config.primary!.disabled = false;
        console.error("Could not dispose. Reason:", error);
        let msg = this.errorService.getMessage('exposures', 'generic', 'error_' + error.status);
        this.rightDrawer.notifyError(msg, this.autoDismiss, true);
        this.onDisposeFailure.emit();
    }

    /**
     * retunr the second to expire the exposure
     * @param expires
     */
    getSecondsToExpire = (expires: number) => {
        let seconds: number = 0;
        if (expires !== 0) {
            let now = new Date();
            seconds = now.setSeconds(now.getSeconds() + expires);
        }
        return seconds;
    }

    /**
     * If the comment is not setted assing a default value
     */
    setDefaultComment = () => {
        if (this.disposition.comment === "") {
            this.disposition.comment = "No comments";
        }
    }
}
