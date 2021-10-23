import { Component, OnInit, OnChanges, Input, EventEmitter, Output } from '@angular/core';
import { AlBaseCardConfig, AlActionFooterButtons, AlBaseCardFooterActions, AlBaseCardItem, AlBaseCardFooterActionEvent } from '@al/ng-cardstack-components';
import { AlFimAsset, AlFimConfiguration, fimAssetType, getFullPath } from '@al/fim';
import { fimType } from '../../types';
import { AssetDescriptor } from '@components/technical-debt';
import { AIMSUser } from '@al/core';
import { Observable } from 'rxjs';
import { SlicePipe } from '@angular/common';

@Component({
    selector: 'deployment-fim-card',
    templateUrl: './deployment-fim-card.component.html',
    styleUrls: ['./deployment-fim-card.component.scss']
})
export class DeploymentFimCardComponent implements OnInit, OnChanges {

    // Inputs Variables
    @Input() cardItem: AlFimConfiguration;
    @Input() usersMap: { [i: string]: Observable<AIMSUser> }
    @Input() selectedCard: boolean;
    @Input() mode: fimType = 'MONITORING';
    @Input() assetsMap: { [i: string]: { [i: string]: AssetDescriptor } };
    @Input() tagsMap: {[i: string]: AssetDescriptor}

    // Outputs Variables
    @Output() selectCard: EventEmitter<any> = new EventEmitter();

    @Output() onEditActionClicked: EventEmitter<AlFimConfiguration> = new EventEmitter<AlFimConfiguration>();
    @Output() onDuplicateActionClicked: EventEmitter<AlFimConfiguration> = new EventEmitter<AlFimConfiguration>();
    @Output() onDeleteActionClicked: EventEmitter<AlFimConfiguration> = new EventEmitter<AlFimConfiguration>();
    @Output() onMonitorToggled: EventEmitter<AlFimConfiguration> = new EventEmitter<AlFimConfiguration>();

    fullPath: string;

    alBaseCardConfig: AlBaseCardConfig = {
        toggleable: true, // Allow expand and collapse the card
        toggleableButton: true, // Show the expandable and collapsible button on the rigth side
        checkable: true,
        hasIcon: true,
    };

    alBaseCardFooterButtonsEdit: AlActionFooterButtons = {
        event: 'edit',
        icon: 'ui-icon-edit',
        visible: true,
        text: 'EDIT'
    };

    alBaseCardFooterButtonsDelete: AlActionFooterButtons = {
        event: 'delete',
        icon: 'ui-icon-delete',
        visible: true,
        text: 'DELETE'
    };

    alBaseCardFooterButtonsDuplicate: AlActionFooterButtons = {
        event: 'duplicate',
        icon: 'ui-icon-content-copy',
        visible: true,
        text: "DUPLICATE"
    };

    alBaseCardFooterActions: AlBaseCardFooterActions = {
        // left: [this.alBaseCardFooterButtons],
        right: this.cardButtons() // Default edit and delete actions
    };
    alBaseCardItem: AlBaseCardItem = {
        id: '1',
        // icon: { name: 'local_airport' }, // The text property can be optional
        // toptitle: 'Title',
        caption: "",
        subtitle: '',
        expanded: false,
        footerActions: this.alBaseCardFooterActions,
        checked: false,
    };

    iconClass: string = "";
    typesMap: { [i: string]: { [i: string]: string } } = {
        nix_dir: {
            icon: 'al al-linux',
            name: 'Linux Type'
        },
        win_dir: {
            icon: 'al al-windows',
            name: 'Windows Directory Type'
        },
        win_reg: {
            icon: 'al al-windows',
            name: 'Windows Registry Type'
        }
    }

    zeroState = {
        active: false,
        isAlertLogicIcon: false,
        icon: "edit",
        title: "",
        description: 'All assets in your deployment were automatically applied for monitoring in this file path. To scope individual assets in this file path, click “EDIT”.',
    };

    assetsInScope: { name: string, type: string }[] = [];

    constructor(protected slicePipe: SlicePipe) { }

    ngOnInit() {
        this.iconClass = this.typesMap[this.cardItem.type].icon;
    }

    ngOnChanges() {
        this.iconClass = this.typesMap[this.cardItem.type].icon;
        this.alBaseCardItem.caption = this.cardItem.base;
        this.alBaseCardItem.checked = this.selectedCard;
        this.alBaseCardFooterActions.right = this.cardButtons();
        const maxLenghtOfPath: number = 110;
        this.fullPath = getFullPath(this.cardItem);
        this.fullPath = this.fullPath.length >= maxLenghtOfPath ? this.slicePipe.transform(this.fullPath, 0, maxLenghtOfPath) + '...' : this.fullPath;
        this.alBaseCardItem.caption = this.fullPath;
        this.calculateAssetsInScopeInfo();
    }

    public footerAction(event: AlBaseCardFooterActionEvent): void {
        switch (event.name) {
            case 'edit':
                this.onEditActionClicked.emit(this.cardItem);
                break;
            case 'duplicate':
                this.onDuplicateActionClicked.emit(this.cardItem);
                break;
            case 'delete':
                this.onDeleteActionClicked.emit(this.cardItem);
                break;
        }
    };

    public toggleCard(event) {
        this.selectCard.emit();
    }

    // Selecting Card Buttons.
    public cardButtons(): Array<AlActionFooterButtons> {
        this.alBaseCardFooterButtonsDelete.visible = !(this.cardItem ? !!this.cardItem.system : true);
        return [this.alBaseCardFooterButtonsDelete, this.alBaseCardFooterButtonsDuplicate, this.alBaseCardFooterButtonsEdit];
    }

    monitor(toggle: boolean) {
        this.onMonitorToggled.emit(this.cardItem);
    }

    private calculateAssetsInScopeInfo(): void {
        if (this.assetsInScope.length === 0 && this.cardItem && this.cardItem.scope) {
            this.assetsInScope =
                this.cardItem.scope.map((fimAsset: AlFimAsset): { name: string, type: string } => {
                    let asset: AssetDescriptor;
                    try {
                        if (fimAsset.type === 'tag') {
                            asset = this.tagsMap[`${fimAsset.value}/${fimAsset.name}`];
                        } else {
                            asset = this.assetsMap[fimAsset.type][fimAsset.key];
                        }
                    } catch  {
                        asset = null;
                    }
                    
                    if (asset) {
                        return { name: asset.name, type: asset.type };
                    }
                    if (fimAsset.type === 'tag') {
                        return { name: fimAsset.name, type: 'tag' };
                    }
                    return { name: 'Unknown', type: fimAsset.type };
                });
        }
    }


}
