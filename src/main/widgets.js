const hyperx = require('hyperx')
const { h, create } = require('virtual-dom')
const hx = hyperx(h)
const draw = require('./draw')

class GraphWidget {

  get type () { return 'Widget' }

  constructor (graph) {
    this.graph = graph
  }

  init () {
    this.tree = hx`
      <div style="overflow:hidden; width:100%; height:100%;">
      </div>
    `
    this.node = create(this.tree)
    setTimeout(() => draw(this.graph, this.node), 10)
    return this.node
  }

  update () {
    return null
  }
}

module.exports = { GraphWidget }
