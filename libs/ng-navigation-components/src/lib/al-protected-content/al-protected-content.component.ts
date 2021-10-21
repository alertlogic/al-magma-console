/**
 *  AlProtectedContentComponent provides a simple way to project content that is entitlement-specific without having to actually worry about
 *  the entitlements subsystem.
 *
 *  To use it, simply wrap your content inside an <al-protected-content> block with the appropriate entitlement expression assigned to its `entitlement` property.
 *  This entitlement expression can be either a | separated list of product families (see O3NavigationService.evaluateEntitlements) OR a named entitlement
 *  group (see the EntitlementGroup class).
 *
 *  The component also accepts optional event handlers for when the content is displayed or hidden (onDisplay and onHide) respectively.
 *
 *  <al-protected-content entitlement="EntitlementGroup.AnyDefender"
 *                       (onDisplay)="onContentDisplayed()"
 *                       (onHide)="onContentHidden()"
 *                       (unentitled)="onUnentitledAccess($event)">
 *      <div>This is my cloud defender-specific content!  Hurrah!</div>
 *      <div class="inaccessible">This is only visible if the content's entitlement requirements aren't met.</div>
 *  </al-protected-content>
 *
 *  The visibility of the content will be updated dynamically as entitlements for different accounts are resolved.
 *
 *  The `unentitled` event emitter will dispatch a copy of the current effective EntitlementCollection to the attached event handler,
 *  allowing the patron component to react to the invalid access in an entitlement-specific way.
 *
 *  @author McNielsen <knielsen@alertlogic.com>
 *  @copyright Alert Logic Inc, 2018
 */

