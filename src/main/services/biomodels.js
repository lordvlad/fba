/* global Headers, fetch */
const url = 'https://cors-anywhere.herokuapp.com/www.ebi.ac.uk/biomodels-main/search-models.do?cmd=TEXT:SEARCH'
const cheerio = require('cheerio')

module.exports = function (self) {
  self.addEventListener('message', function (e) {
    let $
    function toModel (i, tr) {
      let $td = $('td', this)
      if (!$td.eq(0)) return null
      let id = $td.eq(0).find('a').first().text()
      if (!id) return null
      let name = $td.eq(1).text()
      return {id, name}
    }

    fetch(url, {
      headers: new Headers({
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
      }),
      method: 'POST',
      body: `txt=${encodeURI(e.data)}`
    })
    .then((r) => r.text())
    .then((s) => ($ = cheerio.load(s)))
    .then(($) => $('#tbl_modelslist tr').map(toModel).get())
    .then((r) => self.postMessage(r))
    .catch((e) => self.postMessage({error: e.message}))
  })
}
