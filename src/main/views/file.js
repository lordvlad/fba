const html = require('choo/html')
const { li } = require('./util')

module.exports = function fileView (state, send) {
  return html`
    <div>
      <nav class="vclNavigation vclLayoutVertical vclLayoutFlex vclVertical">
        <ul>
          ${li('new model', 'file-o', () => send('newModel'))}
          ${li('open sbml', 'folder-open-o', () => send('openModelFile'))}
        </ul>
      </nav>
    </div>
  `
}
