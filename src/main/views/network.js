const html = require('choo/html')
const li = require('./li')

module.exports = function networkView (state, send) {
  const wrap = (lis) => html`<ul class="list pa0 ma0">${lis}</ul>`
  const { directories, detail } = state.menu.network
  if (detail) {
    return wrap(
      li({
        title: detail.id,
        icon: 'info',
        text: detail.id,
        styles: 'underline'
      }))
  }
  if (directories) {
    return wrap(
      li({title: 'TODO', text: 'TODO'})
    )
    // TODO
  }
  return wrap(
    li({title: 'TODO', text: 'TODO'})
  )
}
