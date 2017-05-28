module.exports = function (name) {
  return function (state, emitter) {
    const emit = emitter.emit.bind(emitter)
    const on = emitter.on.bind(emitter)
    window[name] = {state, emitter, emit, on}
  }
}
