const ModelComponent = require('../components/model')

module.exports = function () {
  return function (state, emitter) {
    if (!state.components) state.components = {}
    state.components.model = new ModelComponent(emitter)
  }
}
