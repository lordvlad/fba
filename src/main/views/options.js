const html = require('choo/html')
const { li } = require('./util')

module.exports = function optionsView (state, send) {
  return html`
    <div>
      <nav class="vclNavigation vclLayoutVertical vclLayoutFlex vclVertical">
        <ul>
          ${li('todo')}
        </ul>
      </nav>
    </div>
    `
}
