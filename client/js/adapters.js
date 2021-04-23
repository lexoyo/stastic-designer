import { container, state } from './globals.js'
import { redraw } from './ui.js'
import { render } from '/lit-html/lit-html.js'
import { deepEqual } from './utils.js'

export async function loadAdapters() {
  const response = await fetch('/adapter/')
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
    const data = getAppData(silex.getSelectedElements())[state[type].adapter.name]
    Array.from(form.querySelectorAll('[name]'))
      .forEach(el => el.setAttribute('data-selection-start', el.selectionStart))
    Array.from(form.querySelectorAll('[name]'))
      .forEach(el => {
        el.value = ''
        el.checked = false
      })
    if (data) {
      Object.entries(data).forEach(([name, value]) => {
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
      })
    }
  }
}

export function getAppData(selection) {
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
  }))
  .reduce((result, {name, value}) => {
    result[name] = value
    return result
  }, {})
}

// update the selected element with data from the UI
export function updateData(adapter, data) {
  const selection = silex.getSelectedElements()
  const el = selection[0]
  const newData = Object.values(data).filter(v => !!v).length ? {
    ...el.data[adapter.name],
    ...data,
  } : null

  if (!deepEqual(data, el.data[adapter.name])) {
    silex.updateElements([{
      ...el,
      data: {
        ...el.data,
        [adapter.name]: newData,
      },
    }])
  }
}

