const through = require('through2')
const traverse = require('traverse')
const assign = require('object-assign')
const sax = require('sax')
const { last, pop, push, words } = require('./util')
const {
  Model,
  Species,
  Reaction,
  Compartment,
  create
} = require('./classes')

module.exports = { read, build, mkgraph }

function mkgraph (model, opt = {}) {
  const seen = new Set()
  const species = new Map()
  const refs = new Map()
  const compartments = new Map()
  const g = {links: [], nodes: [], groups: [], constraints: []}

  return traverse(model).reduce(function (_, x) {
    if (!seen.has(x)) {
      seen.add(x)

      if (x instanceof Compartment) {
        compartments.set(x.id, x)
        let i = g.groups.push(assign(x, {groups: [], leaves: []})) - 1
        if (x.outside) {
          compartments.get(x.outside).groups.push(i)
        }
      } else if (x instanceof Species) {
        species.set(x.id, x)
        /* let c = */ x.compartment = compartments.get(x.compartment)
        // let i = g.nodes.push(x) - 1
        // c.leaves.push(i)
      } else if (x instanceof Reaction) {
        let i = g.nodes.push(x) - 1
        const comp = []
        for (let t of words('Products Reactants Modifiers')) {
          for (let r of (x['listOf' + t] || [])) {
            let c
            if (refs.has(r.species)) {
              r = refs.get(r.species)
              c = r.compartment
            } else {
              refs.set(r.species, r)
              let s = r.species = species.get(r.species)
              c = r.compartment = compartments.get(s.compartment.id)
              let i = g.nodes.push(r) - 1
              c.leaves.push(i)
            }
            if (comp.indexOf(c) === -1) comp.push(c)
            let [source, target] = (t === 'Products') ? [r, x] : [x, r]
            g.links.push({source, target})
          }
        }
        if (comp.length === 1) {
          comp[0].leaves.push(i)
        } else {
          x.transporter = true
          // fixme put it on the border between two compartments
          comp[0].leaves.push(i)
        }
      }
    }

    return g
  })
}

function build (opt = {}) {
  return through.obj((d, _, c) => c(null, mkgraph(d, opt)))
}

function read (opt = {strict: true}) {
  const mkparser = () => sax.createStream(opt.strict, opt)
  const stack = [{}]
  const write = (d, _, c) => parser.write(d) && c()
  const dup = through.obj(write)

  let parser = mkparser()

  parser.on('error', (e) => dup.emit('error', e))
  parser.on('opentag', (n) => push(stack, create(n)))
  parser.on('closetag', (n) => {
    let o = pop(stack)
    let p = last(stack)

    if (o instanceof Model) {
      dup.push(o)
      parser = mkparser() // FIXME see if we can go around building a new parser
      return
    }

    if (Array.isArray(p)) p.push(o)
    else p[n] = o
  })

  return dup
}
