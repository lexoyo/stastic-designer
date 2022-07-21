const GitService = require('./GitService')
const { JSDOM } = require("jsdom")

test('Diff dom nodes', async () => {
  const html1 = '<div></div>'
  const dom1 = new JSDOM(html1)
  const html2 = '<div class="test"></div>'
  const dom2 = new JSDOM(html2)
  const delta = await GitService.diffDom(dom1, dom2)
  expect(delta).not.toBeUndefined()
  expect(Object.keys(delta)).toHaveLength(2)
})
