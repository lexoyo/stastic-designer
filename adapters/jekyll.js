const {getDefaultPage, replaceLegacyTemplates, insertTemplates} = require('../server/adapter-utils')

module.exports = function(unifile) {
  return {
    info: {
      name: 'jekyll',
      displayName: 'Jekyll layouts',
    },
    beforeSplit: async function(context, actions) {
      return insertTemplates(context, actions)
    },
    beforeWrite: function(context, actions) {
      return replaceLegacyTemplates(context, actions)
        .map((action) => {
          if (action.name === 'writefile' && action.path.endsWith('/styles.css')) {
            return {
              ...action,
              content: '---\n---' + action.content.toString('utf-8'),
            }
          }
          return action
        })
    },
    getDefaultPage: function(context) {
      return getDefaultPage(context)
    },
    getHtmlFolder: function(context, defaultFolder) {
      return '_layouts' // TODO: read from config
    },
    getRootUrl: function(context, rootUrl) {
      return '{{ site.url }}{{ site.baseurl }}/'
    }
  }
}
