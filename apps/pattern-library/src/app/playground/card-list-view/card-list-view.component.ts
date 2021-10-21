import { Component } from '@angular/core';
import { AlNavigationService } from '@al/ng-navigation-components';
import { CardListViewService, Incident } from './card-list-view.service';
import { AlBaseCardItem, AlBaseCardConfig, AlBaseCardFooterActions, AlActionFooterButtons, alEditDeleteFooterActions, AlBaseCardFooterActionEvent, AlItemCount } from '@al/ng-cardstack-components';

@Component({
  selector: 'app-card-list-view',
  templateUrl: './card-list-view.component.html',
  styleUrls: ['./card-list-view.component.scss']
})


export class CardListViewComponent {

  data: Incident[];
  cols: { field: string, header: string }[];

  constructor(
    public navigation: AlNavigationService,
    private dataViewService: CardListViewService,
  ) {

    this.data = [];
  }

  getCols() {
    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'date', header: 'Date' },
      { field: 'summary', header: 'Summary' },
      { field: 'class', header: 'class' },
      { field: 'attacker', header: 'attacker' },
      { field: 'target', header: 'target' },
      { field: 'account', header: 'account' },
      { field: 'deployment', header: 'deployment' }
    ];
  }

  // Get Data
  getData() {
    this.dataViewService.getData().then(data => {
      this.data = data;
    });
  }



  ngOnInit() {
    this.getData();
    this.getCols();

  }

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

  alBaseCardFooterAction(event: AlBaseCardFooterActionEvent) {
    console.log(event.name, event.value);
  }

}
