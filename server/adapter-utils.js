const fs = require('fs')

module.exports = {
  TYPE_TEMPLATE: 'TYPE_TEMPLATE',
  TYPE_CMS: 'TYPE_CMS',
  listAdapters: (path) => {
    return fs.readdirSync(path)
  },
  createAdapterClass: (path, unifile) => {
    const adapter = require(path)
    const AdapterClass = fromAdapter(adapter(unifile))
    return new AdapterClass(unifile)
  },
  insertTemplates: async (context) => {
    context.data.elements
      .filter(el => !!el.data.template)
      .forEach(el => {
        const doc = context.document
        const domEl = doc.querySelector('.' + el.id)
        const domElContent = domEl.querySelector('.silex-element-content') || domEl
        if(el.data.template.replace) {
          el.innerHTML = domElContent.innerHTML = el.data.template.replace
        }
        if(el.data.template.before) {
          // FIXME: handle content element
          domElContent.innerHTML = el.data.template.before + domElContent.innerHTML
        }
        if(el.data.template.after) {
          // FIXME: handle content element
          domElContent.innerHTML += el.data.template.after
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
  getDefaultPage: (context) => context.data.pages[0].id + '.html',
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

function fromAdapter(adapter) {
  const AdapterClass = function(unifile) {
    this.unifile = unifile;
  }
  // prevent page name added to page title (the page name here is a layout name)
  AdapterClass.prototype.getOptions = function(session) {
    return {
      isLoggedIn: true,
      skipVhostSelection: true,
      skipFolderSelection: false,
      ...adapter.info,
    };
  }
  AdapterClass.prototype.finalizePublication = adapter.finalizePublication ? adapter.finalizePublication : (context, onStatus) => {} // finalizePublication is required
  AdapterClass.prototype.getPageTitle = adapter.getPageTitle ? adapter.getPageTitle : (defaultTitle, context) => defaultTitle
  AdapterClass.prototype.beforeSplit = adapter.beforeSplit
  AdapterClass.prototype.beforeWrite = adapter.beforeWrite
  AdapterClass.prototype.getDefaultPageFileName = adapter.getDefaultPage
  AdapterClass.prototype.getHtmlFolder = adapter.getHtmlFolder
  AdapterClass.prototype.getRootUrl = adapter.getRootUrl
  AdapterClass.prototype.getPermalink = adapter.getPermalink
  AdapterClass.prototype.getPageLink = adapter.getPageLink
  AdapterClass.prototype.getJsFolder = adapter.getJsFolder
  AdapterClass.prototype.getCssFolder = adapter.getCssFolder
  AdapterClass.prototype.getAssetsFolder = adapter.getAssetsFolder
  AdapterClass.prototype.getForm = adapter.getForm
  return AdapterClass
}

function decodeHTMLEntities(text) {
  const entities = [['amp', '&'], ['apos', '\''], ['#x27', '\''], ['#x2F', '/'], ['#39', '\''], ['#47', '/'], ['lt', '<'], ['gt', '>'], ['nbsp', ' '], ['quot', '"']]
  entities.forEach((entity) => text = text.replace(new RegExp('&' + entity[0] + ';', 'g'), entity[1]))
  return text
}
