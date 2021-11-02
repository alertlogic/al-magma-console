import { ObjectValuePipe } from './pipes/object-value.pipe';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';


import { AlBadgeComponent } from './al-badge/al-badge.component';
import { AlButtonComponent } from './al-button/al-button.component';
import { AlButtonGroupComponent } from './al-button-group/al-button-group.component';
import { AlDataFieldComponent } from './al-data-field/al-data-field.component';
import { AlDropdownComponent } from './al-dropdown/al-dropdown.component';
import { AlDropdownPanelComponent } from './al-dropdown/al-dropdown-panel/al-dropdown-panel.component';
import { AlIconComponent } from './al-icon/al-icon.component';
import { AlLayoutComponent } from './al-layout/al-layout.component';
import { AlLayoutRowComponent } from './al-layout/layout-row/al-layout-row.component';
import { AlLayoutSidebarComponent } from './al-layout/sidebar/al-layout-sidebar.component';
import { AlLinkComponent } from './al-link/al-link.component';
import { AlLoadingSpinnerComponent } from './al-loading-spinner/al-loading-spinner.component';
import { AlMenuComponent } from './al-menu/al-menu.component';
import { AlStackComponent } from './al-stack/al-stack.component';
import { AlWrapperComponent } from './al-wrapper/al-wrapper.component';
import { AlLayoutColComponent } from './al-layout/layout-col/al-layout-col.component';
import { AlTabComponent } from './al-tabs/al-tab/al-tab.component';
import { AlTabsComponent } from './al-tabs/al-tabs.component';
import { AldRepeaterComponent } from './ald-repeater/ald-repeater.component';
import { AldRepeaterItemComponent } from './ald-repeater/ald-repeater-item/ald-repeater-item.component';




@NgModule({
  declarations: [
    AlBadgeComponent,
    AlButtonComponent,
    AlButtonGroupComponent,
    AlDataFieldComponent,
    AlDropdownComponent,
    AlDropdownPanelComponent,
    AlIconComponent,
    AlLayoutComponent,
    AlLayoutColComponent,
    AlLayoutRowComponent,
    AlLayoutSidebarComponent,
    AlLinkComponent,
    AlLoadingSpinnerComponent,
    AlMenuComponent,
    AlStackComponent,
    AlTabComponent,
    AlTabsComponent,
    AlWrapperComponent,
    ObjectValuePipe,
    AldRepeaterComponent,
    AldRepeaterItemComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    OverlayModule,
  ],
  providers: [
  ],
  exports: [
    AlBadgeComponent,
    AlButtonComponent,
    AlButtonGroupComponent,
    AlDataFieldComponent,
    AlDropdownComponent,
    AlDropdownPanelComponent,
    AlIconComponent,
    AlLayoutComponent,
    AlLayoutColComponent,
    AlLayoutRowComponent,
    AlLayoutSidebarComponent,
    AlLinkComponent,
    AlLoadingSpinnerComponent,
    AlMenuComponent,
    AldRepeaterComponent,
    AldRepeaterItemComponent,
    AlStackComponent,
    AlTabComponent,
    AlTabsComponent,
    AlWrapperComponent,
    ObjectValuePipe,
  ]
})
export class AlCommonComponentsModule { }
