const test = require('ava')
const fs = require('fs')
const sbml = require('../main/services/sbml')
const { defer, words } = require('../main/util')

test('test reading a file', async function (t) {
  for (let file of words('gly tca')) {
    const d = defer()
    fs.createReadStream(`${__dirname}/resources/${file}.xml`)
      .pipe(sbml())
      .on('data', d.resolve.bind(d))
      .on('error', d.reject.bind(d))

    const model = await d.promise

    t.truthy(model)
    t.snapshot(model)
  }
})
