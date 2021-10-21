/**
 * The login page, originally migrated from auth0 hosted page code and
 * repowered with some o3 code.
 *
 * @author Kevin Knielsen <knielsen@alertlogic.com> // The migrator.
 * @author Gisler Garces <ggarces@alertlogic.com> // Blame me.
 * @copyright Alert Logic, Inc 2019
 */

import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { AlNavigationService } from '@al/ng-navigation-components';
import {
    AIMSSessionDescriptor,
    AlAuthenticationUtility, AlAuthenticationState, AlAuthenticationResult,
    AlCabinet,
    AlConduitClient,
    AlDefaultClient,
    AlErrorHandler,
    AlLocatorService,
    AlLocation,
    AlRuntimeConfiguration, ConfigOption,
    AlSession,
    AlSessionDetector,
    AlStopwatch,
} from '@al/core';
import { AxiosResponse } from 'axios';
import { AlDatacenterSessionErrorEvent } from '@al/core';

@Component({
    selector: 'portero-login',
    templateUrl: './login.component.html',
    styleUrls: [ './login.component.scss' ],
    encapsulation: ViewEncapsulation.None
})

export class LoginComponent implements OnInit {

    public userName:string          =   "";
    public passPhrase:string        =   "";
    public errorMessage: string     =   "";
    public formReady                =   false;

    public showPassword: boolean    =   false;
    public state: string            =   "";
    protected conduit               =   new AlConduitClient();
    protected authenticator         =   new AlAuthenticationUtility();

    constructor(    public navigation:AlNavigationService,
                    public router: Router,
                    public activeRoute:ActivatedRoute ) {

    }

    ngOnInit() {
        this.onInitialized();
    }

    async onInitialized() {
        this.conduit.start();
        let detector = new AlSessionDetector( this.conduit );
        let storage = AlCabinet.ephemeral( "portero-login" );
        try {
            let sessionDetected = await detector.detectSession();
            if ( sessionDetected ) {
                let redirectCount = storage.get('redirectCount');
                if ( redirectCount >= 3 ) {
                    console.error("FATAL ERROR: redirect loop detected, 3rd party cookies are likely to be disabled." );
                    this.handleSessionPersistenceError();
                    return;
                } else {
                    if (!redirectCount) {
                        redirectCount = 0;
                    }
                    redirectCount = redirectCount + 1;
                    storage.set( 'redirectCount', redirectCount, 30 ).synchronize();
                }
                this.redirectAfterAuthentication();
            } else {
                this.formReady = true;
            }
        } catch( error ) {
            AlErrorHandler.log( error, "Could not detect session" );
            if ( AlSession.isActive() ) {
                storage.set( 'redirectCount', 0, 30 ).synchronize();
                AlSession.deactivateSession();
            }
            this.formReady = true;
        }
    }

    /**
     * A keyboard listener for the Enter key.
     */
    onKeyDown(event) {
        if (event.keyCode === 13) {
           this.onLogin();
        }
    }

    /**
     * When user clicks on login button.
     */
    async onLogin() {
        this.executeAuthentication();
    }

    /**
     * When user clicks on login button (updated logic)
     */
    public async executeAuthentication() {

        try {
            this.formReady = false;
            const result = await this.authenticator.authenticate( this.userName, this.passPhrase );
            switch( result ) {
                case AlAuthenticationResult.Authenticated :
                    this.navigation.navigate.byURL( this.navigation.queryParam("return", `/#/` ) );
                    break;

                case AlAuthenticationResult.PasswordResetRequired :
                    this.navigation.navigate.byLocation( AlLocation.AccountsUI, `/#/password/reset/confirm`, {
                            email: this.userName,
                            return: window.location.href
                        } );
                    break;

                case AlAuthenticationResult.MFAEnrollmentRequired :
                    this.navigation.navigate.byLocation( AlLocation.AccountsUI, '/#/mfa/enroll',
                        {
                            email: this.userName,
                            token: this.authenticator.getSessionToken(),
                            return: window.location.href
                        } );
                    break;

                case AlAuthenticationResult.MFAVerificationRequired :
                    this.navigation.navigate.byLocation( AlLocation.AccountsUI, '/#/mfa/verify',
                        {
                            return: this.navigation.queryParam("return", '/#/' ),
                            token: this.authenticator.getSessionToken()
                        } );
                    break;

                case AlAuthenticationResult.TOSAcceptanceRequired :
                    this.navigation.navigate.byLocation( AlLocation.AccountsUI, '/#/terms-of-service',
                        {
                            return: this.navigation.queryParam("return", '/#/' ),
                            token: this.authenticator.getSessionToken(),
                            url: this.authenticator.getTermsOfServiceURL()
                        } );
                    break;

                case AlAuthenticationResult.AccountLocked :
                    this.showErrorMessage("The account you are attempting to log into is inactive." );
                    break;
                case AlAuthenticationResult.AccountUnavailable :
                    this.showErrorMessage("The account you are attempting to log into is not available.");
                    break;
                case AlAuthenticationResult.InvalidCredentials :
                default :
                    this.showErrorMessage("Invalid user name or password.");
                    break;

            }
        } catch( e ) {
            this.showErrorMessage( AlErrorHandler.normalize( e ).message );
        }

        this.formReady = true;
    }

    /**
     * Show error message in the login page.
     */
    showErrorMessage = ( message:string ) => {
        this.errorMessage = message;
    }


    /**
     * Routes to a local path *without* preserving query parameters
     */
    localRoute = ( commands:string[], parameters:{[parameter:string]:string} = {} ) => {
        this.router.navigate( commands, { queryParams: parameters } );
    }

    /**
     * Show/Hide password field.
     */
    toggleShowPassword = () => {
        this.showPassword = !this.showPassword;
    }

    /**
     * When user clicks on the x of the error message.
     */
    closeErrorMessage = () => {
        this.errorMessage = "";
    }

    /**
     * When user click on the forgot password link, after password reset should go back to portero.
     */
    goToForgotPassword = ( event:Event ) => {
        if ( event ) {
            event.preventDefault();
        }
        this.localRoute( [ 'password', 'reset' ], { return_to: window.location.href } );
    }

    /**
     * When user click on the integrations link
     */
    onClickIntegrations= ( event:Event ) => {
        if ( event ) {
            event.preventDefault();
        }
        window.location.href = "/users/developer/index.html#/";
    }

    /**
     * After successfull authentication find the return url in navigation so we
     * can go back to the initial place.
     */
    redirectAfterAuthentication() {
        let redirectURL = this.activeRoute.snapshot.queryParams.hasOwnProperty("return")
                            ? this.activeRoute.snapshot.queryParams["return"]
                            : null;
        if ( redirectURL ) {
            const tokenParam = this.activeRoute.snapshot.queryParams.hasOwnProperty("token" )
                                ? this.activeRoute.snapshot.queryParams["token"]
                                : null;
            let parameters:{[p:string]:string} = {};
            if ( tokenParam && tokenParam !== "null" ) {
                parameters[tokenParam] = AlSession.getToken();
            }
            this.navigation.navigate.byURL( redirectURL, parameters );
        } else {
            this.navigation.navigate.byNgRoute( [ '/' ] );
        }
    }

    handleSessionPersistenceError() {
        this.navigation.onDatacenterSessionError( new AlDatacenterSessionErrorEvent( "inapplication", "cookie-configuration", null ) );
    }
}
