import { TYPE_CMS, TYPE_TEMPLATE, container, state } from './globals.js'
import { loadAdapters, selectAdapter } from './adapters.js'
import { updateStasticTab } from './ui.js'

const propertyTool = document.querySelector('.silex-property-tool .main-container')

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
      const path = silex.getSite().file.url.split('/').slice(0, -1).join('/')
      silex.loadComponents([
        './prodotype/components', 
        './components', 
        path + '/components', 
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
}
start()
