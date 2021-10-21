import { Component } from '@angular/core';
import { AlRoute } from '@al/core';
import { AlNavigationService } from '@al/ng-navigation-components';

@Component({
    selector: 'app-welcome-dialog',
    templateUrl: './welcome-dialog.component.html',
    styleUrls: ['./welcome-dialog.component.scss']
})
export class WelcomeDialogComponent {

    constructor( public navigation:AlNavigationService ) {}

    showModal() {
        new AlRoute(  this.navigation,
            {
                caption: "",
                action: { type: "trigger", trigger: "Navigation.Open.WelcomeDialog" }
            } )
            .dispatch();
    }

}
