const morph = require('xtend/mutable')

const initialState = {
  active: null,
  width: 224,
  network: {},
  file: {
    search: {
      searchId: 'search',
      term: '',
      busy: false,
      results: []
    }
  }
}

module.exports = function () {
  return function (state, emitter) {
    if (!state.menu) state.menu = initialState
    else morph(state.menu, initialState)
    const emit = emitter.emit.bind(emitter)
    const on = emitter.on.bind(emitter)
    const render = () => emitter.emit('render')

    on('menu:active', (active) => {
      if ((active === 'network' || active === 'calculate') && !state.content.model) return
      state.menu.active = active === state.menu.active ? null : active
      emit('log:debug', `menu:active ${state.menu.active}`)
      render()
    })
  }
}
