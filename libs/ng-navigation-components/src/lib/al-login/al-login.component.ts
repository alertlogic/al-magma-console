/**
 *  AlLoginComponent provides a login challenge page.
 *
 *  @author Man in Black <knielsen@alertlogic.com>
 *  @author Kung Fu Panda <ggarces@alertlogic.com>
 *
 *  @copyright Alert Logic, Inc 2017-2020
 */

import {
    AlDefaultClient,
    AlSession,
} from '@al/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlNavigationService } from '../services/al-navigation.service';

@Component({
  selector: 'al-login',
  templateUrl: './al-login.component.html',
  styleUrls: [ './al-login.component.scss']
})
export class AlLoginComponent
{
    /**
     *  Public State
     */
    public email:string                 =   '';
    public password:string              =   '';
    public mfaCode:string               =   '';
    public sessionToken:string          =   '';
    public authenticating:boolean       =   false;
    public phase:"credentials"|"mfa"    =   'credentials';

    constructor( public router:Router,
                 public navigation:AlNavigationService ) {
    }

    /**
     * Triggered when the user clicks the authenticate button OR hits enter while in the form
     */
    public async doAuthenticate() {
        try {
            let options = {
                actingAccount: this.navigation.queryParams.hasOwnProperty("aaid") ? this.navigation.queryParams.aaid : undefined,
                locationId: this.navigation.queryParams.hasOwnProperty("locid") ? this.navigation.queryParams.locid : undefined
            };
            await AlSession.authenticate( this.email, this.password, options );
        } catch( e ) {

            if ( AlDefaultClient.isResponse( e ) && e.data.hasOwnProperty("error") && e.data.error === "mfa_code_required" ) {
                this.phase = "mfa";
                this.sessionToken = e.headers['x-aims-session-token'];
            } else {
                console.log("Authentication failed with error:", e );
                //  TODO: generate error
            }
        }
    }

    public async doValidateMfaCode() {
        try {
            await AlSession.authenticateWithSessionToken( this.sessionToken, this.mfaCode );
        } catch( e ) {
            console.log("Validation failed with error:", e );
            //  TODO: generate error
        }
    }
}

