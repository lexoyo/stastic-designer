const forestry = require('../adapters/forestry')(null)
const data1 = require('./sample-forestry1.json')
const data2 = require('./sample-forestry2.json')

const NUM_PAGES = 2
const NUM_ADDED_FIELDS = 2 // we add the fields: layout and permalink
const WITH_FORESTRY_CSS_CLASS = 'with-forestry'
const NO_FORESTRY_CSS_CLASS = 'no-forestry'

test('Generate forestry template with 2 pages', () => {
  expect(forestry.toForestryTemplate).not.toBeNull()
  expect(data1).not.toBeNull()
  expect(data1.pages).toHaveLength(NUM_PAGES)
  const forestryTemplates = forestry.toForestryTemplates(data1)
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

test('Filter elements which are in a group', () => {
  expect(data2.elements).toHaveLength(5)
  const main = data2.elements
    .filter(el => el.data.forestry)
    .find(el => el.data.forestry.name === 'main')
  const filtered = data2.elements.filter(forestry.filterGroups(data2))
  // Should be all elements but children of main
  // => section, section container, main
  expect(filtered).toHaveLength(3)
})

test('Filter elements which are in a level 2 group (a group in a group)', () => {
  expect(data2.elements).toHaveLength(5)
  const main = data2.elements
    .filter(el => el.data.forestry)
    .find(el => el.data.forestry.name === 'main')
  const right = data2.elements
    .filter(el => el.data.forestry)
    .find(el => el.data.forestry.name === 'right')
  const text = data2.elements
    .filter(el => el.data.forestry)
    .find(el => el.data.forestry.name === 'text right')

  const filtered1 = data2.elements.filter(forestry.filterGroups(data2, main))
  // Should be only right, the container in main which contains a text
  expect(filtered1).toHaveLength(1)
  expect(filtered1[0]).toBe(right)

  const filtered2 = data2.elements.filter(forestry.filterGroups(data2, right))
  // Should be only right, the container in main which contains a text
  expect(filtered2).toHaveLength(1)
  expect(filtered2[0]).toBe(text)
})

test('Generate forestry template with groups', () => {
  const forestryTemplates = forestry.toForestryTemplates(data2)
  const main = forestryTemplates[0].fields.find(f => f.name === 'main')
  console.log(JSON.stringify(forestryTemplates))
  expect(main.fields).toHaveLength(1)
  // const left = main.fields.find(f => f.name === 'left')
  // expect(left.fields).toHaveLength(1)
  const right = main.fields.find(f => f.name === 'right')
  expect(right.fields).toHaveLength(1)
})
