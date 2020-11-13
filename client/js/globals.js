export const TYPE_CMS = 'TYPE_CMS'
export const TYPE_TEMPLATE = 'TYPE_TEMPLATE'

export const container = {
  parent: document.createElement('div'),
  [TYPE_TEMPLATE]: document.createElement('div'),
  [TYPE_CMS]: document.createElement('div'),
}

export const state = {
  [TYPE_TEMPLATE]: {
    adapters: [],
    adapter: null,
  },
  [TYPE_CMS]: {
    adapters: [],
    adapter: null,
  },
}


