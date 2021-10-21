/*
 *  AIMS/Auth0 Route Guard.
 *
 *  @author McNielsen <knielsen@alertlogic.com>
 *  @author Sir Robert <robert.parker@alertlogic.com>
 *  @copyright 2019 Alert Logic, Inc.
 *
 */

import { AlSession, AlConduitClient, AlSessionDetector } from '@al/core';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, Subscriber } from 'rxjs';
import { AlNavigationService } from './al-navigation.service';

@Injectable({
    providedIn: 'root'
})
export class AlIdentityResolutionGuard implements CanActivate {
    protected resolver$: Observable<boolean>;
    protected conduit = new AlConduitClient();
    protected detector = new AlSessionDetector(this.conduit, true);

    constructor(public alNavigation: AlNavigationService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

        if (this.resolver$) {
            return this.resolver$;
        }

        this.resolver$ = new Observable<boolean>( (observer: Subscriber<boolean>) => {
            this.findSession( observer, route );
        } );

        return this.resolver$;
    }

    async findSession( observer:Subscriber<boolean>, route:ActivatedRouteSnapshot ) {
        const returnURL = 'return' in route.queryParams ? route.queryParams.return : undefined;
        const activeDatacenterId = route.queryParams.hasOwnProperty("locid") ? route.queryParams["locid"] : undefined;
        const actingAccountId = route.queryParams.hasOwnProperty("aaid") ? route.queryParams["aaid"] : undefined;
        let profileId = 'profile' in route.queryParams ? route.queryParams["profile"] : undefined;
        if ( profileId === "none" ) {
            profileId = undefined;
        }
        if ( `aims_token` in route.queryParams ) {
            let options = { actingAccount: actingAccountId, locationId: activeDatacenterId, profileId: profileId };
            try {
                console.log("Starting resolution via AIMS token..." );
                await AlSession.authenticateWithAccessToken( route.queryParams['aims_token'], options );
                await this.conduit.setSession( AlSession.getSession() );
                console.log("Resolving with AIMS token!", window.location.href, AlSession.getSession() );
                return this.onResolved( observer );
            } catch( error ) {
                console.error( `Failed to switch identity to provided aims_token; ignoring `, error );
            }
        }
        try {
            let sessionFound = await this.detector.detectSession();
            if (sessionFound) {
                if ( activeDatacenterId && activeDatacenterId !== AlSession.getActiveDatacenter() ) {
                    AlSession.setActiveDatacenter(route.queryParams["locid"]);
                }
                if ( actingAccountId && ( actingAccountId !== AlSession.getActingAccountId() || profileId !== AlSession.getProfileId() ) ) {
                    let result = await this.alNavigation.setActingAccount(actingAccountId, profileId );
                    if ( ! result) {
                        return this.onUnauthenticatedAccess(observer, `Could not set acting account to ${actingAccountId}`, returnURL );
                    }
                }
            } else {
                return this.onUnauthenticatedAccess(observer, 'The user does not appear to be authenticated; no session detected.', returnURL );
            }
        } catch (e) {
            return this.onUnauthenticatedAccess(observer, "Received unexpected error while detecting session state." + e.toString(), returnURL );
        }
        this.onResolved( observer );

        return this.resolver$;
    }


    onResolved(observer: Subscriber<boolean>) {
        observer.next(true);
        observer.complete();
        this.resolver$ = undefined;
    }

    onUnauthenticatedAccess(observer: Subscriber<boolean>, reason: string, returnURL?:string ) {
        const reentryUrl = returnURL || window.location.href;
        console.log("AlIdentityResolutionGuard: refusing access to route: " + (reason ? reason : "No reason specified"));
        observer.next(false);
        observer.complete();
        this.resolver$ = undefined;
        this.alNavigation.forceAuthentication( reentryUrl );
    }
}

