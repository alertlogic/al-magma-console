import { Component, OnInit  } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
    AlConduitClient,
    AlDefaultClient,
    AlErrorHandler,
    AlLocatorService,
    AlLocation,
    AlRuntimeConfiguration, ConfigOption,
    AlSession,
    AlSessionDetector
} from '@al/core';
import {
    AlNavigationService
} from '@al/ng-navigation-components';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html'
})

export class LogoutComponent implements OnInit {

    protected conduit:AlConduitClient = new AlConduitClient();

    constructor( public navigation:AlNavigationService ) {
        this.conduit.start();
    }

    ngOnInit() {
        /**
         *  Forcibly end any extant defender sessions.
         */
        let currentEnvironment = AlLocatorService.getContext().environment;
        let defenderNodes = {};

        AlLocatorService.search( node => {
            if ( node.locTypeId === AlLocation.LegacyUI && node.environment === currentEnvironment ) {
                defenderNodes[node.uri] = node.uri;
                return true;
            }
            return false;
        } );
        let requestArray = [];
        if ( AlRuntimeConfiguration.getOption( ConfigOption.GestaltAuthenticate ) ) {
            requestArray.push( AlDefaultClient.delete( {
                url: AlLocatorService.resolveURL( AlLocation.AccountsUI, `/session/v1/status` )
            } ) );
        }
        Object.values( defenderNodes ).forEach( defenderNodeURI => {
            const logoutURL = `${defenderNodeURI}/defender_unified_logout.php`;
            requestArray.push( AlDefaultClient.get( { url: logoutURL } ) );
        } );

        if ( requestArray.length === 0 ) {
            this.continueLogout();
        } else {
            Promise.all( requestArray ).then( () => this.continueLogout(),
                                              error => this.continueLogoutError( error ) );
        }
    }

    continueLogoutError = ( error:any ) => {
        console.log("Warning: could not logout from a defender session; ignoring", error );
        this.continueLogout();
    }

    continueLogout = async () => {
        let auth0Node   =   AlLocatorService.getNode( AlLocation.Auth0 );
        let returnURI   =   this.chooseReentryURL();
        let logoutURI;
        let currentEnvironment = AlLocatorService.getCurrentEnvironment();
        let deauthenticateViaAuth0 = auth0Node
                                        && [ 'production', 'integration' ].includes( currentEnvironment )
                                        && ! returnURI.includes( "account-pr-");

        if ( deauthenticateViaAuth0 ) {
            let clientId    =   auth0Node.data.clientID;
            logoutURI = "https://" + auth0Node.uri + "/v2/logout?federated&clientID=" + clientId + "&returnTo=" + encodeURIComponent( returnURI );
        } else {
            logoutURI = returnURI;
        }

        /**
         * Nuke Conduit Session
         */
        try {
            let detector = new AlSessionDetector( this.conduit );
            await detector.detectionComplete();
            AlSession.deactivateSession();
            await this.conduit.deleteSession();
        } catch( e ) {
            AlErrorHandler.log( e, `Failed to destroy conduit session` );
        }
        console.log("Notice: logout is complete; redirecting to %s", logoutURI );
        window.location.href = logoutURI;
    }

    /**
     * Attempt to choose the best URL to return to after deauthentication is complete.
     */
    chooseReentryURL() {
        let returnURL = this.navigation.queryParam("return");
        let reentryURL = AlLocatorService.resolveURL( AlLocation.AccountsUI, '/#/login' );
        if ( returnURL ) {
            reentryURL += `?return=${encodeURIComponent( returnURL )}`;
        }
        return reentryURL;
    }
}
