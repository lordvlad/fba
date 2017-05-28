const html = require('choo/html')
const li = require('./li')

module.exports = function calcView (state, emit) {
  return html`
    <ul class="list pa0 ma0">
      ${li({title: 'fba'})}
      ${li({title: 'dyn. simulation'})}
    </ul>
  `
}
