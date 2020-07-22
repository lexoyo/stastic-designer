const { SilexServer, Config } = require('silex-website-builder')
const serveStatic = require('serve-static')
const path = require('path')
const isElectron = require('is-electron')

// create a default config
const config = new Config()

// enable only local file system to store files
// and github to publish
config.ceOptions.enableSftp = false
config.ceOptions.enableFs = isElectron() || process.env.ENABLE_FS
config.ceOptions.githubClientId = process.env.GITHUB_CLIENT_ID || 'f124e4148bf9d633d58b'
config.ceOptions.githubClientSecret = process.env.GITHUB_CLIENT_SECRET || '1a8fcb93d5d0786eb0a16d81e8c118ce03eefece'

// allow to publish only in a local folder
config.publisherOptions.skipHostingSelection = true
config.publisherOptions.enableHostingUnifile = false
config.publisherOptions.enableHostingGhPages = false

// create the Silex server
const silex = new SilexServer(config)

// add custom services
const HostingProvider = require('./HostingProvider.js')
silex.publishRouter.addHostingProvider(new HostingProvider(silex.unifile))

// serve custom script
silex.app.use('/client.js', serveStatic(path.resolve('./client/client.js')))

// serve modified html
silex.app.use('/', serveStatic(path.resolve('./pub')))

// export Silex so that the caller can start Silex with silex.start(() => {})
module.exports = silex

