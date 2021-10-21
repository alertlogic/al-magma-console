# al-protected-content

## Overview

The `al-protected-content` component allows application authors to easily protect views or view elements from accounts who are not entitled to see them.
It also provides functionality to automatically redirect to a more appropriate route when the acting account changes, show a zero state in the event the current user is unentitled, or redirect to a default route in the case the current user is unentitled.

## Basic Usage

```
<al-protected-content entitlement="cloud_defender">
    Content for entitled view
    <div class="inaccessible">
        Only unentitled viewers will see this.
    </div>
</al-protected-content>
```

The `entitlement` attribute can be any valid entitlement expression (e.g., `"cloud_insight&!active_watch_premier|web_security_managed"`) or array of entitlement expressions.
It can also be a named entitlement group (e.g., `"EntitlementGroup.Incidents"`) or one of two special string constants.

* `"*"` This expression is always evaluated as true, so that the content will always be displayed (unless other conditions are applied).
* `"@schema"` This constant will cause the component to interrogate the currently activated route (according to AlNavigationService) and its ancestors for a valid entitlement expression.  Please note that this shorthand has _significant_ limitations when dealing with routes with complex, compound, or negated visibility conditions.

_Best Practice_: Embed your entitlement expression or group directly into your component's markup instead of storing it in a public property on your component.  This makes it easier to tell when and how the component should work from its markup.

## Events

`al-protected-content` emits three events under normal usage conditions.

`onHide` emits `void` when the current account's entitlements do NOT allow the acting user to view the entitled content, before it is hidden (or at initialization time).

`onDisplay` emits `void` when the current account's entitlements DO allow the acting user to view the entitled content, before it is displayed.

`unentitled` emits the current entitlements when the current account has been determined to be ineligible to view the protected content.  These entitlements take the form of an `EntitlementCollection` instance, which can be used to determine the best place to redirect to, for instance.

Last but not least, `onAccountChange` emits the acting account whenever the account changes, its metadata has been successfully resolved, AND it is entitled to view the content.  For components that are interested only in reloaded their data when the acting account changes, this simplifies the process of listening for account changes to something as simple as

```
    <al-protected-content (onAccountChange)="reload($event)">
        View of account data here
    </al-protected-content>
```

#### Example

Component HTML:

```
<al-protected-content [entitlement]="'EntitlementGroup.CloudInsightOnly'"
                    (onDisplay)="beforeShowContent()"
                    (onHide)="beforeHideContent()"
                    (unentitled)="onUnentitledAccess($event)">
    Na nah, you can't see me without the right entitlements!

    <em>{{notice}}</em>
</al-protected-content>
```

Component TS:

```
    public onDisplay() {
        console.log("Showing protected content" );
        this.notice = "I will be populated before the content displays.";
    }

    public onHide() {
        this.notice = null;     //  whatever 
    }

    public onUnentitledAccess( entitlements:EntitlementCollection ) {
        if ( this.navigation.evaluateEntitlement("log_manager|threat_manager", entitlements ) ) {
            this navigation.route( [ 'some', 'other', 'route' ] );
        } else {
            this navigation.route( [ 'some', 'other', 'other', 'route' ] );
        }
    }
```

In this example, the onDisplay event is used to calculate a property before the inner content is destroyed, clean it up when the current viewer is unentitled, and redirect to an alternative location based on the user's entitlements when the unentitled case is detected.

## Account Change Handling

Most applications with account-specific views will want to automatically reroute the current view to reference the newly activated account when it changes, or redirect to a default/"detector" route (typically '/') when the newly activated account is not entitled to access the current view.
The `al-protected-content` component supports both of these common use cases with the @Input(s) `accountChangeRoute` and `unentitledRoute`.

Both `accountChangeRoute` and `unentitledRoute` can be assigned a boolean, string, or array of strings.  
When the acting account changes, IF the new account is entitled to view the inner content based on the `entitlement` attribute, then `al-protected-content` will redirect to the given route.  
If `accountChangeRoute` is a boolean, the component will attempt to redirect to the current view, replacing the old account ID with the new one.  
If `accountChangeRoute` is a string, it will be treated as a route literal.
If `accountChangeRoute` is a string[], it will be treated as an array of route segments.

#### Examples

```
<al-protected-content entitlement="threat_manager"
						 [accountChangeRoute]="true"
						 [unentitledRoute]="true">
	<div>My Content Lives Here</div>
</al-protected-content>
```

The above example will display "My Content Lives Here" if the current account has the "threat_manager" entitlement.

If the acting account changes to another account that has the threat_manager entitlement, the component will redirect the application to the *same* route with the old acting account ID replaced with the new one.

If the acting account changes to an account without the threat_manager entitlement, it will redirect to the default unentitled route -- '/'.

```
<al-protected-content entitlement="log_manager|cloud_insight"
						 [accountChangeRoute]="['kevin', 'was', 'here', ':accountId' ]"
						 unentitledRoute="/unacceptable/:accountId">
    <!-- State Seekrets Here -->
</al-protected-content>
```

In the above example, state secrets will be shown to accounts with log manager or cloud insight entitlements.  If the account changes to an account with those entitlements, the app will be routed to '/kevin/was/here/(account ID)'.  Otherwise, it will be routed to '/unacceptable/(account ID)'.

*Note* that the component does not need to be used with both route inputs at once.  Either can be used in isolation, if the client wishes to show a zero state or not modify the route when the account changes.
