// 11ty app
// load site components
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

// **
// Dynamic silex app
// This will add elements to the "parms" tab in Silex

// init 
const editor = document.querySelector('.silex-property-tool .main-container')
const ui = initUi()
initListeners(ui, applyFMTemplate)
silex.subscribeElements(() => updateForestryApp())
silex.subscribeUi(() => updateForestryApp())

function initListeners(allUis, cbk) {
  allUis.fmTemplateInput.onchange = cbk
  allUis.nameInput.onchange = cbk
  allUis.labelInput.onchange = cbk
  allUis.defaultInput.onchange = cbk
}
function initUi(cbk) {
  const maybeContainer = editor.querySelector('.forestry-app')
  if(!maybeContainer) {
    // create the container
    const containerEl = document.createElement('section')
    containerEl.classList.add('forestry-app')
    // create the UI
    containerEl.innerHTML = `
      <h3>Dynamic parameters</h3>
      <label>Forestry Front Matter Template</label>
      <select data-attr-name="fmTemplate">
        <option value=""></option>
        <option value="text">Text</option>
        <option value="textarea">Textarea</option>
        <option value="number">Number</option>
        <option value="toggle">Toggle</option>
        <option value="select">Select</option>
        <option value="datetime">Datetime</option>
        <option value="color">Color</option>
        <option value="tag_list">Tag List</option>
        <option value="list">List</option>
        <option value="file">File</option>
        <option value="image_gallery">Gallery</option>
      </select>
      <label>Name</label>
      <input type="text" data-attr-name="name"></input>
      <label>Label</label>
      <input type="text" data-attr-name="label"></input>
      <label>Default Value</label>
      <input type="text" data-attr-name="default"></input>
    `
    // add to the dom
    editor.appendChild(containerEl)
    // listeners
    return getUiElements(containerEl)
  }
  return getUiElements(maybeContainer)
}

function getUiElements(containerEl) {
  return { 
    containerEl,
    fmTemplateInput: containerEl.querySelector('[data-attr-name=fmTemplate]'),
    nameInput: containerEl.querySelector('[data-attr-name=name]'),
    labelInput: containerEl.querySelector('[data-attr-name=label]'),
    defaultInput: containerEl.querySelector('[data-attr-name=default]'),
  }
}

function updateForestryApp() {
  const selection = silex.getSelectedElements()
  if(silex.getUi().currentToolbox === 'params') {
    showEditor()
    updateEditor(selection)
  } else {
    hideEditor()
  }
}

function getAppData(selection) {
  if (selection && selection[0] && selection[0].data) {
    return selection[0].data.forestry
  }
  return null
}

function updateEditor(selection) {
  const data = getAppData(selection)
  if(data) {
    ui.fmTemplateInput.value = data.fmTemplate
    ui.nameInput.disabled = false
    ui.nameInput.value = data.name
    ui.labelInput.disabled = false
    ui.labelInput.value = data.label
    ui.defaultInput.disabled = false
    ui.defaultInput.value = data.default
  } else {
    ui.fmTemplateInput.value = ''
    ui.nameInput.disabled = true
    ui.nameInput.value = ''
    ui.labelInput.disabled = true
    ui.labelInput.value = ''
    ui.defaultInput.disabled = true
    ui.defaultInput.value = ''
  }
}

function showEditor() {
  ui.containerEl.style.display = ''
}

function hideEditor() {
  ui.containerEl.style.display = 'none'
}

function applyFMTemplate() {
  const selection = silex.getSelectedElements()
  const el = selection[0]
  silex.updateElements([{
    ...el,
    data: {
      ...el.data,
      // data used by the hosting provider to generate forestry FM templates
      forestry: {
        ...el.data.forestry,
        fmTemplate: ui.fmTemplateInput.value,
        name: el.id,
        label: el.type,
        default: el.innerHtml,
      },
      // data for silex component (+ menu) 
      component: {
        templateName: 'template', // name of the generic template component
        data: {
          template: `{% include '${ui.fmTemplateInput.value}.njk'}`,
          preview: el.innerHtml,
        }
      },
    }
  }])
}
