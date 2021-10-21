/**
 * A service to push Google Tag Manager custom events\tags to the datalayer shared by Google Analytics
 *
 * @author Robert Parker <robert.parker@alertlogic.com>
 *
 */
import {
    AlLocatorService,
    AlSession,
    AlSubscriptionGroup,
    AlSessionStartedEvent,
    AlActingAccountResolvedEvent,
    AlEntitlementCollection,
} from '@al/core';
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AlGoogleTagManagerService {

    protected subscriptions = new AlSubscriptionGroup();

    private containerId: string = 'GTM-KJZM6BQ'; // Same one is used for all environments
    private isLoaded = false;
    private currentEnvironment: string;
    private entitlements: AlEntitlementCollection | null;

    private browserGlobals = {
        windowRef(): any {
            return window;
        },
        documentRef(): any {
            return document;
        }
    };

    private pendingDataLayerItems: object[] = [];

    constructor() {
        this.entitlements = null;
        this.subscriptions.manage(
            AlSession.notifyStream.attach( AlActingAccountResolvedEvent, this.onActingAccountResolved )
        );
        this.currentEnvironment = AlLocatorService.getCurrentEnvironment();
        const supportedEnvironments = ['integration', 'production'];
        if (!supportedEnvironments.includes(this.currentEnvironment)) {
            this.containerId = '';
            return;
        }
    }

    public getDataLayer() {
        const window = this.browserGlobals.windowRef();
        window['dataLayer'] = window['dataLayer'] || [];
        return window['dataLayer'];
    }

    public addGtmToDom() {
        if (this.isLoaded || this.containerId === '') {
            return;
        }
        const doc = this.browserGlobals.documentRef();
        this.entitlements = AlSession.getPrimaryEntitlementsSync();
        const currentUserMeta = this.getCurrentUserMeta();
        this.pushOnDataLayer({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js',
            ...currentUserMeta
        });

        if(this.pendingDataLayerItems.length > 0) {
            this.pendingDataLayerItems.forEach(item => {
                this.pushOnDataLayer({...item, ...currentUserMeta});
            });
            this.pendingDataLayerItems = [];
        }

        const gtmScript = doc.createElement('script');
        gtmScript.id = 'GTMscript';
        gtmScript.async = true;
        gtmScript.src = `https://www.googletagmanager.com/gtm.js?${this.getQueryParamsForEnvironment()}`;
        doc.head.insertBefore(gtmScript, doc.head.firstChild);

        const ifrm = doc.createElement('iframe');
        ifrm.setAttribute(
            'src',
            `https://www.googletagmanager.com/ns.html?${this.getQueryParamsForEnvironment()}`
        );
        ifrm.style.width = '0';
        ifrm.style.height = '0';
        ifrm.style.display = 'none';
        ifrm.style.visibility = 'hidden';

        const noscript = doc.createElement('noscript');
        noscript.id = 'GTMiframe';
        noscript.appendChild(ifrm);

        doc.body.insertBefore(noscript, doc.body.firstChild);
        this.isLoaded = true;
    }

    public trackPageViewEvent(pageTitle: string, pagePath: string) {
        this.pushTag({
            event: 'pageview',
            title: pageTitle,
            page: {
                path: pagePath
            }
        });
    }

    public trackCustomEvent(eventName: string, eventProps: {[k:string]:any}) {
        this.pushTag({
            event: eventName,
            ...eventProps
        });
    }

    public pushTag(item: object) {
        if(this.entitlements) {
            this.pushOnDataLayer({...item, ...this.getCurrentUserMeta()});
        } else {
            this.pendingDataLayerItems.push(item);
        }
    }
    protected onActingAccountResolved = ( event:AlSessionStartedEvent ) => {
        this.addGtmToDom();
    }

    protected getCurrentUserMeta() {
        const actingAccount = AlSession.getActingAccount();
        const primaryAccount = AlSession.getPrimaryAccount();
        return {
            userId: AlSession.getUserId(),
            actingAccountId: actingAccount.id,
            actingAccountName: actingAccount.name,
            primaryAccountId: primaryAccount.id,
            primaryAccountName: primaryAccount.name,
            isMDR: (<AlEntitlementCollection>this.entitlements).evaluateExpression("assess|detect|respond|tmpro|lmpro")
        };
    }

    private pushOnDataLayer(obj: object) {
        const dataLayer = this.getDataLayer();
        dataLayer.push(obj);
    }

    private getQueryParamsForEnvironment() {
        let queryString = `id=${this.containerId}&gtm_auth=90WSmNrOIcCL4zxHHggB6A&gtm_preview=env-1&gtm_cookies_win=x`;
        if(this.currentEnvironment === 'integration') {
            queryString = `id=${this.containerId}&gtm_auth=AmUBTiR7DBBqEnz7BH13JQ&gtm_preview=env-14&gtm_cookies_win=x`;
        }
        return queryString;
    }
}
