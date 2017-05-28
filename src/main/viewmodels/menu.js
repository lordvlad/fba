module.exports = function () {
  return function (state, emitter) {
    const emit = emitter.emit.bind(emitter)
    const on = emitter.on.bind(emitter)
    const render = () => emitter.emit('render')

    state.menu = {
      active: null,
      file: {
        search: {
          searchId: 'search',
          term: '',
          busy: false,
          results: []
        }
      }
    }

    on('menu:active', (active) => {
      state.menu.active = active === state.menu.active ? null : active
      emit('log:debug', `menu:active ${state.menu.active}`)
      render()
    })
  }
}
