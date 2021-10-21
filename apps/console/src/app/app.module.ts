import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Injector, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';

import {
  AlIdentityResolutionGuard,
  NgNavigationModule
} from '@al/ng-navigation-components';
import { DefaultComponent } from './default/default.component';
import { AppInjector } from '@al/ng-generic-components';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      [
        {
          path: '',
          // canActivate: [AlIdentityResolutionGuard],
          redirectTo: 'dashboards',
          pathMatch: 'full'
        },
        {
          path: 'dashboards',
          canActivate: [AlIdentityResolutionGuard],
          loadChildren: () =>
            import('@feature/dashboards').then(
              module => module.DashboardsModule
            )
        },
        {
          path: 'exposure-management',
          loadChildren: () =>
            import('@feature/exposures').then(module => module.ExposuresModule)
        }
      ],
      { useHash: true }
    ),
    NgNavigationModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(injector:Injector){
      AppInjector.setInjector(injector);// save a injector ref 💾
  }
}
