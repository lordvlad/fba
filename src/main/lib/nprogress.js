const np = require('nprogress')

module.exports = function () {
  return function (state, emitter) {
    emitter.on('progress:start', () => np.start())
    emitter.on('progress:done', () => np.done())
  }
}
