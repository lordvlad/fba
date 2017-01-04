const { simplex } = require('./optimize')
const parse = require('./parse')

module.exports.search = require('./search')

module.exports.parse = function (opt) {
  return parse(opt)
}

module.exports.optimize = function (opt) {
  return simplex(opt)
}
