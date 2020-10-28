console.log('\n[Stastic designer] Init Silex server...\n')

const isElectron = require('is-electron')
const silex = require ('./web')

console.info('\n[Stastic designer] Start Silex server...\n')

// Start Silex
silex.start(() => {
  if (isElectron()) {
    console.info('\n[Stastic designer] Start electron...\n')
    // Start electron app when started with electron
    require('./electron')
  }
})

