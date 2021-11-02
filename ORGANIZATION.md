# Magma Monorepo Organization

## Applications

Top level applications -- of which the user-facing console is one, and the usage guide is another -- are structured as angular application/BrowserModule-powered modules in the `apps` subdirectory.

To generate a new application, use the command

```
nx g @nrwl/angular:application (application name)
```

and follow the prompts.

In general, however, new applications should be created sparingly, and new functionality and features should be developed and exposed as feature modules or component libraries.

## Libraries

New libraries can be created using the command

```
nx g @nrwl/angular:library (library name)
```

In practice, there are three different types of library modules and it is important to know which type to use in given scenarios.

### Feature Libraries

Feature libraries have the following characteristics:
- They expose routing via `RouterModule.forChild()`
- They marshall other component libraries to expose a discrete feature, feature variant, or reusable feature expression (e.g., an "asset details" feature might have its own child route in multiple
      other features; this will not occur often, however)
- They should export *only* an angular module: they should not have types, services, exported components, pipes, or other apparatus that is externally available.

Feature libaries should be distinguished from other types of libraries with an `f-` prefix -- e.g., `f-exposures`, `f-topology`, `f-deployments`.  Iterated features should have a version number, 
in the form f-dashboards-v2, or f-topology-v3.  In general, their tsconfig.base.json mapping should begin with `@feature`, and match the name -- `f-exposures` would be importable from `@feature/exposures`;
`f-topology-v3` would be importable from `@feature/topology-v3`.

### Component Libaries

Component libraries are just the usual collections of reusable components and types.  See the [Components Readme](COMPONENTS.md) for more detail on development standards.  They have the following characteristics:

- They export lots n lots of components, along with relevant associated services, pipes, directives, and types
- They do not have routing

They should be distinguished from other types of libraries with a `c-` prefix -- e.g., `c-generic`, `n-navigation`, `c-forms-v3`.  As with feature modules, their mapping alias in tsconfig.base.json should
be `@components/generic`, `@components/navigation`, `@components/forms-v3`.  

### Utility Libraries

Utility libraries are clusters of functionality that are more sophisticated than API clients, or inappropriate for bundling with an API client, but without display logic.  Typically, these are used
for sharing types and services between component libraries.  They have these features:

- They do not contain any routing or components, but do export some combination of services, pipes, directives, and types
- They are not API clients
    
As with other libraries, they should be prefixed appropriately with a `u-` and their path alias in tsconfig.base.json should be `@utility`.

### Special Cases

Magma will necessarily need to absorb some of the legacy/"tech-debty" componentry that currently lives in @o3/core and @o3/design as a stopgap measure.  Any components, services, or pipes from these
old libraries should be imported into libs/c-technical-debt.  NOTHING unnecessary should be imported; items that are no longer necessary should be removed. 

### Notes for Future Refactoring

Legacy component libraries will retain their original prefixes/pathing until after magma is live.  After that point, it would be desirable to do a quick refactor to normalize them as follows:

@al/ng-generic-components: this module needs to be divided into three libraries for ideal dependency management.

- c-common (alias @components/common) for things like the loading spinner, zero state, view helper, tooltip, sidebar, etc
- c-controls (alias @components/controls) for legacy form controls
- c-controls-v2 (alias @components/controls-v2) for new form controls (Dave Rees's sparkly stuff)

@al/ng-navigation-components: this module will become c-navigation (alias @components/navigation)

@al/ng-assets-components: this module will become c-assets (alias @components/assets)

@al/ng-forms-components: this module will become c-d3forms (alias @components/d3forms), an alias for data driven dynamic forms

Etcetera.
