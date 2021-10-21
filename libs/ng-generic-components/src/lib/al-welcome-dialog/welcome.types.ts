import { AlRouteCondition } from '@al/core';

export interface WelcomePageResource {
    url: string;
    title: string;
    visible: boolean;
    subtitle?: string;
    imageUrl?: string;
    entitlements?: string;
    conditions?: AlRouteCondition;
    data?: any;
}

export interface WelcomePageManifest {
    /**
     * Current version number of the welcome page.  Incrementing this will cause the welcome page to be displayed again for users who have dismissed it.
     */
    version: number;

    /**
     * Master toggle: if false, the welcome page will be ignored.
     */
    enabled: true;

    /**
     * Textual title of the welcome page (default: "Welcome")
     */
    title:string;

    /**
     * Optional resource to be injected into content.
     */
    introContentId?:string;

    /**
     * Elements for each section of the welcome page
     */
    sections: {[sectionId:string]: {
        items: WelcomePageResource[]
    }};
}

export interface WelcomePageState {
    /**
     * Has the welcome page been seen already this session?  If so, this will be a timestamp for the end of the
     * session in which it was seen.
     */
    sessionExpiration:number;

    /**
     * What version was last displayed to the user?
     */
    lastDisplayedVersion:number;

    /**
     * Should the welcome page only display when there are updates?
     */
    displayUpdatesOnly:boolean;
}
