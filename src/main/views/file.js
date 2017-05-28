const html = require('choo/html')
const li = require('./li')

module.exports = function fileView (state, send) {
  const lii = (title, icon, onclick) => li({title, icon, onclick})

  return html`
    <ul class="list pa0 ma0 measure-narrow">
      ${lii('new model', 'file-o', () => send('model:new'))}
      ${lii('open sbml file\u2026', 'folder-open-o', () => send('file:select:file'))}
      ${lii('open sbml url\u2026', 'external-link', () => send('file:select:url'))}
    </ul>
  `
}
