const morph = require('xtend/mutable')
const cors = require('../lib/cors-anywhere')
const exampleId = 'BIOMD0000000172'
const exampleUrl = cors + '/http://otto.bioquant.uni-heidelberg.de/sbml/level2/20080130/example5.xml'

const initialState = { exampleId, exampleUrl }

module.exports = function () {
  return function (state, emitter) {
    if (!state.content) state.content = initialState
    else morph(state.content, initialState)
  }
}
