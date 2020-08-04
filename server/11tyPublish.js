const Base = require('./PublishBase')

module.exports = function(unifile) {
    this.unifile = unifile;
};

module.exports.prototype = new Base()

module.exports.prototype.getOptions = function(session) {
  return {
    name: 'eleventy',
    displayName: '11ty layout',
    pleaseCreateAVhost: 'create an 11ty layout.',
    afterPublishMessage: 'Publication success',
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
};

module.exports.prototype.beforeWrite = (context, actions) => {
  return Base.prototype.beforeWrite.call(this, context, actions)
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
}
