/* global fetch */
const { Subject } = require('rx-lite')

const keggReaction = (t) => fetch(`http://localhost:1337/rest.kegg.jp/find/reaction/${t}`)
  .then((t) => t.text())
  .then((t) => t.split('\n')
    .map((l) => l.match(/^([^\s]+)\s+(.*);\s+(.*)$/))
    .filter(Boolean)
    .map(([_, id, names, reaction]) => ({ id, names, reaction }))
  )

module.exports = function search (state) {
  const input = new Subject()
  const output = input
    .filter((t) => t.length > 2)
    .throttle(750)
    .distinctUntilChanged()
    .map(encodeURIComponent)
    .flatMapLatest(keggReaction)

  return {input, output}
}
