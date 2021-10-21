import { RemediationItemAsset } from '@al/assets-query';
import { AppConstants } from '../../constants';
import { Component, Input, OnInit, } from '@angular/core';
import { IconBase, IconState } from '../../types/icons.types';
import { AIMSClient } from '@al/core';
@Component({
    selector: 'al-left-panel-detail',
    templateUrl: './al-left-panel-detail.component.html',
    styleUrls: ['./al-left-panel-detail.component.scss']
})
export class AlLeftPanelDetailComponent implements OnInit {

    @Input()
    public descriptor: AppConstants.LeftPanelDetailDescriptor;

    @Input()
    public remediationItem?: RemediationItemAsset;

    @Input()
    public accountId?: string;

    @Input()
    public state: string;


    public remediationItemData: {
        icon: IconBase,
        state: string,
        assessment: string,
        modifyOn: number,
        assessedBy: string,
        comments: string,
        expires: number
    };


    async ngOnInit() {
        if (this.remediationItem) {
            let user = await AIMSClient.getUserDetailsByUserId(this.remediationItem.user_id);
            this.remediationItemData = {
                icon: this.remediationItem.state === AppConstants.PageConstant.Disposed ? IconState.iconDispose : IconState.iconConclude,
                state: this.remediationItem.state,
                assessment: this.state === AppConstants.PageConstant.Concluded ? '' : AppConstants.PageConstant.reasonDispositions[this.remediationItem.reason].caption,
                modifyOn: this.remediationItem.modified_on,
                assessedBy: user && user.name || this.remediationItem.user_id,
                comments: this.remediationItem.comment,
                expires: this.remediationItem.expires
            };
        }
    }

    changeState(state: "open" | "concluded" | "disposed") {
        this.state = state;
    }

}

