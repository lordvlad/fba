const html = require('choo/html')
const modelView = require('./model')

module.exports = function (state, emit) {
  const v = modelView(state, emit)
  if (state.menu.active) {
    const closeMenu = () => emit('menu:active', state.menu.active)
    return html`<div class="overflow-hidden w-100 v-top dib h-100" onmousedown=${closeMenu}>${v}</div>`
  }
  return html`<div class="overflow-hidden w-100 v-top dib h-100">${v}</div>`
}
