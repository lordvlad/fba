const html = require('choo/html')
const li = require('./li')

module.exports = function networkView (state, send) {
  const { directories, detail } = state.menu.network
  if (detail) {
    return html`
    <ul class="list pa0 ma0">
      ${li({
        title: detail.id,
        icon: 'info',
        text: detail.id,
        styles: 'b'
      })}
    </ul>
  `
  }
  if (directories) {
    // TODO
  }
}
