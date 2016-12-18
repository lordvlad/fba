const { read, build } = require('./parser')
const dnd = require('drag-and-drop-files')
const frs = require('filereader-stream')

class DropHook {
  constructor (cb, el) { this.cb = cb; this.el = el }
  hook (node) {
    dnd(this.el || node, ([file]) => frs(file).pipe(read()).pipe(build()).on('data', this.cb))
  }
}

class FocusHook {
  hook (node) {
    setTimeout(() => node.focus(), 10)
  }
}

module.exports = { DropHook, FocusHook }
