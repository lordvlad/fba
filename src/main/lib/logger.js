const nanologger = require('nanologger')
const log = nanologger('fba')

module.exports = function logger (name) {
  return function (state, emitter) {
    emitter.on('console:debug', log.debug.bind(log))
    emitter.on('console:info', log.info.bind(log))
    emitter.on('console:warn', log.warn.bind(log))
    emitter.on('console:error', log.error.bind(log))
    emitter.on('console:fatal', log.fatal.bind(log))
  }
}
