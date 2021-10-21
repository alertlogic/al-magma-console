import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardsComponent } from './dashboards.component';
import { NgGenericComponentsModule } from '@al/ng-generic-components';
import { FormsModule } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { MenuModule } from 'primeng/menu';
import { DashboardsService } from './dashboards.service';
import { UserPreferencesService } from './user-preferences.service';
import { NgVisualizationModule } from '@al/ng-visualizations-components';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: '', component: DashboardsComponent}
    ]),
    NgGenericComponentsModule,
    NgVisualizationModule,
    DialogModule,
    CalendarModule,
    MenuModule,
    FormsModule
  ],
  declarations: [DashboardsComponent],
  providers: [
    DashboardsService,
    UserPreferencesService,
  ]
})
export class DashboardsModule {}
