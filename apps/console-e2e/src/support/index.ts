// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import 'cypress-mochawesome-reporter/register';
import { AIMSSessionDescriptor } from '@al/core';


// Alternatively you can use CommonJS syntax:
// require('./commands')
export const login = (username: string, initialRoute: string) => {

    const passwords = {
        "securityui@alertlogic.com": Cypress.env('SECURITY_UI_PASSWORD'),
        "configui@alertlogic.com": Cypress.env('CONFIG_UI_PASSWORD'),
        "dashboardui@alertlogic.com": Cypress.env("DASHBOARD_UI_PASSWORD")
    }

    cy.request({
        method: 'POST',
        url: `https://api.product.dev.alertlogic.com/aims/v1/authenticate`,
        auth: {
            user: username,
            pass: passwords[username]
        }
    }).its('body').then((body: AIMSSessionDescriptor) => {
      const encToken = encodeURIComponent(body.authentication.token);
      cy.visit(`/#/${initialRoute.replace(':accountId', body.authentication.account.id)}?aims_token=${encToken}`);
    });

}
