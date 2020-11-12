const {TYPE_TEMPLATE, TYPE_CMS, replaceLegacyTemplates} = require('./adapter-utils')

module.exports = class HostingProvider {
  constructor(unifile) {
    this.unifile = unifile
    this.adapters = []
  }
  addAdapter(adapter) {
    this.adapters = this.adapters.concat(adapter)
  }
  getAdapterName(context, type) {
    return (context.data.site.data.stastic || {})[type]
  }
  getAdapter(type, name) {
    const adapter = this.adapters.find(a => a.info.type === type && a.info.name === name)
    return adapter
  }
  getAdaptersFromContext(context) {
    const [template, cms] = [TYPE_TEMPLATE, TYPE_CMS].map(type => this.getAdapter(type, this.getAdapterName(context, type)))
    return {
      template,
      cms,
    }
  }
  getOptions(session) {
    return {
      name: 'stastic',
      displayName: 'Stastic',
      isLoggedIn: true,
      skipVhostSelection: true,
      skipFolderSelection: false,
    }
  }
  finalizePublication(context, onStatus) {
  }
  getPageTitle(defaultTitle, context) {
    return defaultTitle
  }
  async beforeSplit(context, actions) {
    await Promise.all(
      [TYPE_TEMPLATE, TYPE_CMS]
      .map(type => {
        const data = this.getAdapterName(context, type)
        if (data) {
          const adapter = this.getAdapter(type, data)
          if (adapter && adapter.beforeSplit) {
            return adapter.beforeSplit(context, actions)
          }
        }
        return null
      })
    )
  }
  beforeWrite(context, actions) {
    // backward compat
    const bcActions = replaceLegacyTemplates(context, actions)

    // hook the actions
    return [TYPE_TEMPLATE, TYPE_CMS]
      .reduce((actions_, type) => {
        const name = this.getAdapterName(context, type)
        if (name) {
          const adapter = this.getAdapter(type, name)
          return adapter && adapter.beforeWrite ? 
            // with hook
            adapter.beforeWrite(context, actions_) :
            // original actions
            actions_
        }
        return actions_
      }, bcActions)
  }
  getDefaultPageFileName(context, data) {
    const {template, cms} = this.getAdaptersFromContext(context)
    if (template && template.getDefaultPageFileName) return template.getDefaultPageFileName(context, data)
    if (cms && cms.getDefaultPageFileName) return cms.getDefaultPageFileName(context, data)
    return context.data.pages[0].id + '.html'
  }
  getHtmlFolder() {
    return '_layouts' // TODO: add context in Silex to this hook
  }
  getRootUrl(context, baseUrl) {
    const {template, cms} = this.getAdaptersFromContext(context)
    if (template && template.getRootUrl) return template.getRootUrl(context, baseUrl)
    if (cms && cms.getRootUrl) return cms.getRootUrl(context, baseUrl)
    return null
  }
  getPermalink(pageName, context) {
    const {template, cms} = this.getAdaptersFromContext(context)
    if (template && template.getPermalink) return template.getPermalink(pageName, context)
    if (cms && cms.getPermalink) return cms.getPermalink(pageName, context)
    return pageName.replace(new RegExp('^page-'), '')
  }
}
