const html = require('choo/html')
const li = require('./li')

function wrap (lis) { return html`<ul class="list pa0 ma0">${lis}</ul>` }

function detailView (detail) {
  // for now its the same
  return wrap(listSelectionElementView(detail))
}

function listSelectionView (selection) {
  return wrap(selection.map(listSelectionElementView))
}

/**
 *
 * @param {*SNode} element
 */
function listSelectionElementView (element) {
  const { id } = element
  return li({
    title: id,
    icon: 'info',
    text: id,
    styles: 'underline'
  })
}

module.exports = function networkView (state, send) {
  const { directories, detail } = state.menu.network
  if (detail && detail.length) return listSelectionView(detail)
  if (detail) return detailView(detail)
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
