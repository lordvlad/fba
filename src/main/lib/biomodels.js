/* global Headers, fetch */
const cheerio = require('cheerio')

const cors = require('../lib/cors-anywhere')

const searchUrl = 'http://www.ebi.ac.uk/biomodels-main/search-models.do?cmd=TEXT:SEARCH'
const biomodelsUrl = (id) => `${cors}/http://www.ebi.ac.uk/biomodels-main/download?mid=${id}`

function search (term) {
  let $

  function toModel (i, tr) {
    let $td = $('td', this)
    if (!$td.eq(0)) return null
    let id = $td.eq(0).find('a').first().text()
    if (!id) return null
    let name = $td.eq(1).text()
    return {id, name}
  }

  return fetch(`${cors}/${searchUrl}`, {
    headers: new Headers({
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }),
    method: 'POST',
    body: `txt=${encodeURI(term)}`
  })
  .then((r) => r.text())
  .then((s) => ($ = cheerio.load(s)))
  .then(($) => $('#tbl_modelslist tr').map(toModel).get())
}

module.exports = {
  biomodelsUrl,
  search
}
