module.exports = function(unifile) {
    this.unifile = unifile;
};

module.exports.prototype.getOptions = function(session) {
  return {
    name: 'jekyll',
    displayName: 'Jekyll layout',
    pleaseCreateAVhost: 'create a Jekyll layout.',
    afterPublishMessage: 'AFTER PUBLISH MESSAGE',
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

module.exports.prototype.finalizePublication = (context, onStatus) => {
  console.log('>>>>>>>>>>>>>>>>>>> TODO: use context.data.elements to build forestry fm template')
}
module.exports.prototype.beforeWrite = (context, actions) => {
  return actions.map((action) => {
    // if (action.name === 'writefile' && action.path.endsWith('/styles.css')) {
    //   // for jekyll
    //   return {
    //     ...action,
    //     content: '---\n---' + action.content.toString('utf-8'),
    //   }
    // } else 
    if (action.name === 'writefile' && action.path.endsWith('.html')) {
      // leave templates unescaped
      return {
        ...action,
        content: action.content.replace(/<silex-template>((.|\n)+?)<\/silex-template>/g, (match, p1) => decodeHTMLEntities(p1)),
      }
    }
    return action
  })
}
module.exports.prototype.getPermalink = (pageName) => pageName === 'index.html' ? '/' : pageName

// for jekyll
module.exports.prototype.getHtmlFolder = (context, defaultFolder) => '_layouts'
module.exports.prototype.getRootUrl = (context, rootUrl) => '{{ site.url }}{{ site.baseurl }}/'

function decodeHTMLEntities(text) {
  const entities = [['amp', '&'], ['apos', '\''], ['#x27', '\''], ['#x2F', '/'], ['#39', '\''], ['#47', '/'], ['lt', '<'], ['gt', '>'], ['nbsp', ' '], ['quot', '"']]
  entities.forEach((entity) => text = text.replace(new RegExp('&' + entity[0] + ';', 'g'), entity[1]))
  return text
}
