const port = 8082
const sax = require('sax')
const through = require('through2')
const assign = require('object-assign')
const http = require('http')
const shoe = require('shoe')
const browserify = require('browserify')
const defaultIndex = require('simple-html-index')
const clones = ['P', 'ATP', 'ADP', 'NAD', 'NADH']

const bundler = browserify('src/main/js/client/index.js', {
  debug: true
})

const {
  Model,
  Species,
  Reaction,
  Compartment,
  Unit,
  SpeciesReference,
  ModifierSpeciesReference,
  create,
  last,
  pop,
  push,
  json
} = require('../shared')

function read (opt = {strict: true}) {
  const mkparser = () => sax.createStream(opt.strict, opt)
  const stack = [{}]
  const compartments = new Map()
  const species = new Map()
  const units = new Map()
  const write = (d, _, c) => parser.write(d) && c()
  const dup = through.obj(write)

  let parser = mkparser()
  let links = []
  let nodes = []
  let groups = []

  parser.on('error', (e) => dup.emit('error', e))
  parser.on('opentag', (n) => push(stack, create(n)))
  parser.on('closetag', (n) => {
    let o = pop(stack)
    let p = last(stack)

    if (o instanceof Compartment) {
      compartments.set(o.id, o)
      o._index = groups.push(o) - 1
      if (o.outside) compartments.get(o.outside).groups.push(o._index)
    }
    if (o instanceof Species) {
      species.set(o.id, o)
      const comp = compartments.get(o.compartment)
      if (clones.indexOf(o.id) === -1) {
        o._index = nodes.push(o) - 1
        comp.leaves.push(o._index)
      }
      o.compartment = comp
    }
    if (o instanceof Reaction) {
      const comp = []
      o._index = nodes.push(o) - 1
      'Products Reactants Modifiers'.split(' ').forEach((t, i) => {
        (o['listOf' + t] || []).forEach((s) => {
          if (comp.indexOf(s.species.compartment) === -1) comp.push(s.species.compartment)
          if (clones.indexOf(s.species.id) === -1) s = s.species
          let [source, target] = i === 0 ? [o, s] : [s, o]
          links.push({source, target})
        })
      })
      if (comp.length === 1) {
        comp[0].leaves.push(o._index)
      } else {
        // fixme put it on the border between two compartments
        comp[0].leaves.push(o._index)
      }
    }
    if (o instanceof Unit) {
      units.set(o.id, o)
    }
    if (o instanceof SpeciesReference || o instanceof ModifierSpeciesReference) {
      o = assign({stoichiometry: 1},
        o,
        {species: species.get(o.species)}
      )
      if (clones.indexOf(o.species.id) !== -1) {
        o._index = nodes.push(o) - 1
        o.species.compartment.leaves.push(o._index)
      }
    }
    if (o instanceof Model) {
      compartments.clear()
      units.clear()
      species.clear()
      dup.push(assign(o, {links, nodes, groups}))
      links = []
      nodes = []
      groups = []
      parser = mkparser()
    }

    if (Array.isArray(p)) p.push(o)
    else p[n] = o
  })

  return dup
}

const reader = () => (stream) => stream
  .pipe(read())
  .on('error', (...args) => console.error('b', ...args))
  .pipe(json(null, 2))
  .pipe(stream, {end: false})

const server = http.createServer(function handle (req, res) {
  if (req.url === '/') defaultIndex({entry: 'app.js'}).pipe(res)
  else if (req.url === '/app.js') bundler.bundle().pipe(res)
})

server.listen(port)
shoe(reader()).install(server, '/reader')

