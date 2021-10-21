import {
    AIMSAccount,
    AIMSClient,
    AlActingAccountChangedEvent,
    AlActingAccountResolvedEvent,
    AlInsightLocations,
    AlLocation,
    AlLocatorService,
    AlSession,
    AlSessionEndedEvent,
    AlSessionStartedEvent,
    AlSubscriptionGroup,
} from '@al/core';
import {
    Component,
    ElementRef,
    NgZone,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChildren,
} from '@angular/core';
import {
    ConfirmationService,
    MenuItem,
} from 'primeng/api';
import { AlNavigationService } from '../../services/al-navigation.service';
import {
    AlDatacenterOptionsSummary,
    AlNavigationContextChanged,
} from '../../types/navigation.types';
import { AlTrackingMetricEventName, AlTrackingMetricEventCategory } from '@al/ng-generic-components';

@Component({
    selector: 'al-archipeligo19-app-header',
    templateUrl: './al-archipeligo19-app-header.component.html',
    styleUrls: ['./al-archipeligo19-app-header.component.scss']
})
export class AlArchipeligo19AppHeaderComponent implements OnInit, OnDestroy
{
    authenticated = false;
    ready = false;

    actingAccountName = '';
    actingAccountId: string;
    actingAccount: AIMSAccount = null;

    managedAccounts: AIMSAccount[] = [];
    loadedManagedAccounts                   =   false;
    loadingManagedAccounts                  =   false;

    userMenuItems: MenuItem[];

    datacenter:AlDatacenterOptionsSummary;

    subscriptions = new AlSubscriptionGroup( null );

    expandedDatacenterMenu:boolean = false;

    @ViewChildren('filterInput') filterInput: QueryList<ElementRef>;

    constructor( public alNavigation:AlNavigationService,
                 public ngZone:NgZone,
                 private confirmationService: ConfirmationService ) {
        if ( AlSession.isActive() ) {
            this.loadActiveSession();
        }
    }

    async loadActiveSession() {
        await AlSession.ready();
        await this.alNavigation.ready();
        this.actingAccount = AlSession.getActingAccount();
        this.actingAccountId = this.actingAccount.id;
        this.actingAccountName = this.actingAccount.name;
        this.managedAccounts = [ this.actingAccount ];
        this.ready = true;
    }

    ngOnInit() {
        this.subscriptions.manage( [
            AlSession.notifyStream.attach( AlSessionStartedEvent, this.onSessionStart),
            AlSession.notifyStream.attach( AlActingAccountChangedEvent, this.onActingAccountChanged),
            AlSession.notifyStream.attach( AlActingAccountResolvedEvent, this.onActingAccountResolved),
            AlSession.notifyStream.attach( AlSessionEndedEvent, this.onSessionEnded ),
            this.alNavigation.events.attach( AlNavigationContextChanged, this.onNavigationContextChanged )
        ] );
        this.actingAccount = AlSession.getActingAccount();
        if ( this.actingAccount ) {
            this.actingAccountId = this.actingAccount.id;
        }
        this.userMenuItems = [
            {
                label: AlSession.getUserName(),
                items: [
                    {
                        label: 'Logout',
                        icon: 'ui-icon-power-settings-new',
                        command: () => {
                          this.logout();
                        }
                    }
                ]
            }
        ];
        this.onNavigationContextChanged();
    }

    ngOnDestroy() {
        this.subscriptions.cancelAll();
    }

    onSessionEnded = ( event: AlSessionEndedEvent ) => {
        this.authenticated = false;
    }

    onSessionStart = (event: AlSessionStartedEvent) => {
        this.authenticated = true;
        this.userMenuItems[0].label = event.user.name;
    }

    onActingAccountChanged = ( event: AlActingAccountChangedEvent ) => {
        this.ready = false;
    }

    onActingAccountResolved = (event: AlActingAccountResolvedEvent) => {
        this.actingAccount = event.actingAccount;
        this.actingAccountId = event.actingAccount.id;
        if ( this.managedAccounts.length < 2 ) {
            this.managedAccounts = [ event.actingAccount ];
        }
        this.ready = true;
    }

