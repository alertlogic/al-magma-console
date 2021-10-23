import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';

import {
  AlIdentityResolutionGuard,
  NgNavigationModule
} from '@al/ng-navigation-components';
import { NgGenericComponentsModule } from '@al/ng-generic-components';
import { DefaultComponent } from './default/default.component';
import { AppInjector } from '@al/ng-generic-components';
import { ApplicationRoutes } from './application.routes';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forRoot( ApplicationRoutes, { useHash: true } ),
        NgGenericComponentsModule,
        NgNavigationModule
    ],
    providers: [],
    bootstrap: [ AppComponent ]
})
export class AppModule {
  constructor(injector:Injector){
      AppInjector.setInjector(injector);    //  Save a injector ref 💾
                                            //  But...  why?
  }
}
