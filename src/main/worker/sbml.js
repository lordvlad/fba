const {createReader, createBuilder} = require('jssbml')

module.exports = function (self) {
  let reader
  function waitForMessage () {
    self.removeEventListener('message', onSbmlFileTail)
    self.addEventListener('message', onMessage)
  }
  function waitForSbmlFileTail () {
    self.removeEventListener('message', onMessage)
    self.addEventListener('message', onSbmlFileTail)
  }
  function onMessage ({data: [key, data]}) {
    if (key !== 'parse') return
    reader = createReader()
    reader.pipe(createBuilder()).on('data', function (model) {
      waitForMessage()
      self.postMessage(['parse:done', model])
    })
    reader.write(data)
    waitForSbmlFileTail()
  }
  function onSbmlFileTail ({data}) {
    reader.write(data)
  }

  waitForMessage()
}
