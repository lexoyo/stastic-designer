const {Api} = require('silex-website-builder')
const yaml = require('js-yaml')

module.exports = function(unifile) {
    this.unifile = unifile;
};

module.exports.prototype.getOptions = function(session) {
  return {
    name: 'forestry',
    displayName: 'Forestry',
    pleaseCreateAVhost: 'Generate forestry front matter templates (1 per silex page)',
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

module.exports.prototype.finalizePublication = (context, onStatus) => {}

module.exports.toForestryTemplates = (data) => {
  return data.pages.map(page => ({
    name: page.id.split('page-').slice(1).join('page-') + '.yml',
    label: page.displayName,
    fields: data.elements
    .filter(el => !Api.isBody(el, data.elements) &&
      (el.pageNames.length === 0 || el.pageNames.includes(page.id)) &&
      (!Api.getFirstPagedParent(el, data.elements) ||
      Api.getFirstPagedParent(el, data.elements).pageNames.includes(page.id)
    ))
    .filter(el => !!el.data.forestry && !!el.data.forestry.type)
    .map(el => el.data.forestry)
    .map(({type}) => ({
      type,
    }))
  }))
}

module.exports.prototype.beforeWrite = (context, actions) => {
  return module.exports.toForestryTemplates(context.data)
    .map(template => ({
      name: 'writefile',
      path: context.to.path + '/.forestry/front_matter/templates/' + template.name,
      content: '---\n' + yaml.dump(template),
    }))
}

