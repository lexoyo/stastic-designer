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
initListeners(ui, applyFMTemplate, applyTemplate)
silex.subscribeElements(() => updateForestryApp())
silex.subscribeUi(() => updateForestryApp())

function initListeners(allUis, applyFMTemplate, applyTemplate) {
  allUis.fmTemplateInput.onchange = applyFMTemplate 
  allUis.nameInput.onchange = applyFMTemplate 
  allUis.labelInput.onchange = applyFMTemplate 
  allUis.defaultInput.onchange = applyFMTemplate 
  allUis.beforeInput.onchange = applyTemplate
  allUis.replaceInput.onchange = applyTemplate
  allUis.afterInput.onchange = applyTemplate
}
function initUi() {
  const maybeContainer = editor.querySelector('.forestry-app')
  if(!maybeContainer) {
    // create the container
    const containerEl = document.createElement('section')
    containerEl.classList.add('forestry-app')
    // create the UI
    containerEl.innerHTML = `
      <style>
        .full-width { min-width: 100%; min-height: 100px; }
        .resizable { resize: vertical; }
      </style>
      <h1>Forestry template</h1>
      <label for="type">Forestry Front Matter Template</label>
      <select id="type" data-attr-name="type">
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
      
      <h1>Template Published</h1>
      <label for="before">Before</label><br/><br/>
      <textarea class="full-width resizable" id="before" data-attr-name="before" placeholder="Template to add before the element during publication"></textarea><br/><br/>
      <label for="replace">Replace</label><br/><br/>
      <textarea class="full-width resizable" id="replace" data-attr-name="replace" placeholder="Template to replace the element during publication"></textarea><br/><br/>
      <label for="after">After</label><br/><br/>
      <textarea class="full-width resizable" id="after" data-attr-name="after" placeholder="Template to add after the element during publication"></textarea><br/><br/>
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
    fmTemplateInput: containerEl.querySelector('[data-attr-name=type]'),
    nameInput: containerEl.querySelector('[data-attr-name=name]'),
    labelInput: containerEl.querySelector('[data-attr-name=label]'),
    defaultInput: containerEl.querySelector('[data-attr-name=default]'),
    beforeInput: containerEl.querySelector('[data-attr-name=before]'),
    replaceInput: containerEl.querySelector('[data-attr-name=replace]'),
    afterInput: containerEl.querySelector('[data-attr-name=after]'),

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
    return selection[0].data
  }
  return {}
}

function updateEditor(selection) {
  const {forestry, template} = getAppData(selection)
  if(forestry) {
    ui.fmTemplateInput.value = forestry.type
    ui.nameInput.disabled = false
    ui.nameInput.value = forestry.name
    ui.labelInput.disabled = false
    ui.labelInput.value = forestry.label
    ui.defaultInput.disabled = false
    ui.defaultInput.value = forestry.default
  } else {
    ui.fmTemplateInput.value = ''
    ui.nameInput.disabled = true
    ui.nameInput.value = ''
    ui.labelInput.disabled = true
    ui.labelInput.value = ''
    ui.defaultInput.disabled = true
    ui.defaultInput.value = ''
  }
  if(template) {
    ui.beforeInput.disabled = false
    ui.beforeInput.value = template.before || ''
    ui.replaceInput.disabled = false
    ui.replaceInput.value = template.replace || ''
    ui.afterInput.disabled = false
    ui.afterInput.value = template.after || ''
  } else {
    ui.beforeInput.value = ''
    ui.replaceInput.value = ''
    ui.afterInput.value = ''
  }
}

function showEditor() {
  ui.containerEl.style.display = ''
}

function hideEditor() {
  ui.containerEl.style.display = 'none'
}

function applyTemplate() {
  const selection = silex.getSelectedElements()
  const el = selection[0]
  silex.updateElements([{
    ...el,
    data: {
      ...el.data,
      // data used by the hosting provider to generate templates
      template: {
        ...el.data.template,
        before: ui.beforeInput.value || '',
        replace: ui.replaceInput.value || '',
        after: ui.afterInput.value || '',
      },
    },
  }])
}

function applyFMTemplate() {
  const selection = silex.getSelectedElements()
  const el = selection[0]
  // const template = ui.fmTemplateInput.value
  // const data = (() => {
  //   const component = silex.getUi().components[template]
  //   if(component && component.props.find(p => p.name === 'preview')) {
  //     // Convert to an existing component
  //     return {
  //       ...el.data,
  //       component: {
  //         templateName: template,
  //         data: {
  //           preview: el.innerHtml,
  //         }
  //       },
  //     }
  //   }
  //   // convert to a generic template + forestry
  //   return {
  //     ...el.data,
  //     // data used by the hosting provider to generate forestry FM templates
  //     forestry: {
  //       ...el.data.forestry,
  //       type: ui.fmTemplateInput.value,
  //       name: el.id,
  //       label: el.type,
  //       default: el.innerHtml,
  //     },
  //     // data for silex component (+ menu) 
  //     component: {
  //       templateName: 'template', // name of the generic template component
  //       data: {
  //         template: `{% include '${template}.njk' %}`,
  //         preview: el.innerHtml,
  //       }
  //     },
  //   }
  // })()
  const reset = ui.fmTemplateInput.value === ''
  silex.updateElements([{
    ...el,
    data: {
      ...el.data,
      // data used by the hosting provider to generate forestry FM templates
      forestry: {
        ...el.data.forestry,
        type: reset ? '' : ui.fmTemplateInput.value,
        name: reset ? '' : ui.nameInput.value || el.id,
        label: reset ? '' : ui.labelInput.value || el.type,
        default: reset ? '' : ui.defaultInput.value || el.innerHtml,
      },
    },
  }])
}
