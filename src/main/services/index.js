/* global URL */
const work = require('webworkify')

const { defer } = require('../util')
const fba = work(require('./fba.js'))

module.exports.search = require('./search')
module.exports.parse = require('./parse')

module.exports.fba = function (opt) {
  const { promise, resolve, reject } = defer()
  const clean = () => {
    fba.removeEventListener('message', onMessage)
    fba.removeEventListener('message', onError)
    URL.revokeObjectURL(fba.objectURL)
  }

  function onMessage (e) { if (e.data.debug) return console.log(e.data.debug); clean(); resolve(e.data) }
  function onError (e) { console.log(e.data); clean(); reject(e) }

  fba.addEventListener('message', onMessage)
  fba.addEventListener('error', onError)

  fba.postMessage(opt)

  return promise
}
