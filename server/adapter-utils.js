const fs = require('fs')

module.exports = {
  TYPE_TEMPLATE: 'TYPE_TEMPLATE',
  TYPE_CMS: 'TYPE_CMS',
  listAdapters: (path) => {
    return fs.readdirSync(path)
  },
  createAdapterClass: (path, unifile) => {
    const adapter = require(path)
    return adapter(unifile)
  },
  insertTemplates: async (context, adapterName) => {
    context.data.elements
      .filter(el => !!el.data[adapterName])
      .forEach(el => {
        const doc = context.document
        const domEl = doc.querySelector('.' + el.id)
        const domElContent = domEl.querySelector('.silex-element-content') || domEl
        if(el.data[adapterName].replace) {
          el.innerHTML = domElContent.innerHTML = el.data[adapterName].replace
        }
        if(el.data[adapterName].before) {
          // FIXME: handle content element
          domElContent.innerHTML = el.data[adapterName].before + domElContent.innerHTML
        }
        if(el.data[adapterName].after) {
          // FIXME: handle content element
          domElContent.innerHTML += el.data[adapterName].after
        }
      })
  },
  replaceLegacyTemplates: (context, actions) => {
    return actions.map((action) => {
      if (action.name === 'writefile' && action.path.endsWith('.html')) {
        return {
          ...action,
          // leave templates unescaped and remove <silex-template> tags
          content: action.content.replace(/<silex-template>((.|\n)+?)<\/silex-template>/g, (match, p1) => decodeHTMLEntities(p1)),
        }
      }
      return action
    })
  },
  getTemplateForm() {
    return `<form>
      <label for="before">Before children</label><br/><br/>
      <textarea class="full-width resizable" id="before" name="before" placeholder="Template to add before the element during publication"></textarea><br/><br/>
      <label for="replace">Replace children</label><br/><br/>
      <textarea class="full-width resizable" id="replace" name="replace" placeholder="Template to replace the element during publication"></textarea><br/><br/>
      <label for="after">After children</label><br/><br/>
      <textarea class="full-width resizable" id="after" name="after" placeholder="Template to add after the element during publication"></textarea><br/><br/>
    </form>`
  }
}

function decodeHTMLEntities(text) {
  const entities = [['amp', '&'], ['apos', '\''], ['#x27', '\''], ['#x2F', '/'], ['#39', '\''], ['#47', '/'], ['lt', '<'], ['gt', '>'], ['nbsp', ' '], ['quot', '"']]
  entities.forEach((entity) => text = text.replace(new RegExp('&' + entity[0] + ';', 'g'), entity[1]))
  return text
}
