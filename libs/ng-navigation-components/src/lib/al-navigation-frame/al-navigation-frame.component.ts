/**
 * The AlNavigationFrameComponent is meant to provide an abstract, top level frame for a specific navigation implementation to be inserted into.
 *
 * In addition, the <al-navigation-frame> directive allows applications to assign an initial schema and experience for the navigation layer.
 * This can also be assigned programmatically via AlNavigationService.
 */

import {
    AIMSClient,
    AlRoute,
    AlRuntimeConfiguration, ConfigOption,
    AlSession,
    AlSessionEndedEvent,
    AlSubscriptionGroup,
} from '@al/core';
import {
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    OnDestroy,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlExperiencePreferencesService } from '../services/al-experience-preferences.service';
import { AlNavigationService } from '../services/al-navigation.service';
import {
    AlAddendumToNavTitleEvent,
    ALNAV_DISABLE_HEADER,
    ALNAV_DISABLE_PRIMARY,
    ALNAV_DISABLE_TERTIARY,
    ALNAV_PRIVATE,
    ALNAV_PUBLIC,
    AlNavigationContextChanged,
    AlNavigationFrameChanged,
    AlNavigationSidenavMounted,
    AlNavigationTrigger,
} from '../types';
import { AlIntegratedAuthenticationComponent } from '../al-integrated-authentication/al-integrated-authentication.component';

@Component({
    selector: 'al-navigation-frame',
    templateUrl: './al-navigation-frame.component.html',
    styleUrls: ['./al-navigation-frame.component.scss']
})
export class AlNavigationFrameComponent implements OnInit, OnDestroy
{
    /**
     * Instance properties
     */
    @Input() public experience:string = null;                       //  this is only used to set the *initial* state.
    @Input() public schema:string = null;                           //  this is only used to set the *initial* state.
    @Input() public allowUnauthenticatedMenus:boolean = false;      //  allows an application to show menus even when there is no session
    public accessAllowed?:boolean = undefined;
    public displayNav:boolean = false;
    public headingText: string = null;
    public showContentMenu:boolean = false;

    public primaryMenu:AlRoute;
    public userMenu:AlRoute;
    public contentMenu:AlRoute;
    public headerActionsMenus:AlRoute[] = [];
    public sidenavMenu:AlRoute;
    public sidenavContentRef:TemplateRef<any>;
    public isCustomSidenav:boolean;
    public breadcrumbs:AlRoute[] = [];
    public showSidenav: boolean;

    showLoginLogo:boolean = false;
    addendumToNavTitle:string = "";
    disableNavigationHeader:boolean = false;
    disablePrimaryMenu:boolean = false;
    disableTertiaryMenu:boolean = false;

    protected subscriptions = new AlSubscriptionGroup();
    @ViewChild(AlIntegratedAuthenticationComponent, { static: true })
    protected authenticationView:AlIntegratedAuthenticationComponent;

    constructor( public alNavigation:AlNavigationService,
                 public activatedRoute:ActivatedRoute,
                 public changeDetector:ChangeDetectorRef,
                 protected alExperiencePreferences: AlExperiencePreferencesService
                 ) {
    }

    ngOnInit() {
        this.subscriptions.manage(
            this.alNavigation.events.attach( AlNavigationFrameChanged, this.onNavigationChanged ),
            this.alNavigation.events.attach( AlNavigationContextChanged, this.onNavigationContextChanged ),
            this.alNavigation.events.attach( AlNavigationSidenavMounted, this.onNavigationSidenavMounted ),
            this.alNavigation.events.attach( AlAddendumToNavTitleEvent, this.setAddendumToNavTitle ),
            this.alNavigation.events.attach( AlNavigationTrigger, this.onNavigationTrigger ),
            AlSession.notifyStream.attach( AlSessionEndedEvent, this.onSessionEnded )
        );
        this.activatedRoute.queryParams.subscribe( this.onQueryParamsChanged );
        if ( this.schema ) {
            this.alNavigation.setSchema( this.schema );
            this.alNavigation.setForceSchema( true );
        } else {
            this.alNavigation.setForceSchema( false );
            this.alNavigation.setSchema( null );
        }
        if ( this.experience ) {
            this.alNavigation.setExperience( this.experience );
            this.alNavigation.setForceExperience( true );
        } else {
            this.alNavigation.setForceExperience( false );
            this.alNavigation.setExperience( null );
        }
        this.checkIfShowLogo();
    }

    ngOnDestroy() {
        this.subscriptions.cancelAll();
    }

    onQueryParamsChanged = async ( params:any ) => {
        if ( AlSession.isActive() && 'aaid' in params && params.aaid !== AlSession.getActingAccountId() ) {
            try {
                let accountInfo = await AIMSClient.getAccountDetails( params.aaid );
                await this.alNavigation.setActingAccount( accountInfo.id );
            } catch( e ) {
                console.warn("Warning: failed to change acting account to reflect aaid failed to change acting account", e );
            }
        }
    }

    onNavigationChanged = ( event:AlNavigationFrameChanged ) => {
        if ( ! event.schema ) {
            console.warn("Cannot assign menus for the current experience in the absence of a navigation scheme!  Ignoring." );
            return;
        }
        this.experience = event.experience;
        this.schema = event.schemaId;
        try {
            this.primaryMenu = this.alNavigation.getLoadedMenu( event.schemaId, 'primary' );
            this.userMenu = this.alNavigation.getLoadedMenu( event.schemaId, 'user' );
        } catch( e ) {
            console.warn("Warning: failed to assign primary and user menus because schema does not have them", e );
        }
        this.changeDetector.detectChanges();
        this.evaluateMenuState();
    }

