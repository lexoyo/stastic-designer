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


export function updateEditor(type) {
  const selection = silex.getSelectedElements()
  if (state[type].adapter) {
    const form = container[type].querySelector('form')
    const data = getAppData(selection)[state[type].adapter.name]
    Array.from(form.querySelectorAll('[name]'))
      .forEach(el => el.setAttribute('data-selection-start', el.selectionStart))
    Array.from(form.querySelectorAll('[name]'))
      .forEach(el => el.value = '')
    if (data) {
      Object.entries(data).forEach(([name, value]) => {
        const el = form.querySelector(`[name=${name}]`)
        if (el) {
          el.value = value
          const carret = parseInt(el.getAttribute('data-selection-start'))
          el.selectionStart = el.selectionEnd = carret
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
    value: el.value,
  }))
  .reduce((result, {name, value}) => {
    result[name] = value
    return result
  }, {})
}
export function updateData(adapter, data) {
  const selection = silex.getSelectedElements()
  const el = selection[0]
  if (!deepEqual(data, el.data[adapter.name])) {
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
}

