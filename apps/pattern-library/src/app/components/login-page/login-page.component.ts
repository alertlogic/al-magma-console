import {
    AIMSAccount,
    AIMSUser,
    AlActingAccountResolvedEvent,
    AlCabinet,
    AlLocatorService,
    AlRoute,
    AlSession,
    AlSessionEndedEvent,
    AlSessionStartedEvent,
    AlSubscriptionGroup,
} from '@al/core';
import { AlNavigationService } from '@al/ng-navigation-components';
import {
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit, OnDestroy {
    public environment:string;
    public authenticated:boolean;
    public actingUser:AIMSUser;
    public actingAccount:AIMSAccount;
    public resumeUrl:string;

    public get targetEnvironment() {
        return this.environment;
    }
    public set targetEnvironment( value:string ) {
        this.setTargetEnvironment( value );
    }

    protected subscriptions:AlSubscriptionGroup = new AlSubscriptionGroup();
    protected storage = AlCabinet.ephemeral("usageGuide");

    constructor( public alNavigation:AlNavigationService, private route: ActivatedRoute, private router: Router) {
    }

    ngOnInit() {
        this.subscriptions.manage( AlSession.notifyStream.attach( AlSessionStartedEvent, this.onSessionStarted ) );
        this.subscriptions.manage( AlSession.notifyStream.attach( AlActingAccountResolvedEvent, this.onActingAccountResolved ) );
        this.subscriptions.manage( AlSession.notifyStream.attach( AlSessionEndedEvent, this.onSessionEnded ) );
        this.evaluateState();
        this.route.queryParams.subscribe(params => {
            this.resumeUrl = params['resumeUrl'];
        });
    }

    evaluateState() {
        this.environment = AlLocatorService.getCurrentEnvironment();
        this.authenticated = AlSession.isActive();
        if ( this.authenticated ) {
            this.actingUser = AlSession.getUser();
            this.actingAccount = AlSession.getActingAccount();
            if(this.resumeUrl){
                this.router.navigate([this.resumeUrl]);
            }
        } else {
            delete this.actingUser;
            delete this.actingAccount;
        }
    }

    ngOnDestroy() {
        this.subscriptions.cancelAll();
    }

    onSessionStarted = ( event:AlSessionStartedEvent ) => {
        console.log("Got session started event...", event );
        this.authenticated = true;
        this.evaluateState();
    }

    onActingAccountResolved = ( event:AlActingAccountResolvedEvent ) => {
        console.log("Got acting account resolved event...", event );
        this.evaluateState();
    }

    onSessionEnded = ( event:AlSessionEndedEvent ) => {
        console.log("Got session ended event...", event );
        this.authenticated = false;
        this.evaluateState();
    }

    doLogOut() {
        AlRoute.trigger( this.alNavigation, "Navigation.User.Signout" ).dispatch();
    }

    setTargetEnvironment( environment:string ) {
        AlLocatorService.setContext( { environment } );
        this.environment = environment;
        this.storage.set("targetEnvironment", this.environment );
    }
}
