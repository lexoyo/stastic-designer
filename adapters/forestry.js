const {Api} = require('silex-website-builder')
const yaml = require('js-yaml')

const {TYPE_CMS} = require('../server/adapter-utils')

const mapTextAreas = field => field.type === 'textarea' ? {
  ...field,
  config: {
    wysiwyg: true,
    schema: { format: 'html-blocks' },
  },
} : field

const mapColor = field => field.type === 'color' ? {
  ...field,
  config: {
    color_format: 'Hex',
  },
} : field
const filterVisible = (data, page) => el => !Api.isBody(el, data.elements) &&
  (el.pageNames.length === 0 || el.pageNames.includes(page.id)) &&
  (!Api.getFirstPagedParent(el, data.elements) ||
    Api.getFirstPagedParent(el, data.elements).pageNames.includes(page.id)
  )

module.exports = function(unifile) {
  return {
    info: {
      name: 'forestry',
      displayName: 'Forestry',
      type: TYPE_CMS,
    },
    beforeWrite: function(context, actions) {
      return actions.concat(this.toForestryTemplates(context.data)
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
          <option value="list">List of Strings</option>
          <option value="field_group_list">List of Items</option>
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
    },
    toForestryTemplates: function(data) {
      return data.pages.map(page => ({
        id: page.id.split('page-').slice(1).join('page-'),
        label: page.displayName,
        fields: data.elements
        // filter invisible elements on the current page
        .filter(filterVisible(data, page))
        // remove elements without forestry data
        .filter(el => !!el.data.forestry && !!el.data.forestry.type)
        // handle lists of object
        .map(el => {
          if (el.data.forestry.type === 'field_group_list') {
            return {
              ...el,
              data: {
                ...el.data,
                forestry: {
                  ...el.data.forestry,
                  fields: Api.getChildrenRecursive(el, data.elements)
                    .filter(child => child !== el)
                    .filter(filterVisible(data, page))
                    .filter(child => !!child.data.forestry)
                    .map(child => child.data.forestry)
                    .map(mapTextAreas)
                    .map(mapColor),
                }
              }
            }
          }
          return el
        })
        // remove all elements which are in a list
        .filter(el => !Api.getAllParents(el, data.elements).find(parent => parent.data.forestry && parent.data.forestry.type === 'field_group_list'))
        // from el to forestry data
        .map(el => el.data.forestry)
        // handle special config of forestry fields
        .map(mapTextAreas)
        .map(mapColor)
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
  }
}

