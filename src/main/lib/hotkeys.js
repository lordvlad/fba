const m = new Map()

const kill = (e) => { e.preventDefault(); e.stopPropagation() }
const tab = (t) => ['menu:active', t]
const etype = (type, ...k) => { let t = keys(...k); return (e) => e.type === type && t(e) }
const keydown = (...k) => etype('keydown', ...k)
const keyup = (...k) => etype('keyup', ...k)
const keys = (...ks) => { const ts = ks.map(key); return (e) => ts.some((t) => t(e)) }
const key = (k) => {
  let s = k.split('-')
  let key = s[s.length - 1]
  let mods = s.slice(0, -1)
  return (e) => e.key === key && mods.every((m) => e[m + 'Key'])
}

m.set(keydown(' '), [['setPanMode', true]])
m.set(keyup(' '), [['setPanMode', false]])
m.set(keydown('alt-f'), [tab('file')])
m.set(keydown('alt-n'), [tab('network')])
m.set(keydown('alt-c'), [tab('calculate')])
m.set(keydown('ctrl-alt-o'), [['file:select:url']])
m.set(keydown('alt-o'), [tab('options')])
m.set(keydown('ctrl-o'), [['file:select:file']])
m.set(keydown('ctrl-n'), [['model:new']])
m.set(keydown('ctrl-s', '/'), [tab('search'), ['focus', '#search']])
m.set(keydown('Escape'), [['blur']])

module.exports = function (e, state) {
  for (let [t, a] of m.entries()) {
    if (t(e, state)) { kill(e); return a }
  }
}
