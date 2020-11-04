const PublishBase = require('./PublishBase')
const data = require('./PublishBase.test.json')

const NUM_PAGES = 2
const WITH_FORESTRY_CSS_CLASS = 'with-forestry'
const NO_FORESTRY_CSS_CLASS = 'no-forestry'

test('Generate forestry template', () => {
  expect(PublishBase.toForestryTemplate).not.toBeNull()
  expect(data).not.toBeNull()
  expect(data.pages).toHaveLength(NUM_PAGES)
  const forestryTemplates = PublishBase.toForestryTemplates(data)
  expect(forestryTemplates).not.toBeNull()
  expect(forestryTemplates).toHaveLength(NUM_PAGES)

  const page1 = forestryTemplates[0]
  expect(page1).not.toBeNull()
  expect(page1.name).toBe('page-1.yml')
  expect(page1.label).toBe('Page 1')
  expect(page1.fields).not.toBeNull()
  expect(page1.fields).toHaveLength(2)
  
  const el1 = page1.fields[0]
  expect(el1).not.toBeNull()
  expect(el1.type).toBe('text')
})
