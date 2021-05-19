const {Api} = require('silex-website-builder')
const yaml = require('js-yaml')

const {TYPE_CMS} = require('../server/adapter-utils')

const log = field => {
  console.log(field)
  return field
}
const sortByOrder = (f1, f2) => parseInt(f1.order || Infinity) - parseInt(f2.order || Infinity)

const cleanupJson = field => ({
  ...field,
  order: undefined,
})

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

const CONTAINERS_TYPES = ['field_group_list', 'field_group']

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
          content: '---\n' + yaml.dump({
            ...template,
            // FIXME: remove fields only needed to build the actions
            id: undefined,
            name: undefined,
          }),
        })))
    },
    getForm() {
      return `
        <label for="type">Forestry Front Matter Template</label>
        <select id="type" name="type">
          <option value=""></option>
          <option value="text">Text</option>
          <option value="textarea">Textarea</option>
          <option value="number">Number</option>
          <option value="boolean">Toggle</option>
          <option value="select">Select</option>
          <option value="datetime">Datetime</option>
          <option value="color">Color</option>
          <option value="field_group">Group</option>
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
        <label>Default Value (texts only)</label>
        <input type="text" name="default"></input>
        <label>Order</label>
        <input type="number" name="order"></input>
      `
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
          if (CONTAINERS_TYPES.includes(el.data.forestry.type)) {
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
                    .sort(sortByOrder)
                    .map(cleanupJson)
                    .map(mapTextAreas)
                    .map(mapColor),
                  default: undefined,
                }
              }
            }
          }
          return el
        })
        // remove all elements which are in a list
        .filter(el => !Api.getAllParents(el, data.elements).find(parent => parent.data.forestry && CONTAINERS_TYPES.includes(parent.data.forestry.type)))
        // from el to forestry data
        .map(el => el.data.forestry)
        // handle special config of forestry fields
        .sort(sortByOrder)
        .map(cleanupJson)
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
        hide_body: !page.fields.find(field => field.name === 'content'),
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
        }]).filter(field => field.name != 'content'),
      }))
    }
  }
}

