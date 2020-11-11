import {html, render} from './lit-html/lit-html.js'
import {unsafeHTML} from './lit-html/directives/unsafe-html.js'

(async function() {
  const propertyTool = document.querySelector('.silex-property-tool .main-container')
  const container = document.createElement('div')
  const state = {
    adapters: [],
    adapter: null,
  }
  propertyTool.appendChild(container)
  // ///////////////////////
  // UI functions
  // ///////////////////////
  function redraw() {
    // create the UI
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
      <select id="adapter-select" @change=${e => selectAdapter(state.adapters[e.target.selectedIndex-1])}>
        <option></option>
        ${state.adapters.map(a => html`
          <option id="${a.name}" ?selected=${state.adapter && a.name === state.adapter.name}>${a.displayName}</option>
        `)}
      </select>
      <h2>${state.adapter ? state.adapter.displayName : ''}</h2>
      <form
        @keyup=${e => updateData(state.adapter, getDataFromForm(e.target.form))}
        @blur=${e => updateData(state.adapter, getDataFromForm(e.target.form))}
        @change=${e => updateData(state.adapter, getDataFromForm(e.target.form))}
        >
        ${state.adapter ? unsafeHTML(state.adapter.form) : ''}
      </form>
    </div>`
  }

  function updateStasticTab() {
    if(silex.isDialogVisible('stastic', 'properties')) {
      showEditor()
      updateEditor()
    } else {
      hideEditor()
    }
  }

  function showEditor() {
    container.style.display = ''
  }

  function hideEditor() {
    container.style.display = 'none'
  }
  function selectAdapter(selected=null) {
    state.adapter = selected
    render(redraw(), container)
    updateEditor()
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

  function updateEditor(selection) {
    const selection = silex.getSelectedElements()
    if (state.adapter) {
      const form = container.querySelector('form')
      const data = getAppData(selection)[state.adapter.name]
      Array.from(form.querySelectorAll('[name]')).forEach(el => el.value = '')
      console.log('xxxxxx', {selection, data, form})
      if (data) {
        Object.entries(data).forEach(([name, value]) => {
          const el = form.querySelector(`[name=${name}]`)
          if (el) el.value = value
          else console.error('Did not find the input with name', name, '(', value, ')')
        })
      }
    }

    // if(forestry) {
    //   ui.fmTemplateInput.value = forestry.type
    //   ui.nameInput.disabled = false
    //   ui.nameInput.value = forestry.name
    //   ui.labelInput.disabled = false
    //   ui.labelInput.value = forestry.label
    //   ui.defaultInput.disabled = false
    //   ui.defaultInput.value = forestry.default
    // } else {
    //   ui.fmTemplateInput.value = ''
    //   ui.nameInput.disabled = true
    //   ui.nameInput.value = ''
    //   ui.labelInput.disabled = true
    //   ui.labelInput.value = ''
    //   ui.defaultInput.disabled = true
    //   ui.defaultInput.value = ''
    // }
    // if(template) {
    //   ui.beforeInput.disabled = false
    //   ui.beforeInput.value = template.before || ''
    //   ui.replaceInput.disabled = false
    //   ui.replaceInput.value = template.replace || ''
    //   ui.afterInput.disabled = false
    //   ui.afterInput.value = template.after || ''
    // } else {
    //   ui.beforeInput.value = ''
    //   ui.replaceInput.value = ''
    //   ui.afterInput.value = ''
    // }
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
    console.log('updateData', {adapter, data})
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

  // function applyFMTemplate() {
  //   const selection = silex.getSelectedElements()
  //   const el = selection[0]
  //   const reset = ui.fmTemplateInput.value === ''
  //   silex.updateElements([{
  //     ...el,
  //     data: {
  //       ...el.data,
  //       // data used by the hosting provider to generate forestry FM templates
  //       forestry: {
  //         ...el.data.forestry,
  //         type: reset ? '' : ui.fmTemplateInput.value,
  //         name: reset ? '' : ui.nameInput.value || el.id,
  //         label: reset ? '' : ui.labelInput.value || el.type + ' ' + el.id,
  //         default: reset ? '' : ui.defaultInput.value || el.innerHtml,
  //       },
  //     },
  //   }])
  // }
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
  state.adapters = await loadAdapters()
  selectAdapter()
  silex.subscribeElements(() => updateStasticTab())
  silex.subscribeUi(() => updateStasticTab())
  silex.addDialog({
      id: 'stastic',
      type: 'properties',
      data: { displayName: '&lt;/&gt;' }
  })
  
  // ///////////////////////
  // listen to Silex events
  // ///////////////////////
  silex.subscribeSite((prev, next) => {
    if (next.publicationPath && prev.publicationPath !== next.publicationPath) {
      const folder = silex.getSite().publicationPath.url
      silex.loadComponents([
        './prodotype/components', 
        './components', 
        folder + '/.silex/components/',
      ])
    }
  })
})()

