const draw = require('./draw')
const { read, build } = require('./parser')
const dnd = require('drag-and-drop-files')
const frs = require('filereader-stream')

class GraphHook {
  constructor (graph) { this.graph = graph }
  hook (node, propName, prev) {
    while (node.firstChild) node.removeChild(node.firstChild)
    setTimeout(() => draw(this.graph, node), 1)
  }
}

class DropHook {
  constructor (cb, el) { this.cb = cb; this.el = el }
  hook (node, propName, prev) {
    dnd(this.el || node, ([file]) => frs(file).pipe(read()).pipe(build()).on('data', this.cb))
  }
}

module.exports = { GraphHook, DropHook }