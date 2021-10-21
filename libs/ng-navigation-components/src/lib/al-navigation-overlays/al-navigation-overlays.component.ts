import { Component, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { AxiosResponse } from 'axios';
import { AlNavigationTrigger, AlNavigationIdlePrompt, AlNavigationReauthenticatePrompt } from '../types/navigation.types';
import { AlManageExperienceService } from '../services/al-manage-experience.service';
import { AlNavigationService } from '../services/al-navigation.service';
import {
    AIMSSessionDescriptor,
    AlConduitClient,
    AlDefaultClient,
    AlLocation,
    AlRuntimeConfiguration, ConfigOption,
    AlSession, AlSessionStartedEvent,
    AlStopwatch,
    AlSubscriptionGroup,
} from '@al/core';
import {
    AlExternalContentManagerService,
    AlToastService,
    AlWelcomeDialogComponent,
    WelcomePageResource,
    WelcomePageManifest
} from '@al/ng-generic-components';

@Component({
    selector: 'al-navigation-overlays',
    templateUrl: './al-navigation-overlays.component.html',
    styleUrls: ['./al-navigation-overlays.component.scss']
})

export class AlNavigationOverlaysComponent implements AfterViewInit, OnDestroy {

    @ViewChild(AlWelcomeDialogComponent, { static: true } ) welcome:AlWelcomeDialogComponent;

    /**
     * Reauthentication state properties
     */
    public formReady = true;
    public inReauthentication:boolean = false;
    public userName:string;
    public userDisplayName:string;
    public expiration:string = '';
    public passPhrase:string = '';
    public showPassword = false;
    public expirationRefresher:AlStopwatch;
    public idleTimeout:AlStopwatch;

    protected subscriptions = new AlSubscriptionGroup();
    protected conduit = new AlConduitClient();

    constructor( public experienceManager: AlManageExperienceService,
                 public navigation: AlNavigationService,
                 public contentManager: AlExternalContentManagerService,
                 public toaster:AlToastService ) {
        this.conduit.start();
        this.evaluateWelcomePageDisplay();
    }

    ngAfterViewInit() {
        this.experienceManager.init();
        this.subscriptions.manage(
            this.navigation.events.attach( AlNavigationTrigger, this.onNavigationTrigger ),
            this.navigation.events.attach( AlNavigationIdlePrompt, this.onNavigationIdle ),
            this.navigation.events.attach( AlNavigationReauthenticatePrompt, this.onRequireReauthentication ),
            AlSession.notifyStream.attach( AlSessionStartedEvent, this.onSessionStarted )
        );
    }

    ngOnDestroy() {
        this.subscriptions.cancelAll();
    }

    onNavigationTrigger = ( event:AlNavigationTrigger ) => {
        if ( event.triggerName === 'Navigation.Open.WelcomeDialog' ) {
            this.triggerWelcomePage();
        }
    }

    onNavigationIdle = ( event:AlNavigationIdlePrompt ) => {
        this.toaster.showMessage( "global-toast", {
            sticky: true,
            closable: false,
            data: {
                message: "You haven't used the console for a while.  Please click to continue working, otherwise you will be signed out.",
                buttons: [
                    {
                        key: 'ie-warning',
                        label: 'Continue Working',
                        class: 'p-col-fixed',
                        textAlign: 'center'
                    }
                ]
            }
        } );
        let subscription = this.toaster.getButtonEmitter( 'global-toast' ).subscribe( () => {
            event.continueWorking();
            if ( this.idleTimeout ) {
                this.idleTimeout.cancel();
                delete this.idleTimeout;
            }
            this.toaster.clearMessages( 'global-toast' );
            subscription.unsubscribe();
        } );
        this.idleTimeout = AlStopwatch.once( () => {
            AlSession.deactivateSession();
            this.navigation.navigate.byLocation( AlLocation.AccountsUI, '/#/logout', { return: window.location.href } );
        }, event.countdown * 1000 );
    }

    onRequireReauthentication = ( event:AlNavigationReauthenticatePrompt ) => {
        this.inReauthentication = true;
        this.userDisplayName = AlSession.getUserName();
        this.userName = AlSession.getUserEmail();
        let expiry = AlSession.getTokenExpiry() - 60;       //  don't forget the 1 minute buffer!
        this.expirationRefresher = AlStopwatch.repeatedly( () => {
            let remaining = expiry - Math.floor( Date.now() / 1000 );
            let minutes = Math.floor( remaining / 60 );
            let seconds = remaining % 60;
            if ( minutes > 1 ) {
                this.expiration = `${minutes} minutes`;
            } else if ( minutes === 1 ) {
                this.expiration = `1 minute and ${seconds} second${seconds===1?'':'s'}`;
            } else if ( seconds >= 10 ) {
                this.expiration = `${seconds} second${seconds===1?'':'s'}`;
            } else {
                this.expiration = `a few seconds`;
            }
        }, 1000, true );
    }

    onSessionStarted = ( event:AlSessionStartedEvent ) => {
        this.inReauthentication = false;
        if ( this.expirationRefresher ) {
            this.expirationRefresher.cancel();
            this.expirationRefresher = null;
        }
    }

    public async evaluateWelcomePageDisplay() {
        await this.navigation.ready();
        await AlSession.resolved();
        if ( ! AlSession.isActive() ) {
            return false;
        }
        if ( this.navigation.isExperienceAvailable( `global#welcomePage` ) &&
             this.navigation.evaluateEntitlementExpression( `assess|detect|respond|tmpro|lmpro` ) && AlSession.getActingAccountId() !== "134249236" ) {
            let welcomeManifest = await this.contentManager.getJsonResource<WelcomePageManifest>( `alid:welcomePage#manifest` );
            if ( await this.welcome.shouldDisplay( welcomeManifest ) ) {
                this.triggerWelcomePage();
            }
        }
        return true;
    }

    public async triggerWelcomePage() {
        let welcomeManifest = await this.contentManager.getJsonResource<WelcomePageManifest>( `alid:welcomePage#manifest` );
        if ( ! welcomeManifest || ! welcomeManifest.sections ) {
            return;
        }
        Object.entries( welcomeManifest.sections ).forEach( ( [ sectionId, section ] ) => {
            section.items.forEach( item => this.normalizeItem( item ) );
        } );
        this.welcome.startDisplay( welcomeManifest );
    }

    public onKeyDown( event:any ) {
        if ( event.keyCode === 13 ) {
            this.reauthenticate();
        }
    }

    public toggleShowPassword() {
        this.showPassword = ! this.showPassword;
    }

    public async reauthenticate() {
        await this.executeAuthentication();
    }

    /**
     * When user clicks on login button (updated logic)
     */
    public async executeAuthentication() {
        this.formReady = false;
        let useGestalt = AlRuntimeConfiguration.getOption( ConfigOption.GestaltAuthenticate, false );
        if ( useGestalt ) {
            try {
                let session = await AlDefaultClient.authenticateViaGestalt( this.userName, this.passPhrase, true );
                return await this.finalizeSession( session );
            } catch( e ) {
                if ( this.handleAuthenticationFailure( e ) ) {
                    this.formReady = true;
                    this.inReauthentication = false;
                    return;
                }
            }
        }

        try {
            let session = await AlDefaultClient.authenticate( this.userName, this.passPhrase, undefined, true );
            return this.finalizeSession( session );
        } catch( e ) {
            if ( this.handleAuthenticationFailure( e ) ) {
                this.formReady = true;
                this.inReauthentication = false;
                return;
            }
        }

        this.showErrorMessage("Invalid user name or password.");

        this.formReady = true;
    }

    public async finalizeSession( session:AIMSSessionDescriptor ) {
        await AlSession.setAuthentication( session );
        await this.conduit.setSession( session );
        return this.onAuthenticationComplete();
    }

    protected requiresMfaCode( response:AxiosResponse<any> ):boolean {
        return response.status === 401
            && typeof( response.data ) === 'object'
            && response.data !== null
            && 'error' in response.data
            && response.data.error === 'mfa_code_required';
    }

    protected requiresMfaEnrollment( response:AxiosResponse<any> ):boolean {
        return response.status === 401
            && typeof( response.data ) === 'object'
            && response.data !== null
            && 'error' in response.data
            && response.data.error === 'mfa_enrollment_required';
    }

    protected requiresPasswordReset( response:AxiosResponse<any> ):boolean {
        return response.status === 400
            && typeof( response.data ) === 'object'
            && response.data !== null
            && 'error' in response.data
            && response.data.error === 'password_expired';
    }

    protected onAuthenticationComplete() {
        this.navigation.navigate.byURL( this.navigation.queryParam("return", `/#/` ) );
    }

    protected handleAuthenticationFailure( error:Error|any ):boolean {

        if ( AlDefaultClient.isResponse( error ) ) {
            if ( this.requiresMfaCode( error ) ) {
                this.navigation.navigate.byLocation( AlLocation.AccountsUI, '/#/mfa/verify',
                    {
                        return: this.navigation.queryParam("return", '/#/' ),
                        token: error.headers['x-aims-session-token']
                    } );
                return true;
            } else if ( this.requiresMfaEnrollment( error ) ) {
                this.navigation.navigate.byLocation( AlLocation.AccountsUI, '/#/mfa/enroll',
                    {
                        email: this.userName,
                        token: error.headers['x-aims-session-token'],
                        return: window.location.href
                    } );
                return true;
            } else if ( this.requiresPasswordReset( error ) ) {
                this.navigation.navigate.byLocation( AlLocation.AccountsUI, `/#/password/reset/confirm`, {
                        email: this.userName,
                        return: window.location.href
                    } );
            } else if ( error.status === 401 ) {
                // General Unauthorized message.
                this.showErrorMessage("Invalid user name or password.");
                return true;
            } else if( error.status === 400) {
                // The AIMS account is inactive, this user is unable to login.
                this.showErrorMessage("Inactive account.");
                return true;
            }
            /**
             * All non-400/401 errors, include 5xx, fall through and return false
             */
        }
        return false;
    }

    protected showErrorMessage( message:string ) {
    }

    protected normalizeItem( resource:WelcomePageResource ) {
        resource.visible = typeof( resource.visible ) === 'undefined' ? true : resource.visible;
        if ( ! resource.visible ) {
            return;
        }
        if ( resource.entitlements ) {
            resource.visible = this.navigation.evaluateEntitlementExpression( resource.entitlements );
            if ( ! resource.visible ) {
                return;
            }
        }
        if ( resource.conditions ) {
            resource.visible = this.navigation.evaluate( resource.conditions ).every( result => result === true );
        }
    }
}
