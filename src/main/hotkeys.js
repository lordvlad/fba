const m = new Map()

const tab = (t) => ['activeMenu', t]
const keys = (...ks) => (e) => ks.some((k) => k === e.key)

m.set(keys('N', 'n'), [tab('network')])
m.set(keys('C', 'c'), [tab('calculate')])
m.set(keys('S', 's'), [tab('settings')])
m.set(keys('F', 'f', '/'), [tab('search'), ['focus', '#search']])
m.set(keys('Escape'), [['blur']])

module.exports = function (e, state) {
  for (let [t, a] of m.entries()) {
    if (t(e, state)) return a
  }
}
