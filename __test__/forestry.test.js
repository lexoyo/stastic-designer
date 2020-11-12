const forestry = require('../adapters/forestry')(null)
const data = require('./sample.json')

const NUM_PAGES = 2
const NUM_ADDED_FIELDS = 2 // we add the fields: layout and permalink
const WITH_FORESTRY_CSS_CLASS = 'with-forestry'
const NO_FORESTRY_CSS_CLASS = 'no-forestry'

test('Generate forestry template', () => {
  expect(forestry.toForestryTemplate).not.toBeNull()
  expect(data).not.toBeNull()
  expect(data.pages).toHaveLength(NUM_PAGES)
  const forestryTemplates = forestry.toForestryTemplates(data)
  expect(forestryTemplates).not.toBeNull()
  expect(forestryTemplates).toHaveLength(NUM_PAGES)

  const page1 = forestryTemplates[0]
  expect(page1).not.toBeNull()
  expect(page1.name).toBe('page-1.yml')
  expect(page1.label).toBe('Page 1')
  expect(page1.fields).not.toBeNull()
  expect(page1.fields).toHaveLength(2 + NUM_ADDED_FIELDS)
  
  const el1 = page1.fields[0]
  expect(el1).not.toBeNull()
  expect(el1.type).toBe('text')
})
