'use strict';

// ///////////////////////////////
// Start silex server
// //////////////////////////////

const { SilexServer, Config } = require('silex-website-builder');

// create a default config
const config = new Config();

// enable only local file system to store files
config.ceOptions.enableSftp = false;
config.ceOptions.enableFs = true;

// allow to publish only in a local folder
config.publisherOptions.skipHostingSelection = true;

// create the Silex server
const silex = new SilexServer(config);

// add custom services
const HostingJekyll = require('./HostingJekyll.js')
silex.publishRouter.addHostingProvider(new HostingJekyll(silex.unifile))

// start Silex
silex.start(function() {
  console.log('server started');
})

