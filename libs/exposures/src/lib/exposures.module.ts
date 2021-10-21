import { TutorialComponent } from './tutorial/tutorial.component';
import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
/** Other Vendor Modules */
import { NgGenericComponentsModule } from '@al/ng-generic-components';
import { NgNavigationModule, AlIdentityResolutionGuard } from '@al/ng-navigation-components';
import { NgCardstackModule } from '@al/ng-cardstack-components';
import { NgAssetModule } from '@al/ng-asset-components';
import { NgNotificationsModule } from '@al/ng-notifications-components';
import { NgFormsComponentsModule } from '@al/ng-forms-components';

import { HealthZeroStateComponent } from './health-zero-state/health-zero-state.component';

import {
    ErrorService,
    FiltersUtilityService,
    FilterDefinitionsService
} from './services';
import { ExposuresComponent } from './exposures/exposures.component';
import { ExposuresDetailsComponent } from './exposures/exposures-details/exposures-details.component';
import { RemediationsComponent } from './remediations/remediations.component';
import { RemediationDetailComponent } from './remediations/remediation-detail/remediation-detail.component';

import { AlLeftPanelDetailComponent } from './components/al-left-panel-detail/al-left-panel-detail.component';
import { AlDetailHeaderComponent } from './components/al-detail-header/al-detail-header.component';

import { ButtonModule } from 'primeng/button';
import { ExposuresNotAvailableComponent } from './components/exposures-not-available/exposures-not-available.component';
import { ExposuresZeroStateComponent } from './components/exposures-zero-state/exposures-zero-state.component';
import { BaseCardItemPipe } from './base-card-item-pipe';
import { ZeroStateCardComponent } from './components/zero-state-card/zero-state-card.component';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressBarModule} from 'primeng/progressbar';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from "@angular/flex-layout";

/**
     *  Returns an array of route definitions available by this module, optionally
     *  prefixed by a specified path (e.g., 'demo/').
     */
