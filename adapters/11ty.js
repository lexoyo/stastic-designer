const {getDefaultPage, insertTemplates, getTemplateForm, TYPE_TEMPLATE} = require('../server/adapter-utils')

const NAME = 'eleventy'

module.exports = function(unifile) {
  return {
    info: {
      name: NAME,
      displayName: '11ty layouts',
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
              content: `---
permalink: /css/styles.css
---
${action.content.toString('utf-8')}
`,
              path: action.path.replace(/\.css$/, '.liquid')
            }
          }
          return action
        })
    },
    getDefaultPage: function(context) {
      return getDefaultPage(context)
    },
    getRootUrl: function(context, rootUrl) {
      return '{{ site.url }}{{ site.baseurl }}/'
    },
    getForm: function() {
      return getTemplateForm()
    },
  }
}
