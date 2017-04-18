/* global Headers, fetch */
const url = 'http://localhost:8080/www.ebi.ac.uk/biomodels-main/search-models.do?cmd=TEXT:SEARCH'
const cheerio = require('cheerio')


module.exports = function search (term) {
  let $

  function toModel (i, tr) {
    let $td = $('td', this)
    if (!$td.eq(0)) return null
    let id = $td.eq(0).find('a').first().text()
    if (!id) return null
    let name = $td.eq(1).text()
    return {id, name}
  }

  return fetch(url, {
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
