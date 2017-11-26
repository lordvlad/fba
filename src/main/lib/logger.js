module.exports = function logger (name) {
  return function (state, emitter) {
    emitter.on('console:debug', console.debug.bind(console))
    emitter.on('console:info', console.info.bind(console))
    emitter.on('console:warn', console.warn.bind(console))
    emitter.on('console:error', console.error.bind(console))
  }
}
