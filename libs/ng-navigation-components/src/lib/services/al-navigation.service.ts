/**
 * A not-very-interesting service to coordinate navigational state management into a singleton.
 * This is a nepal-based implementation of AlRoutingHost.
 *
 * @author McNielsen <knielsen@alertlogic.com>
 *
 */

import {
    getJsonPath,
    AlActingAccountChangedEvent,
    AlActingAccountResolvedEvent,
    AlBehaviorPromise,
    AlConduitClient,
    AlDatacenterSessionErrorEvent,
    AlExternalTrackableEvent,
    AlDefaultClient,
    AlEntitlementCollection,
    AlEntitlementRecord,
    AlErrorHandler,
    AlExperienceMapping,
    AlGlobalizer,
    AlInsightLocations,
    AlLocation,
    AlLocationContext,
    AlLocatorService,
    AlNavigationSchema,
    AlParamPreservationRule,
    AlRoute,
    AlRouteCondition,
    AlRouteDefinition,
    AlRouteAction,
    AlRoutingHost,
    AlRuntimeConfiguration, ConfigOption,
    AlSession,
    AlSessionEndedEvent,
    AlSessionStartedEvent,
    AlStopwatch,
    AlSubscriptionGroup,
    AlTriggerStream
} from '@al/core';
import {
    EventEmitter,
    Injectable,
    NgZone,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
    ActivatedRouteSnapshot,
    Data,
    NavigationEnd,
    NavigationExtras,
    Router,
} from '@angular/router';
import { MenuItem as PrimengMenuItem } from 'primeng/api';
import { filter } from 'rxjs/operators';
import {
    AlDatacenterOptionsSummary,
    AlNavigateOptions,
    AlNavigationContextChanged,
    AlNavigationFrameChanged,
    AlNavigationTertiarySelected,
    AlNavigationTrigger,
    AlNavigationIdlePrompt,
    AlNavigationReauthenticatePrompt
} from '../types';
import { AlExperiencePreferencesService } from './al-experience-preferences.service';
import {
    AlExternalContentManagerService,
    AlGoogleTagManagerService,
    AlTrackingMetricEventName,
    AlTrackingMetricEventCategory
} from '@al/ng-generic-components';
/*
import idleService, { IdleEvents } from '@kurtz1993/idle-service';
*/

