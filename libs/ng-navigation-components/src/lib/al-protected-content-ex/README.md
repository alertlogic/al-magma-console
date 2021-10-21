# al-protected-content-ex

## Overview

The `al-protected-content-ex` component allows component authors to easily protect views or view elements from users that are not allowed to see them, based on a variety of criteria.

## Usage

```
<al-protected-content-ex [entitlements]="'entitlement expression or array of entitlement expressions'"
                         [primaryEntitlements]="'entitlement expression to be applied to primary account entitlements'"
                         [environments]="'allowed environment IDs'"
                         [experiences]="'allowed experiences'"
                         [authentication]="'boolean, indicating whether the user must be authenticated or unauthenticated to see the content'"
                         [requiresDefender]="'boolean, indicating the interior content requires a defender session to execute as expected.'"
                         [verbose]="boolean"
                         [unavailableTemplate]="templateRef"
                         (onAccountChange)="convenience event to indicate when the acting account has changed."
                         (onDisplay)="event that fires when the content is shown"
                         (onHide)="event that fires when the content is hidden"
                         (onDisallowed)="event that fires when a criteria mismatch is detected">
    Content for entitled view
    <div unavailable>
        Only users who do not meet the block's view criteria will see this, and only if an `unavailableTemplate` input isn't specified.
    </div>
</al-protected-content-ex>
```
The protection criteria inputs are:

- `entitlements` Can be a string entitlement expression, array of string entitlement expressions, a reference to an EntitlementGroup, or one of the two special constants `*` and `@schema`.  If present, these are evaluated against the entitlements of the _acting account_.  If the user is not authenticated, this will fail with `disallowedCriteria` = `'authentication'`.  `*` indicates any entitlement, and `@schema` indicates the entitlement requirements should be extracted from the current route by introspecting the navigational metadata for an activated route tree with conditions.
- `primaryEntitlements` This behaves identically to `entitlements` except it is evaluated against the entitlements of the _primary_ account.
- `environments` A string (or array of strings) indicating which environments the protected content is allowed to be displayed in.
- `experiences` A string (or array of strings) indicating which navigational experiences ts the protected content is allowed to be displayed in.
- `authentication` A boolean value indicating whether or not the user must be authenticated (`true`) or unauthenticated (`false`) to see the given content.  Please note that using `entitlements` or `primaryEntitlements` both imply an `[authentication]="true"` criteria.
- `requiresDefender` A boolean value.  If true, indicates that a defender session to the contextually relevant defender datacenter must be established before the content can be shown.

If all of the criteria for the protected content block are met, the `onShow` event emitter will be triggered, and the inner content will be displayed.

If all of the criteria for the protected content block are not met:
- The `onHide` event will trigger
- The `onDisallowed` event will trigger with a reference to an object containing `disallowedReason`, `disallowedCriteria`, and a `redirect` method that can be used to navigate away from the current route.
- The inner content will be hidden.  
    - If a template is provided via the `unavailableTemplate` input, then that template will be rendered inside the component.
    - If a template is NOT provided, the first element with attribute `[unavailable]` will be projected into the component.

_Best Practice_: Embed your entitlement expression or group directly into your component's markup instead of storing it in a public property on your component.  This makes it easier to tell when and how the component should work from its markup.

_Best Practice_: Redirecting between components based on entitlements should be avoided in general, because redirection chains do not scale gracefully without a great deal of coordinated effort.  Rather than redirecting, project a reasonable zero state and provide a link to a better location.  You should only call the `redirect()` method in the `onDisallowed()` event handler under special circumstances.

## Other Events

If the criteria are met and the acting account changes, the `onAccountChange` emitter will be triggered with a reference to the new acting account.  This event will be emitted on the intial view, as well.

## Examples

### Example 1: Basic Usage

Component HTML:

```
<al-protected-content-ex [entitlements]="'EntitlementGroup.CloudInsightOnly'"
                    (onDisplay)="beforeShowContent()"
                    (onHide)="beforeHideContent()">

    Na nah, you can't see me without the right entitlements!

    <em>{{notice}}</em>
    <div unavailable>
        Put a zero state here
    </div>
</al-protected-content-ex>
```

Component TS:

```
    public onDisplay() {
        //  This will be invoked before the content is displayed
        this.notice = "Greetings, person with the Cloud Insight entitlement!";
    }

    public onHide() {
        //  This will be invoked before the content is hidden (if it was ever accessible to begin with)
        this.notice = null;
    }
```

### Example 2: Using Account Change Notifications

Component HTML:

```
<al-protected-content-ex (onAccountChange)="reloadViewForAccount($event)">
    This is my inner content!  Since no criteria are provided, this content will _always_ be shown. 
</al-protected-content-ex>
```

Component TS:

```
    public reloadViewForAccount( account:AIMSAccount ) {
        this.initializeView( account.id );
    }
```

### Example 3: Redirecting

Component HTML:

```
<al-protected-content-ex [entitlements]="'Some entitlement that doesn't exist'"
                    (onDisallowed)="onAccessRejected($event)">

    Hypothetically, this content can never be displayed because its entitlement requirement are fundamentally gibberish.

</al-protected-content-ex>
```

Component TS:

```
    public onAccessRejected( rejection:AlContentUnavailable ) {
        console.log("Access rejected because of " + rejection.disallowedReason, rejection.disallowedCriteria );
        if ( false ) {
            //  Ordinarily, you shouldn't do this -- but you can if you need to
            rejection.redirect( "https://lmgtfy.com/?q=no+way+jose" );
        }
    }
```

### Example 4: Using Navigation Metadata and Debugging

Component HTML:

```
<al-protected-content-ex [entitlements]="@schema"
                         [rerouteActingAccount]="true"
                         [verbose]="true">
</al-protected-content-ex>
```

This example requires no code-behind to work.

`[entitlements]="@schema"` will infer which route you are on from the loaded navigational schematics, and determine the entitlement criteria applied to that route (and its ancestors). For example, if you are inside a view in the Health application without any more specific entitlements (like [this one](https://algithub.pd.alertlogic.net/defender/ui-metadata/blob/master/navigation-schemas/siemless/primary.json#L52)), the component will automatically retrieve the entitlement expression `"assess|detect|respond|tmpro|lmpro"` and apply those to the entitlements criteria.
Alternatively, if you are using this component inside a view within [this route](https://algithub.pd.alertlogic.net/defender/ui-metadata/blob/master/navigation-schemas/cie-plus2/sidenav.overview.json#L68), it will automatically apply a criteria of `[entitlements]="EntitlementGroup.ThreatManager"`.  Easy!

`[rerouteActingAccount]="true"` will automatically apply route changes, based on the same navigational metadata it uses to determine `@schema` based entitlement criteria.  Borrowing the last example above (the defender scans path in the overview application), when the acting account changes, the route's URL will be recalculated accordingly, and the user will automatically be redirected to the appropriate route for the newly selected account.

Last but not least, `[verbose]="true"` will turn on extra logging around evaluation cycles and show/hide logic.  This should help you figure out why the component is behaving in the way it does.

### Example 5: Requiring A Defender Session

Some views require a defender session to be ready and initialized in order to work properly.  `al-protected-content-ex` won't create the session for you, but it will wait for one to be ready before displaying its content.

Component HTML:

```
<al-protected-content-ex [requiresDefender]="true"
							(onDisplay)="loadConvergenceData()">
    <em>Inner Content</em>
</al-protected-content-ex>	
```

Component TS:

```
public loadConvergenceData() {
    // Muhahaha!  I can safely request data from convergence APIs from this method.
}
```

