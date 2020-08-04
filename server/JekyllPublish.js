const Base = require('./PublishBase')

module.exports = function(unifile) {
    this.unifile = unifile;
};

module.exports.prototype = new Base()

module.exports.prototype.getOptions = function(session) {
  return {
    name: 'jekyll',
    displayName: 'Jekyll layout',
    pleaseCreateAVhost: 'create a Jekyll layout.',
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
        content: '---\n---' + action.content.toString('utf-8'),
      }
    }
    return action
  })
}
