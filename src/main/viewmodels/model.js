const { Model } = require('jssbml')
const morph = require('xtend/mutable')

const initialState = {
  undos: [],
  redos: [],
  lock: false,
  pan: false
}

module.exports = function () {
  return function (state, emitter) {
    if (!state.content) state.content = initialState
    else morph(state.content, initialState)
    const emit = (...args) => emitter.emit(...args)
    const on = (...args) => emitter.on(...args)
    const render = () => emitter.emit('render')
    const renderAfter = (fn) => (...args) => { fn(...args); render() }

    on('model:set', renderAfter((model) => {
      emit('progress:done')
      emit('log:info', `loaded model '${model.id}'`)
      state.content.model = model
    }))

    on('sbml_response:parse:done', (m) => emit('model:set', m))
    on('model:pan:toggle', renderAfter((on) => { state.content.pan = on }))
    on('model:lock:toggle', renderAfter((on) => { state.content.lock = on }))
    on('model:close', renderAfter(() => { state.content.model = null }))
    on('model:new', renderAfter(() => emit('model:set', new Model())))
    on('model:node:select', renderAfter((n) => {
      state.menu.active = 'network'
      state.menu.network.detail = n
    }))
  }
}
