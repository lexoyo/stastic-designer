const { SilexServer, Config } = require('silex-website-builder')
const isElectron = require('is-electron')

const path = require('path')
const serveStatic = require('serve-static')

const config = new Config()
const {listAdapters, createAdapterClass} = require('./adapter-utils')
const HostingProvider = require('./HostingProvider')

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

// hosting provider for custom publication
const hostingProvider = new HostingProvider(silex.unifile)
silex.publishRouter.addHostingProvider(hostingProvider)

// adapters mechanism
const adapters = listAdapters(path.resolve('./adapters/'))
.map(adapterName => createAdapterClass('../adapters/' + adapterName, silex.unifile))
// add unifile custom services
adapters
.forEach(adapter => {
  hostingProvider.addAdapter(adapter)
})
// adapters API
silex.app.use('/adapter/', (req, res) => {
  res.json(adapters.map(adapter => ({
    ...adapter.info,
    form: adapter.getForm ? adapter.getForm() : undefined,
  })))
})

// serve custom script
silex.app.use('/client.js', serveStatic(path.resolve('./client/client.js')))
silex.app.use('/lit-html/', serveStatic(path.resolve('./node_modules/lit-html/')))

// serve modified html to electron
// for some reason the following override does not work in electron
// therefore in ./electron.js we load /stastic.html and we serve index.html at this path
// wihtout this workaround it serves the original index.html file
silex.app.use('/stastic.html', serveStatic(path.resolve('./pub/index.html')))

// serve the pub folder
// this will override the original index.html file served by silex
silex.app.use('/', serveStatic(path.resolve('./pub')))

// export Silex so that the caller can start Silex with silex.start(() => {})
module.exports = silex
