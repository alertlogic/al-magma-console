# Magma

![Magma](https://media4.giphy.com/media/9gqeKCrqvuf5e/giphy.gif?cid=ecf05e47x4vew5e2tqaj0lhhkgjpn2en19fb35vmach718fa&rid=giphy.gif&ct=g)

_Actual footage of al-magma-console consuming an antiquated o3 application_

**Integration**: https://console.magma.product.dev.alertlogic.com

Magma is a *M*assive, *AG*greggated, *M*odernized, and *A*ccelerated refactor of our existing UI componentry (effective in the middle of 2021, which will
be the distant past soon enough).  It is meant to address a number of concerns with that existing componentry, which is why it is

  - *Massive* - because having many small applications is inefficient and slow (many redundant resources are loaded when moving between applications), 
    complex (navigation and authentication state must be juggled across applications), and prone to UX inconsistencies because features are developed in silos.
    The new customer-facing console will be a single large application with lazy loaded feature modules.

  - *Aggregated* - because the maintenance of many library and feature-specific application repositories is unnecessarily difficult: instead of updating 
    libraries in one place, the process must be repeated across many applications which must be independently kept in sync.  Thus, magma will be a monorepo.

  - *Modernized* - because we are consistently 3 or more major versions behind the latest release versions of angular and primeng.  Magma will update all libraries
    to their most recent versions, and will also aim to eliminate some of the organizational problems that make it difficult to update our frameworks regularly.

  - *Accelerated* - because ultimately, the way the application performs for users is the only real metric of its success.  This restructuring will making
    navigation between features/deep linking fundamentally faster.  It will also make our developer experience more pleasant by providing a development environment 
    and deployment pipeline that are both faster and easier to manage.

## Contributing

Before adding, modifying, or refactoring anything here, please review the following documents:

- [Organization Guide](ORGANIZATION.md) A brief overview of how the monorepo is structured, how library modules should be named and classified, and where the bodies are buried.  And yes, there are several bodies buried in here.
- [Component Development Guide](COMPONENTS.md) A set of guidelines for component development.

## Getting Started

```
npm install
npm install -g nx
nx serve console
```

There are currently two application targets -- `console` (the customer-facing application scaffold) and `pattern-library`, which corresponds to the usage guide in nepal-ng-common-components.

## Boilerplate

This project was generated using [Nx](https://nx.dev).

<p style="text-align: center;"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="450"></p>

🔎 **Smart, Extensible Build Framework**

[Nx Documentation](https://nx.dev/angular)

[10-minute video showing all Nx features](https://nx.dev/getting-started/intro)

[Interactive Tutorial](https://nx.dev/tutorial/01-create-application)

### Adding capabilities to your workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below are our core plugins:

- [Angular](https://angular.io)
  - `ng add @nrwl/angular`
- [React](https://reactjs.org)
  - `ng add @nrwl/react`
- Web (no framework frontends)
  - `ng add @nrwl/web`
- [Nest](https://nestjs.com)
  - `ng add @nrwl/nest`
- [Express](https://expressjs.com)
  - `ng add @nrwl/express`
- [Node](https://nodejs.org)
  - `ng add @nrwl/node`

There are also many [community plugins](https://nx.dev/community) you could add.

### Generate an application

Run `ng g @nrwl/angular:app my-app` to generate an application.

> You can use any of the plugins above to generate applications as well.

When using Nx, you can create multiple applications and libraries in the same workspace.

### Generate a library

Run `ng g @nrwl/angular:lib my-lib` to generate a library.

> You can also use any of the plugins above to generate libraries as well.

Libraries are shareable across libraries and applications. They can be imported from `@magma/mylib`.

### Development server

Run `ng serve my-app` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng g component my-component --project=my-app` to generate a new component.

### Build

Run `ng build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test my-app` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

### Running end-to-end tests

For local development the syntax of the e2e command to run is:

`npm run cypress:e2e <environment> <credential_ids> <launch-testrunner>`

For example to run all e2e tests against a locally running instance of console where the configui credentials are needed in the tests:

`npm run cypress:e2e local CONFIG_UI_PASSWORD false`

You will be prompted for any credential_ids value you supply, note this arg can be a comma separated list of ids, e.g `CONFIG_UI_PASSWORD,SECURITY_UI_PASSWORD`, and you will need to grab the values from our 1Password vault.

The `false` param tells cypress to not launch the interactive test runner, so will instead just go ahead and run all tests.

To run against the integration environment:

`npm run cypress:e2e integration CONFIG_UI_PASSWORD false`

If you want to use the cypress test runner so you can choose what test to run, what browser to use, etc, then omit the `false` param like so:

`npm run cypress:e2e local CONFIG_UI_PASSWORD`

Again, swap the `local` for `integration` if you want to work with test suites against the currently deployed version in integration.


Run `ng e2e my-app` to execute the end-to-end tests via [Cypress](https://www.cypress.io).

Run `nx affected:e2e` to execute the end-to-end tests affected by a change.

### Understand your workspace

Run `nx dep-graph` to see a diagram of the dependencies of your projects.

### Further help

Visit the [Nx Documentation](https://nx.dev/angular) to learn more.






### ☁ Nx Cloud

#### Distributed Computation Caching & Distributed Task Execution

<p style="text-align: center;"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-cloud-card.png"></p>

Nx Cloud pairs with Nx in order to enable you to build and test code more rapidly, by up to 10 times. Even teams that are new to Nx can connect to Nx Cloud and start saving time instantly.

Teams using Nx gain the advantage of building full-stack applications with their preferred framework alongside Nx’s advanced code generation and project dependency graph, plus a unified experience for both frontend and backend developers.

Visit [Nx Cloud](https://nx.app/) to learn more.
