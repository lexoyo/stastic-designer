import { TYPE_CMS, TYPE_TEMPLATE, container, state } from './globals.js'
import { loadAdapters, selectAdapter } from './adapters.js'
import { updateStasticTab } from './ui.js'
import { login, logout } from './auth.js'

const propertyTool = document.querySelector('.silex-property-tool .main-container')
const logoutBtn = document.querySelector('#logout')

// ///////////////////////
// Start the app
// ///////////////////////
async function start() {
  container.parent.appendChild(container[TYPE_TEMPLATE])
  container.parent.appendChild(container[TYPE_CMS])
  propertyTool.appendChild(container.parent)

  const adapters = await loadAdapters()
  ;[TYPE_TEMPLATE, TYPE_CMS]
    .forEach(type => {
      state[type].adapters = adapters.filter(a => a.type === type)
    })
  silex.subscribeElements(() => updateStasticTab())
  silex.subscribeUi(() => updateStasticTab())
  silex.addDialog({
    id: TYPE_TEMPLATE,
    type: 'properties',
    data: { displayName: '{ }' }
  })
  silex.addDialog({
    id: TYPE_CMS,
    type: 'properties',
    data: { displayName: 'CMS' }
  })

  // ///////////////////////
  // listen to Silex events
  // ///////////////////////
  silex.subscribeSite((prev, next) => {
    // load custom components
    if (next.publicationPath && prev.publicationPath !== next.publicationPath) {
      const folder = silex.getSite().publicationPath.url
      silex.loadComponents([
        './prodotype/components', 
        './components', 
        folder + '/.silex/components/',
      ])
    }
    // select adapters
    const data = silex.getSite().data.stastic
    ;[TYPE_TEMPLATE, TYPE_CMS]
      .forEach(type => {
        const adapter = data ? state[type].adapters.find(a => a.name === data[type]) : null
        selectAdapter(type, adapter)
      })
  })
  /////////////////////
  // auth
  /////////////////////
  login().then(async user => {
    console.log('ok', {user})
  })
  .catch(e => {
    console.error('error', {e})
  })
  logoutBtn.onclick = () => logout()
}
start()
