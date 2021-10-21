/**
 * The login page, originally migrated from auth0 hosted page code and
 * repowered with some o3 code.
 *
 * @author Kevin Knielsen <knielsen@alertlogic.com> // The migrator.
 * @author Gisler Garces <ggarces@alertlogic.com> // Blame me.
 * @copyright Alert Logic, Inc 2019
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { AlViewHelperComponent } from '@al/ng-generic-components';
import { AlNavigationService } from '../services/al-navigation.service';
import {
    AlCabinet,
    AlConduitClient,
    AlDatacenterSessionErrorEvent,
    AlDefaultClient,
    AlLocation,
    AlLocatorService,
    AlRuntimeConfiguration, ConfigOption,
    AlSession,
    AlSessionDetector,
} from '@al/core';

@Component({
    selector: 'al-integrated-authentication',
    templateUrl: './al-integrated-authentication.component.html',
    styleUrls: [ './al-integrated-authentication.component.scss' ]
})

export class AlIntegratedAuthenticationComponent implements OnInit {

    public state: string = "passive";        //  "passive", "signin", "verify", "signout"

    public userName:string = "";
    public passPhrase:string = "";

    public formReady = false;

    public showPassword: boolean = false;

    protected sessionToken:string;
    protected sessionTokenExpiration:number;

    protected conduitClient = new AlConduitClient();
    protected sessionDetector = new AlSessionDetector( this.conduitClient );
    protected storage = AlCabinet.ephemeral( "al-integrated-auth" );

    @ViewChild( AlViewHelperComponent, { static: true } )
    protected viewHelper:AlViewHelperComponent;

    constructor( public navigation:AlNavigationService ) {
        this.conduitClient.start();
    }

    ngOnInit() {
        this.initialize();
    }

    async initialize() {
        let sessionDetected = await this.sessionDetector.detectSession();
        if ( sessionDetected ) {
            this.state = 'passive';
        } else {
            this.state = 'signin';
        }
        this.formReady = true;
    }

    public doLogout() {
        this.state = "signout";
        this.formReady = false;
        this.executeDeauthentication();
    }

    /**
     * A keyboard listener for the Enter key.
     */
    onKeyDown(event:any) {
        if (event.keyCode === 13) {
           this.executeAuthentication();
        }
    }

    /**
     * When user clicks on login button.
     */
    public async executeAuthentication() {
        this.formReady = false;
        let useGestalt = AlRuntimeConfiguration.getOption<boolean>( ConfigOption.GestaltAuthenticate, false );
        if ( useGestalt ) {
            try {
                let session = await AlDefaultClient.authenticateViaGestalt( this.userName, this.passPhrase, true );
                AlSession.setAuthentication( session );
            } catch( e ) {
                if ( this.handleAuthenticationFailure( e ) ) {
                    this.formReady = true;
                    return;
                }
            }
        }

        try {
            let session = await AlDefaultClient.authenticate( this.userName, this.passPhrase, undefined, true );
            AlSession.setAuthentication( session );
        } catch( e ) {
            if ( this.handleAuthenticationFailure( e ) ) {
                this.formReady = true;
                return;
            }
        }

        this.showErrorMessage("Invalid user name or password.");

        this.formReady = true;
    }

    public async executeDeauthentication() {
        /**
         *  Forcibly end any extant defender sessions.
         */
        let currentEnvironment = AlLocatorService.getContext().environment;
        let defenderNodes:{[key:string]:string} = {};

        AlLocatorService.search( node => {
            if ( node.locTypeId === AlLocation.LegacyUI && node.environment === currentEnvironment ) {
                defenderNodes[node.uri] = node.uri;
                return true;
            }
            return false;
        } );

        let defenderNodeURIList = Object.values( defenderNodes );
        for ( let i = 0; i < defenderNodeURIList.length; i++ ) {
            let logoutURL = `${defenderNodeURIList[i]}/defender_unified_logout.php`;
            try {
                await AlDefaultClient.get( { url: logoutURL } );
            } catch( e ) {
                console.log(`Notice: failed to terminate defender session at '${logoutURL}': ${e.message} (ignoring)` );
            }
        }

        await this.terminateGestaltSession();
        await this.conduitClient.deleteSession();
        AlSession.deactivateSession();
        console.log("All done -- session has been terminated!" );
        this.formReady = true;
        this.state = 'signin';
    }

    /**
     * Show/Hide password field.
     */
    toggleShowPassword = () => {
        this.showPassword = !this.showPassword;
    }

    /**
     * Show error message in the login page.
     */
    showErrorMessage = ( message:string ) => {
        this.viewHelper.notifyError( message, 6000 );
    }

    /**
     * When user click on the forgot password link, after password reset should go back to portero.
     */
    goToForgotPassword = ( event:Event ) => {
        if ( event ) {
            event.preventDefault();
        }
        this.navigation.navigate.byLocation( AlLocation.AccountsUI, '/#/password/reset', { return_to: window.location.href } );
    }

    /**
     * When user click on the integrations link
     */
    onClickIntegrations= ( event:Event ) => {
        if ( event ) {
            event.preventDefault();
        }
        this.navigation.navigate.byLocation( AlLocation.AccountsUI, '/users/developer/index.html#/' );
    }

    handleSessionPersistenceError() {
        this.navigation.onDatacenterSessionError( new AlDatacenterSessionErrorEvent( "inapplication", "cookie-configuration", null ) );
    }

    protected async terminateGestaltSession() {
        let environment = AlLocatorService.getCurrentEnvironment();
        let residency = 'US';
        if ( environment === 'development' ) {
            environment = 'integration';
        }
        await AlDefaultClient.delete( {
            url: AlLocatorService.resolveURL( AlLocation.AccountsUI, '/session/v1/status', { environment, residency } ),
            data: {}
        } );
    }

    protected handleAuthenticationFailure( error:Error|any ):boolean {

        if ( AlDefaultClient.isResponse( error ) ) {
                if ( error.status === 401 ) {
                    //  Manage 401/Unauthorized Responses
                    if ( error.data && error.data.hasOwnProperty("error" ) && error.data.error === "mfa_code_required" )
                    {
                        this.state = "verify";
                        return true;
                    } else if ( error.data && error.data.hasOwnProperty("error" ) && error.data.error === "mfa_enrollment_required" ) {
                        this.navigation.navigate.byLocation( AlLocation.AccountsUI, '/#/mfa/enroll',
                            {
                                email: this.userName,
                                token: error.headers['x-aims-session-token'],
                                return: window.location.href
                            } );
                        return true;
                    } else {
                        // General Unauthorized message.
                        this.showErrorMessage("Invalid user name or password.");
                        return true;
                    }
                } else if( error.status === 400) {
                    // Manage 400/Bad Request responses.
                    if ( error.data && error.data.hasOwnProperty("error" ) && error.data.error === "password_expired" )
                    {
                        this.navigation.navigate.byLocation( AlLocation.AccountsUI, '/#/password/reset/confirm', { return: window.location.href } );
                        return true;
                    } else {
                        // The AIMS account is inactive, this user is unable to login.
                        this.showErrorMessage("Inactive account.");
                        return true;
                    }
                }
        }
        return false;
    }

}
