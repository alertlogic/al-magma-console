import { Component, OnInit, ChangeDetectionStrategy, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { AlApplicationsClient, AlRulePayload, AlRule } from '@al/applications';
import { ApplicationLogCardDescriptor } from '../../../../../types/application-log.types';
import { from as observableFrom } from 'rxjs';
import { AlBottomSheetHeaderOptions } from '@al/ng-generic-components';
import { AlBaseCardConfig, AlActionFooterButtons, AlBaseCardFooterActions, AlBaseCardItem, AlBaseCardFooterActionEvent } from '@al/ng-cardstack-components';

@Component({
    selector: 'al-application-log-card',
    templateUrl: './application-log-card.component.html',
    styleUrls: ['./application-log-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationLogCardComponent implements OnInit {

    public zeroState = {
        active: false,
        isAlertLogicIcon: true,
        icon: "al al-assets",
        title: "",
        description: 'You do not have any assets in scope. Click "ASSETS" to start adding.',
    };

    public alBottomSheetHeaderOptions: AlBottomSheetHeaderOptions  = {
        icon:  'call_merge',
        title:  'Title',
        collapsibleFromTitle: true,
        primaryAction: {
            text: 'Save',
            disabled:  true,
        },
        secondaryAction:{
            text:  'Cancel',
            disabled:  false
        }
    };

    public alBaseCardConfig: AlBaseCardConfig = {
        toggleable: true, // Allow expand and collapse the card
        toggleableButton: true, // Show the expandable and collapsible button on the rigth side
        checkable: false,
        hasIcon: true,
    };

    public alBaseCardFooterButtonsEdit: AlActionFooterButtons = {
        event: 'edit_log',
        icon: 'ui-icon-edit',
        visible: true,
        text: 'EDIT'
    };

    public alBaseCardFooterButtonsDelete: AlActionFooterButtons = {
        event: 'delete',
        icon: 'ui-icon-delete',
        visible: true,
        text: 'DELETE'
    };

    public alBaseCardFooterButtonsDuplicate: AlActionFooterButtons = {
        event: 'duplicate',
        icon: 'ui-icon-content-copy',
        visible: true,
        text: "DUPLICATE"
    };

    public alBaseCardFooterButtonsAssets: AlActionFooterButtons = {
        event: 'rules',
        icon: 'icon-block-medium al al-assets',
        visible: true,
        text: "ASSETS"
    };

    public alBaseCardFooterActions: AlBaseCardFooterActions = {
        // Default edit and delete actions
        right: [this.alBaseCardFooterButtonsDelete, this.alBaseCardFooterButtonsDuplicate, this.alBaseCardFooterButtonsAssets, this.alBaseCardFooterButtonsEdit]
    };

    public alBaseCardItem: AlBaseCardItem = {
        id: '1',
        icon:{
            name: null,
            cssClasses: "al al-flatfile"
        },
        // toptitle: 'top Title',
        // caption: 'Title',
        caption: "",
        subtitle: '',
        expanded: false,
        footerActions: this.alBaseCardFooterActions,
        checked:false,
    };

    @Input() cardItem: ApplicationLogCardDescriptor;
    @Input() accountId: string;
    @Input() usersDictionary: {[i: string]:unknown}
    @Input() setEnable:boolean;

    @Output()
    onButtonClick: EventEmitter<{ details: ApplicationLogCardDescriptor, action: string }> = new EventEmitter();

    @Output()
    onToggleClick:EventEmitter<any> = new EventEmitter();

    @Output()
    openCreateRuleModal:EventEmitter<any> = new EventEmitter();

    constructor() { }

    ngOnInit() {
        this.alBaseCardItem.caption = this.cardItem.applicationName;
        this.alBaseCardItem.toptitle = this.cardItem.applicationTypeName;
    }

    buttonClick(action: string) {
        this.onButtonClick.emit({ details: this.cardItem, action: action });
    }

    handleRule( event:boolean, cardItem:ApplicationLogCardDescriptor ) {
        if(!cardItem.rule ) {
            // Adding Rule
            this.cardItem.enabled = false;
            this.openCreateRuleModal.emit();
        } else {
            // Add Rule Payload
            let data:AlRulePayload = {
                application_id: this.cardItem.applicationId,
                name: this.cardItem.rule.name,
                config: {
                    flatfile: {
                        path: this.cardItem.rule.config.flatfile.path,
                        message_timestamp: this.cardItem.rule.config.flatfile.message_timestamp,
                        message_split_spec: this.cardItem.rule.config.flatfile.message_split_spec,
                        filename: this.cardItem.rule.config.flatfile.filename
                    }
                },
                scope: this.cardItem.rule.scope,
                enabled: event
            };

            // Update Rule
            observableFrom( AlApplicationsClient.updateRule( this.accountId, cardItem.rule.id, data ) ).subscribe( ( rule:AlRule) =>{
                this.cardItem.enabled = rule.enabled;
                this.cardItem.rule = rule;
                this.onToggleClick.emit();
            });
        }
    }

    public footerAction(event: AlBaseCardFooterActionEvent): void {
        this.buttonClick(event.name);
    }
}
