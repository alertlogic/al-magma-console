import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlNavigationService } from '@al/ng-navigation-components';
import { AlSubscriptionGroup, AlSession, AlActingAccountChangedEvent } from '@al/core';

@Component({
    selector: 'exposures-zero-state',
    templateUrl: './exposures-zero-state.component.html',
    styleUrls: ['./exposures-zero-state.component.scss']
})

export class ExposuresZeroStateComponent implements OnInit, OnDestroy {

    private subscription = new AlSubscriptionGroup();

    constructor( public navigationService:AlNavigationService )
    { }

    ngOnInit() {
        this.subscription.manage(
            AlSession.notifyStream.attach(AlActingAccountChangedEvent, (event: AlActingAccountChangedEvent) => {
                this.navigationService.navigate.byNgRoute([ 'exposure-management', 'exposures/open', AlSession.getActingAccountId()]);
            })
        );
    }

    ngOnDestroy() {
        this.subscription.cancelAll();
    }

    navigateToDeploymentsPage(){
        this.navigationService.navigate.byNamedRoute('cd17:phoenix:deployments', {accountId: AlSession.getActingAccountId()});
    }
}
