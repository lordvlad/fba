const ndarray = require('ndarray')
const fill = require('ndarray-fill')
const traverse = require('traverse')
const { assign } = require('ndarray-ops')

const { simplex } = require('./optimize')
const { Model, Species, Reaction, Unit, Compartment } = require('../model')
const proto = (o, c) => Object.setPrototypeOf(o, c.prototype)
const deleteThis = new Set()
;['graph', 'group', 'transform', 'pool'].forEach((x) => deleteThis.add(x))

module.exports = function (self) {
  function clean (model) {
    traverse(model).forEach(function (x) {
      if (x) {
        if (deleteThis.has(this.key)) return this.delete(true)

        if (x.$constructor) {
          switch (x.$constructor) {
            case 'Model': proto(x, Model); break
            case 'Unit': proto(x, Unit); break
            case 'Species': proto(x, Species); break
            case 'Reaction': proto(x, Reaction); break
            case 'Compartment': proto(x, Compartment); break
          }
          this.update(x)
        }
      }
    })
    return model
  }

  function fba ({model, options}) {
    const {print} = options

    print(`starting fba for model ${model.id}`)
    print(`restoring prototypes`)
    clean(model, print)

    print('setting up variables')
    const n = model.reactions.size
    const m = model.species.size
    const constraints = []
    const objective = ndarray(new Float64Array(n), [n, 1])
    const lbs = ndarray(new Float64Array(n), [n, 1])
    const ubs = ndarray(new Float64Array(n), [n, 1])

    print('getting stoichiometricMatrix')
    const S = model.stoichiometricMatrix

    print('setting up objective')
    fill(objective, () => 1)

    print('setting up constraints')
    for (let i = 0; i < m; i++) {
      let coef = ndarray(new Float64Array(n), [n])
      assign(coef, S.pick(i, null))
      constraints.push([coef.data, '=', 0])
    }

    print('setting up bounds')
    fill(lbs, () => -1)
    fill(ubs, () => 1)

    print('starting simplex')
    return simplex({
      objective: { coef: objective },
      constraints,
      lbs,
      ubs,
      print
    })
  }

  self.addEventListener('message', function ({data}) {
    let t = Date.now()
    try {
      data.options.print = (s) => self.postMessage({debug: t + ': ' + s})
      self.postMessage({debug: `starting fba ${t}`})
      let r = fba(data)
      self.postMessage({debug: `done with fba ${t}`})
      self.postMessage(r)
    } catch (e) {
      self.postMessage({error: {message: e.message, stack: e.stack}})
    }
  })
  self.postMessage('alive')
}
