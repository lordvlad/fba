const assign = require('object-assign')
const ndarray = require('ndarray')

class Clazz {
  constructor (attr) {
    assign(this, attr, { $constructor: this.constructor.name })
  }
}

class Entity extends Clazz {
}

class Shape extends Clazz {
  constructor (attr) {
    super(assign({x: 0, y: 0, X: 0, Y: 0}, attr))
  }
}

class Rect extends Shape {
  constructor (attr) {
    super(assign({shape: 'rect'}, attr))
  }
}

class Circle extends Shape {
  constructor (attr) {
    super(assign({shape: 'circle'}, attr))
  }
  get r () { return this.width / 2 }
}

class Group extends Rect {
  constructor (compartment) {
    super({ compartment, leaves: [], groups: [], rx: 8, ry: 8 })
  }
  get id () { return this.compartment.id }
  get label () { return this.compartment.id }
  get className () { return `group compartment ${this.id}` }
}

class Transform extends Rect {
  constructor (reaction) {
    super({ reaction, leaves: [], groups: [] })
  }
  get id () { return this.reaction.id }
  get label () { return this.reaction.id }
  get className () { return `node reaction ${this.id}` }
}

class Pool extends Circle {
  constructor (species) {
    super({species, refs: []})
  }
  get id () { return this.species.id }
  get label () { return this.species.id }
  get className () { return `node pool ${this.id}` }
}

class Graph extends Entity {
  constructor (attr) {
    super(assign({nodes: [], links: [], groups: [], constraints: []}, attr))
  }
}

class Model extends Entity {
  constructor (attr) {
    super(assign({
      graph: new Graph(),
      species: new Map(),
      reactions: new Map(),
      compartments: new Map()
    }, attr))
  }

  addCompartment (x) {
    let c = new Compartment(x)
    let g = new Group(c)
    c.group = g
    c.model = this

    this.compartments.set(c.id, c)
    let i = g.nodeIndex = this.graph.groups.push(g) - 1
    if (c.outside) {
      c.outside = this.compartments.get(c.outside)
      g.groups.push(i)
    }
    return c
  }

  addSpecies (x) {
    let s = new Species(x)
    let p = new Pool(s)
    s.pool = p
    s.model = this

    this.species.set(s.id, s)
    s.compartment = this.compartments.get(s.compartment)
    let i = p.nodeIndex = this.graph.nodes.push(p) - 1
    s.compartment.group.leaves.push(i)
    return s
  }

  addReaction (x) {
    let r = new Reaction(x)
    let t = new Transform(r)
    r.transform = t
    r.model = this

    this.reactions.set(r.id, r)
    t.nodeIndex = this.graph.nodes.push(t) - 1
    return r
  }

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
          console.log(react.id, 'reactant', r)
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

class Species extends Entity {
  get label () { return this.id }
}


class Compartment extends Entity { }
class Unit extends Entity { }
class Reaction extends Entity {
  constructor (attr) { super(assign({reversible: true, modifiers: [], reactants: [], products: []}, attr)) }
  get compartment () { return this._compartment }
  set compartment (c) {
    if (this._compartment) {
      // todo remove from old compartment
    }
    this._compartment = c
    c.group.leaves.push(this.transform.nodeIndex)
  }
  _mkSpeciesRef (x) {
    let s = new SpeciesReference(x)
    s.species = this.model.species.get(s.species)
    s.species.pool.refs.push(s)
    if (!this.compartment) this.compartment = s.species.compartment
    return s
  }
  addReactant (x) {
    let s = this._mkSpeciesRef(x)
    this.reactants.push(s)
    this.model.graph.links.push({source: s.species.pool, target: this.transform})
    return s
  }
  addModifier (x) {
    let s = this._mkSpeciesRef(x)
    this.modifiers.push(s)
    this.model.graph.links.push({source: s.species.pool, target: this.transform})
    return s
  }
  addProduct (x) {
    let s = this._mkSpeciesRef(x)
    this.products.push(s)
    this.model.graph.links.push({target: s.species.pool, source: this.transform})
    return s
  }
}
class SpeciesReference extends Entity {
  constructor (attr) { super(assign({stoichiometry: 1}, attr)) }
  get label () { return this.species.label }
}
class ModifierSpeciesReference extends SpeciesReference {}

const create = (attributes) => {
  switch (attributes.$name) {
    case 'model': return new Model(attributes)
    case 'unitDefinition': return new Unit(attributes)
    case 'compartment': return new Compartment(attributes)
    case 'species': return new Species(attributes)
    case 'reaction': return new Reaction(attributes)
    case 'speciesReference': return new SpeciesReference(attributes)
    case 'modifierSpeciesReference': return new ModifierSpeciesReference(attributes)
    default: return attributes
  }
}

module.exports = {
  Pool,
  Transform,
  Model,
  Species,
  Compartment,
  Unit,
  Reaction,
  SpeciesReference,
  ModifierSpeciesReference,
  Group,
  create
}
