const assign = require('object-assign')
const tobj = require('through2').obj
const cycle = require('./cycle')

class Node {
  constructor (attr) { assign(this, attr, {$class: this.constructor.name, annotation: null}) }
  get label () { return this.id }
}

class Model extends Node { }
class Species extends Node { }
class Compartment extends Node {
  constructor (attr) {
    super(assign({leaves: [], groups: []}, attr))
  }
}
class Unit extends Node { }
class Reaction extends Node { }
class SpeciesReference extends Node {
  get label () { return this.species.label }
 }
class ModifierSpeciesReference extends SpeciesReference {}

const create = ({name, attributes}) => {
  if (name.startsWith('listOf')) return []

  switch (name) {
    case 'model': return new Model(attributes)
    case 'unitDefinition': return new Unit(attributes)
    case 'compartment': return new Compartment(attributes)
    case 'species': return new Species(attributes)
    case 'reaction': return new Reaction(attributes)
    case 'speciesReference': return new SpeciesReference(attributes)
    case 'modifierSpeciesReference': return new ModifierSpeciesReference(attributes)
  }

  return attributes
}

const isDefined = (x) => typeof x !== 'undefined'
const func = (fn) => (...args) => isDefined(args[0]) ? fn(...args) : 0[0]
const last = func((a) => a[a.length - 1])
const either = (...args) => args.find(isDefined)
const pop = func((a) => a.pop())
const push = func((a, b) => a.push(b))
const reduce = func((a, c, s) => a.reduce(c, s))
const getOrSet = (k, v) => func((o) => (o[k] = either(o[k], v)))
const empty = (t) => !t.trim().length
const get = func((o, k) => o[k])
const json = (...args) => tobj((o, _, c) => c(null, JSON.stringify(cycle.decycle(o), ...args)))
const pick = (...attr) => tobj((o, _, c) => c(null, reduce(attr, get, o)))

module.exports = {
  Node,
  Model,
  Species,
  Compartment,
  Unit,
  Reaction,
  SpeciesReference,
  ModifierSpeciesReference,
  create,
  isDefined,
  func,
  last,
  either,
  pop,
  push,
  getOrSet,
  empty,
  json,
  pick
}

