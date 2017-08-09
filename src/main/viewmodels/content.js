const cors = require('../lib/cors-anywhere')
const exampleId = 'BIOMD0000000172'
const exampleUrl = cors + '/http://otto.bioquant.uni-heidelberg.de/sbml/level2/20080130/example5.xml'

module.exports = function () {
  return function (state) {
    state.content = {
      exampleId,
      exampleUrl
    }
  }
}
