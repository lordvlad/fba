module.exports = function toKebab (s) {
  let r = ''
  let first = true
  for (let c of s) {
    r += (!first && c === c.toUpperCase() ? '-' : '') + c.toLowerCase()
    if (first) first = false
  }
  return r
}
