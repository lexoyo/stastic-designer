import { container, state } from './globals.js'
import { redraw } from './ui.js'
import { render } from '../lit-html/lit-html.js'
import { deepEqual } from './utils.js'

export async function loadAdapters() {
  const response = await fetch('./adapter/')
  return response.json()
}

export function selectAdapter(type, selected=null) {
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

// update the form UI with fresh data
export function updateEditor(type) {
  if (state[type].adapter) {
    const form = container[type].querySelector('form')
    const elementData = getElementData(silex.getSelectedElements())[state[type].adapter.name]
    const pageData = getPageData(silex.getCurrentPage())[state[type].adapter.name]
    Array.from(form.querySelectorAll('[name]'))
      .forEach(el => el.setAttribute('data-selection-start', el.selectionStart))
    // remove all values from form
    Array.from(form.querySelectorAll('[name]'))
      .forEach(el => {
        el.value = ''
        el.checked = false
      })
    if (elementData) {
      Object.entries(elementData)
      .forEach(data => updateEditorField(form, data))
    }
    if (pageData) {
      Object.entries(pageData)
      .forEach(data => updateEditorField(form, data))
    }
  }
}

function updateEditorField(form, [name, value]) {
  const el = form.querySelector(`[name=${name}]`)
  if (el) {
    if (typeof value === 'boolean') el.checked = value
    else {
      el.value = value
      el.checked = false
    }
    if (el.selectionStart !== null) {
      // for text inputs
      const carret = parseInt(el.getAttribute('data-selection-start'))
      el.selectionStart = el.selectionEnd = carret
    }
  } else console.error('Did not find the input with name', name, '(', value, ')')
}

export function getPageData(page) {
  if (page && page.data) {
    return page.data
  }
  return {}
}

export function getElementData(selection) {
  if (selection && selection[0] && selection[0].data) {
    return selection[0].data
  }
  return {}
}

export function getDataFromForm(form) {
  return Array.from(form.elements)
  .map(el => ({
    name: el.name,
    value: el.checked || el.value,
    model: el.getAttribute('data-model') || 'element',
  }))
  .reduce((models, {name, value, model}) => {
    models[model][name] = value
    return models
  }, {element: {}, page: {}})
}

// update the selected element with data from the UI
export function updateData(adapter, {element, page}) {
  // Update page data
  const p = silex.getCurrentPage()
  // init page data (it should be in silex)
  p.data = p.data || {}
  // build the new data for the page
  const newPage = Object.values(page).filter(v => !!v).length ? {
    ...p.data[adapter.name],
    ...page,
  } : null
  // update the page
  if (!deepEqual(newPage, p.data[adapter.name])) {
    silex.updatePages([{
      ...p,
      data: {
        ...p.data,
        [adapter.name]: newPage,
      },
    }])
  }

  // Update selected element's data
  const selection = silex.getSelectedElements()
  const el = selection[0]
  const newElement = Object.values(element).filter(v => !!v).length ? {
    ...el.data[adapter.name],
    ...element,
  } : null

  if (!deepEqual(newElement, el.data[adapter.name])) {
    silex.updateElements([{
      ...el,
      data: {
        ...el.data,
        [adapter.name]: newElement,
      },
    }])
  }
}

