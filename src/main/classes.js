const assign = require('object-assign')
const ndarray = require('ndarray')

const { words } = require('./util')

class Node {
  constructor (attr) { assign(this, attr, {$class: this.constructor.name, annotation: null}) }
  get label () { return this.id }
}

class Model extends Node {
  constructor (attr) { super(assign({groups: [], nodes: [], links: [], species: [], reactions: []}, attr)) }
  get stoichiometricMatrix () {
    const {species, reactions} = this
    const n = species.length
    const m = reactions.length
    const s = ndarray(new Array(n * m), [n, m])

    let i = 0
    for (let spec of species) {
      let j = 0
      for (let react of reactions) {
        for (let r of (react.listOfReactants || [])) {
          console.log(react.id, 'reactand', r)
          if (spec.id === r.species.id) {
            s.set(i, j, r.stoichiometry)
          }
        }
        for (let r of (react.listOfProducts || [])) {
          console.log(react.id, 'product', r)
          if (spec.id === r.species.id) {
            s.set(i, j, -r.stoichiometry)
          }
        }
        j++
      }
      i++
    }

    return s
  }
}
class Species extends Node { }
class Compartment extends Node {
  constructor (attr) {
    super(assign({leaves: [], groups: []}, attr))
  }
}
class Unit extends Node { }
class Reaction extends Node { }
class SpeciesReference extends Node {
  constructor (attr) { super(assign({stoichiometry: 1}, attr)) }
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

module.exports = {
  Node,
  Model,
  Species,
  Compartment,
  Unit,
  Reaction,
  SpeciesReference,
  ModifierSpeciesReference,
  create
}

