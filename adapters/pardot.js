const {Api} = require('silex-website-builder')
const {TYPE_CMS} = require('../server/adapter-utils')

const PARDOT_EDITABLE_TAGS = ['a', 'img', 'code', 'pre', 'address', 'b', 'big', 'blockquote', 'caption', 'cite', 'del', 'dfn', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'i', 'ins', 'kbd', 'p', 'q', 's', 'samp', 'span', 'small', 'strike', 'strong', 'sub', 'sup', 'u', 'var', 'article', 'aside', 'div', 'dt', 'dd', 'figure', 'figcaption', 'li', 'footer', 'header', 'main', 'section','td']

module.exports = function(unifile) {
  return {
    info: {
      name: 'pardot',
      displayName: 'Salesforce Pardot',
      type: TYPE_CMS,
    },
    beforeSplit: async function(context, actions) {
      context.data.elements
        .filter(el => !!el.data['pardot'])
        .filter(el => el.type !== 'section-element')
        .filter(el => !!context.document.querySelector('.' + el.id))
        .forEach(el => {
          const {editable, regionName} = el.data['pardot']
          if (editable && regionName) {
            const domEl = context.document.querySelector('.' + el.id)
            const contentEl = domEl.querySelector('.silex-element-content, img')
            const chosenEl = contentEl || domEl
            if (!PARDOT_EDITABLE_TAGS.includes(chosenEl.tagName.toLowerCase())) throw new Error(`The tag name ${chosenEl.tagName} is not supported by pardot. The element ${el.id} should not be editable`)
            chosenEl.setAttribute('pardot-region', regionName)
          }
        })
    },
    getHtmlFolder() {
      return null
    },
    getForm() {
      return `<form>
        <label for="editable">Is editable (pardot-region)</label>
        <input type="checkbox" id="editable" name="editable"></input>
        <label for="regionName">Editable Region Name</label>
        <input type="text" id="regionName" name="regionName"></input>
      </form>`
    },
  }
}
