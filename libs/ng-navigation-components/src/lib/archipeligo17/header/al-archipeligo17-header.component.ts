import {
    AlActingAccountResolvedEvent,
    AlSession,
    AlSessionEndedEvent,
    AlSubscriptionGroup,
} from '@al/core';
import {
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { AlNavigationService } from '../../services/al-navigation.service';

@Component({
  selector: 'al-archipeligo17-header',
  templateUrl: './al-archipeligo17-header.component.html',
  styleUrls: [ './al-archipeligo17-header.component.scss' ]
})
export class AlArchipeligo17HeaderComponent implements OnInit, OnDestroy {

    public authenticated:boolean = false;

    protected subscriptions = new AlSubscriptionGroup();

    constructor( public alNavigation:AlNavigationService ) {
    }

    ngOnInit() {
        this.authenticated = AlSession.isActive();
        this.subscriptions.manage( this.alNavigation.events.attach( AlActingAccountResolvedEvent, this.onActingAccountResolved ) );
        this.subscriptions.manage( this.alNavigation.events.attach( AlSessionEndedEvent, this.onSessionEnded ) );
    }

    ngOnDestroy() {
        this.subscriptions.cancelAll();
    }

    onSessionEnded = ( event:AlSessionEndedEvent ) => {
        this.authenticated = false;
    }

    onActingAccountResolved = ( event:AlActingAccountResolvedEvent ) => {
        this.authenticated = true;
    }
}
