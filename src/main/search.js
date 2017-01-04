/* global fetch */
const { Subject } = require('rx-lite')

const base = 'https://cors-anywhere.herokuapp.com/rest.kegg.jp/'

const split = (t) => t.split('\n')
  .map((l) => l.match(/^([^\s]+)\s+(.*);\s+(.*)$/)).filter(Boolean)
  .map(([_, id, names, reaction]) => ({ id, names, reaction, href: get(id) }))
const text = (t) => t.text()
const busy = new Subject()
const get = (id) => `${base}/get/${id}`
const keggReaction = (t) => fetch(`${base}/find/reaction/${t}`).then(text).then(split)

const input = new Subject()
const output = input
  .filter((t) => t.length > 2)
  .debounce(300)
  .distinctUntilChanged()
  .map(encodeURIComponent)
  .tap(() => busy.onNext(true))
  .flatMapLatest(keggReaction)
  .tap(() => setTimeout(() => busy.onNext(false), 10))

module.exports = { input, busy, output }
