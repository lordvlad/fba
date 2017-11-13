const html = require('choo/html')
const Nanocomponent = require('nanocomponent')
const nanobus = require('nanobus')
const xtend = require('xtend')

const draw = require('../lib/draw')

module.exports = class ModelComponent extends Nanocomponent {
  constructor () {
    super()
    this.bus = nanobus()
    this.style = 'height:100%; widht:100%'
    this.state = {}
    this.state.model = null
    this.state.undoable = false
    this.state.redoable = false
    this.state.pan = false
    this.state.lock = false
    this.bus.on('render', () => {
      if (this.bubbleUp) this.bubbleUp()
    })
  }
  toggleLock () { this.setState({lock: !this.state.lock}) }
  togglePan () { this.setState({pan: !this.state.pan}) }
  undo() { this.bus.emit('do_undo') }
  redo() { this.bus.emit('do_redo') }

  createElement (state = {}) {
    this.setState(state)
    return html`<div class=graph style=${this.style}></div>`
  }

  update (state = {}) {
    if (state.model !== this.state.model) return true
    this.setState(state)
  }

  setState (state = {}) {
    for (let [key, val] of Object.entries(state)) {
      if (this.state[key] === state[key]) continue
      this.state[key] = val
      this.bus.emit(key, val)
    }
  }

  draw () {
    draw({
      container: this.element,
      events: this.bus,
      state: this.state,
      setState: (s) => this.setState(s)
    })
  }
  load () { this.draw() }
  afterupdate () { this.draw() }
}
