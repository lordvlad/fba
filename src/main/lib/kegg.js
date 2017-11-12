/* global fetch */

const text = (t) => t.text()

const parse = (t) => t.split('\n')
  .reduce(({pos, obj}, l) => {
    if (l.startsWith('ENTRY')) {
      obj.id = 'rn:' + l.split(/\s+/)[1]
      pos = 'ENTRY'
    } else if ((l.startsWith(' ') && pos === 'NAME') || l.startsWith('NAME')) {
      if (!obj.names) obj.names = []
      obj.names.push(l.replace('NAME', '').replace(';', '').trim())
      pos = 'NAME'
    } else if (l.startsWith('DEFINITION')) {
      obj.definition = l.replace('DEFINITION', '').trim()
      pos = 'DEFINITION'
    } else if (l.startsWith('EQUATION')) {
      obj.equation = l.replace('EQUATION', '').trim()
      pos = 'EQUATION'
    } else if (l.startsWith('ENZYME')) {
      obj.enzyme = l.replace('ENZYME', '').trim().split(/\s+/)
      pos = 'ENZYME'
    } else if (l.startsWith('RCLASS')) {
      obj.rclass = l.replace('RCLASS', '').trim().split(/\s+/)
      pos = 'RCLASS'
    }

    return {pos, obj}
  }, {pos: null, obj: {}}).obj

module.exports = function kegg (self) {
  self.addEventListener('message', function ({data}) {
    if (data.href) {
      const href = data.href
      fetch(href).then(text).then(parse).then(function (reaction) {
        self.postMessage({href, reaction})
      })
    }
  })
}
