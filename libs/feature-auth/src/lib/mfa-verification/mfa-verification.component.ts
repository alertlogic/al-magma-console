import { Component, ViewChild, OnInit } from '@angular/core';
import { AlNavigationService } from '@al/ng-navigation-components';
import { AlViewHelperComponent } from '@al/ng-generic-components';
import {
    AlAuthenticationUtility, AlAuthenticationResult,
    AlDefaultClient,
    AlErrorHandler,
    AlLocatorService,
    AlLocation,
    AlRuntimeConfiguration, ConfigOption,
    AlSession,
    AlStopwatch,
    AIMSSessionDescriptor,
    AlConduitClient
} from '@al/core';

@Component({
  selector: 'mfa-verification',
  templateUrl: './mfa-verification.component.html',
  styleUrls: [ './mfa-verification.component.scss' ]
})

export class MFAVerificationComponent implements OnInit {

    public authenticationCode:string = '';
    public loading:boolean = false;
    public conduit:AlConduitClient = new AlConduitClient();

    protected failureCount:number = 0;
    protected maximumFailureCount:number = 3;
    protected ttl:number = 60 * 5;
    protected abortTimer:AlStopwatch;
    protected authenticator = new AlAuthenticationUtility();

    @ViewChild('alViewHelper') viewHelper:AlViewHelperComponent;

    constructor( public navigation:AlNavigationService ) {
    }

    ngOnInit() {
        if ( this.navigation.queryParam("ttl") ) {
            this.ttl = parseInt( this.navigation.queryParam("ttl"), 10 );
        }

        if ( this.ttl > 0 ) {
            //  pad the TTL to 90% of its duration, on the assumption we should fail/redirect BEFORE the token goes away
            this.abortTimer = AlStopwatch.once( () => this.abortVerification, ( this.ttl * 0.9 ) * 1000 );
        }
    }

    onSubmitAuthenticateCode = async () => {
        this.loading = true;

        this.authenticator.state.sessionToken = this.navigation.queryParam("token");

        let returnURL = this.navigation.queryParam( "return", AlLocatorService.resolveURL( AlLocation.AccountsUI, '/#/' ) );
        let auth0State = this.navigation.queryParam( 'state', null );     //  Auth0 rule pipeline state token, if federated

        try {
            let result = await this.authenticator.validateMfaCode( this.authenticationCode );
            switch( result ) {
                case AlAuthenticationResult.Authenticated :
                    return this.completeVerification( returnURL, auth0State );

                case AlAuthenticationResult.TOSAcceptanceRequired :
                    this.navigation.navigate.byLocation( AlLocation.AccountsUI, '/#/terms-of-service',
                        {
                            return: this.navigation.queryParam("return", '/#/' ),
                            token: this.authenticator.getSessionToken(),
                            url: this.authenticator.getTermsOfServiceURL()
                        } );
                    break;

                case AlAuthenticationResult.AccountLocked :
                    this.viewHelper.notifyError( "The account you are attempting to log into is inactive.", 2500 );
                    break;
                case AlAuthenticationResult.AccountUnavailable :
                    this.viewHelper.notifyError("The account you are attempting to log into is not available.");
                    break;
                case AlAuthenticationResult.InvalidCredentials :
                default :
                    this.viewHelper.notifyError( "The code you provided was invalid.", 2500);
                    break;

            }
        } catch ( e ) {
            this.viewHelper.notifyError( AlErrorHandler.normalize( e ).message, 2500 );
        }

        this.failureCount++;
        if ( this.failureCount >= this.maximumFailureCount ) {
            this.abortVerification();
        } else {
            this.loading = false;
            this.viewHelper.notifyError("The code you entered did not work. Enter the authentication code and try again.", 2500 );
        }
    }

    completeVerification = async ( returnURL:string, auth0State:any ) => {
        this.viewHelper.notifySuccess("Welcome back!  Please wait a moment while we sign you in.");
        this.abortTimer.cancel();
        let continueURL:string;
        if ( auth0State !== null ) {
            //  Federated/SSO login: we *must* return control to auth0 to complete the rule pipeline execution, or auth0 will force us to log out :)
            this.navigation.navigate.byLocation( AlLocation.Auth0, `/continue?state=${encodeURIComponent( auth0State )}&auth_token=${encodeURIComponent( AlSession.getToken() )}` );
        } else if ( returnURL ) {
            //  Explicit return URL: bounce back to wherever the user initially tried to access
            this.navigation.navigate.byURL( returnURL );
        } else {
            //  In the absence of any other constraints/directions, redirect to the root of the account application
            this.navigation.navigate.byLocation( AlLocation.AccountsUI, '/#/' );
        }
    }

    handleVerificationError = ( error:any ):boolean => {
        if ( AlDefaultClient.isResponse( error ) ) {
            this.loading = false;
            if ( error.status === 401 ) {
                this.viewHelper.notifyError("The code you entered did not work. Enter the authentication code and try again.", 2500 );
                return true;
            } else if ( error.status === 400 ) {
                this.viewHelper.notifyError("An internal error prevented the code from being authenticated properly.  If this problem persists, please contact support.", 2500 );
                return true;
            }
        }
        AlErrorHandler.log( error, `Unable to perform MFA validation` );
        return false;
    }

    abortVerification = ( message?:string ) => {
        this.abortTimer.cancel();
        if ( ! message ) {
            message = "Your login session expired. You will be redirected to the login page. Log in and try again.";
        }
        this.viewHelper.notifyError(message, 2500 );
        AlStopwatch.once( () => {
            this.navigation.navigate.byLocation( '/#/logout' );
        }, 2500 );
    }
}
