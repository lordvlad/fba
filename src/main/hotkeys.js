const m = new Map()

const kill = (e) => { e.preventDefault(); e.stopPropagation() }
const tab = (t) => ['activeMenu', t]
const keys = (...ks) => { const ts = ks.map(key); return (e) => ts.some((t) => t(e)) }
const key = (k) => {
  let s = k.split('-')
  let key = s[s.length - 1]
  let mods = s.slice(0, -1)
  return (e) => {
    return mods.every((m) => e[m + 'Key']) && e.key === key
  }
}

m.set(keys('alt-f'), [tab('file')])
m.set(keys('alt-n'), [tab('network')])
m.set(keys('alt-c'), [tab('calculate')])
m.set(keys('alt-o'), [tab('options')])
m.set(keys('ctrl-o'), [['openModelFile']])
m.set(keys('ctrl-n'), [['newModel']])
m.set(keys('ctrl-s', '/'), [tab('search'), ['focus', '#search']])
m.set(keys('Escape'), [['blur']])

module.exports = function (e, state) {
  for (let [t, a] of m.entries()) {
    if (t(e, state)) { kill(e); return a }
  }
}
