const html = require('choo/html')
const Nanocomponent = require('nanocomponent')
const nanobus = require('nanobus')

const draw = require('../lib/draw')

module.exports = class ModelComponent extends Nanocomponent {
  constructor () {
    super()
    this.state = nanobus()
    this.state.model = null
    this.style = 'height:100%; widht:100%'
  }

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
      this.state.emit(key, val)
    }
  }

  draw () { draw(this.element, this.state) }
  load () { this.draw() }
  afterupdate () { this.draw() }
  emit (...args) { this.state.emit(...args) }
}
