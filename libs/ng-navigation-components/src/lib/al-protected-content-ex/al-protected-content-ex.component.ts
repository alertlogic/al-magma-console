/**
 *  AlProtectedContentComponentEx provides a simple way to project content whose visibility is predicated on a combination of entitlements, experience mode,
 *  environment, and authentication state, without the need for the host view to know anything about services that expose those conditions.
 *
 *  Please see README.md for complete documentation.
 *
 *  @author McNielsen <knielsen@alertlogic.com>
 *  @copyright Alert Logic Inc, 2020
 */

import {
    AIMSAccount,
    AlActingAccountChangedEvent,
    AlActingAccountResolvedEvent,
    AlBehaviorPromise,
    AlConduitClient,
    AlDatacenterSessionEstablishedEvent,
    AlExperienceMapping,
    AlRoute,
    AlRouteCondition,
    AlSession,
    AlSessionEndedEvent,
    AlSessionStartedEvent,
    AlStopwatch,
    AlSubscriptionGroup
} from '@al/core';
import {
    Component,
    EventEmitter,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import { Router } from '@angular/router';
import { AlExperiencePreferencesService } from '../services/al-experience-preferences.service';
import { AlNavigationService } from '../services/al-navigation.service';
import { EntitlementGroup } from '../types/entitlement-group.class';
import {
    AlContentUnavailable,
    AlNavigationContextChanged
} from '../types/navigation.types';

@Component({
    selector: 'al-protected-content-ex',
    templateUrl: './al-protected-content-ex.component.html'
})

export class AlProtectedContentExComponent implements OnInit, OnChanges, OnDestroy, AlContentUnavailable
{
    @Input()    authentication:boolean|null                                     =   null;       //  default: any authentication state
    @Input()    entitlements:string|string[]|null                               =   null;       //  default: any entitlements allowed
    @Input()    primaryEntitlements:string|string[]|null                        =   null;       //  default: any primary entitlements allowed
    @Input()    accounts:string[]|null                                          =   null;       //  default: any accounts
    @Input()    primaryAccounts:string[]|null                                   =   null;       //  default: any primary account
    @Input()    experiences:string|string[]|null                                =   null;       //  default: any experience
    @Input()    environments:string|string[]|null                               =   null;       //  default: any environment
    @Input()    requiresDefender:boolean                                        =   false;      //  default: defender session is not required

    @Input()    rerouteActingAccount:boolean                                    =   true;       //  if true, acting account changes will use routing metadata to change to an account-specific route (if available)
    @Input()    verbose:boolean                                                 =   false;      //  if true, the component will be helpfully verbose

    @Input()    experienceId:string;                                                            //  optional feature/experience identifier (future use).  This should be in the form "topLevelFeatureCode.childFeatureCode#variant".

    @Output()   onDisallowed                                                    =   new EventEmitter<AlContentUnavailable>();
    @Output()   onDisplay:EventEmitter<void>                                    =   new EventEmitter<void>();
    @Output()   onHide:EventEmitter<void>                                       =   new EventEmitter<void>();
    @Output()   onAccountChange:EventEmitter<AIMSAccount>                       =   new EventEmitter<AIMSAccount>();

    public      aboveContentCrosslink?:AlRoute;
    public      contentVisible:boolean|undefined;
    public      conditions:AlRouteCondition                                     =   {};
    public      unavailableZeroState?:{
        title:string;
        description:string;
        iconClass:string;
        iconText:string;
    };

    protected   calculatingState                                                =   new AlBehaviorPromise( true );      //  used as a mutex to prevent multiple asyncronous checks from running at the same time
    protected   subscriptions:AlSubscriptionGroup                               =   new AlSubscriptionGroup();
    protected   previousAccountId:string                                        =   "00000000";
    protected   capturedRoute:AlRoute;

    protected   featureId:string;
    protected   variantId:string;
    protected   isInitialAccessibilityEvaluation = true;
    protected   featureVariantId:string;
    protected   experienceMapping:AlExperienceMapping|null                      =   null;

    constructor( public router:Router,
                 public navigation:AlNavigationService,
                 public experiencePreferences: AlExperiencePreferencesService,
                 public zone:NgZone ) {
        this.subscriptions.manage(
            AlSession.notifyStream.attach( AlSessionStartedEvent, this.onSessionStarted ),
            AlSession.notifyStream.attach( AlSessionEndedEvent, this.onSessionEnded ),
            AlSession.notifyStream.attach( AlActingAccountChangedEvent, this.onAccountChanged ),
            AlSession.notifyStream.attach( AlActingAccountResolvedEvent, this.onAccountResolved ),
            AlConduitClient.events.attach( AlDatacenterSessionEstablishedEvent, this.onDatacenterSessionEstablished ),
            this.navigation.events.attach( AlNavigationContextChanged, this.onNavigationContextChanged )
        );
    }

    ngOnInit() {
        this.navigation.incrementAuthenticationRequisite();
    }

    ngOnChanges( changes:SimpleChanges ) {
        let criteriaChanged:number = 0;
        if ( 'accounts' in changes ) {
            this.conditions.accounts = changes.accounts.currentValue;
        }
        if ( 'primaryAccounts' in changes ) {
            this.conditions.primaryAccounts = changes.primaryAccounts.currentValue;
        }
        if ( 'entitlements' in changes ) {
            this.conditions.entitlements = this.normalizeEntitlementInput( changes.entitlements.currentValue );
            criteriaChanged++;
        }
        if ( 'primaryEntitlements' in changes ) {
            this.conditions.primaryEntitlements = this.normalizeEntitlementInput( changes.primaryEntitlements.currentValue );
            criteriaChanged++;
        }
        if ( 'experiences' in changes ) {
            this.conditions.experiences = typeof( changes.experiences.currentValue ) === 'string' ? [ changes.experiences.currentValue ] : changes.experiences.currentValue;
            criteriaChanged++;
        }
        if ( 'environments' in changes ) {
            this.conditions.environments = typeof( changes.environments.currentValue ) === 'string' ? [ changes.environments.currentValue ] : changes.environments.currentValue;
            criteriaChanged++;
        }
        if ( 'authentication' in changes ) {
            this.conditions.authentication = changes.authentication.currentValue === null ? null : !!changes.authentication.currentValue;       //  force to boolean type if not null
            criteriaChanged++;
        }
        if ( 'experienceId' in changes ) {
            if ( this.conditions.experiences ) {
                this.conditions.experiences.push( changes.experienceId.currentValue );
            } else {
                this.conditions.experiences = [ changes.experienceId.currentValue ];
            }
            criteriaChanged++;
        }
        if ( 'requiresDefender' in changes ) {
            criteriaChanged++;
        }
        if ( criteriaChanged > 0 ) {
            this.evaluateAccessibility("criteria changed");
        }
    }

    ngOnDestroy() {
        this.subscriptions.cancelAll();
        this.navigation.decrementAuthenticationRequisite();
    }

    /**
     * Imperatively redirects to a location/path combination, an AlRoute href, and fully qualified URL,
     * or a local route.  Optionally accepts query parameters to be merged into target URL.
     */
    public redirect( target:string|string[]|AlRoute|{location:string,path:string;}, parameters:{[p:string]:string} = {}, options:any = {} ):void {
        console.log(`Notice: al-protected-content-ex redirecting to new target`, target );
        return this.navigation.navigate.to( target, parameters );
    }

    /**
     * Outer method to evaluate whether content should be shown or not.
     */
    public async evaluateAccessibility( triggerName?:string ):Promise<boolean> {

        await this.calculatingState;     //  only one evaluation at a time, please

        this.calculatingState.rescind();

        await this.navigation.ready();

        if ( this.verbose && triggerName ) {
            this.log(`Evaluating accessibility after trigger: ${triggerName}` );
        }

        let results = this.navigation.evaluate( this.conditions );
        if ( this.requiresDefender ) {
            results.push( this.navigation.conduit.checkExternalSession() );
        }

        const allowed = results.reduce( ( alpha, value ) => alpha && value, true );

        if ( allowed ) {
            if ( ! this.contentVisible || this.contentVisible === undefined ) {
                this.log(`accessibility evaluation yields VISIBLE state.` );
                //  Content has changed from hidden/initial to visible
                this.zone.run( () => {
                    this.contentVisible = true;
                    this.log("emitting onDisplay/setting visibility to true" );
                    this.onDisplay.emit();
                    if (this.isInitialAccessibilityEvaluation) {
                        this.onAccountChange.emit( AlSession.getActingAccount() );
                        this.isInitialAccessibilityEvaluation = false;
                    }
                } );
            }
        } else {
            if ( this.contentVisible || this.contentVisible === undefined ) {
                this.log(`accessibility evaluation yields PROTECTED state` );
                //  Content is changed from visible/initial to hidden
                this.zone.run( () => {
                    this.contentVisible = false;
                    this.log("emitting onHide/onDisallowed and setting visibility to false" );
                    this.onHide.emit();
                    this.onDisallowed.emit( this );     //  pass self as emitted object
                } );
            }
        }
        this.calculatingState.resolve( true );
        return this.contentVisible;
    }

    normalizeEntitlementInput( input:string|string[]|null ):string[]|null {

        input = this.toArray( input );
        let output:string[] = [];

        input.forEach( entitlementExpression => {
            if ( entitlementExpression === '@schema' ) {
                output = output.concat( this.toArray( this.getEntitlementsFromSchema() ) );
            } else if ( entitlementExpression.startsWith( "EntitlementGroup." ) ) {
                const groupId = entitlementExpression.substring( 17 );
                if ( EntitlementGroup.hasOwnProperty( groupId ) && typeof( EntitlementGroup[groupId] ) === 'string' ) {
                    const groupValue = EntitlementGroup[groupId] as string;
                    output.push( groupValue );
                } else {
                    console.error(`Warning: "EntitlementGroup.${groupId}" is not a valid entitlement group reference; ignoring` );
                }
            } else if ( entitlementExpression === '*' ) {
                return;
            } else {
                output = output.concat( this.toArray( entitlementExpression ) );
            }
        } );

        if ( output.length === 0 ) {
            return null;
        }

        return output;
    }

    onSessionStarted = ( event:AlSessionStartedEvent ) => {
        AlStopwatch.once( () => this.evaluateAccessibility( `session started` ) );
    }

    onAccountChanged = ( event:AlActingAccountChangedEvent ) => {
        //  Capture the previous account ID for later use
        this.previousAccountId = event.previousAccount ? event.previousAccount.id : "00000000";
    }

    onAccountResolved = ( event:AlActingAccountResolvedEvent ) => {
        AlStopwatch.once( async () => {
            if ( this.rerouteActingAccount ) {
                if ( this.navigation.activatedRoute && this.navigation.activatedRoute.toHref() !== window.location.href ) {
                    console.log(`Notice: al-protected-content-ex is redirecting current view to account-specific location [${this.navigation.activatedRoute.toHref()}]`);
                    this.navigation.navigate.to( this.navigation.activatedRoute );
                    return;
                }
            }
            if ( await this.evaluateAccessibility( `account change resolution` ) ) {                 //  content is still accessible
                if ( this.previousAccountId !== "00000000" ) {          //  previous account ID wasn't "empty"
                    this.log(`Emitting account changed event ${event.actingAccount.id}` );
                    this.onAccountChange.emit( event.actingAccount );   //  emit event
                }
            }
        } );
    }

    onSessionEnded = ( event:AlSessionEndedEvent ) => {
        AlStopwatch.once( () => this.evaluateAccessibility( `session ended` ) );
    }

    onDatacenterSessionEstablished = ( event:AlDatacenterSessionEstablishedEvent ) => {
        if ( this.requiresDefender ) {
            AlStopwatch.once( () => this.evaluateAccessibility("datacenter session established") );
        }
    }

    onNavigationContextChanged = ( event:AlNavigationContextChanged ) => {
        AlStopwatch.once( () => {
            this.evaluateAccessibility("navigation context changed");
        } );
    }

    /**
     * Attempts to retrieve a valid entitlement expression from the current activated route.
     */
    getEntitlementsFromSchema():string|string[] {
        if ( ! this.navigation.activatedRoute ) {
            console.warn("Warning: al-protected-content cannot extract entitlements from schema; no activated route is currently set." );
            return "void_entitlement";      //  think defensively; match nothing by default!
        }
        let route = this.navigation.activatedRoute;
        while( route ) {
            if ( typeof( route.definition.visible ) === 'object' ) {
                let entitlementExpression = this.getEntitlementsFromRouteCondition( route.definition.visible );
                if ( entitlementExpression ) {
                    console.log("Notice: al-protected-content extracted entitlement expression from schema: ", entitlementExpression );
                    this.capturedRoute = route;
                    return entitlementExpression;
                }
            }
            route = route.parent;
        }

        console.warn("Warning: al-protected-content cannot extract entitlements from schema; activated route hierarchy does not contain any entitlement conditions." );
        return "void_entitlement";
    }

    /**
     * Uses `AlNavigationService.activatedRoute` to redirect to the deepest route in the current route's lineage that is visible
     * AND entitled.  Hypothetically, this should ascend to the top level application's root route  in cases where there is
     * no entitled route.
     */
    findDeepestAccessibleRoute():AlRoute {
        const cursor:AlRoute = this.capturedRoute || this.navigation.activatedRoute;
        if ( ! cursor ) {
            return null;
        }
        let route = cursor.parent;      //  start with next item up
        while ( route ) {
            if ( route.visible && route.definition.action ) {
                //  visible implies it is either hardcoded visible or its entitlements and other conditions evaluated as truthy
                //  action means it can actually do something
                //  both are required
                console.log(`Notice: al-protected-content has selected an accessible route from the current route's ancestry: [${route.href}]`, route );
                return route;
            }
            route = route.parent;
        }
        //  No viable candidate routes?  SO SAD.
        return null;
    }

    /**
     * Attempts to retrieve a valid entitlement expression from a route condition (or nested condition).  PLEASE NOTE
     * that this will not yield the desired results in cases of complex or compound route conditions.
     */
    getEntitlementsFromRouteCondition( condition:AlRouteCondition ):string|string[] {
        if ( condition.entitlements ) {
            return condition.entitlements;
        }
        if ( condition.conditions && condition.rule === 'all' ) {
            for ( let i = 0; i < condition.conditions.length; i++ ) {
                let entitlementExpression = this.getEntitlementsFromRouteCondition( condition.conditions[i] );
                if ( entitlementExpression ) {
                    return entitlementExpression;
                }
            }
        }
        return null;
    }

    protected toArray( input?:string|string[] ):string[] {
        if ( ! input ) {
            return [];
        }
        if ( typeof( input ) === 'object' && input.hasOwnProperty( "length" ) ) {
            return input;
        }
        return [ input as string ];
    }

    protected log( message:string ) {
        if ( this.verbose ) {
            console.log("AlProtectedContentEx: " + message );
        }
    }
}
