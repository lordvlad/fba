const nanologger = require('nanologger')

module.exports = function logger (name) {
  const log = nanologger(name)

  return function (state, emitter) {
    emitter.on('log:debug', log.debug.bind(log))
    emitter.on('log:info', log.info.bind(log))
    emitter.on('log:warn', log.warn.bind(log))
    emitter.on('log:error', log.error.bind(log))
    emitter.on('log:fatal', log.fatal.bind(log))
  }
}
