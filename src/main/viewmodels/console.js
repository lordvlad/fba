/* global document */
const Fifo = require('fifo-array')

const LOG_LENGTH = 10

function scrollUp () {
  const el = document.querySelector('#console')
  if (el) el.scrollTop = el.scrollHeight
}

module.exports = function () {
  return function (state, emitter) {
    const c = state.console = {
      open: false,
      msgs: new Fifo(LOG_LENGTH),
      notification: false
    }

    const emit = emitter.emit.bind(emitter)
    const on = emitter.on.bind(emitter)
    const render = () => {
      emitter.emit('render')
      setTimeout(scrollUp, 10)
    }
    const toggle = (x) => {
      emit('log:debug', `${x ? 'opening' : 'closing'} console`)
      c.open = x
      if (x && c.notification) c.notification = false
      render()
    }

    const debug = (...args) => console.log(...args)
    const info = (...args) => {
      console.info(...args)
      c.msgs.push({info: true, args})
      if (c.open) render()
    }
    const warn = (...args) => {
      console.warn(...args)
      c.msgs.push({warning: true, args})
      if (c.open) render()
    }
    const error = (...args) => {
      console.error(...args)
      c.msgs.push({error: true, args})
      if (c.open) render()
      else if (!c.notification) {
        c.notification = true
        render()
      }
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
