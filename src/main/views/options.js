const html = require('choo/html')
const li = require('./li')

module.exports = function optionsView (state, send) {
  return html`
    <ul class="list pa0 ma0">
      ${li('todo', 'question')}
    </ul>
    `
}
