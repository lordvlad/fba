const { createReader, createBuilder } = require('jssbml')

module.exports = function (self) {
  let reader = null
  let tail = false
  self.addEventListener('message', function ({data}) {
    if (tail && reader) reader.write(data)
    else if (!tail && !reader) onMessage(data[0], data[1])
  })
  function onMessage (event, data) {
    if (event !== 'parse') return
    reader = createReader()
    reader.pipe(createBuilder()).on('data', function (model) {
      tail = false
      reader = null
      self.postMessage(['parse:done', model])
    })
    tail = true
    reader.write(data)
  }
}

module.exports.events = ['parse']