@Injectable({
    providedIn: 'root'
})
export class AlNavigationService
             implements AlRoutingHost
{
    public schema:AlNavigationSchema            =   null;
    public currentUrl:string                    =   '';
    public authenticationRequisites:number      =   0;

    public routeData:{[k:string]:any}           =   {};
    public routeParams:{[k:string]:string}      =   {};
    public queryParams:{[k:string]:string}      =   {};

    public tertiaryMenu:AlRoute                 =   null;
    public conduit                              =   new AlConduitClient();

    /**
     *  `activatedRoutes` refers to the hierarchy of menu items of the deepest activated menu item, if any.
     *  It will be updated each time the AlNavigationContextChanged event is emitted.
     *  The deepest item in this hierarchy can be retrieved using the `activatedRoute` getter.
     */
    public activatedRoutes:AlRoute[]            =   [];
    public get activatedRoute():AlRoute|null {
        return this.activatedRoutes.length > 0 ? this.activatedRoutes[this.activatedRoutes.length-1] : null;
    }

    /**
     * Navigation triggers (named events referenced by menu data) emit through this event channel.
     */
    public events                               =   new AlTriggerStream();

    /**
     * Acting and primary entitlement snapshots
     */
    public authenticated:boolean                =   false;
    public primaryAccountId:string;
    public actingAccountId:string;
    public environment:string;
    public entitlements                         =   new AlEntitlementCollection();
    public primaryEntitlements                  =   new AlEntitlementCollection();
    public experienceFlags:{[experienceId:string]:boolean} = {};
    public routeParameters:{[parameter:string]:string}  =   {};
    public globalExperience:string;

    /**
     * EventEmitter to pass a css class to tertiary-content (al-archipeligo17-tertiary-menu)
     */
    public tertiaryContentClass$ = new EventEmitter<string|string[]|{[i:string]:boolean}>();

    /**
     * EventEmitter to indicate when the authentication requirements of the current route have changed.
     */
    public authRequirementsChanged$ = new EventEmitter<number>();

    /**
     * This cluster of methods supports imperative navigation of different types.
     * Note that each method accepts an optional `params` parameter bag.  This parameters will be used
     * to satisfy a given route or target's route parameters (if any); any *remaining* parameters will be
     * added as query parameters to the route.
     */
    public navigate = {
        /**
         * Determines the best type of navigation strategy to use based on a given input, using generous type
         * interpretation for the sake of simplicity :)
         */
        to: ( target: string|string[]|any[]|AlRoute|{location:string,path:string},
              parameters:{[p:string]:string} = {},
              options:AlNavigateOptions = {} ) => {
            if ( target instanceof AlRoute ) {
                return this.navigateByRoute( target, parameters, options );
            } else if ( typeof( target ) === 'string' && target.startsWith( "http" ) ) {
                return this.navigateByURL( target, parameters, options );
            } else if ( typeof( target ) === 'object' && target.hasOwnProperty("location") && target.hasOwnProperty("path") ) {
                let targetObject = target as {location:string,path:string};
                return this.navigateByLocation( targetObject.location, targetObject.path, parameters, options );
            } else if ( typeof( target ) === 'object' && target.hasOwnProperty("length") ) {
                return this.navigateByNgRoute( target as any[], { queryParams: parameters } );
            } else if ( typeof( target ) === 'string' ) {
                return this.navigateByNgRoute( [ target ], { queryParams: parameters } );
            }
        },

        /**
         * Navigates to a new URL based on a named route, like "cd17:overview" or "cd19:dashboards:settings".
         */
        byNamedRoute: ( namedRouteId:string, parameters:{[p:string]:string} = {}, options:AlNavigateOptions = {} ) => {
            return this.navigateByNamedRoute( namedRouteId, parameters, options );
        },

        /**
         * Navigates to a new URL based on a literal route.
         */
        byRoute: ( route: AlRoute, parameters:{[p:string]:string} = {}, options:AlNavigateOptions = {} ) => {
            return this.navigateByRoute( route, parameters, options );
        },

        /**
         * Navigates to a new URL based on location/path.
         */
        byLocation: ( locTypeId:string, path:string = '/#/', parameters:{[p:string]:string} = {}, options:AlNavigateOptions = {} ) => {
            return this.navigateByLocation( locTypeId, path, parameters, options );
        },

        /**
         * Navigates to a new URL
         */
        byURL: ( url:string, parameters:{[p:string]:string} = {}, options:AlNavigateOptions = {} ) => {
            return this.navigateByURL( url, parameters, options );
        },

        /**
         * Navigates to a new location in the current route using an array of angular commands.
         */
        byNgRoute: ( commands: any[], extras: NavigationExtras = { skipLocationChange: false } ) => {
            return this.navigateByNgRoute( commands, extras );
        }
    };

    protected navigationSchemaId:string             =   null;
    protected pendingResourceCount:number           =   0;
    protected navigationReady                       =   new AlBehaviorPromise<boolean>();

    protected schemas:{[schema:string]:Promise<AlNavigationSchema>}     =   {};
    protected loadedMenus:{[fullMenuId:string]:AlRoute}                 =   {};
    protected bookmarks:{[bookmarkId:string]:AlRoute}                   =   {};
    protected namedRouteDictionary:{[routeId:string]:AlRouteDefinition} =   {};
    protected conditionDictionary:{[conditionId:string]:AlRouteCondition} = {};
    protected conditionCache:{[conditionId:string]:boolean[]}           =   {};

    // This is useful to prefer the values when they're set by inputs
    protected forcedSchema:boolean          =   false;
    protected forcedExperience:boolean      =   false;
    protected identified:boolean            =   false;
    protected initialTrackingMetric:boolean =   false;

    protected frameNotifier:AlStopwatch;
    protected contextNotifier:AlStopwatch;
    protected sessionMonitor:AlStopwatch;
    protected subscriptions                 =   new AlSubscriptionGroup();
    protected rawExperienceMappings:unknown;
    protected experienceMappings:AlBehaviorPromise<unknown>;
    protected warnings:{[key:string]:boolean} = {};
    protected parameterPreservationRule:AlParamPreservationRule|null = null;

    // Session Idle and Session Expiration Controls
    protected useExpirationUI               =   false;
    protected inIdleWarning:boolean         =   false;
    protected inReauthentication:boolean    =   false;

    constructor( public router:Router,
                 public ngZone:NgZone,
                 public experiencePreference: AlExperiencePreferencesService,
                 public externalContent:AlExternalContentManagerService,
                 private titleService: Title,
                 private alGTMService: AlGoogleTagManagerService
    ) {
        this.frameNotifier = AlStopwatch.later( this.emitFrameChanges );
        this.contextNotifier = AlStopwatch.later( this.emitContextChanges );
        this.currentUrl = window.location.href;
        if ( this.router ) {
            this.subscriptions.manage( this.router.events.pipe( filter( event => event instanceof NavigationEnd ) ).subscribe( e => this.onNavigationComplete( e as NavigationEnd ) ) );
        }
        this.subscriptions.manage(
            AlSession.notifyStream.attach( AlSessionStartedEvent, this.onSessionStarted ),
            AlSession.notifyStream.attach( AlActingAccountChangedEvent, this.onActingAccountChanged ),
            AlSession.notifyStream.attach( AlActingAccountResolvedEvent, this.onActingAccountResolved ),
            AlSession.notifyStream.attach( AlSessionEndedEvent, this.onSessionEnded ),
            AlConduitClient.events.attach( AlDatacenterSessionErrorEvent, this.onDatacenterSessionError ),
            AlConduitClient.events.attach( AlExternalTrackableEvent, this.onExternalTrackableEvent )
        );
        this.exposeGlobals();
        this.listenForSignout();
        if ( AlRuntimeConfiguration.getOption<boolean>( ConfigOption.NavigationViaConduit ) ) {
            this.conduit.start();
        }

        // Start loading both schemas immediately in order to populate the namedRouteDictionary.
        this.getNavigationSchema("siemless");
        this.getNavigationSchema("cie-plus2");
        this.getExperienceMappings();

        if ( AlSession.isActive() ) {
            this.authenticated = true;
            this.entitlements = AlSession.getEffectiveEntitlementsSync();
            this.primaryEntitlements = AlSession.getPrimaryEntitlementsSync();
            this.primaryAccountId = AlSession.getPrimaryAccountId();
            this.actingAccountId = AlSession.getActingAccountId();
            this.setRouteParameter( "anonymous", "false" );
            this.setRouteParameter( 'accountId', this.actingAccountId );
            this.sessionMonitor = AlStopwatch.repeatedly( this.onSessionMonitor, 5000 );
            this.listenForIdle();
        } else {
            this.setRouteParameter("anonymous", "true" );   //  presume the user is unauthenticated by default
        }
    }

    /**
     * Returns a promise(-like object) that resolves when the navigation service is ready to navigate.
     */
    public ready():Promise<boolean> {
        return this.navigationReady.then( r => r, e => e );
    }

    /**
     * In lieu of a deconstructor/destroyer or consistent garbage collection, this provides a way to detach an instance of AlNavigationService
     * from all of its subscriptions and listeners.
     */
    public detach() {
        this.subscriptions.cancelAll();
    }

    /**
     * Returns the experience
     */
    public getExperience():string {
        return this.globalExperience;
    }

    /**
     * Returns the navigation schema id
     */
    public getSchema() {
        return this.navigationSchemaId;
    }

    /**
     * Whether the experience was forced
     */
    public getForcedExperience():boolean {
        return this.forcedExperience;
    }

    /**
     * Whether the experience was forced
     */
    public getForcedSchema():boolean {
        return this.forcedSchema;
    }

    public setForceSchema( force:boolean ) {
        this.forcedSchema = force;
    }

    public setForceExperience( force:boolean ) {
        this.forcedExperience = force;
    }

    /**
     * Sets the desired experience and notifies the navigation components of the changed setting.
     */
    public setExperience( experience:string, force?:boolean ) {
        if ( force || !this.forcedExperience ) {
            this.globalExperience = experience;
            this.setRouteParameter( "experience", experience );        //  make the selected experience available for conditional routes to test against
            this.frameNotifier.again();
            this.contextNotifier.again();
        }
    }

    /**
     * Sets the desired schema and notifies the navigation components of the changed setting.
     */
    public setSchema( schemaId:string, force?:boolean ) {
        if ( force || !this.forcedSchema ) {
            this.navigationSchemaId = schemaId;
            this.frameNotifier.again();
            this.contextNotifier.again();
        }
    }

    public setTertiaryMenu( menu:AlRoute ) {
        this.tertiaryMenu = menu;
        this.events.trigger( new AlNavigationTertiarySelected( menu ) );
    }

    /**
     * Changes the acting account.
     *
     * @param accountId The new acting account ID.
     * @param profileId If provided, the profile will "stick" to the correct session.
     * @param preventRedirection If provided and true, will prevent the function from triggering redirection if
     *                          the residency/domain changes.
     */
    public async setActingAccount( accountId:string, profileId?:string, preventRedirection?:boolean ):Promise<boolean> {

        //  Capture original state -- accountId, acting node, acting base URL
        const originalActingAccountId = AlSession.getActingAccountId();
        const originalDatacenterId = AlSession.getActiveDatacenter();
        const originalActingNode = AlLocatorService.getActingNode();
        const originalBaseUrl = originalActingNode ? AlLocatorService.resolveURL( originalActingNode.locTypeId ) : null;

        //  Change the acting account via @al/core
        try {
            await AlSession.setActingAccount( accountId, profileId );
            //  Update the accountId route parameter
            this.setRouteParameter("accountId", accountId );

            if ( originalBaseUrl && originalBaseUrl !== AlLocatorService.resolveURL( originalActingNode.locTypeId ) ) {
                let actingBaseUrl = AlLocatorService.resolveURL( originalActingNode.locTypeId );
                //  If these two strings don't match, the residency portal for the acting application has changed (e.g., we've switched from .com to .co.uk or vice-versa)
                //  In this case, redirect to the correct target location.
                let path = this.currentUrl.replace( /http[s]?:\/\/[a-z0-9_\-\.]+/i, '' );
                if ( originalActingAccountId ) {
                    //  Replace references to the previous acting account ID with references to the new one.
                    //  This could hypothetically malfunction for certain deep links -- so far, no issues have been reported (fingerscrossed)
                    path = path.replace( `/${originalActingAccountId}`, `/${accountId}` );
                }
                if ( path.indexOf( "?" ) >= 0 ) {
                    //  Chop off query parameters.  I remembered why we're doing this!  It's because the redirect logic below will
                    //  add the correct ones back in again.
                    path = path.substring( 0, path.indexOf( "?" ) );
                }

                if ( ! preventRedirection ) {
                    let href = this.resolveURL( `${actingBaseUrl}${path}` );
                    console.warn("AlNavigationService.setActingAccount: portal residency changed; redirecting to", href );
                    this.goToURL( href );
                }
            } else {
                if ( ! preventRedirection ) {
                    let href = this.rewriteUrlToAccountAndLocation( this.currentUrl, originalActingAccountId, originalDatacenterId );
                    if ( href !== this.currentUrl ) {
                        console.log("AlNavigationService.setActingAccount: acting account changed, acting URI rewritten to", href );
                        this.goToURL( href );
                    }
                }

                await this.setDefenderPreferredCustomer();
            }
            return true;
        } catch( error ) {
            AlErrorHandler.log( error, "AlNavigationService failed to set acting account" );
            return false;
        }
    }

    /**
     * This method calls a legacy endpoint in the defender stack to tell it which customer is currently the active or "preferred" one.
     * It will log errors and return false in case of failure, but is not treated as a blocking failure for `setActingAccount()`.
     */
    public async setDefenderPreferredCustomer():Promise<boolean> {
        try {
            let linkedUsers = AlSession.getUser().linked_users ?? [];
            let linkedDatacenterUser = linkedUsers.find( user => user.location === AlSession.getActiveDatacenter() );
            if ( linkedDatacenterUser ) {
                await AlDefaultClient.post( {
                    url: AlLocatorService.resolveURL( AlLocation.LegacyUI, '/core/set-preferred-cid' ),
                    params: {
                        customer_id: AlSession.getActingAccountId()
                    }
                } );
            }
            return true;
        } catch( e ) {
            AlErrorHandler.log( e, "AlNavigationService could not set defender preferred customer" );
            return false;
        }
    }

    /* A note for posterity: there are *definitely* ways that the following URL rewrite can cause problems.  For instance, if the user is looking at a
     * specific account's deployment, then the URL will be rewritten to look at account A and deployment belonging to account B.
     * However, a more systemically "correct" way of redirecting after account change is not yet available.  Someday soon, one hopes.
     */
    public rewriteUrlToAccountAndLocation( url:string, originalActingAccountId:string, originalDatacenterId:string ) {
        let pathReplacer = new RegExp( `\/${originalActingAccountId}([?\/])`, 'm' );
        return url.replace( /aaid=([0-9]+)/m, `aaid=${AlSession.getActingAccountId()}` )
                    .replace( pathReplacer, match => match.replace( originalActingAccountId, AlSession.getActingAccountId() ) )
                    .replace(`locid=${originalDatacenterId}`, `locid=${AlSession.getActiveDatacenter()}` );
    }

    /**
     * Retrieves a navigation schema (or resolves with the already-loaded schema).
     *
     * @param schemaId The identifier of the schema, currently either 'cie-plus2' or 'siemless' (although that is subject to change).
     *
     * The method will first attempt to retrieve the schema from conduit, and then fall back to retrieving a local copy using http.
     */
    public getNavigationSchema( schemaId:string ):Promise<AlNavigationSchema> {
        if ( ! this.schemas.hasOwnProperty( schemaId ) ) {
            this.schemas[ schemaId ] = new Promise( async ( resolve, reject ) => {
                this.claimPendingResource();
                let schemaDefinition:AlNavigationSchema|undefined = undefined;
                if ( AlRuntimeConfiguration.getOption<boolean>( ConfigOption.NavigationViaConduit ) ) {
                    try {
                        //  request shared resource from conduit
                        schemaDefinition = await this.conduit.getGlobalResource( `navigation/${schemaId}`, 60 ) as AlNavigationSchema;
                    } catch( e ) {
                        AlErrorHandler.log( e, `failed to retrieve navigation schema '${schemaId}' from conduit` );
                    }
                }
                if ( ! schemaDefinition && AlRuntimeConfiguration.getOption<boolean>( ConfigOption.NavigationViaGestalt ) ) {
                    try {
                        schemaDefinition = await this.externalContent.getJsonResource<AlNavigationSchema>( `navigation:schemas/${schemaId}.json` );
                    } catch( e ) {
                        AlErrorHandler.log( e, `failed to retrieve navigation schema '${schemaId}' from gestalt` );
                    }
                }
                if ( ! schemaDefinition ) {
                    try {
                        let basePath = AlRuntimeConfiguration.getOption<string>( ConfigOption.NavigationAssetPath, '/assets/navigation' );
                        schemaDefinition = await AlDefaultClient.get( { url: `${basePath}/schemas/${schemaId}.json`, withCredentials: false } ) as AlNavigationSchema;
                    } catch( e ) {
                        AlErrorHandler.log( e, `failed to retrieve navigation schema '${schemaId}' from local` );
                    }
                }
                resolve( this.ingestNavigationSchema( schemaId, schemaDefinition ) );       //  resolve regardless of whether or not a schema has been retrieved
            } );
        }
        return this.schemas[schemaId];
    }

    /**
     * Retrieves an "experience mapping" for a given experience identifier (a string formatted as path.to.feature#variant)
     */
    public async getExperienceMapping( experienceId:string ):Promise<AlExperienceMapping|null> {
        const matcher = /([a-zA-Z0-9\-_\.]+)#([a-zA-Z0-9_\-\.]+)/;
        const matches = experienceId.match( matcher );
        if ( matches.length !== 3 ) {
            console.warn(`Warning: experience identifier '${experienceId}' cannot be parsed as a featureId#variantId pair; please check your formatting.`);
            return null;
        }
        const mappings = await this.getExperienceMappings();
        let featureNode = getJsonPath( mappings, matches[1], null );
        if ( ! featureNode ) {
            return null;
        }
        if ( matches[2] in featureNode ) {
            return featureNode[matches[2]] as AlExperienceMapping;
        }
        return null;
    }

    public async getExperienceMappings():Promise<unknown> {
        if ( this.rawExperienceMappings ) {
            return this.rawExperienceMappings;
        }
        if ( this.experienceMappings ) {
            return this.experienceMappings;
        }
        this.experienceMappings = new AlBehaviorPromise<unknown>();
        this.claimPendingResource();
        let mappingDictionary:unknown;
        if ( AlRuntimeConfiguration.getOption<boolean>( ConfigOption.NavigationViaGestalt ) ) {
            try {
                mappingDictionary = await this.externalContent.getResource( "navigation:experience-mappings.json", "json" );
            } catch ( e ) {
                AlErrorHandler.log( e, "Could not retrieve experience mappings from gestalt; using empty mapping set." );
                mappingDictionary = {};
            }
        } else {
            try {
                let basePath = AlRuntimeConfiguration.getOption<string>( ConfigOption.NavigationAssetPath, '/assets/navigation' );
                mappingDictionary = await AlDefaultClient.get<unknown>( { url: `${basePath}/experience-mappings.json`, withCredentials: false } );
            } catch( e ) {
                AlErrorHandler.log( e, `Could not retrieve experience mappings from local; using empty mapping set.` );
                mappingDictionary = {};
            }
        }
        this.rawExperienceMappings = mappingDictionary;
        this.evaluateExperienceMappings( mappingDictionary );
        this.releasePendingResource();
        this.experienceMappings.resolve( this.rawExperienceMappings );
        this.contextNotifier.again();
        return this.rawExperienceMappings;
    }

    public getRouteByName( routeName:string ):AlRouteDefinition {
        if ( ! this.namedRouteDictionary.hasOwnProperty( routeName ) ) {
            console.warn(`AlNavigationService: cannot retrieve route with name '${routeName}'; no such named route is defined.` );
            return null;
        }
        return this.namedRouteDictionary[routeName];
    }

    public getConditionById( conditionId:string ):AlRouteCondition|boolean {
        if ( this.conditionDictionary.hasOwnProperty( conditionId ) ) {
            return this.conditionDictionary[conditionId];
        }
        return false;
    }

    /**
     * @deprecated
     *
     * Routes with ids are now referred to as 'named routes'; use getRouteByName instead.
     */
    public getRouteById( routeId:string ):AlRouteDefinition {
        console.warn("AlNavigationService.getRouteById is deprecated; please use getRouteByName instead." );
        return this.getRouteByName( routeId );
    }

    /**
     * Gets a menu by schema and ID (async)
     */
    public getMenu( schemaId:string, menuId:string ):Promise<AlRoute> {
        return this.getNavigationSchema( schemaId ).then( schema => {
            let menuKey = `${schemaId}:${menuId}`;
            if ( ! this.loadedMenus.hasOwnProperty( menuKey ) ) {
                throw new Error( `Navigation schema '${schemaId}' does not have a menu with ID '${menuId}'` );
            }
            return this.loadedMenus[menuKey];
        } );
    }

    /**
     * Gets a menu by schema and ID (syncronous)
     */
    public getLoadedMenu( schemaId:string, menuId:string ):AlRoute {
        const menuKey = `${schemaId}:${menuId}`;
        if ( ! this.loadedMenus.hasOwnProperty( menuKey ) ) {
            throw new Error( `Navigation schema '${schemaId}' is not loaded or does not have a menu with ID '${menuId}'` );
        }
        return this.loadedMenus[menuKey];
    }

    public setBookmark( bookmarkId:string, menuItem:AlRoute ) {
        this.bookmarks[bookmarkId] = menuItem;
    }

    public getBookmark( bookmarkId:string ):AlRoute {
        return this.bookmarks.hasOwnProperty( bookmarkId ) ? this.bookmarks[bookmarkId] : null;
    }

    /**
     * Handles user dispatch of a given route.
     */
    public dispatch = ( route:AlRoute, params?:{[param:string]:string} ) => {
        let options:AlNavigateOptions = {};
        if ( 'target' in route.properties ) {
            options.target = route.properties.target;
        }
        let isParentAncester = ( targetRoute:AlRoute, parentRoute:AlRoute ): boolean => {
            return targetRoute?.parent ? targetRoute.parent === parentRoute || isParentAncester(targetRoute.parent, parentRoute) : false;
        };
        if ( 'redirect-to-parent' in route.properties && route && this.activatedRoute?.parent
            && isParentAncester(this.activatedRoute, route)) {
            console.log("Redirecting to parent route...", this.activatedRoute.parent);
            route = this.activatedRoute.parent;
        }
        this.activatedRoutes = [ route ];            //  always set the activated route to the route being dispatched
        this.navigate.byRoute( route, params, options );
    }

    public refreshMenus() {
        let activatedRoutes:AlRoute[] = null;
        if ( ! this.schema || ! this.navigationSchemaId ) {
            console.warn("Warning: cannot refresh menus without an active schema." );
            return;
        }

        Object.keys( this.schema.menus )
            .map( menuId => `${this.navigationSchemaId}:${menuId}` )
            .map( scopedMenuId => this.loadedMenus[scopedMenuId] )
            .forEach( menu => {
                if (menu) {
                    menu.refresh( true );
                    if ( ! activatedRoutes ) {
                        activatedRoutes = menu.getActivationCursorFlat();
                    }
                }
            } );

        this.activatedRoutes = activatedRoutes || [];
    }

    /**
     * Determine whether or not a given experience flag is available in this context.
     */
    public isExperienceAvailable( xpId:string ):boolean {
        if ( xpId in this.experienceFlags ) {
            return this.experienceFlags[xpId];
        }
        return false;
    }

    /**
     * Evaluates a route condition.  Please note that this method will only be called for conditionals that cannot already be intuited by data from this service's
     * AlRoutingHost implementation.
     */
    public evaluate( condition: AlRouteCondition ):boolean[] {
        if ( condition.conditionId && condition.conditionId in this.conditionCache ) {
            return this.conditionCache[condition.conditionId];
        }

        let results:boolean[] = [];
        if ( typeof( condition.authentication ) === 'boolean' ) {
            results.push( this.authenticated === condition.authentication );
        }
        if ( condition.accounts ) {
            results.push( condition.accounts.includes( this.actingAccountId ) );
        }
        if ( condition.primaryAccounts ) {
            results.push( condition.primaryAccounts.includes( this.primaryAccountId ) );
        }
        if ( condition.locations ) {
            results.push( condition.locations.includes( AlSession.getActiveDatacenter() ) );
        }
        if ( condition.primaryLocations ) {
            results.push( condition.primaryLocations.includes( AlSession.getPrimaryAccount().default_location ) );
        }

        if ( condition.entitlements ) {
            if ( ! Array.isArray( condition.entitlements ) ) {
                condition.entitlements = [ condition.entitlements ];
                this.warnOnce( 'entitlementsArray', "Warning: AlNavigationService.evaluate() will not support non-array 'entitlements' conditions in the future", condition );
            }
            results = results.concat( condition.entitlements.map( entitlementExpression => this.authenticated && this.entitlements.evaluateExpression( entitlementExpression ) ) );
        }
        if ( condition.primaryEntitlements ) {
            if ( ! Array.isArray( condition.primaryEntitlements ) ) {
                condition.primaryEntitlements = [ condition.primaryEntitlements ];
                this.warnOnce( 'entitlementsArray', "Warning: AlNavigationService.evaluate() will not support non-array 'primaryEntitlements' conditions in the future", condition );
            }
            results = results.concat( condition.primaryEntitlements.map( entitlementExpression => this.authenticated && this.primaryEntitlements.evaluateExpression( entitlementExpression ) ) );
        }
        if ( condition.environments ) {
            results.push( condition.environments.includes( AlLocatorService.getContext().environment ) );
        }
        if ( condition.experiences ) {
            results.push(
                condition.experiences.includes( this.globalExperience )
                    ||
                condition.experiences.some( experienceId => this.isExperienceAvailable( experienceId ) )
            );
        }
        if ( condition.conditions ) {
            results = results.concat( condition.conditions.map( child => this.evaluateCondition( child ) ) );
        }
        if ( condition.conditionId ) {
            this.conditionCache[condition.conditionId] = results;
        }
        if ( condition.after || condition.before ) {
            let now = Math.floor( Date.now() / 1000 );       //  epoch timestamp
            if ( condition.before ) {
                results.push( now < this.dateToUTCTimestamp( condition.before ) );
            }
            if ( condition.after ) {
                results.push( now >= this.dateToUTCTimestamp( condition.after ) );
            }
        }
        return results;
    }

    /**
     * Extends the above evaluation function by reducing all of the results to a final value
     */
    public evaluateCondition( condition:AlRouteCondition ):boolean {
        let results = this.evaluate( condition );
        if ( condition.rule === 'none' ) {
            return ! results.some( value => value );
        } else if ( condition.rule === 'any' ) {
            return results.some( value => value );
        } else {
            return results.every( value => value );
        }
    }

    /**
     * Convenience method to evaluate currently installed entitlements against a logic entitlement expression.
     * See @al/core AlEntitlementCollection for more information on these expressions and how they are evaluated.
     */
    public evaluateEntitlementExpression( expression:string ):boolean {
        return this.entitlements.evaluateExpression( expression );
    }

    /**
     * @deprecated
     * Alias of evaluateEntitlementExpression
     */
    public evaluateEntitlement( expression:string ):boolean {
        return this.evaluateEntitlementExpression( expression );
    }

    /**
     * Sets a route parameter and schedules notification of child components.
     */
    public setRouteParameter( parameter:string, value:string ) {
        this.routeParameters[parameter] = value;
        this.contextNotifier.again();
    }

    /**
     * Deletes a route parameter and schedules notification of child components.
     */
    public deleteRouteParameter( parameter:string ) {
        delete this.routeParameters[parameter];
        this.contextNotifier.again();
    }

    /**
     * A workhorse method to resolve target locations, based on a variety of inputs, that includes route parameter substitution and session state query
     * parameters (aaid and locid).  It can accept a literal URL, a locTypeId/path pair, or an AlRoute as inputs.
     */
    public resolveURL( url:string|{locTypeId:string,path?:string}|AlRoute, parameters:{[p:string]:string} = {}, context?:AlLocationContext ):string {
        if ( url instanceof AlRoute ) {
            url.refresh( true );
            if ( ! url.href ) {
                throw new Error("Invalid usage: cannot resolve URL for a non-link route!" );
            }
            url = url.href;
        } else if ( typeof( url ) === 'object' && url.hasOwnProperty( "locTypeId" ) ) {
            url = AlLocatorService.resolveURL( url.locTypeId, url.path, context );
        }
        //  url is now guaranteed to be a string containing a fully qualified href
        return this.applyParameters( url as string, parameters );
    }

    /**
     * Implements `AlRoutingHost`'s decorateHref method, which allows it to manipulate the URLs generated
     * by @al/core.
     */
    public decorateHref( route:AlRoute ) {
        if ( route && route.href && route.visible ) {
            route.href = this.applyParameters( route.href, {}, true, true );        //  applies locid and aaid query parameters as appropriate
        }
    }

    /**
     * Black magic function that, given a url with :variable placeholder, consumes provided parameters as route parameters
     * and compiles any remainders into a query string.
     *
     * @param url The input url, with route parameter placeholder -- e.g., https://console.overview.alertlogic.com/#/remediations-scan-status/:accountId/:deploymentId
     * @param parameters The list of parameters to consume
     * @param rewriteQueryString If true (default), applies unused keys/values from the `parameters` input to generate a query string, and appends that to the result.
     * @param identityParameters If true (default) or a navigation options structure, applies acting account and location parameters to the query string.
     *
     * @returns The compiled URL.
     */
    public applyParameters( url:string,
                            parameters:{[p:string]:string},
                            rewriteQueryString:boolean = true,
                            identityParameters:boolean|AlNavigateOptions = true ):string {
        let unused = Object.assign( {}, parameters );

        url = url.replace( /\:[a-zA-Z_]+/g, match => {
            let variableId = match.substring( 1 );
            if ( unused.hasOwnProperty( variableId ) ) {
                let value = unused[variableId];
                delete unused[variableId];
                return value;
            } else if ( this.routeParameters.hasOwnProperty( variableId ) ) {
                return this.routeParameters[variableId];
            } else {
                //  Missing route parameters should not occur under most circumstances
                //  console.warn(`AlNavigationService: cannot fully construct URL which requires missing parameter '${variableId}'`);
                return "(null)";
            }
        } );

        /* istanbul ignore else */
        if ( rewriteQueryString ) {
            if ( identityParameters && AlSession.isActive() ) {
                let actingAccountId;
                let datacenterId;
                let profileId = AlSession.getProfileId();
                if ( typeof( identityParameters ) === 'object' && identityParameters.hasOwnProperty("as") ) {
                    actingAccountId = identityParameters.as.accountId || AlSession.getActingAccountId();
                    datacenterId = identityParameters.as.locationId || AlSession.getActiveDatacenter();
                } else {
                    actingAccountId = AlSession.getActingAccountId();
                    datacenterId = AlSession.getActiveDatacenter();
                }
                unused["aaid"] = actingAccountId;
                if ( datacenterId ) {
                    unused["locid"] = datacenterId;      //  corresponds to insight locations service locationId
                }
                if ( profileId ) {
                    unused["profile"] = profileId;
                }
            }
            let qsOffset = url.indexOf("?");
            if ( qsOffset !== -1 ) {
                const existing:{[parameter:string]:string} = {};
                url.substring( qsOffset + 1 )
                    .split("&")
                    .forEach( kvPair => {
                        let [ key, value ] = kvPair.split("=");
                        existing[key] = decodeURIComponent( value );
                    } );
                for ( let k in existing ) {
                    if ( existing.hasOwnProperty( k ) ) {
                        unused[k] = existing[k];
                    }
                }
                url = url.substring( 0, qsOffset );
            }
            if ( Object.keys( unused ).length > 0 ) {
                let queryString = Object.keys( unused ).sort().map( key => `${key}=${encodeURIComponent( unused[key] )}` ).join( "&" );
                url = `${url}?${queryString}`;
            }
        }

        return url;
    }

    /**
     *  Generates the available data center menu structure.
     *
     *  A note on history: the reason this code is so unduly complicated is because, when the data center selector was introduced during 2017's "Universal Navigation"
     *  project (a time period when it was necessary to manage seperate user accounts and logins for different datacenters, if you can imagine that) the decision was made
     *  to conflate defender and insight locations into composites "us-west-1", "us-east-1", and "uk-west-1".  The problem, of course, is that the defender and insight
     *  datacenters of the US are asymmetrical.  It was assumed that the number of datacenters would inevitably increase and span further regions, so abstraction
     *  was preferred over a simpler enumeration of the possible permutations.
     *
     *  This expansion has not yet occurred, but the code is ready for it...  :)
     */
    public generateDatacenterMenu( currentLocationId:string,
                                      accessible:string[],
                                      activationCallback:{(insightLocationId:string,$event:any):void} ):AlDatacenterOptionsSummary {
        let available:{[i:string]:{[j:string]:string}} = {};
        let currentRegion = AlInsightLocations.hasOwnProperty( currentLocationId )
                                ? AlInsightLocations[currentLocationId].logicalRegion
                                : 'us-west-1';      //  without a default, people complain...  they complain so much
        accessible.forEach( accessibleLocationId => {
            if ( ! AlInsightLocations.hasOwnProperty( accessibleLocationId ) ) {
                return;
            }
            const locationInfo = AlInsightLocations[accessibleLocationId];
            let targetLocationId = accessibleLocationId;
            let logicalRegion = locationInfo.logicalRegion;
            if ( locationInfo.alternatives ) {
                locationInfo.alternatives.find( alternativeLocationId => {
                    if ( accessible.includes( alternativeLocationId ) ) {
                        targetLocationId = alternativeLocationId;
                        logicalRegion = AlInsightLocations[alternativeLocationId].logicalRegion;
                        return true;
                    }
                    return false;
                } );
            }
            if ( ! available.hasOwnProperty( locationInfo.residencyCaption ) ) {
                available[locationInfo.residencyCaption] = {};
            }
            if ( ! available[locationInfo.residencyCaption].hasOwnProperty( logicalRegion ) ) {
                available[locationInfo.residencyCaption][logicalRegion] = targetLocationId;
            }
        } );

        let locationsAvailable = 0;
        let currentResidency = "US";
        let selectableRegions:PrimengMenuItem[] = [];
        Object.keys( available ).forEach( region => {
            let regionMenu: {label: string; items: PrimengMenuItem[]} = {
                label: region,
                items: []
            };
            Object.keys( available[region] ).forEach( logicalRegion => {
                const targetLocationId = available[region][logicalRegion];
                const activated = ( logicalRegion === currentRegion ) ? true : false;
                if ( activated ) {
                    currentResidency = AlInsightLocations[targetLocationId].residency;
                    currentRegion = AlInsightLocations[targetLocationId].logicalRegion;
                }
                locationsAvailable++;
                regionMenu.items.push( {
                    label: logicalRegion,
                    styleClass: activated ? "active" : "",
                    command: ( event ) => activationCallback( targetLocationId, event )
                } );
            } );
            selectableRegions.push( regionMenu );
        } );

        return { locationsAvailable, selectableRegions, currentRegion, currentResidency };
    }

    /**
     * Forces the user to login.
     */
    public forceAuthentication( returnURL?:string ) {
        let environment = AlLocatorService.getCurrentEnvironment();
        let residency = 'US';
        if ( environment === 'development' ) {
            environment = 'integration';
        }
        let loginURL = AlLocatorService.resolveURL( AlLocation.AccountsUI, '/#/login', { environment, residency } );
        this.navigate.byURL( loginURL, { return: returnURL || window.location.href } );
    }

    public incrementAuthenticationRequisite() {
        this.authenticationRequisites++;
    }

    public decrementAuthenticationRequisite() {
        this.authenticationRequisites--;
    }


    /**
     * Detect if the current browser is either IE 10 or older (msie) or IE 11 (trident)
     */
    public isIEBrowser() {
        return /msie\s|trident\//i.test(window.navigator.userAgent);
    }

    /**
     * Dispatches an arbitrary event/properties to our analytics provider(s).
     * Please note the the acting and primary account, user, and application will be populated automatically.
     */
    public track( eventName:AlTrackingMetricEventName|string, properties:{[k:string]:any} = {} ) {
        this.alGTMService.trackCustomEvent( eventName, properties);
    }

    /**
     * Dispatches a specifically configured usage tracking event to our analytics provider(s) - most suited for Google Analytics.
     */
    public trackUsageEvent( properties:{category: string, action: string, label?: string} ) {
        this.alGTMService.trackCustomEvent( AlTrackingMetricEventName.UsageTrackingEvent, properties);
    }

    /**
     * @deprecated
     * Sends an identification call to our analytics provider(s).
     */
    public async identify() {
        console.warn('AlNavigationService.identify() has now been deprecated, please remove the invocation to this method');
        this.identified = true;
    }

    /**
     * Handles session persistence errors (aka "third party cookies are disabled and you can't log in").
     * If the current application instance is in an iframe, it communicates the error to the parent document.
     * If the current application is the top level document, it will redirect to the appropriate error page on console.account.
     */
    public onDatacenterSessionError = ( error:AlDatacenterSessionErrorEvent ) => {
        if ( window.parent !== window ) {
            const message = {
                type: "conduit.externalSessionError",
                requestId: "na",
                errorType: error.errorType || "cookie-configuration"
            };
            window.parent.postMessage( message, "*" );
        } else {
            let errorType = error.errorType || "cookie-configuration";
            this.navigate.byLocation( AlLocation.AccountsUI, `/#/error/${errorType}` );
        }
    }

    /**
     * Handles external trackable events (these are javascript events communicated from our legacy datacenters via conduit/postMessage)
     */
    public onExternalTrackableEvent = ( event:AlExternalTrackableEvent ) => {
        let eventData = event.data as any;
        let name = 'eventName' in eventData ? eventData.eventName : "External Event";
        let description = `eventDescription` in eventData ? eventData.eventDescription : "";
        let value = 'eventValue' in eventData ? eventData.eventValue : '';
        let trackableData = {
            category: AlTrackingMetricEventCategory.ExternalDatacenterAction,
            action: name,
            label: description,
            value: value
        };
        this.track( AlTrackingMetricEventName.UsageTrackingEvent, trackableData );
    }

    /**
     * Convenience method to retrieve a query parameter, optionally providing a default value
     */
    public queryParam( parameterName:string, defaultValue:string = null ):string {
        return ( parameterName in this.queryParams ) ? this.queryParams[parameterName] : defaultValue;
    }

    /**
     * Convenience method to retrieve a route parameter, optionally providing a default value
     */
    public routeParam( parameterName:string, defaultValue:string = null ):string {
        return ( parameterName in this.routeParams ) ? this.routeParams[parameterName] : defaultValue;
    }

    /**
     * Registers a listener for the Navigation.User.Signout trigger, which should prompt local session destruction and a redirect to
     * console.account's logout route.
     */
    protected listenForSignout() {
        this.events.attach( 'AlNavigationTrigger', (event: AlNavigationTrigger) => {
            switch( event.triggerName ) {
                case 'Navigation.User.Signout' :
                    if ( ! AlRuntimeConfiguration.getOption<boolean>( ConfigOption.NavigationIntegratedAuth, false ) ) {
                        //  Only execute this logic if integrated authentication mode is disabled
                        event.respond( true );
                        AlSession.deactivateSession();
                        this.navigate.byLocation( AlLocation.AccountsUI, '/#/logout', { return: window.location.href } );
                    }
                    break;
            }
        });
    }

    /**
     * If applicable, uses the idleService to detect when/if the user's session should be terminated due to idleness.
     *
     * NOTE: this idle-based expiration is an initial implementation of a more complex feature.  Essentially, if the interval of time expires,
     * logout will be triggered immediately and without warning.  In the future, timeToIdle and timeToTimeout (below) should be reconfigured
     * to prompt the user to continue working.
     *
     * When we get there, we should implement "prompt to reauthenticate when the token is about to expire" at the same time -- two birds, one stone.
     */
    protected listenForIdle() {
        let account = AlSession.getPrimaryAccount();
        let idleTimeout = account.idle_session_timeout;
        if ( idleTimeout ) {
            this.startIdleService( idleTimeout );
        }
    }

    protected startIdleService( idleTimeout:number ) {
        console.log(`Notice: initiating idle timeout of ${idleTimeout} seconds.` );
        let threshold = Math.max( 30, idleTimeout - 180 );
        let warningDuration = 180;
        /*
        idleService.configure( {
            timeToIdle: threshold,
            timeToTimeout: warningDuration,
            autoResume: false,
            listenFor: "mousemove click scroll"
        } );
        idleService.on( IdleEvents.TimeoutWarning, remaining => {
            if ( remaining < warningDuration && ! this.inIdleWarning && this.useExpirationUI ) {
                this.inIdleWarning = true;
                this.ngZone.run( () => {
                    console.log("Notice: user's idle time has reached threshold of %s seconds remaining; triggering idle warning", remaining );
                    this.events.trigger( new AlNavigationIdlePrompt( warningDuration, () => {
                        idleService.reset();
                        this.inIdleWarning = false;
                    } ) );
                } );
            }
        } );
        idleService.start();
        */
    }

    /**
     * Listens for router complete/cancel events from angular
     */
    protected onNavigationComplete = ( event:NavigationEnd ) => {
        this.currentUrl = window.location.href;         //  Update the current "official" URL for the menu system
        if ( !this.parameterPreservationRule ) {
            this.parameterPreservationRule = AlRuntimeConfiguration.findParamPreservationRule( event.urlAfterRedirects );
        }

        //  Iterate through the router's root to accumulate all data from its children, and make that data public
        let aggregatedData:Data = {};
        let aggregatedQueryParams = {};
        let aggregatedRouteParams = {};
        if ( this.router && this.router.routerState.root.snapshot.children ) {
            let accumulator = ( element:ActivatedRouteSnapshot ) => {
                Object.assign( aggregatedData, element.data );
                Object.assign( aggregatedQueryParams, element.queryParams );
                Object.assign( aggregatedRouteParams, element.params );
                if ( element.children ) {
                    element.children.forEach( accumulator );
                }
            };
            accumulator( this.router.routerState.root.snapshot );
        }

        // Assigning the App Title if the "title" property is present.
        if( aggregatedData.hasOwnProperty( 'title' ) ) {
            this.titleService.setTitle( aggregatedData['title'] );
        }
        let pageViewTitle = this.titleService.getTitle();
        // In some cases, the page title is being set dynamically in the apps themselves, such as via the al-custom-title directive so that names of things can be included.
        // For example - 'Overview | Topology | Deployment 12345' - in this case we would not want the 'Deployment 12345' part included in the data sent to Google Analytics.
        // Add a pageViewTitle data attribute in the application route definitions and set to something custom.
        // If not set, the current page title will be used as the default
        if( aggregatedData.hasOwnProperty( 'pageViewTitle' ) ) {
            pageViewTitle = aggregatedData['pageViewTitle'];
        }

        this.routeData = aggregatedData;
        this.routeParams = aggregatedRouteParams;
        this.queryParams = aggregatedQueryParams;

        if ( AlSession.isActive() && event.urlAfterRedirects !== '/' ) { // Don't track default base route navigation events
            this.alGTMService.trackPageViewEvent(pageViewTitle, event.urlAfterRedirects);
        }

        this.contextNotifier.again();                   //  Notify child components
    }

    /**
     * Listens for session start triggers from @al/core
     */
    protected onSessionStarted = ( event:AlSessionStartedEvent ) => {
        this.authenticated = true;
        this.inReauthentication = false;
        this.setRouteParameter("anonymous", "false" );
        this.primaryAccountId = event.primaryAccount.id;
        this.contextNotifier.again();
        this.sessionMonitor = AlStopwatch.repeatedly( this.onSessionMonitor, 5000 );
        this.listenForIdle();
    }

    /**
     * Listens for acting account changed triggers from @al/core
     */
    protected onActingAccountChanged = ( event:AlActingAccountChangedEvent ) => {
        if ( event.actingAccount.id !== this.actingAccountId ) {
            this.actingAccountId = event.actingAccount.id;
            this.routeParameters['accountId'] = event.actingAccount.id;
            this.experienceFlags = {};
            this.contextNotifier.again();
        }
    }

    /**
     * Listens for acting account resolution triggers from @al/core
     */
    protected onActingAccountResolved = ( event:AlActingAccountResolvedEvent ) => {
        this.entitlements               =   event.entitlements;
        this.primaryEntitlements        =   event.primaryEntitlements;
        this.evaluateExperienceMappings( this.rawExperienceMappings );
        this.contextNotifier.again();
    }

    /**
     * Listens for session ended triggers from @al/core
     */
    protected onSessionEnded = ( event:AlSessionEndedEvent ) => {
        this.authenticated = false;
        this.setRouteParameter("anonymous", "true");
        this.deleteRouteParameter( 'accountId' );
        this.contextNotifier.again();
        if ( this.sessionMonitor ) {
            this.sessionMonitor.cancel();
            delete this.sessionMonitor;
        }
        /*
        idleService.stop();
        */
        this.identified = false;
    }

    /**
     * Monitor session lifespan.
     * When the session is within 6 minutes of expiration, trigger the "reauthenticate now" modal.
     * When the session is within 1 minute of expiring, force deauthentication to occur.
     */
    protected onSessionMonitor = () => {
        let secondsToExpiration = AlSession.getTokenExpiry() - Math.floor( Date.now() / 1000 );
        if ( secondsToExpiration < 360 && ! this.inReauthentication && this.useExpirationUI ) {
            console.log("Notice: there are only %s seconds until session expiration; triggering reauthentication prompt", secondsToExpiration );
            this.inReauthentication = true;
            this.ngZone.run( () => this.events.trigger( new AlNavigationReauthenticatePrompt() ) );
        } else if ( secondsToExpiration < 60 ) {
            console.warn("Notice: session has expired; deactivating session and redirecting to login." );
            AlSession.deactivateSession();
            this.navigate.byLocation( AlLocation.AccountsUI, '/#/logout', { return: window.location.href } );
        } else {
            // console.log("There are %s seconds left until session expiration", secondsToExpiration );
        }
    }

    /**
     * Internal handler for navigation by named route.
     */
    protected navigateByNamedRoute( namedRouteId:string, parameters:{[p:string]:string} = {}, options:AlNavigateOptions = {} ) {
        this.navigationReady.then( schema => {
            let definition = this.getRouteByName( namedRouteId );
            if ( ! definition ) {
                throw new Error("Imperative navigation could not be executed." );
            }
            let route = new AlRoute( this, definition );
            this.navigateByRoute( route, parameters, options );
        } );
    }

    /**
     * Internal handler for navigation by route.
     */
    protected navigateByRoute( route: AlRoute, parameters:{[p:string]:string} = {}, options:AlNavigateOptions = {} ):void {
        const action = route.getRouteAction();
        if ( action ) {
            if ( action.type === 'link' ) {
                if ( action.url ) {
                    this.navigateByURL( action.url, parameters, options );
                } else if ( action.location ) {
                    if ( this.isLocalRoute( action ) ) {
                        //  We are navigating within an application -- use the angular router
                        this.navigateByLocalLocation( action, parameters );
                    } else {
                        //  We are navigating between applications -- away we go
                        this.navigateByLocation( action.location, action.path, parameters, options );
                    }
                } else {
                    console.warn("AlNavigationService: cannot dispatch link route without a link!", action );
                }
            } else if ( action.type === 'trigger' ) {
                console.log("AlNavigationService.Trigger [%s]", action.trigger );
                this.events.trigger( new AlNavigationTrigger( this,
                                                              action.trigger,
                                                              route.definition,
                                                              route ) );
            }
        } else {
            //  Find first visible child with an action and go there instead
            let eligibleChild = route.children.find( child => child.visible && typeof( child.definition.action ) !== 'undefined' );
            if ( eligibleChild ) {
                return this.navigateByRoute( eligibleChild, parameters, options );
            } else {
                console.warn("AlNavigationService: cannot dispatch route without an action!", route );
            }
        }
    }

    protected isLocalRoute( action:AlRouteAction ):boolean {
        if ( AlLocatorService.getActingNode()?.locTypeId !== action.location ) {
            return false;
        }
        if ( ! action.path || ! action.path.startsWith('/#') || action.path.includes( "/index.html") ) {
            return false;       //  only consider hrefs prefixed with hash fragments/without a child index
        }
        return true;
    }

    /**
     * Converts a location/path pair into an angular Router.navigate call.
     * Sadly, "local location" is both redundant and unpoetic -- the adjective and noun both derive from the latin 'loc', or 'place', and the whole
     * business of navigation of riddled with redundant, overlapping, and incongruous constructs of place and movement.  It really bothers me.
     * But at the same time, this function does exactly what the name says, so I'm gonna get over it.
     */
    protected navigateByLocalLocation( target:AlRouteAction, rawParameters:{[p:string]:string} = {} ):void {
        let [ path, pathParams ] = target.path.split("?");
        let parameters:{[p:string]:string} = Object.assign( {}, rawParameters );
        let targetRoute = path.replace( /\:[a-zA-Z_]+/g, match => {
            let variableId = match.substring( 1 );
            if ( variableId in parameters ) {
                let value = parameters[variableId];
                delete parameters[variableId];
                return value;
            } else if ( variableId in this.routeParameters ) {
                return this.routeParameters[variableId];
            } else {
                return "(null)";
            }
        } );
        if ( targetRoute.startsWith("/#") ) {
            targetRoute = targetRoute.substring( 2 );
        }
        if ( targetRoute.startsWith("/") ) {
            targetRoute = targetRoute.substring( 1 );
        }
        if ( pathParams ) {
            //  If the path contains query parameters, merge them into the parameter map
            pathParams.split("&")
                .forEach( kvPair => {
                    let [ key, value ] = kvPair.split("=");
                    parameters[key] = decodeURIComponent( value );
                } );

        }
        let targetRouteCommands = targetRoute.split("/");
        this.navigateByNgRoute( targetRouteCommands, { queryParams: parameters } ); //  take that!
    }

    /**
     * Internal handler for navigation based on location/path.
     */
    protected navigateByLocation( locTypeId:string, path:string = '/#/', parameters:{[p:string]:string} = {}, options:AlNavigateOptions = {} ) {
        this.navigateByURL( AlLocatorService.resolveURL( locTypeId, path ), parameters, options );
    }

    /**
     * Internal handler for navigation by raw URL
     */
    protected navigateByURL( url:string, parameters:{[p:string]:string} = {}, options:AlNavigateOptions = {} ) {
        url = this.applyParameters( url, parameters, true, options );
        this.goToURL( url, options );
    }

    /**
     *  Method to actually, you know, change the URL.  This is separated by the imperative mechanism above so that unit testing
     *  can easily intercept navigation events.
     */
    protected goToURL( url:string, options:AlNavigateOptions = {} ) {
        let newWindow = options.hasOwnProperty('target') && options['target'] === '_blank';
        if ( newWindow ) {
            console.log(`AlNavigationService: opening [${url}] in new window` );
            window.requestAnimationFrame( () => {
                window.open( url, "_blank" );
            } );
        } else {
            console.log(`AlNavigationService: navigating to [${url}]` );
            if ( options.replace ) {
                window.location.replace( url );
            } else {
                window.location.href = url;
            }
        }
    }

    /**
     * Internal handler for navigation using angular router
     */
    protected navigateByNgRoute( commands: any[], initialExtras: NavigationExtras = { skipLocationChange: false } ) {
        let extras = initialExtras || {};
        extras.queryParamsHandling = extras.queryParamsHandling || 'merge';
        extras.queryParams = extras.queryParams || {};
        extras.queryParams['aims_token'] = undefined;       //  make sure this query parameter is never propagated, because it is icky
        if ( AlSession.isActive() ) {
            extras.queryParams["aaid"] = AlSession.getActingAccountId();
            let datacenterId = AlSession.getActiveDatacenter();             //  corresponds to insight locations service locationId
            if ( datacenterId ) {
                extras.queryParams["locid"] = datacenterId;
            }
            let profileId = AlSession.getProfileId();
            if ( profileId ) {
                extras.queryParams["profile"] = profileId;
            }
        }

        /**
         * Determine if we are changing parameter preservation "zones" -- if so, we need to remove any volatile query parameters and make
         * sure any existing query parameters are in the new zone's whitelist (if applicable).
         */
        let targetRule = AlRuntimeConfiguration.findParamPreservationRule( this.commandsToPath( commands ) );
        if ( targetRule !== this.parameterPreservationRule ) {
            if ( this.parameterPreservationRule && this.parameterPreservationRule.volatile ) {
                //  Remove any 'volatile' query parameters unless an explicit value for them is provided by the caller
                this.parameterPreservationRule.volatile.forEach( volatileQueryParam => {
                    if ( ! ( volatileQueryParam in extras.queryParams ) ) {
                        extras.queryParams[volatileQueryParam] = undefined;
                    }
                } );
            }
            if ( targetRule && targetRule.whitelist ) {
                let whitelist = targetRule.whitelist.concat( [ "aaid", "locid", "profile" ] );
                Object.keys( this.queryParams ).forEach( existingParam => {
                    if ( ! whitelist.includes( existingParam ) ) {
                        extras.queryParams[existingParam] = undefined;
                    }
                } );
            }
        }

        if ( this.router ) {
            this.router.navigate( commands, extras );
            this.parameterPreservationRule = targetRule;
        } else {
            throw new Error("Cannot navigate without router reference." );
        }
    }

    protected commandsToPath( commands:any[] ):string {
        let path = commands.join("/");
        if ( ! path.startsWith("/") ) {
            path = `/${path}`;
        }
        return path;
    }

    /**
     *  Notifies the navigation componentry that the schema or experience has changed, after loading the selected schema.
     *  This change is communicated via an AlNavigationFrameChanged event emitted through AlNavigationService's `events` channel.
     */
    protected emitFrameChanges = () => {
        if ( ! this.navigationSchemaId || ! this.globalExperience ) {
            //  If no schema or experience has been set, do not notify the frame of any changes -- both must be present for the frame to be displayed.
            return;
        }
        this.getNavigationSchema( this.navigationSchemaId ).then( schema => {
            this.schema = schema;
            this.ngZone.run( () => {
                if ( this.navigationSchemaId && this.schema ) {
                    this.refreshMenus();
                }
                let event = new AlNavigationFrameChanged( this, this.navigationSchemaId, schema, this.globalExperience );
                this.events.trigger( event );
            } );
        } );
    }

    /**
     * Notifies the navigation componentry that one (or more) of the following things has changed:
     *      - Authentication status
     *      - Acting account/entitlements
     *      - Route parameters
     *      - Current route
     *  This change is communicated via an AlNavigationContextChanged event emitted through AlNavigationService's `events` channel.
     */
    protected emitContextChanges = () => {
        this.ngZone.run( () => {
            this.conditionCache = {};
            if ( this.navigationSchemaId && this.schema ) {
                this.refreshMenus();
            }
            let event = new AlNavigationContextChanged( this, AlSession, this.routeData, this.activatedRoute );
            this.events.trigger( event );
        } );
    }

    /**
     * Processes a schema when it is loaded for the first time -- hydrates its menus, stores its named routes, etc.
     */
    protected ingestNavigationSchema( schemaId:string, schema:AlNavigationSchema|undefined ):AlNavigationSchema {
        if ( schema ) {
            //  First ingest named routes and add them to the internal dictionary
            if ( schema.conditions ) {
                Object.entries( schema.conditions )
                    .forEach( ( [ conditionId, condition ] ) => {
                        this.conditionDictionary[conditionId] = condition;
                    } );
            }
            if ( schema.namedRoutes ) {
                Object.entries( schema.namedRoutes )
                    .forEach( ( [ routeId, routeDefinition ]:[ string, AlRouteDefinition ] ) => {
                        this.namedRouteDictionary[routeId] = routeDefinition;
                    } );
            }
            //  Then build living menus from their definitions
            if ( schema.menus ) {
                Object.entries( schema.menus )
                    .forEach( ( [ menuId, menuDefinition ]:[ string, AlRouteDefinition ] ) => {
                        const menuKey = `${schemaId}:${menuId}`;
                        if ( ! this.loadedMenus.hasOwnProperty( menuKey ) ) {
                            this.loadedMenus[`${schemaId}:${menuId}`] = new AlRoute( this, menuDefinition );
                        }
                    } );
            }
        } else {
            console.warn(`AlNavigationService: failed to retrieve navigation schema '${schemaId}'`);
        }
        this.releasePendingResource();
        return schema;
    }

    /**
     * Enumerates through all experience mappings and calculates experience availability
     */
    protected evaluateExperienceMappings( mappings:unknown ) {
        let excludedKeys = [ "name", "description", "entryRoute", "trigger", "unavailable", "crosslink" ];
        let iterator = ( featureId:string, nodeId:string, mappings:unknown ) => {
            if ( typeof( mappings ) === 'object' ) {
                let basePath = featureId.length > 0 ? `${featureId}.${nodeId}` : nodeId;
                if ( 'name' in mappings ) {
                    const xpId = `${featureId}#${nodeId}`;
                    const enabled = this.evaluateExperienceMapping( xpId, mappings as AlExperienceMapping );
                    this.experienceFlags[xpId] = enabled;
                }
                Object.entries( mappings )
                    .filter( ( [ key, value ] ) => typeof( value ) === 'object' && value !== null && ! excludedKeys.includes( key ) )
                    .forEach( ( [ xpId, mapping ] ) => iterator( basePath, xpId, mapping ) );
            }
        };
        iterator( '', '', mappings );
    }

    protected evaluateExperienceMapping(xpId:string, mapping:AlExperienceMapping):boolean {
        if ( Array.isArray( mapping.trigger ) ) {
            return mapping.trigger.find( trigger => this.evaluateCondition( trigger ) ) ? true : false;
        } else if ( typeof( mapping.trigger ) === 'object' ) {
            return this.evaluateCondition( mapping.trigger );
        } else if ( typeof( mapping.trigger ) === 'boolean' ) {
            return mapping.trigger;
        }
        return false;
    }

    protected dateToUTCTimestamp( value:string|number ):number {
        if ( typeof( value ) === 'number' ) {
            return value;
        } else if ( typeof( value ) === 'string' ) {
            let result = Date.parse( value );
            if ( typeof( result ) === 'number' ) {
                return Math.floor( result / 1000 );
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

    protected claimPendingResource() {
        if ( this.pendingResourceCount === 0 ) {
            this.navigationReady.rescind();
        }
        this.pendingResourceCount++;
    }

    protected releasePendingResource() {
        this.pendingResourceCount--;
        if ( this.pendingResourceCount <= 0 ) {
            //  I don't recall why this bit of delay is required -- it might be worth killing it at some point.  But not now.
            AlStopwatch.once( () => {
                this.ngZone.run( () => {
                    this.navigationReady.resolve( true );
                } );
            } );
        }
    }

    protected warnOnce( key:string, message:string, data?:any ) {
        if ( ! ( key in this.warnings ) ) {
            console.warn( message, data );
            this.warnings[key] = true;
        }
    }

    protected exposeGlobals() {
        AlGlobalizer.expose( 'al.navigation', {
            context: () => {
                return {
                    authenticated:          AlSession.isActive(),
                    user:                   AlSession.getUser(),
                    primaryAccount:         AlSession.getPrimaryAccount(),
                    primaryEntitlements:    this.primaryEntitlements,
                    actingAccount:          AlSession.getActingAccount,
                    actingEntitlements:     this.entitlements,
                    routeParameters:        this.routeParameters,
                    activatedRoute:         this.activatedRoute,
                    experienceFlags:        this.experienceFlags
                };
            },
            routingHost: this,
            loadProfile: async ( profileId:string ) => {
                await AlSession.setActingAccount( AlSession.getActingAccount(), profileId );
                return true;
            },
            modifyEntitlements: ( commandSequence:string, acting:boolean = true ) => {
                //  This allows dynamic tweaking of entitlements using an economical sequence of string commands
                let records:AlEntitlementRecord[] = [];
                commandSequence.split(",").forEach( command => {
                    if ( command.startsWith( "+") ) {
                        records.push( { productId: command.substring( 1 ), active: true, expires: new Date( 8640000000000000 ) } );
                    } else if ( command.startsWith( "-" ) ) {
                        records.push( { productId: command.substring( 1 ), active: false, expires: new Date( 8640000000000000 ) } );
                    } else {
                        console.warn(`Warning: don't know how to interpret '${command}'; ignoring` );
                    }
                } );
                if ( acting ) {
                    this.entitlements.merge( records );
                } else {
                    this.primaryEntitlements.merge( records );
                }
                this.contextNotifier.again();
            },
            refresh: () => {
                this.contextNotifier.again();
            },
            menus: ( id:string ) => {
                if ( id ) {
                    return this.loadedMenus.hasOwnProperty( id ) ? this.loadedMenus[id] : null;
                }
                return this.loadedMenus;
            },
            navigate: this.navigate,
            idlePrompt: ( timeout:number = 120 ) => {
                this.useExpirationUI = true;
                this.startIdleService( timeout );
            },
        } );
        AlGlobalizer.expose( 'al.registry.AlNavigationService', this );
    }
}
