const { SilexServer, Config } = require('silex-website-builder')
const serveStatic = require('serve-static')
const path = require('path')

// create a default config
const config = new Config()

// enable only local file system to store files
config.ceOptions.enableSftp = false
config.ceOptions.enableFs = true

// allow to publish only in a local folder
config.publisherOptions.skipHostingSelection = true
config.publisherOptions.enableHostingUnifile = false
config.publisherOptions.enableHostingGhPages = false

// create the Silex server
const silex = new SilexServer(config)

// add custom services
const HostingJekyll = require('./HostingJekyll.js')
silex.publishRouter.addHostingProvider(new HostingJekyll(silex.unifile))

// serve custom script
silex.app.use('/client.js', serveStatic(path.resolve('./client/client.js')))

// serve modified html
silex.app.use('/', serveStatic(path.resolve('./pub')))

// start Silex
silex.start(function() {
  console.log('server started')
})

