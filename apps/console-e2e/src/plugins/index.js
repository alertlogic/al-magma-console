/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
 const { beforeRunHook, afterRunHook } = require('cypress-mochawesome-reporter/lib');

 module.exports = (on, config) => {
   on('before:run', async (details) => {
     if(details.parallel) {
         return;
     }
     console.log('override before:run');
     await beforeRunHook(details);
   });

   on('after:run', async (results) => {
     if(results.runUrl) {
         return;
     }
     console.log('override after:run');
     await afterRunHook();
   });

   return require('@bahmutov/cypress-extends')(config.configFile)
 };
