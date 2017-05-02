const through = require('through2')
const pipe = require('multipipe')
const assign = require('object-assign')
const omit = require('lodash/omit')
const sax = require('sax')

const { last, pop, push } = require('../util')
const { Model } = require('../model')

module.exports = (o) => pipe(read(o), build())

const getChild = (o, $name) => o.$children.find((x) => x.$name === $name) || {}
const listOf = (o, what) => getChild(o, `listOf${what}`).$children || []
const clean = (o) => omit(o, ['$children', 'annotation', '$name'])

function build () {
  return through.obj((d, _, c) => c(null, mkgraph(d)))
}

function mkgraph (o) {
  let m = new Model(clean(o))

  for (let c of listOf(o, 'Compartments')) m.addCompartment(clean(c))
  for (let c of listOf(o, 'Species')) m.addSpecies(clean(c))
  for (let c of listOf(o, 'Reactions')) {
    let r = m.addReaction(clean(c))
    for (let s of listOf(c, 'Reactants')) r.addReactant(clean(s))
    for (let s of listOf(c, 'Products')) r.addProduct(clean(s))
    for (let s of listOf(c, 'Modifiers')) r.addModifier(clean(s))
  }

  return m
}

function read (opt = { strict: true }) {
  const mkparser = () => sax.createStream(opt.strict, opt)
  const stack = [{}]
  const write = (d, _, c) => parser.write(Buffer.from(d)) && c()
  const dup = through.obj(write)

  let parser = mkparser()

  parser.on('error', (e) => dup.emit('error', e))
  parser.on('opentag', (n) => push(stack, assign(n.attributes, { $name: n.name })))
  parser.on('closetag', (n) => {
    let o = pop(stack)
    let p = last(stack)

    if (n.toLowerCase() === 'model') {
      dup.push(o)
      dup.push(null)
      return
    }

    if (!p.$children) p.$children = []
    p.$children.push(o)
  })

  return dup
}
