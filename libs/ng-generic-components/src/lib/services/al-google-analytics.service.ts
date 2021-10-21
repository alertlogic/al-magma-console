/**
 * A service to POST stats to Google Analytics using the gtag (Google Tag Manager) client
 *
 * @author Darwin Garcia <dgarcia@alertlogic.com>
 *
 */
import {
    AlLocation,
    AlLocationDescriptor,
    AlLocatorService,
} from '@al/core';
import { Injectable } from "@angular/core";

declare let gtag: Function;

@Injectable({
    providedIn: 'root'
})
export class AlGoogleAnalyticsService {

    private trackingId: string = '';

    public constructor() {
        const currentNode: AlLocationDescriptor = AlLocatorService.getNodeByURI(window.location.origin);
        if (!currentNode) {
            this.trackingId = '';
            return;
        }

        const findMeHere: {[k: string]: string} = { environment: currentNode.environment };
        const gaLocator = AlLocatorService.getNode(AlLocation.GoogleTagManager, findMeHere);
        if (gaLocator.hasOwnProperty('data') && gaLocator.data.hasOwnProperty('analyticsKey')) {
            this.trackingId = gaLocator.data.analyticsKey;

            const gscript: HTMLScriptElement = document.createElement('script');
            gscript.setAttribute('src', `https://www.googletagmanager.com/gtag/js?id=${this.trackingId}`);
            gscript.async = true;
            document.head.appendChild(gscript);

            const gscript2: HTMLScriptElement = document.createElement('script');
            gscript2.textContent = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
            `;
            document.head.appendChild(gscript2);

            this.callGtag(['config', this.trackingId]);

        }

    }

    // useful for unit testing
    /**
     * enforce usage of an specific trackingID
     * @param trackingId
     */
    public setTrackingId(trackingId: string) {
        this.trackingId = trackingId;
    }

    /**
     * enforce usage of an specific trackingID
     * @param userId string
     */
    public setUserId(userId: string) {
        this.callGtag(['set', {'user_id': userId}]);
    }

    /**
     * Send an event to Google Analitycs
     * @param eventAction s the string that will appear as the event action in Google Analytics Event reports.
     * @param eventCategory  is the string that will appear as the event category.
     * @param eventLabel is the string that will appear as the event label.
     * @param eventValue is a non-negative integer that will appear as the event value.
     */
    public sendEvent(
        eventAction: string,
        eventCategory: string,
        eventLabel?: string,
        eventValue?: number,
        customParams?: { [k: string]: string }) {
        if (this.trackingId !== '') {
            if (!eventAction || !eventCategory) {
                throw new Error('No Event Action and Category provided');
            }
            const params = {
                event_category: eventCategory,
                ...(eventLabel ? { event_label: eventLabel } : {}),
                ...(eventValue ? { event_value: eventValue } : {}),
                ...customParams,
            };
            this.callGtag(['event', eventAction, params]);
        }

    }

    // isolating this global call to make unit test more developer friendly
    /**
     * call the gtag() global function to POST data to Google Analytics
     * @param params
     *
     */
    public callGtag(params: unknown[]) {
        gtag(...params);
    }

}
