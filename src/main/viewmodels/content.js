const cors = require('../lib/cors-anywhere')
const exampleId = 'BIOMD0000000172'
const exampleUrl = cors + '/http://otto.bioquant.uni-heidelberg.de/sbml/level2/20080130/example5.xml'

module.exports = function () {
  return function (state, emitter) {
    state.content = {
      exampleId,
      exampleUrl
    }

    emitter.on('model:unlock', () => {
      state.content.lock = false
      emitter.emit('render')
    })
    emitter.on('model:lock', () => {
      state.content.lock = true
      emitter.emit('render')
    })
  }
}
