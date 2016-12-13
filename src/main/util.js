const isDefined = (x) => typeof x !== 'undefined'
const func = (fn) => (...args) => isDefined(args[0]) ? fn(...args) : 0[0]
const last = func((a) => a[a.length - 1])
const either = (...args) => args.find(isDefined)
const pop = func((a) => a.pop())
const push = func((a, b) => a.push(b))
const reduce = func((a, c, s) => a.reduce(c, s))
const getOrSet = (k, v) => func((o) => (o[k] = either(o[k], v)))
const empty = (t) => !t.trim().length
const maybeEval = (x, c) => typeof x === 'function' ? x.call(c) : x
const get = (keys) => (o) => keys.split('.').reduce((o, k) => o && maybeEval(o[k], o), o)
const byProp = (...keys) => (val) => (x) => keys.reduce((o, k) => o && o[k], x) === val
const words = (s) => ({
  [Symbol.iterator] () { return splitGen(s, ' ') }
})

function * splitGen (s, x) {
  let r = ''
  for (let c of s) {
    if (c === x) {
      if (r.length) yield r
      r = ''
    } else {
      r += c
    }
  }
}

module.exports = {
  isDefined,
  func,
  last,
  either,
  pop,
  push,
  reduce,
  getOrSet,
  empty,
  maybeEval,
  get,
  byProp,
  splitGen,
  words
}