import {
    AIMSAccount,
    AlActingAccountChangedEvent,
    AlActingAccountResolvedEvent,
    AlEntitlementCollection,
    AlRoute,
    AlRouteCondition,
    AlSession,
    AlStopwatch,
    AlSubscriptionGroup,
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
    SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { AlExperiencePreferencesService } from '../services/al-experience-preferences.service';
import { AlNavigationService } from '../services/al-navigation.service';
import { EntitlementGroup } from '../types/entitlement-group.class';

@Component({
    selector: 'al-protected-content',
    templateUrl: './al-protected-content.component.html'
})

export class AlProtectedContentComponent implements OnInit, OnChanges, OnDestroy
{
    public static deprecationNotice = true;
    public contentVisible:boolean = null;

    @Input() entitlement:string|string[];
    @Input() experienceAllowed:string|string[]                                  =   ['beta','default', null];// experience allowed by default

    @Input() accountChangeRoute:string|string[]|boolean                         =   null;
    @Input() unentitledRoute:string|string[]|boolean                            =   null;

    @Output() onDisplay:EventEmitter<void>                                      =   new EventEmitter<void>();
    @Output() onHide:EventEmitter<void>                                         =   new EventEmitter<void>();
    @Output() unentitled:EventEmitter<AlEntitlementCollection>                  =   new EventEmitter<AlEntitlementCollection>();
    @Output() onAccountChange:EventEmitter<AIMSAccount>                         =   new EventEmitter<AIMSAccount>();
    @Output() experienceNotAllowed:EventEmitter<string|string[]>                =   new EventEmitter<string|string[]>();

    protected subscriptions:AlSubscriptionGroup                                 =   new AlSubscriptionGroup();
    protected previousAccountId:string                                          =   "00000000";
    protected capturedRoute:AlRoute;

    private experience:string|string[]                                          =   null;
    private isExperienceAllowed:boolean                                         =   true;

    constructor( public router:Router,
                 public navigation:AlNavigationService,
                 public experiencePreferences: AlExperiencePreferencesService,
                 public zone:NgZone ) {
        this.subscriptions.manage(
            AlSession.notifyStream.attach(AlActingAccountChangedEvent, this.onAccountChanged ),
            AlSession.notifyStream.attach(AlActingAccountResolvedEvent, this.onAccountResolved )
        );
    }

    ngOnInit() {
        if ( AlProtectedContentComponent.deprecationNotice ) {
            let notification = new Error( `DEPRECATION WARNING: please update al-protected-content to al-protected-content-ex; this component will be removed soon.` );
            console.error( notification );
            AlProtectedContentComponent.deprecationNotice = false;
        }
        this.setEntitlements( this.entitlement );
        Promise.all( [ AlSession.resolved(), this.navigation.ready() ] ).then( async () => {
            if ( await this.evaluateAccessibility() ) {
                this.onAccountChange.emit( AlSession.getActingAccount() );
            }
        });
    }

    ngOnChanges( changes:SimpleChanges ) {
        if ( changes.hasOwnProperty( 'entitlement' ) ) {
            if ( ! changes.entitlement.firstChange ) {
                //  Reflect changes to the entitlement string after onInit has been executed
                this.setEntitlements( changes.entitlement.currentValue );
                this.evaluateAccessibility();
            }
        }
    }

    ngOnDestroy() {
        this.subscriptions.cancelAll();
    }

    setEntitlements = ( entitlement:string|string[] ) => {
        if ( ! entitlement ) {
            console.warn("Warning: the entitlement expression of the al-protected-content component should not be empty; using '*'" );
            this.entitlement = "*";
        }

        let result:string[] = [];

        if ( typeof( entitlement) === "string" ) {
            result = this.setEntitlementGroup(entitlement);
        } else if ( entitlement instanceof Array ) {
            entitlement.forEach( entitlementItem => {
                let entitlements = this.setEntitlementGroup(entitlementItem);
                if ( typeof( entitlements ) === 'string' ) {
                    result.push( entitlements );
                } else if ( entitlements instanceof Array ) {
                    result = result.concat( entitlements );
                }
            } );
        }
        this.entitlement = result;
    }

    setEntitlementGroup = ( entitlement:string ):string[] => {
        if ( entitlement.startsWith("EntitlementGroup.") ) {
            entitlement = entitlement.substring( 17 );
            if ( EntitlementGroup.hasOwnProperty( entitlement ) ) {
                // witchcraft
                // @ts-ignore
              return EntitlementGroup[entitlement];
            } else {
                throw new Error(`Warning: the entitlement expression 'EntitlementGroup.${entitlement}' does not reflect a valid entitlement group.  Are you using an outdated O3 constant?` );
            }
        } else if ( entitlement === '@schema' ) {
            return this.getEntitlementsFromSchema();
        } else if ( entitlement === "*" ) {
            return [];
        } else {
            return [ entitlement ];
        }
    }

    onAccountResolved = ( event:AlActingAccountResolvedEvent ) => {
        AlStopwatch.once( async () => {
            if ( await this.evaluateAccessibility( event.entitlements ) ) {
                if ( this.accountChangeRoute && (this.previousAccountId !== "00000000") ) {
                    this.dispatchRoute( this.accountChangeRoute, window.location.pathname );
                }
                this.onAccountChange.emit( event.actingAccount );
            }
        }, 10 );
    }

    onAccountChanged = ( event:AlActingAccountChangedEvent ) => {
        //  Capture the previous account ID for later use
        this.previousAccountId = event.previousAccount ? event.previousAccount.id : "00000000";
    }

    onContentUnavailable = ( invalidEntitlements:AlEntitlementCollection ) => {
        this.onHide.emit();
        if ( !this.isExperienceAllowed ) {
            this.experienceNotAllowed.emit(this.experience);
        } else if ( this.unentitledRoute ) {
            console.log("al-protected-content notice: content has become unavailable; dispatching redirect", this.unentitledRoute );
            this.dispatchRoute( this.unentitledRoute, "/" );
        } else {
            this.unentitled.emit( invalidEntitlements );
        }
    }

    async evaluateAccessibility( entitlements:AlEntitlementCollection = null ):Promise<boolean> {
        if ( ! entitlements ) {
            entitlements = this.navigation.entitlements;
        }
        let contentVisible = this.entitlement === '*' ? true :  false;
        // tslint:disable-next-line: no-boolean-literal-compare
        if ( contentVisible === false ){
            if ( typeof(this.entitlement) === "string" ) {
                contentVisible = this.navigation.evaluateEntitlementExpression( this.entitlement );
            } else if ( this.entitlement instanceof Array ) {
                contentVisible = this.entitlement.reduce<any>( ( alpha, expression ) => alpha && this.navigation.evaluateEntitlementExpression( expression ), true ) as boolean;
            } else {
                console.warn("AlProtectedContent: cannot evaluate entitlement expression that is not a string!" );
            }

        }
        // Check the experience preference
        try{
            await this.experiencePreferences.getExperiencePreferences();// to avoid getExperience() 'null' due to the delay to set the experience
            this.experience = this.navigation.getExperience();// get the current experience
            this.isExperienceAllowed = this.experienceAllowed instanceof Array ? this.experienceAllowed.includes(this.experience) : this.experienceAllowed === this.experience;
            contentVisible = contentVisible && this.isExperienceAllowed;
        }catch(err){
            console.error(err);
        }

        if ( contentVisible ) {
            this.onDisplay.emit();
        } else {
            this.onContentUnavailable( entitlements );
        }
        this.contentVisible = contentVisible;
        return contentVisible;
    }

    /**
     * Dispatches a route.  This can be a boolean 'true' (in which case the defaultRoute will be used),
     * a string URL, or an array of segments.
     *
     * The method will coerce any of these inputs into an array of segments, and replace :accountId with the new acting account ID for each segment (if provided).
     */
    dispatchRoute( route:string|string[]|boolean, defaultRoute:string ) {
        const previousAccountId = this.previousAccountId;
        this.previousAccountId = "00000000";
        if ( typeof( route ) === 'boolean' ) {
            const accessibleRoute = this.findDeepestAccessibleRoute();
            if ( accessibleRoute ) {
                accessibleRoute.dispatch();
                return;
            }
            route = defaultRoute;
            route = route.replace( `/${previousAccountId}`, `/${AlSession.getActingAccountId()}` );       //  only replace the old account ID with the new one if it is at the beginning of a path segment
        }

        if ( typeof( route ) === 'string' ) {
            route = route.split("/").slice( 1 );
        }

        if ( route instanceof Array ) {
            route[0] = `/${route[0]}`;      // route relative to root
            route = route.map( el => el.replace( ":accountId", AlSession.getActingAccountId() ) );
            console.log("Notice: al-protected-content is re-routing by ngRoute: ", route );
            this.zone.run( () => this.navigation.navigate.byNgRoute( route as string[] ) );
        }
    }

    /**
     * Attempts to retrieve a valid entitlement expression from the current activated route.
     */
    getEntitlementsFromSchema():string[] {
        if ( ! this.navigation.activatedRoute ) {
            console.warn("Warning: al-protected-content cannot extract entitlements from schema; no activated route is currently set." );
            return [ "void" ];
        }
        let route = this.navigation.activatedRoute;
        while( route ) {
            if ( route.definition.visible ) {
                let entitlements = this.getEntitlementsFromRouteCondition( route.definition.visible );
                if ( entitlements ) {
                    console.log("Notice: al-protected-content extracted entitlement expression from schema: ", entitlements );
                    this.capturedRoute = route;
                    return entitlements;
                }
            }
            route = route.parent;
        }

        console.warn("Warning: al-protected-content cannot extract entitlements from schema; activated route hierarchy does not contain any entitlement conditions." );
        return [ "void" ];
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
    getEntitlementsFromRouteCondition( condition:boolean|string|AlRouteCondition ):string[] {
        if ( typeof( condition ) === 'string' ) {
            condition = this.navigation.getConditionById( condition );
        }
        if ( typeof( condition ) === 'boolean' ) {
            if ( condition === true ) {
                return ["*"];                   //  always accessible
            } else {
                return ["void"];                //  never accessible
            }
        } else if ( typeof( condition ) === 'object' ) {
            if ( condition.entitlements ) {
                /**
                 * TODO: remove this normalization step after all menus have been recompiled to latest condition format
                 */
                if ( typeof( condition.entitlements ) === 'string' ) {
                    return [ condition.entitlements ];
                }
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
        }
        return null;
    }
}
