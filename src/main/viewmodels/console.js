const Fifo = require('fifo-array')

const LOG_LENGTH = 10

module.exports = function () {
  return function (state, emitter) {
    const c = state.console = {open: false, msgs: new Fifo(LOG_LENGTH)}

    const emit = emitter.emit.bind(emitter)
    const on = emitter.on.bind(emitter)
    const render = () => emitter.emit('render')
    const toggle = (x) => {
      emit('log:debug', `${x ? 'opening' : 'closing'} console`)
      c.open = x
      render()
    }

    const debug = (...args) => console.log(...args)
    const info = (...args) => {
      console.info(...args)
      c.msgs.push({info: true, icon: 'info-circle', color: 'blue', args})
      c.open && render()
    }
    const warn = (...args) => {
      console.warn(...args)
      c.msgs.push({warn: true, icon: 'warning', color: 'yellow', args})
      c.open && render()
    }
    const error = (...args) => {
      console.error(...args)
      c.msgs.push({error: true, icon: 'warning', color: 'red', args})
      c.open && render()
    }

    on('log:debug', debug)
    on('log:warn', warn)
    on('log:error', error)
    on('log:info', info)

    on('console:toggle', () => emit(c.open ? 'console:close' : 'console:open'))
    on('console:open', () => toggle(true))
    on('console:close', () => toggle(false))
  }
}
