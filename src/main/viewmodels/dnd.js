const { noop, dnd } = require('./lib/util')

module.exports = function () {
  return function (state, emitter) {
    const emit = emitter.emit.bind(emitter)
    dnd(document.body, ({ items, files }) => {
      if (items.length) emit('dropItems', items, noop)
      if (files.length) emit('file:open:file', files[0], noop)
    })
  }
}
