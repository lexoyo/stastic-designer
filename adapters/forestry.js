const {Api} = require('silex-website-builder')
const yaml = require('js-yaml')

const {TYPE_CMS} = require('../server/adapter-utils')

module.exports = function(unifile) {
  return {
    info: {
      name: 'forestry',
      displayName: 'Forestry',
      type: TYPE_CMS,
    },
    beforeWrite: function(context, actions) {
      return actions.concat(toForestryTemplates(context.data)
        .map(template => ({
          name: 'writefile',
          path: context.to.path + '/.forestry/front_matter/templates/' + template.name,
          content: '---\n' + yaml.dump(template),
        })))
    },
    getForm() {
      return `<form>
        <label for="type">Forestry Front Matter Template</label>
        <select id="type" name="type">
          <option value=""></option>
          <option value="text">Text</option>
          <option value="textarea">Textarea</option>
          <option value="number">Number</option>
          <option value="toggle">Toggle</option>
          <option value="select">Select</option>
          <option value="datetime">Datetime</option>
          <option value="color">Color</option>
          <option value="tag_list">Tag List</option>
          <option value="list">List</option>
          <option value="file">File</option>
          <option value="image_gallery">Gallery</option>
        </select>
        <label>Name</label>
        <input type="text" name="name"></input>
        <label>Label</label>
        <input type="text" name="label"></input>
        <label>Default Value</label>
        <input type="text" name="default"></input>
      </form>`
    }
  }
}

function toForestryTemplates(data) {
  return data.pages.map(page => ({
    id: page.id.split('page-').slice(1).join('page-'),
    label: page.displayName,
    fields: data.elements
    .filter(el => !Api.isBody(el, data.elements) &&
      (el.pageNames.length === 0 || el.pageNames.includes(page.id)) &&
      (!Api.getFirstPagedParent(el, data.elements) ||
        Api.getFirstPagedParent(el, data.elements).pageNames.includes(page.id)
      ))
    .filter(el => !!el.data.forestry && !!el.data.forestry.type)
    .map(el => el.data.forestry)
    // handle special config of forestry fields
    .map(field => field.type === 'textarea' ? {
      ...field,
      config: {
        wysiwyg: true,
        schema: { format: 'html' },
      },
    } : field)
  }))
  // add name
    .map(page => ({
      ...page,
      name: page.id + '.yml',
    }))
  // add options to each page
    .map(page => ({
      ...page,
      hide_body: true,
      fields: page.fields.concat([{
        name: 'permalink',
        type: 'text',
        label: 'Permalink',
        config: {
          required: true,
        }
      }, {
        name: 'layout',
        type: 'text',
        hidden: true,
        label: 'layout',
        default: page.id,
        config: {
          required: true,
        }
      }]),
    }))
}
