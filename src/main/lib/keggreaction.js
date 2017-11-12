/* global fetch */
const base = require('../lib/cors-anywhere')
const url = 'rest.kegg.jp'

const split = (t) => t.split('\n')
  .map((l) => l.match(/^([^\s]+)\s+(.*);\s+(.*)$/)).filter(Boolean)
  .map(([_, id, names, reaction]) => ({ id, names, reaction, href: geturl(id) }))
const text = (t) => t.text()
const geturl = (id) => `${base}/${url}/get/${id}`
const search = (t) => fetch(`${base}/${url}/find/reaction/${encodeURIComponent(t)}`).then(text).then(split)

module.exports = search
