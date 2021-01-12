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
      .filter(el => !!context.document.querySelector('.' + el.id))
      .forEach(el => {
        const doc = context.document

        // Children
        const domEl = doc.querySelector('.' + el.id)
        const domElContent = domEl.querySelector('.silex-element-content') || domEl
        if(el.data[adapterName].replaceChildren) {
          domElContent.innerHTML = el.data[adapterName].replaceChildren
        }
        // if(el.data[adapterName].beforeChildren) {
        //   domElContent.prepend(el.data[adapterName].beforeChildren)
        // }
        // if(el.data[adapterName].afterChildren) {
        //   domElContent.append(el.data[adapterName].afterChildren)
        // }

        // Element
        // query the element again and again as its ref will change
        const e = () => doc.querySelector('.' + el.id)
        if(el.data[adapterName].before) {
          e().outerHTML = el.data[adapterName].before + e().outerHTML
        }
        if(el.data[adapterName].after) {
          e().outerHTML += el.data[adapterName].after
        }
        // // this needs to be last as it will remove the element
        // if(el.data[adapterName].replace) {
        //   e().outerHTML = el.data[adapterName].replace
        // }
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
    return `
      <h3>Element</h3>
      <label for="before">Before Element</label><br/><br/>
      <textarea class="full-width resizable" id="before" name="before" placeholder="Template to add before the element during publication"></textarea><br/><br/>
      <!--
      <label for="replace">Replace Element</label><br/><br/>
      <textarea class="full-width resizable" id="replace" name="replace" placeholder="Template to replace the element during publication"></textarea><br/><br/>
      -->
      <label for="after">After Element</label><br/><br/>
      <textarea class="full-width resizable" id="after" name="after" placeholder="Template to add after the element during publication"></textarea><br/><br/>

      <h3>Children</h3>
      <!--
      <label for="before-children">Before Children</label><br/><br/>
      <textarea class="full-width resizable" id="beforeChildren" name="beforeChildren" placeholder="Template to add before the element's children during publication"></textarea><br/><br/>
      -->
      <label for="replaceChildren">Replace Children</label><br/><br/>
      <textarea class="full-width resizable" id="replaceChildren" name="replaceChildren" placeholder="Template to replace the element's children during publication"></textarea><br/><br/>
      <!--
      <label for="afterChildren">After Children</label><br/><br/>
      <textarea class="full-width resizable" id="afterChildren" name="afterChildren" placeholder="Template to add after the element's children during publication"></textarea><br/><br/>
      -->
    `
  }
}

function decodeHTMLEntities(text) {
  const entities = [['amp', '&'], ['apos', '\''], ['#x27', '\''], ['#x2F', '/'], ['#39', '\''], ['#47', '/'], ['lt', '<'], ['gt', '>'], ['nbsp', ' '], ['quot', '"']]
  entities.forEach((entity) => text = text.replace(new RegExp('&' + entity[0] + ';', 'g'), entity[1]))
  return text
}
