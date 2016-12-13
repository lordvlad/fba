const assign = require('object-assign')

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