    onNavigationContextChanged = ( event?:AlNavigationContextChanged ) => {
        if ( AlSession.isActive() ) {
            this.authenticated = true;
            this.datacenter = this.alNavigation.generateDatacenterMenu( AlSession.getActiveDatacenter(),
                                                                        AlSession.getActingAccountAccessibleLocations(),
                                                                        this.onClickDatacenter );
        } else {
            this.datacenter = undefined;
        }
    }

    logout = () => {
        AlSession.deactivateSession();
        this.alNavigation.navigate.byLocation( AlLocation.AccountsUI, '/#/logout' );
    }

    onAccountChanged() {
        this.alNavigation.setActingAccount(this.actingAccountId);
    }

    accountSearchFn(term: string, account: AIMSAccount) {
        term = term.toLocaleLowerCase();
        return account.name.toLocaleLowerCase().indexOf(term) > -1 || account.id.startsWith(term);
    }

    onOpenAccountSelector() {
        if ( ! this.loadedManagedAccounts ) {
            this.loadingManagedAccounts = true;
            this.managedAccounts = [];
            AIMSClient.getAccountsByRelationship( AlSession.getPrimaryAccountId(), "managed", { active: true } ).then( ( managedAccounts:AIMSAccount[] ) => {
                this.managedAccounts = [ AlSession.getPrimaryAccount(), ...managedAccounts ]
                                       .sort( ( a, b ) => a.name.toUpperCase().localeCompare( b.name.toUpperCase() ) );
                this.loadedManagedAccounts = true;
                this.loadingManagedAccounts = false;
            } );
            this.filterInput.changes.subscribe(res => {     //  we don't have to unsubscribe?  Okay...
                if (this.filterInput.first) {
                    this.filterInput.first.nativeElement.focus();
                }
            });
        }
    }

    onClickDatacenter = ( insightLocationId:string, $event:any ) => {
        const actor = AlLocatorService.getActingNode();
        if ( ! actor || ! AlInsightLocations.hasOwnProperty( insightLocationId ) ) {
            //  No meat, no eggs, no bacon?  No breakfast for you :(
            return;
        }
        const regionLabel = AlInsightLocations[insightLocationId].logicalRegion;
        this.confirmationService.confirm({
            key: 'confirmation',
            header: 'Are you sure?',
            message: `You are about to switch regions to ${regionLabel}.  Are you sure this is what you want to do?`,
            acceptLabel: 'Yes, switch now!',
            rejectLabel: 'No thanks',
            accept: () => {
                const originBaseURI = AlLocatorService.resolveURL( actor.locTypeId );
                AlSession.setActiveDatacenter( insightLocationId );
                AlLocatorService.setContext( { insightLocationId } );
                const targetBaseURI = AlLocatorService.resolveURL( actor.locTypeId );
                this.alNavigation.track(AlTrackingMetricEventName.UsageTrackingEvent, {
                    category: AlTrackingMetricEventCategory.GenericConsoleAction,
                    action: 'Data Residency Change',
                    label: insightLocationId
                });
                if ( targetBaseURI !== originBaseURI ) {
                    //  The new domain portal for the changed datacenter is the one we're on.  Emit a notice and redirect.
                    console.log(`NOTICE: changing active location to '${insightLocationId}' requires change to a new portal at [${targetBaseURI}]`);
                    this.alNavigation.navigate.byLocation( actor.locTypeId );
                } else {
                    //  The new domain portal is the same as the old one.  Route to its base/default route using angular's router.
                    this.alNavigation.navigate.byNgRoute( [ '/' ] );
                }
            }
        });
    }

    redirectToDashboards() {
        this.alNavigation.navigate.byNamedRoute("cd19:dashboards");
    }

    filterAccounts( accountSelector:any, $event:Event ) {
        console.log("Types", accountSelector, $event );
    }
}
