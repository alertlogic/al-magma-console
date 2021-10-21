# MAGMA support work

### Pipeline and Deployment

Because this project involves consolidating many properties (nepal-ng-common-components, black sheep o3 libs, all the consoles, etc) the pipeline will need to be sophisticated
enough to deploy several targets to multiple targets.

Additionally, to support server side rendering (SSR), which is a performance goodie for some views, we can no longer rely on the super-simple S3 + CloudFront architecture we're currently 
using.  We will need to determine whether we want to use Fargate, Elastic Beanstalk, or manually managed EC2 clusters to deliver content.  Versioning, rollback, and blue-green deployment 
capability (along with general performance, since this pipeline will be exercised *very* heavily compared to individual application repositories/pipelines right now) need to be considered.
Whatever solution we opt for will need to be coordinated and approved by cloud operations/software delivery since they will ultimately own the production pipeline.  However, I suggest we invest the energy
to develop the prototype/integration pipeline ourselves, since they tend to be backlogged and no one will understand our needs better than ourselves.

#### Questions

  - What technologies do we want to use?
  - How much flexibility do we need to have for feature branches

#### Scope

### Domain Names

Scope: easy

### Migration Process

How shall we go about integrating our existing surface area into the new architecture?  Presumably we will want to do this in phases.

Before we begin, to avoid needing to maintain two separate codebases on different versions of angular for a sustained period of time (as we did during the ng7->ng9 migration), we should
    a) Fully absorb the current ngcc libraries into the new platform (~85% of this will be done as part of the POC), and publish them into npm, similar to our current lerna-powered monorepo (but much faster)
    b) Update all of the applications to ng12 (Rob and I have gone through this process several times now, and it really isn't that bad -- nothing like the ng7->ng9 agony.

For instance, we start with a consolidation of dashboards, exposures, and hopefully incidents (plus the pattern library and authentication-related portero functionality, of course).  

When that has stabilized and we have bandwidth

### Routing

#### Description

#### Questions

#### Scope

### Authentication

#### Description

#### Questions

#### Scope

### Data Residency/Regionality

### Test Coverage

#### Code Management

Currently, our work on new features/migrations is separated into functionally distinct silos, which minimizes the need for coordination and merging of changes.  Moving everything into a monorepo
will involve adopting new protocols for branch management, change communication, and coordination.  Failure to address this gracefully will reproduce some of the organizational difficulties we've 
had in nepal-ng-common-components.

## Timeline

### Phase 1: Foundations

1.  UX: complete ng-generic-components/alertlogic-theme integration with @al/ui-css-kit, in al-magma-console.  
2.  Update o3-configuration (and other apps with material design forms) to use @al/ng-forms-components.  This will allow us to roll
    all forms to the shiny new components (or styled primeng ones) all at once.
2.  UI: update all libraries to ng12 in existing nepal-ng-common-components 
    This isn't as scary as it sounds -- I already have an ng12 migration for o3-core, o3-design, and all of the ngcc libraries.  
    I have disabled a few problematic components, and there are a few missing types that should be cleaned up.
    Once we are done, we should be publishing these as version 12.0.0-beta.x.
4.  Development pipeline for publishing libraries the libraries in al-magma-console to npm.

This phase will be executed using feature branches, and will not impact the ability to work on product or VTT.

### Phase 2: Normandy

1.  UI: Deprecate nepal-ng-common-components and beginning publishing ngcc libraries through al-magma-console's pipeline, using version 12.0.x.
2.  UI: update all applications to angular12, using the 12.0.x referring to 12.0.0-beta.x branches prepared in phase 1.
    Again, this isn't as scary as it sounds -- I already have an angular11 branch of o3-configuration and o3-search and, other than strictTemplateChecks, the update isn't really that bad.
    I believe that with 70% of our developers working on this in parallel, we could accomplish all of this in 1.5 sprints (+/- 3 days).  All work would be done in feature branches/production-staging, 
    so critical feature development + VTT would not be impeded (although it would be extremely inconvenient!)
3.  Update ng-forms-component to use sparkly new components, and activate the forms rework from phase 1.
4.  UI+UX: stabilize, regress, and polish.

At the end of this phase, we should be able to deploy our entire surface area (using existing application repositories and pipelines) as ng12 applications, using the sparkly new forms.
All new shared component development should be done in al-magma-console, and nepal-ng-common-components should be archived.

### Phase 3: Intersection

1.  Use the new application pipeline built in phase 2 to deploy the initial magma application (e.g., console.product.dev.alertlogic.com, console.alertlogic.com, console.alertlogic.co.uk) 
    composed of
      - authentication components from o3-portero
      - dashboards and exposures
      - incidents?  automated response?  something active, so that we can shift as much ongoing product work into the new monorepo as possible.
2.  UX: Update existing nepal-dashboards and o3-exposures (and others) to redirect to equivalent routes in magma console.
3.  UX. Update all other applications that reference them + ui-static-content to point to new magma console.  Sadly, this will require a cloud defender release for the login route :'(

At the end of this phase, we should be doing most forward product work in al-magma-console; nepal-dashboards and o3-exposures can be archived.

### Phase 4: Application Migration

Once phase 3 has been fully stabilized, we can begin to migrate applications into al-magma-console one at a time, without particular haste.  The process for each application will look like this:

1.  Migrate the application into a feature library in al-magma-console.
2.  Update the feature library's relative local linking to to includes the subpath it will exist under in the console.  No outbound linking should need to change.
3.  Update ui-static-content's navigation schemas to point the feature's links to the right place.
4.  Regress/polish
5.  Deploy updated al-magma-console, and then ui-static-content, to point everything to the new location for the feature/app
6.  Last but not least, gut the existing o3 application (which is now defunct) and make it simply redirect to the magma console.

This could be approached in parallel or one at a time, or even be staged into the intermediate future, and does not conflict with stages 4 and 5.

### Phase 5: Gestalt Migration

This can happen at any time once the application is served via EB/Fargate/ECS.

### Phase 6: Further Optimization

1.  Apply prerendering/SSR where applicable
