const html = require('choo/html')
const Nanocomponent = require('nanocomponent')

const draw = require('../lib/draw')

class ModelView extends Nanocomponent {
  constructor () {
    super()
    this.model = null
    this.style = 'height:100%; widht:100%'
  }

  createElement (model) {
    this.model = model
    return html`<div class=graph style=${this.style}></div>`
  }

  update (model) { return this.model !== model }
  load () { draw(this.model, this.element) }
  afterupdate () { draw(this.model, this.element) }
}

const modelView = new ModelView()
module.exports = (state, emitter) => modelView.render(state)
