import {html, render} from './lit-html/lit-html.js'
import {unsafeHTML} from './lit-html/directives/unsafe-html.js'

(async function() {
  // constants
  const TYPE_CMS = 'TYPE_CMS'
  const TYPE_TEMPLATE = 'TYPE_TEMPLATE'

  // global properties
  const propertyTool = document.querySelector('.silex-property-tool .main-container')
  const container = {
    parent: document.createElement('div'),
    [TYPE_TEMPLATE]: document.createElement('div'),
    [TYPE_CMS]: document.createElement('div'),
  }
  container.parent.appendChild(container[TYPE_TEMPLATE])
  container.parent.appendChild(container[TYPE_CMS])

  const state = {
    [TYPE_TEMPLATE]: {
      adapters: [],
      adapter: null,
    },
    [TYPE_CMS]: {
      adapters: [],
      adapter: null,
    },
  }
  propertyTool.appendChild(container.parent)

  // ///////////////////////
  // UI functions
  // ///////////////////////
  function redraw(type, {adapters, adapter}) {
    console.log('redraw', {type, adapter, adapters})
    return html`<div class="stastic-property">
      <style>
        .stastic-property .full-width { min-width: 100%; min-height: 100px; }
        .stastic-property .resizable { resize: vertical; }
        .stastic-property textarea { 
          background-color: #393939;
          border: 1px solid #2A2A2A;
          border-radius: 2px;
          box-sizing: border-box;
          padding: 0 5px;
          color: white;
        }
      </style>
 
      <label for="adapter-select">Adapter</label>
      <select id="adapter-select" @change=${e => selectAdapter(type, adapters[e.target.selectedIndex-1])}>
        <option ?selected=${!adapter}></option>
        ${adapters.map(a => html`
          <option id="${a.name}" ?selected=${adapter && a.name === adapter.name}>${a.displayName}</option>
        `)}
      </select>
      <h2>${adapter ? adapter.displayName : ''}</h2>
      <form
        @keyup=${e => updateData(adapter, getDataFromForm(e.target.form))}
        @blur=${e => updateData(adapter, getDataFromForm(e.target.form))}
        @change=${e => updateData(adapter, getDataFromForm(e.target.form))}
        >
        ${adapter ? unsafeHTML(adapter.form) : ''}
      </form>
    </div>`
  }

  function updateStasticTab() {
    ;[TYPE_TEMPLATE, TYPE_CMS]
      .forEach(type => {
        if(silex.isDialogVisible(type, 'properties')) {
          showEditor(type)
          updateEditor(type)
        } else {
          hideEditor(type)
        }
      })
  }

  function showEditor(type) {
    container[type].style.display = ''
  }

  function hideEditor(type) {
    container[type].style.display = 'none'
  }
  function selectAdapter(type, selected=null) {
    state[type].adapter = selected
    render(redraw(
      type,
      state[type],
    ), container[type])
    updateEditor(type)
    const site = silex.getSite()
    if (!site.data.stastic ||
      (site.data.stastic[type] !== selected && // case of null === null
        site.data.stastic[type] !== (selected || {}).name)) {
      silex.updateSite({
        ...site,
        data: {
          ...site.data,
          stastic: {
            ...site.data.stastic,
            [type]: selected ? selected.name : null,
          },
        },
      })
    }
  }

  // ///////////////////////
  // Data functions
  // ///////////////////////
  function getAppData(selection) {
    if (selection && selection[0] && selection[0].data) {
      return selection[0].data
    }
    return {}
  }

  function updateEditor(type) {
    const selection = silex.getSelectedElements()
    if (state[type].adapter) {
      const form = container[type].querySelector('form')
      const data = getAppData(selection)[state[type].adapter.name]
      Array.from(form.querySelectorAll('[name]')).forEach(el => el.value = '')
      if (data) {
        Object.entries(data).forEach(([name, value]) => {
          const el = form.querySelector(`[name=${name}]`)
          if (el) el.value = value
          else console.error('Did not find the input with name', name, '(', value, ')')
        })
      }
    }
  }

  function getDataFromForm(form) {
    return Array.from(form.elements)
    .map(el => ({
      name: el.name,
      value: el.value,
    }))
    .reduce((result, {name, value}) => {
      result[name] = value
      return result
    }, {})
  }
  function updateData(adapter, data) {
    const selection = silex.getSelectedElements()
    const el = selection[0]
    silex.updateElements([{
      ...el,
      data: {
        ...el.data,
        [adapter.name]: {
          ...el.data[adapter.name],
          ...data,
        },
      },
    }])
  }

  // ///////////////////////
  // Adapters functions
  // ///////////////////////
  async function loadAdapters() {
    const response = await fetch('/adapter/')
    return response.json()
  }
  // ///////////////////////
  // Start the app
  // ///////////////////////
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
      data: { displayName: '&lt;/&gt;' }
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
})()

