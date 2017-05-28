const test = require('ava')
const fs = require('fs')
const sbml = require('../main/services/sbml')
const { defer } = require('../main/lib/util')

const file = 'gly'

test.before('load model', async function (t) {
  const d = defer()
  fs.createReadStream(`${__dirname}/resources/${file}.xml`)
    .pipe(sbml())
    .on('data', d.resolve.bind(d))
    .on('error', d.reject.bind(d))

  await d.promise
})

test.todo('reviving a model')
