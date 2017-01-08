/* global URL */
const work = require('webworkify')
const np = require('nprogress')

const { defer } = require('../util')

const services = {
  fba: require('./fba.js'),
  biomodels: require('./biomodels.js')
}
const workers = {}

module.exports.search = require('./search')
module.exports.parse = require('./parse')
module.exports.fba = service('fba')
module.exports.biomodels = window.biomodels = service('biomodels')

function service (name) {
  return function (opt) {
    np.start()
    if (!workers[name]) workers[name] = work(services[name])
    const srv = workers[name]
    const { promise, resolve, reject } = defer()
    const clean = () => {
      srv.removeEventListener('message', onMessage)
      srv.removeEventListener('message', onError)
      URL.revokeObjectURL(srv.objectURL)
      np.done()
    }

    function onMessage (e) {
      if (e.data.debug) {
        np.inc()
        console.log(e.data.debug)
      } else if (e.data.progress) {
        np.set(e.data.progress)
      } else {
        clean()
        resolve(e.data)
      }
    }
    function onError (e) {
      console.log(e.data)
      clean()
      reject(e)
    }

    srv.addEventListener('message', onMessage)
    srv.addEventListener('error', onError)

    srv.postMessage(opt)

    return promise
  }
}
