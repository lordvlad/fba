const test = require('ava')
const fs = require('fs')
const sbml = require('../main/services/sbml')
const { defer } = require('../main/util')
const { revive } = require('../main/model')

const file = 'gly'
let model = null

test.before('load model', async function (t) {
  const d = defer()
  fs.createReadStream(`${__dirname}/resources/${file}.xml`)
    .pipe(sbml())
    .on('data', d.resolve.bind(d))
    .on('error', d.reject.bind(d))

  model = await d.promise
})

test.todo('reviving a model')
