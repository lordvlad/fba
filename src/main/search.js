/* global fetch */
const { Subject } = require('rx-lite')
const base = 'https://cors-anywhere.herokuapp.com/rest.kegg.jp/'

const get = (id) => `${base}/get/${id}`
const keggReaction = (t) => fetch(`${base}/find/reaction/${t}`)
  .then((t) => t.text())
  .then((t) => t.split('\n')
    .map((l) => l.match(/^([^\s]+)\s+(.*);\s+(.*)$/))
    .filter(Boolean)
    .map(([_, id, names, reaction]) => ({ id, names, reaction, href: get(id) }))
  )

const input = new Subject()
const output = input
  .filter((t) => t.length > 2)
  .throttle(750)
  .distinctUntilChanged()
  .map(encodeURIComponent)
  .flatMapLatest(keggReaction)

module.exports = {input, output}