    onNavigationContextChanged = ( event:AlNavigationContextChanged ) => {
        this.evaluateMenuState();
        let routeDirectives:string[] = [];
        if ( event.routeData.hasOwnProperty("alNavigation" ) ) {
            routeDirectives = event.routeData.alNavigation as string[];
        }
        this.disableNavigationHeader = routeDirectives.includes( ALNAV_DISABLE_HEADER );
        this.disablePrimaryMenu = routeDirectives.includes( ALNAV_DISABLE_PRIMARY );
        this.disableTertiaryMenu = routeDirectives.includes( ALNAV_DISABLE_TERTIARY );


        /* tslint:disable:no-boolean-literal-compare */
        let defaultAuthState = AlRuntimeConfiguration.getOption<boolean|null>( ConfigOption.NavigationDefaultAuthState );
        if ( defaultAuthState === true ) {
            //  This application requires authentication by default -- only allow routes explicitly tagged as public to be displayed without authentication.
            this.accessAllowed = AlSession.isActive() || routeDirectives.includes( ALNAV_PUBLIC );
        } else if ( defaultAuthState === false ) {
            //  This application does NOT require authentication by default -- only enforce authentication for routes explicitly tagged as private
            this.accessAllowed = ( routeDirectives.includes( ALNAV_PRIVATE ) && ! AlSession.isActive() ) ? false : true;
        } else {
            //  This application doesn't care about authentication or handles it separately, using a route guard
            this.accessAllowed = true;
        }
        this.changeDetector.detectChanges();
    }

    onNavigationSidenavMounted = ( event:AlNavigationSidenavMounted ) => {
        if ( event.contentRef ) {
            this.sidenavContentRef = event.contentRef;
        }
        this.isCustomSidenav = event.showSidenav;
    }

    onSessionEnded = ( event:AlSessionEndedEvent ) => {
    }

    setAddendumToNavTitle = ( event:AlAddendumToNavTitleEvent ) => {
        this.addendumToNavTitle = event.addendumToTitle;
    }

    onNavigationTrigger = ( event:AlNavigationTrigger ) => {
        switch( event.triggerName ) {
            case 'Navigation.User.Signout' :
                if ( AlRuntimeConfiguration.getOption<boolean>( ConfigOption.NavigationIntegratedAuth, false ) ) {
                    //  Only execute this logic if integrated authentication mode is enabled
                    console.log("Triggering logout process on authentication view..." );
                    this.authenticationView.doLogout();
                    event.respond( true );
                }
                break;
        }
    }

    evaluateMenuState() {
        this.breadcrumbs        = [];
        this.headerActionsMenus = [];
        this.contentMenu        = undefined;

        const activatedRoutes   = this.alNavigation.activatedRoutes;
        let contentMenu:AlRoute = undefined;
        let sidenavMenu:AlRoute = undefined;
        let hideTabs:boolean = false;

        activatedRoutes.forEach( ( route:AlRoute, index:number ) => {
            let outlet = route.getProperty("childOutlet", "none" );
            if ( outlet === "content-menu" ) {
                contentMenu = route;
            } else if ( outlet === "sidenav" ) {
                sidenavMenu = route;
            }
            hideTabs = hideTabs || route.getProperty("noTabs", false);
        } );

        if ( ! contentMenu && ! sidenavMenu ) {
            // it should only get here to display regular tertiary menu
            if(activatedRoutes.length > 3 && activatedRoutes[2].getProperty("childOutlet", null) !== "none") {
                sidenavMenu = activatedRoutes[2];
            }
        }

        if ( contentMenu ) {
            this.contentMenu          = new AlRoute(contentMenu.host, contentMenu.definition, contentMenu.parent);
            this.contentMenu.children = [];
            this.contentMenu.children = contentMenu.children.filter( c => !c.getProperty("isHeaderAction") );
            this.headerActionsMenus   = contentMenu.children.filter( c => c.getProperty("isHeaderAction") );
        }
        if ( this.sidenavMenu !== sidenavMenu ) {
            this.sidenavMenu = sidenavMenu;
            if ( sidenavMenu ) {
                this.isCustomSidenav = false;
            }
        }

        //  Store a reference to the activation path, with duplicate items/breadcrumb-suppressed items removed
        this.breadcrumbs = activatedRoutes.filter( ( item, index ) => {
            if ( index > 0 && item.caption !== activatedRoutes[index-1].caption ) {
                return item.getProperty("breadcrumb", true ) === true;
            }
            return false;
        } );

        // determine if content menu should be visible
        this.showContentMenu = false;
        if (this.contentMenu && this.contentMenu.children.length && !hideTabs && this.contentMenu.children.find(e => e.visible)) {
            this.showContentMenu = true;
        }
    }

    toggleNav() {
        this.displayNav = ! this.displayNav;
    }

    checkIfShowLogo = async () => {
        this.showLoginLogo = false;
        await AlSession.ready();
        this.showLoginLogo = !AlSession.isActive();
    }

}
