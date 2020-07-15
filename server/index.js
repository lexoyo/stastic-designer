const isElectron = require('is-electron')
const silex = require ('./web')

// Start Silex
silex.start(() => {
  if (isElectron()) {
    // Start electron app when started with electron
    require('./electron')
  }
})

