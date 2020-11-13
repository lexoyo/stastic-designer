import { TYPE_CMS, TYPE_TEMPLATE, container } from './globals.js'
import { html } from '../lit-html/lit-html.js'
import {unsafeHTML} from '../lit-html/directives/unsafe-html.js'
import { updateData, getDataFromForm, selectAdapter, updateEditor } from './adapters.js'

export function redraw(type, {adapters, adapter}) {
  console.log('redraw', {type, adapters, adapter})
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

export function updateStasticTab() {
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
