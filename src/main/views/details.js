const html = require('choo/html')

const li = require('./li')

module.exports = function fileView (state, emit) {
  const detail = state.detail
  return html`
    <ul class="list pa0 ma0 measure-narrow">
      ${li({
        title: detail.id,
        icon: 'info',
        text: detail.id
      })}
    </ul>
  `
}
