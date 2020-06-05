module.exports = function(unifile) {
    this.unifile = unifile;
};

module.exports.prototype.getOptions = function(session) {
  return {
    name: 'jekyll',
    displayName: 'Jekyll layout',
    authorizeUrl: '',
    dashboardUrl: '',
    pleaseCreateAVhost: 'create a Jekyll layout.',
    vhostsUrl: '', // route created by silex automatically
    buyDomainUrl: '',
    skipVhostSelection: true,
    skipFolderSelection: true,
    afterPublishMessage: '',
  };
};

const WEBSITE_FOLDER_NAME = 'Website';
module.exports.prototype.getVhosts = async function(session) {
  return [{
    name: WEBSITE_FOLDER_NAME,
    // domainUrl: `/hosting/custom-provider/vhost/get`,
    skipDomainSelection: true,
    publicationPath: {
      //absPath: `/ce/github/get/${ WEBSITE_FOLDER_NAME }/gh-pages`,
      name: WEBSITE_FOLDER_NAME,
      folder: WEBSITE_FOLDER_NAME,
      path: `${ WEBSITE_FOLDER_NAME }/`,
      service: 'custom-service',
      url: `/ce/custom-service/get/Website/`
    }
  }]
}
module.exports.prototype.getDefaultPageFileName = () => null
module.exports.prototype.getHtmlFolder = (context, defaultFolder) => '_layouts'
module.exports.prototype.getRootUrl = (context, rootUrl) => '{{ site.url }}{{ site.baseurl }}/'
module.exports.prototype.beforeWrite = (context, actions) => {
  const action = actions.find((a) => a.name === 'writefile' && a.path.endsWith('/styles.css'))
  if (action) {
    action.content = '---\n---' + action.content.toString('utf-8')
  } else {
    throw new Error('Could not make the file style.css a Jekyll file with front matter')
  }
  return actions
}
module.exports.prototype.getPermalink = (pageName) => pageName === 'index.html' ? '/' : pageName

