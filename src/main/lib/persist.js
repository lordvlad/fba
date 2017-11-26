/* global localStorage */
const morph = require('xtend/mutable')
const debounce = require('lodash.debounce')
const omit = require('lodash.omit')

const trafos = []
const ignoreProps = ['components', 'events']

trafos.push({
  set: (o) => omit(o, ignoreProps)
})

module.exports = function (name = 'app') {
  function get () {
    let o = JSON.parse(localStorage.getItem(name) || '{}')
    for (let trafo of trafos) {
      if (trafo.get) o = trafo.get(o)
    }
    return o
  }
  function set (o) {
    for (let trafo of trafos) {
      if (trafo.set) o = trafo.set(o)
    }
    localStorage.setItem(name, JSON.stringify(o))
  }

  return function (state, emitter) {
    morph(state, get())
    emitter.on('*', debounce(() => set(state), 100))
  }
}

module.exports.add = (trafo) => trafos.push(trafo)