const routes = [
      {
          path: 'exposures/open/:accountId',
          component: ExposuresComponent,
          canActivate: [AlIdentityResolutionGuard],
          data: {
              title: 'Exposures | Open Exposures',
              pageData: {
                  page: "exposures",
                  state: "open"

              }
          }
      },
      {
          path: 'exposures/open/:accountId/:exposureId',
          component: ExposuresDetailsComponent,
          canActivate: [AlIdentityResolutionGuard],
          data: {
              title: 'Exposures | Open Exposures | Item Detail',
              pageData: {
                  page: "exposures",
                  state: "open"

              }
          }
      },
      {
          path: 'exposures/disposed/:accountId',
          component: ExposuresComponent,
          canActivate: [AlIdentityResolutionGuard],
          data: {
              title: 'Exposures | Disposed Exposures',
              pageData: {
                  page: "exposures",
                  state: "disposed"
              }
          }
      },
      {
          path: 'exposures/disposed/:accountId/:deploymentId/:itemId',
          component: ExposuresDetailsComponent,
          canActivate: [AlIdentityResolutionGuard],
          data: {
              title: 'Exposures | Disposed Exposures | Item Detail',
              pageData: {
                  page: "exposures-details",
                  state: "disposed"
              }
          }
      },
      {
          path: 'exposures/disposed/:accountId/:deploymentId/:auditId/:vulnerabilityId',
          component: ExposuresDetailsComponent,
          canActivate: [AlIdentityResolutionGuard],
          data: {
              title: 'Exposures | Disposed Exposures | Item Detail',
              pageData: {
                  page: "exposures-details",
                  state: "disposed"
              }
          }
      },
      {
          path: 'exposures/concluded/:accountId',
          component: ExposuresComponent,
          canActivate: [AlIdentityResolutionGuard],
          data: {
              title: 'Exposures | Concluded Exposures',
              pageData: {
                  page: "exposures",
                  state: "concluded"
              }
          }
      },
      {
          path: 'exposures/concluded/:accountId/:deploymentId/:itemId',
          component: ExposuresDetailsComponent,
          canActivate: [AlIdentityResolutionGuard],
          data: {
              title: 'Exposures | Concluded Exposures | Item Detail',
              pageData: {
                  page: "exposuredetails",
                  state: "concluded"
              }
          }
      },
      {
          path: 'exposures/concluded/:accountId/:deploymentId/:auditId/:vulnerabilityId',
          component: ExposuresDetailsComponent,
          canActivate: [AlIdentityResolutionGuard],
          data: {
              title: 'Exposures | Concluded Exposures | Item Detail',
              pageData: {
                  page: "exposuredetails",
                  state: "concluded"
              }
          }
      },
      {
          path: 'remediations/open/:accountId',
          component: RemediationsComponent,
          canActivate: [AlIdentityResolutionGuard],
          data: {
              title: 'Remediations | Open Remediations',
              pageData: {
                  page: "remediations",
                  state: "open"
              }
          }
      },
      {
          path: 'remediations/open/:accountId/:remediationId',
          component: RemediationDetailComponent,
          canActivate: [AlIdentityResolutionGuard],
          data: {
              title: 'Remediations | Open Remediations | Item Detail',
              pageData: {
                  page: "remediations",
                  state: "open"

              }
          }

      },
      {
          path: 'remediations/disposed/:accountId',
          component: RemediationsComponent,
          canActivate: [AlIdentityResolutionGuard],
          data: {
              title: 'Remediations | Disposed Remediations | Item Detail',
              pageData: {
                  page: "remediations",
                  state: "disposed"
              }
          }
      },
      {
          path: 'remediations/disposed/:accountId/:deploymentId/:itemId',
          component: RemediationDetailComponent,
          canActivate: [ AlIdentityResolutionGuard ],
          data: {
              title: 'Remediations | Disposed Remediations | Item Detail',
              pageData: {
                  page: "remediations",
                  state: "disposed"
              }
          }
      },
      {
          path: 'remediations/disposed/:accountId/:deploymentId/:auditId/:remediationId',
          component: RemediationDetailComponent,
          canActivate: [ AlIdentityResolutionGuard ],
          data: {
              title: 'Remediations | Disposed Remediations | Item Detail',
              pageData: {
                  page: "remediations",
                  state: "disposed"
              }
          }
      },
      {
          path: 'remediations/concluded/:accountId',
          component: RemediationsComponent,
          canActivate: [AlIdentityResolutionGuard],
          data: {
              title: 'Remediations | Concluded Remediations',
              pageData: {
                  page: "remediations",
                  state: "concluded"
              }
          }
      },
      {
          path: 'remediations/concluded/:accountId/:deploymentId/:itemId',
          component: ExposuresDetailsComponent,
          canActivate: [ AlIdentityResolutionGuard ],
          data: {
              title: 'Remediations | Concluded Remediations | Item Detail',
              pageData: {
                  page: "remediations",
                  state: "concluded"
              }
          }
      },
      {
          path: 'remediations/concluded/:accountId/:deploymentId/:auditId/:remediationId',
          component: RemediationDetailComponent,
          canActivate: [ AlIdentityResolutionGuard ],
          data: {
              title: 'Remediations | Concluded Remediations | Item Detail',
              pageData: {
                  page: "remediations",
                  state: "concluded"
              }
          }
      },
      {
          path: 'getting-started',
          component: HealthZeroStateComponent,
          data: {
              title: 'Health | Getting Started'
          }
      }
  ];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        NgGenericComponentsModule,
        NgAssetModule,
        NgNavigationModule,
        NgCardstackModule,
        NgAssetModule,
        NgNotificationsModule,
        NgFormsComponentsModule,
        ButtonModule,
        CheckboxModule,
        ProgressBarModule,
        FlexLayoutModule
    ],
    declarations: [
        HealthZeroStateComponent,
        ExposuresZeroStateComponent,
        ExposuresNotAvailableComponent,
        ExposuresComponent,
        RemediationsComponent,
        BaseCardItemPipe,
        ZeroStateCardComponent,
        ExposuresDetailsComponent,
        RemediationDetailComponent,
        AlLeftPanelDetailComponent,
        AlDetailHeaderComponent,
        TutorialComponent
    ],
    entryComponents: [
        TutorialComponent
    ],
    providers: [
        ErrorService,
        FiltersUtilityService,
        FilterDefinitionsService
    ],
    exports: [RouterModule]
})


export class ExposuresModule {
  constructor(injector: Injector) {
    // setAppInjector(injector);
  }
}
