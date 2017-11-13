const cors = require('../lib/cors-anywhere')
const exampleId = 'BIOMD0000000172'
const exampleUrl = cors + '/http://otto.bioquant.uni-heidelberg.de/sbml/level2/20080130/example5.xml'

module.exports = function () {
  return function (state, emitter) {
    const render = () => emitter.emit('render')
    state.content = {
      exampleId,
      exampleUrl
    }

    function lock (toggle) {
      state.content.lock = toggle
      render()
    }

    function panZoomControls (toggle) {
      state.content.panZoomControls = toggle
      render()
    }

    emitter.on('model:unlock', () => lock(false))
    emitter.on('model:lock', (toggle = true) => lock(toggle))
    emitter.on('model:panZoomControls', (toggle = true) => panZoomControls(toggle))
  }
}
