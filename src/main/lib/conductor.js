const webworkify = require('webworkify')

function conductor (workerModule, domain) {
  const worker = webworkify(workerModule)

  return function (state, emitter) {
    worker.addEventListener('message', function ({ data: [key, data] }) {
      emitter.emit(`${domain}_response:${key}`, data)
    })

    emitter.on('*', function (key, perfId, data) {
      if (!data && perfId) [data, perfId] = [perfId, null]
      const keys = key.split(':')
      if (keys[0] !== domain) return
      worker.postMessage([keys.slice(1).join(':'), data])
    })
  }
}

module.exports = conductor
