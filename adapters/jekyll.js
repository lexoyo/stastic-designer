const {replaceLegacyTemplates, insertTemplates, getTemplateForm, TYPE_TEMPLATE} = require('../server/adapter-utils')

const NAME = 'jekyll'

module.exports = function(unifile) {
  return {
    info: {
      name: NAME,
      displayName: 'Jekyll layouts',
      type: TYPE_TEMPLATE,
    },
    beforeSplit: async function(context, actions) {
      return insertTemplates(context, NAME)
    },
    beforeWrite: function(context, actions) {
      return actions
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
    getRootUrl: function(context, rootUrl) {
      return '{{ site.url }}{{ site.baseurl }}/'
    },
    getForm: function() {
      return getTemplateForm()
    },
  }
}
