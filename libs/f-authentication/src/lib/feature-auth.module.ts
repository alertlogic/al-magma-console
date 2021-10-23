import { NgModule } from '@angular/core';
import { Route } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { MFAVerificationComponent } from './mfa-verification/mfa-verification.component';
import { NgGenericComponentsModule } from '@al/ng-generic-components';

@NgModule({
  imports: [
      CommonModule, 
      FormsModule,
      NgGenericComponentsModule
  ],
  declarations: [
      LoginComponent, 
      LogoutComponent,
      MFAVerificationComponent
  ]
})
export class FeatureAuthModule {
    public static publicRoutes:Route[] = [
        {
            path: 'login',
            component: LoginComponent,
            data: {
                hideMenus: true,
                title: "Login"
            }
        },
        {
            path: 'logout',
            component: LogoutComponent,
            data: {
                title: "Logout",
                hideMenus: true
            }
        },
    ];
}
