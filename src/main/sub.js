const set = (a, k, v) => { a[k] = v; return a }
const xtend = (a, b) => Object.entries(b).reduce((c, [k, v]) => set(c, k, v), a)
module.exports = (state, set, key) => [state[key], (x) => set(xtend(state, {[key]: x}))]
