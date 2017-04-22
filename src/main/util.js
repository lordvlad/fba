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
const isPromise = (obj) => typeof obj !== 'undefined' && typeof obj.then === 'function'
const words = (s) => ({
  [Symbol.iterator] () { return splitGen(s, ' ') }
})

/**
 * @param {IterableIterator<X>} it
 * @param {Function} fn
 * @returns {IterableIterator<X>}
 **/
function * filter (it, fn) {
  for (let i of it) if (fn(i)) yield i
}

/**
 * @param {IterableIterator} it
 * @param {Function} fn
 * @returns {IterableIterator}
 **/
function * map (it, fn) {
  for (let i of it) yield fn(i)
}

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

function getAsString (i) {
  return new Promise(function (resolve, reject) {
    try {
      i.getAsString((r) => resolve(r))
    } catch (e) {
      reject(e)
    }
  })
}

function isDOMData (i) {
  return i.kind !== 'file'
}

function handleDrop (callback, e) {
  killEvent(e)
  let items = map(filter(e.dataTransfer.items, isDOMData), getAsString)
  let files = e.dataTransfer.files
  Promise
    .all(items)
    .then((items) => {
      const r = {items, files}
      callback(r)
    })
    .catch((e) => console.error(e))
}

function killEvent (e) {
  e.stopPropagation()
  e.preventDefault()
  return false
}

function dnd (element, callback) {
  element.addEventListener('dragenter', killEvent, false)
  element.addEventListener('dragover', killEvent, false)
  element.addEventListener('drop', handleDrop.bind(undefined, callback), false)
}

function toKebab (s) {
  let r = ''
  let first = true
  for (let c of s) {
    r += (!first && c === c.toUpperCase() ? '-' : '') + c.toLowerCase()
    if (first) first = false
  }
  return r
}

function defer () {
  let res
  let rej
  let p = new Promise(function (resolve, reject) { res = resolve; rej = reject })
  return { promise: p, resolve: res, reject: rej }
}


module.exports = {
  defer,
  noop: () => {},
  toKebab,
  dnd,
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
  words,
  filter,
  map,
  isPromise
}
