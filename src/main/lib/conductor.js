const webworkify = require('webworkify')

function conductor (workerModule, domain) {
  const worker = webworkify(workerModule)
  const post = (...args) => worker.postMessage(args)

  return function (state, emitter) {
    worker.addEventListener('message', function ({ data: [key, data] }) {
      emitter.emit(`${domain}_response:${key}`, data)
    })

    if (workerModule.events) {
      for (let key of workerModule.events) {
        emitter.on(`${domain}:${key}`, (data) => post(key, data))
      }
    }
  }
}

module.exports = conductor
