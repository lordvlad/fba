const html = require('choo/html')
const modelView = require('./model')

module.exports = function (state, emit) {
  const v = modelView(state, emit)
  const cls = 'absolute overflow-hidden w-100 h-100 v-top dib'
  if (state.menu.active) {
    const closeMenu = () => emit('menu:active', state.menu.active)
    return html`<div class="${cls}" onmousedown=${closeMenu}>${v}</div>`
  }
  return html`<div class="${cls}">${v}</div>`
}
