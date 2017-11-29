/* global localStorage */
const xtend = require('xtend')
const morph = require('xtend/mutable')
const debounce = require('lodash.debounce')
const { revive } = require('./jssbml')
const omit = require('lodash.omit')

function replaceAction (action) {
  return {
    name: action.name,
    args: xtend({}, action.args, {
      nodes: action.args.nodes.map((n) => n.data('id'))
    })
  }
}

function reviveAction (action) {
  const nodes = action.args.nodes
  let _nodes
  return {
    name: action.name,
    args: morph({
      get nodes () {
        if (!_nodes) {
          _nodes = nodes.map((id) => window.cy.$('#' + id))
        }
        return _nodes
      }
    }, omit(action.args, 'nodes'))
  }
}

const replacer = (k, v) => {
  if (['events', 'components'].includes(k)) return undefined
  if (['undos', 'redos'].includes(k)) return v.map(replaceAction)
  return v
}

const reviver = (k, v) => {
  if (k === 'model' && v.xmlns) return revive(v)
  if (['undos', 'redos'].includes(k)) return v.map(reviveAction)
  return v
}
const setters = []
const getters = []

module.exports = function (name = 'app') {
  function get () {
    let o
    try {
      o = JSON.parse(localStorage.getItem(name) || '{}', reviver)
    } catch (e) {
      console.error(e)
      console.log('clearing localstorage')
      localStorage.clear()
      o = {}
    }
    for (let getter of getters) o = getter(o)
    return o
  }
  function set (o) {
    for (let setter of setters) o = setter(o)
    localStorage.setItem(name, JSON.stringify(o, replacer))
  }

  return function (state, emitter) {
    morph(state, get())
    emitter.on('*', debounce(() => set(state), 100))
  }
}
