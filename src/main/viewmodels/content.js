const exampleId = 'BIOMD0000000172'

module.exports = function () {
  return function (state) {
    state.content = {
      exampleId
    }
  }
}
