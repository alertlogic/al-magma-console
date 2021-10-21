# `@al/ng-generic-components` directives

## `alExternalText`

This directive allows you to inject external text content into an element.  It accepts a single input (as a property value) that indicates which external resource to load and inject.  Please note that this resource *must* be a text/plain resource; other resource types will throw a content type mismatch error.

Example usage:

```
<div class="my-content" alExternalText="alid:scanning#schedulingFAQ"></div>
```

Example usage, using variable resource:

```
<div [alExternalText]="external?'alid:details#externalDescription':'alid:details#internalDescription'></div>
```

Please see the section on resource identifiers and bundled resources below.

## `alExternalHtml`

This directive allows you to inject markup into an element's innerHTML.  It accepts a single input (as a property value) that indicates which external resource to load and insert. 

Two important caveats about HTML injection:

1.  The resource must be a text/html resource.  If it is not, a content type mismatch error will be thrown.
2.  Links, styles, and images or other embedded resources in the HTML *must* be provided externally.

Example usage:

```
<div class="something" alExternalHtml="alid:help/aws-deployments.html">
```

Example usage, using a component property named `topicResourceId`:

```
<div class="inline-help" [alExternalHtml]="topicResourceId"></div>
```

## Resource Identifiers and Bundled Resource Collections

External resource retrieval is managed by a service named `AlExternalContentManagerService` (quite a mouthful), which uses a Gestalt endpoint to flatten the logical surface area of static content.

In general, external resources come in two flavors: raw, and bundled.  Raw sources are single entities stored by themselves; bundles are collections of small resources grouped together by category or topic for the sake of efficiency.  Both raw and bundled resources are referenced via a category and path; bundled resources include an additional item identifier.

Example resource identifiers:

  - `alid:context-help/exposures#completed` references the 'completed' item in the Alert Logic InfoDev (alid) 'context-help/exposures' bundle.
  - `alid:tutorials/deployments/aws/getting-started.html` references the "getting-started.html" resource in the info dev 'tutorials/deployments/aws' topic.

