import {
    AlNavigationSchema,
    AlRoute,
    AlRouteAction,
    AlRouteCondition,
    AlRouteDefinition,
    AlRoutingHost,
    AlSessionInstance,
    AlTrigger,
    AlTriggeredEvent,
} from '@al/core';
import { TemplateRef } from '@angular/core';
import { MenuItem as PrimengMenuItem } from 'primeng/api';

/**
 * A triggered event that indicates something in the parent frame has changed -- either a new schema is being installed, the experience setting has changed.
 * This event will not fire until the schema has been fully loaded.
 */
@AlTrigger("AlNavigationFrameChanged")
export class AlNavigationFrameChanged extends AlTriggeredEvent<void>
{
    constructor( public host:AlRoutingHost,
                 public schemaId:string,
                 public schema:AlNavigationSchema,
                 public experience:string ) {
        super();
    }
}

/**
 * A triggered event that indicates something in the navigation context has changed -- specifically, this can be
 *     - A new route/URL has been set
 *     - Route parameters have changed
 *     - Acting account/effective eEntitlements have changed
 *     - Authentication status has changed
 * @dynamic
 */
@AlTrigger("AlNavigationContextChanged")
export class AlNavigationContextChanged extends AlTriggeredEvent<void>
{
    constructor( public host:AlRoutingHost,
                 public session: AlSessionInstance,
                 public routeData:{[property:string]:any},
                 public activatedRoute:AlRoute|null ) {
        super();
    }
}

/**
 * This event will be triggered when a route of type `trigger` is dispatched by AlNavigationService.
 * Its `host` property will refer to AlNavigationService; its `triggerName` will indicate the name of the trigger.
 *
 * This event type can accept boolean responses indicating whether the event was handled as expected.
 */
@AlTrigger("AlNavigationTrigger")
export class AlNavigationTrigger extends AlTriggeredEvent<boolean>
{
    constructor( public host:AlRoutingHost,
                 public triggerName:string,
                 public definition:AlRouteDefinition,
                 public route:AlRoute ) {
        super();
    }
}

@AlTrigger("AlAddendumToNavTitleEvent")
export class AlAddendumToNavTitleEvent extends AlTriggeredEvent<void>
{
    constructor(public addendumToTitle: string) {
        super();
    }
}

/**
 * @deprecate
 */
@AlTrigger("AlNavigationSecondarySelected")
export class AlNavigationSecondarySelected extends AlTriggeredEvent<void>
{
    constructor(public child: AlRoute) {
        super();
    }
}

/**
 * @deprecate
 */
@AlTrigger("AlNavigationTertiarySelected")
export class AlNavigationTertiarySelected extends AlTriggeredEvent<void>
{
    constructor(public child: AlRoute) {
        super();
    }
}

/**
* AlNavigationSidenavMounted
 */
@AlTrigger("AlNavigationSidenavMounted")
export class AlNavigationSidenavMounted extends AlTriggeredEvent<void>
{
    constructor( public contentRef:TemplateRef<any>|null, public showSidenav:boolean = true ) {
        super();
    }
}

@AlTrigger("AlNavigationNavHeaderMounted")
export class AlNavigationNavHeaderMounted extends AlTriggeredEvent<void>
{
    constructor() {
        super();
    }
}

@AlTrigger("AlNavigationInitializeToggle")
export class AlNavigationInitializeToggle extends AlTriggeredEvent<void>
{
    constructor(
        public label: string,
        public tooltip: string,
        public checked: boolean,
        public callback: Function) {
        super();
    }
}

@AlTrigger("AlNavigationRemoveToggle")
export class AlNavigationRemoveToggle extends AlTriggeredEvent<void>
{
    constructor() {
        super();
    }
}

@AlTrigger("AlNavigationIdlePrompt")
export class AlNavigationIdlePrompt extends AlTriggeredEvent<void>
{
    constructor( public countdown:number, public continueWorking:{():void} ) {
        super();
    }
}

@AlTrigger("AlNavigationReauthenticatePrompt")
export class AlNavigationReauthenticatePrompt extends AlTriggeredEvent<void>
{
    constructor() {
        super();
    }
}

export interface ExperienceToggleDefinition
{
    label: string;
    tooltip: string;
    checked: boolean;
    callback: Function;
}

export interface ExperiencePreference
{
    displayBetaNavigation:  boolean;
    displayIEWarning?:      boolean;
    displayExpOptOut?:      boolean;
    offerBetaTutorial?:     boolean;
}

export interface AlDatacenterOptionsSummary
{
    locationsAvailable:     number;
    selectableRegions:      PrimengMenuItem[];
    currentRegion:          string;
    currentResidency:       string;
}

/**
 *  This interface is used to communicate the unavailability of a protected content block to its parent component
 *  (see al-protected-content-ex).
 */
export interface AlContentUnavailable {
    /**
     * The route condition associated with the unavailable content.
     */

    conditions: AlRouteCondition;
    /**
     * Exposes a helper method to redirect to a local route, route tree, AlRoute, or location/path pair.
     */
    redirect: {(to:string|string[]|AlRoute|{location:string;path:string}):void};
}

export interface AlNavigationPromptDescriptor {
    type:string;
    selection:string;
    description:string;
    icon?:string;
    action?:AlRouteAction;
}

export const ALNAV_DISABLE_HEADER  = "alNavigation.disableHeader";
export const ALNAV_DISABLE_PRIMARY  = "alNavigation.disablePrimary";
export const ALNAV_DISABLE_TERTIARY = "alNavigation.disableTertiary";
export const ALNAV_PUBLIC           = "alNavigation.public";
export const ALNAV_PRIVATE          = "alNavigation.private";

export type IEWarningState = "showed" | "showing" | "not_showed";
export type AlExperience = "default" | "beta" | null; // Experience types used to define the content to display

export interface AlNavigateOptions {
    target?: "_blank"|undefined;    //  force open in new window
    replace?: boolean;              //  if true, replace current item in history instead of creating a new history entry
    as?: {
        accountId?:string;          //  if provided, acting account of the target URL will be overridden
        locationId?:string;         //  if provided, working datacenter of the target URL will be overridden
    };
}

export type TrackEventCategory = 'menu_opt_in' | 'menu_opt_out' | 'popup_opt_out' | 'popup_continue';
