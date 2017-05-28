const html = require('choo/html')
const li = require('./li')

module.exports = function networkView (state, send) {
  return html`
    <ul class="list pa0 ma0">
      ${li({title: 'todo'})}
    </ul>
    `
}
