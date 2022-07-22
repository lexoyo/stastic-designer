const GitService = require('../server/GitService')
const { JSDOM } = require("jsdom")

test('Diff dom nodes', async () => {
  const html1 = '<html><head></head><body><div></div></body></html>'
  const dom1 = new JSDOM(html1)
  const html2 = '<html><head></head><body><div class="test"></div></body></html>'
  const dom2 = new JSDOM(html2)
  const html3 = '<html><head></head><body><div>test</div></body></html>'
  const dom3 = new JSDOM(html3)
  const html4 = '<html><head></head><body><div class="test">test</div></body></html>'
  const dom4 = new JSDOM(html4)
  const delta = await GitService.diffDom(dom1, dom2)
  expect(delta).not.toBeUndefined()
  expect(Object.keys(delta)).toHaveLength(2)
  await GitService.patchDom(dom3, delta)
  expect(dom3.serialize()).toEqual(html4)
  await GitService.patchDom(dom3, delta)
  expect(dom3.serialize()).toEqual(html4)
})

test('Add revparse to data', async () => {
  const revparse = 'oihnfaeknfz'
  const service = new GitService()
  const jsonStr = await service.readFile({}, __dirname + '/../__test__/test.html.json', revparse)
  const json = JSON.parse(jsonStr)
  expect(json).toBeInstanceOf(Object)
  expect(json.site).toBeInstanceOf(Object)
  expect(json.site.revparse).toEqual(revparse)
})
