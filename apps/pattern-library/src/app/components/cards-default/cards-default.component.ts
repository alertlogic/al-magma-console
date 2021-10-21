import { Component } from '@angular/core';
import { AlBaseCardItem, AlBaseCardConfig, AlBaseCardFooterActions, AlActionFooterButtons, alEditDeleteFooterActions, AlBaseCardFooterActionEvent, AlItemCount } from '@al/ng-cardstack-components';
@Component({
    selector: 'cards-default',
    templateUrl: './cards-default.component.html',
    styleUrls: ['./cards-default.component.scss'],
})
export class CardsDefaultComponent {

    // al-base-card examples
    public alBaseCardBasicItem: AlBaseCardItem = {
        id: '1',
        toptitle: 'Title',
        caption: 'Content',
        subtitle: 'Subtitle'
    };

    // Toggleagle with content projection
    public alBaseCardConfigToggleable: AlBaseCardConfig = {
        toggleable: true,
        toggleableButton: true,
        checkable: false,
        hasIcon: false,
    };

    public alBaseCardToggleableItem: AlBaseCardItem = {
        id: '1',
        icon: { name: 'date_range' },
        toptitle: 'Title',
        caption: 'Content',
        subtitle: 'Subtitle',
        expanded: false
    };

    // Footer actions, checkable
    public alBaseCardConfigFooterActions: AlBaseCardConfig = {
        toggleable: true,
        toggleableButton: true,
        checkable: true,
        hasIcon: false,
    };

    public alBaseCardFooterButtons: AlActionFooterButtons = {
        event: 'download',
        icon: 'ui-icon-get-app',
        visible: true,
        text: "DOWNLOAD"
    };

    public alBaseCardFooterActions: AlBaseCardFooterActions = {
        left: [this.alBaseCardFooterButtons],
        right: alEditDeleteFooterActions
    };

    public alBaseCardFooterActionsItem: AlBaseCardItem = {
        id: '1',
        icon: { name: 'date_range' },
        toptitle: 'Title',
        caption: 'Content',
        subtitle: 'Subtitle',
        expanded: false,
        footerActions: this.alBaseCardFooterActions
    };

    // Icon and checkable
    public alBaseCardConfigIcon: AlBaseCardConfig = {
        toggleable: true,
        toggleableButton: true,
        checkable: true,
        hasIcon: true,
    };

    // Icon and NOT checkable
    public alBaseCardConfigIconWithoutCheckbox: AlBaseCardConfig = {
        toggleable: true,
        toggleableButton: true,
        checkable: false, // it disables the checkbox to avoid the selection of the card
        hasIcon: true,
    };

    public alBaseCardIconItem: AlBaseCardItem = {
        id: '1',
        icon: { name: 'date_range' },
        toptitle: 'Title',
        caption: 'Content',
        subtitle: 'Subtitle',
        expanded: false,
        footerActions: this.alBaseCardFooterActions
    };

    // Icon and checkable
    public alBaseCardItemCount: AlItemCount = {
        number: 135,
        text: 'Items'
    };

    public alBaseCardItemCountItem: AlBaseCardItem = {
        id: '1',
        icon: { name: 'date_range', text: 'Daily' },
        toptitle: 'Title',
        caption: 'Content',
        subtitle: 'Subtitle',
        countItems: [this.alBaseCardItemCount],
        expanded: false,
        footerActions: this.alBaseCardFooterActions
    };

    alBaseCardFooterAction(event: AlBaseCardFooterActionEvent) {
        console.log(event.name, event.value);
    }

}
