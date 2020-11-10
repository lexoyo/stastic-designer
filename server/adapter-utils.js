const fs = require('fs')

module.exports = {
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
}

function fromAdapter(adapter) {
  const AdapterClass = function(unifile) {
    this.unifile = unifile;
  }
  // prevent page name added to page title (the page name here is a layout name)
  AdapterClass.prototype.getOptions = function(session) {
    return {
      name: adapter.info.name,
      displayName: adapter.info.displayName,
      pleaseCreateAVhost: '',
      afterPublishMessage: '',
      isLoggedIn: true,
      authorizeUrl: null,
      dashboardUrl: null,
      pleaseCreateAVhost: null,
      vhostsUrl: null,
      buyDomainUrl: null,
      skipVhostSelection: true,
      skipFolderSelection: false,
      afterPublishMessage: null,
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
  return AdapterClass
}

function decodeHTMLEntities(text) {
  const entities = [['amp', '&'], ['apos', '\''], ['#x27', '\''], ['#x2F', '/'], ['#39', '\''], ['#47', '/'], ['lt', '<'], ['gt', '>'], ['nbsp', ' '], ['quot', '"']]
  entities.forEach((entity) => text = text.replace(new RegExp('&' + entity[0] + ';', 'g'), entity[1]))
  return text
}