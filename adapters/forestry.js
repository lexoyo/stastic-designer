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

// remove all elements which are in a list
const filterGroups = (data, root=null) => {
  return el => {
    // get all the parents which are groups
    const parents = Api.getAllParents(el, data.elements)
      .filter(parent => parent.data && parent.data.forestry && CONTAINERS_TYPES.includes(parent.data.forestry.type))
    // select this element if it is a direct descendent of root, i.e. its first group parent is root
    return (!!root && parents[0] === root) || (!root && parents.length === 0)
  }
}

module.exports = function(unifile) {
  return {
    filterGroups, // for unit tests
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
        <label for="type">Type (Forestry Front Matter Template)</label>
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
        <label>Variable name (for use in { } tab})</label>
        <input type="text" name="name"></input>
        <label>Label (displayed in Forestry)</label>
        <input type="text" name="label"></input>
        <label>Default Value (texts only)</label>
        <input type="text" name="default"></input>
        <label>Order</label>
        <input type="number" name="order"></input>
      `
    },

    toForestryFields(data, page, elements) {
      return elements
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
                  fields: this.toForestryFields(data, page,
                    Api.getChildrenRecursive(el, data.elements)
                    .filter(filterGroups(data, el))
                  ),
                  default: undefined,
                }
              }
            }
          }
          return el
        })
        // from el to forestry data
        .map(el => el.data.forestry)
        // handle special config of forestry fields
        .sort(sortByOrder)
        .map(cleanupJson)
        .map(mapTextAreas)
        .map(mapColor)
    },

    toForestryTemplates: function(data) {
      // 1 layout (yaml file) per Silex page
      return data.pages.map(page => ({
        id: page.id.split('page-').slice(1).join('page-'),
        label: page.displayName,
        fields: this.toForestryFields(data, page, 
          data.elements
          .filter(filterGroups(data))
        ),
      }))
      // add name
      .map(page => ({
        ...page,
        name: page.id + '.yml',
        display_field: 'permalink',
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

