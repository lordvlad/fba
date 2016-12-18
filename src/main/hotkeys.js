const { Observable } = require('rx-lite')
const assign = require('deep-assign')

const m = new Map()

const tab = (t) => (_, s) => ({side: {selected: s.side.selected === t ? '' : t}})
const keys = (...ks) => (e) => ks.some((k) => k === e.key)
const focusSearch = (e, s) => (s.side.slected === 'search')
    ? {side: {selected: ''}}
    : {side: {selected: 'search', search: {focus: true}}}
const blur = (e, s) => {
  if (!e.target.matches('#search')) return {}
  setTimeout(() => e.target.blur(), 10)
  return {side: {search: {focus: false}}}
}
m.set(keys('N', 'n'), tab('network'))
m.set(keys('C', 'c'), tab('calculate'))
m.set(keys('S', 's'), tab('settings'))
m.set(keys('F', 'f', '/'), focusSearch)
m.set(keys('Escape'), blur)

module.exports = function (state, update) {
  return Observable
    .fromEvent(document.body, 'keyup')
    .filter((e) => e.key === 'Escape' || (e.target ? e.target.nodeName !== 'INPUT' : true))
    .subscribe((e) => {
      for (let [t, a] of m.entries()) {
        if (t(e, state)) return update(assign(state, a(e, state)))
      }
    })
}
