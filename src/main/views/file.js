const html = require('choo/html')
const { li } = require('./util')
const css = require('sheetify')

const tdn = css`:host a {text-decoration: none;}`

module.exports = function fileView (state, send) {
  const lii = (title, icon, onclick) => li({title,
    icon,
    onclick,
    styles: `pa3 ${tdn}`
  })

  return html`
    <ul class="list pa0 ma0">
      ${lii('new model', 'file-o', () => send('newModel'))}
      ${lii('open sbml', 'folder-open-o', () => send('openModelFile'))}
    </ul>
  `
}

// ${search(state.search, send)}
