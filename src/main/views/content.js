const html = require('choo/html')

const modelView = require('./model')

const callout = (inner) => html`
  <div class="measure pa4 mt4 bg-lightest-blue center v-mid">${inner}</div>
`

module.exports = function contentView ({content}, emit) {
  const example = () => emit('file:open:biomodelsid', content.exampleId)
  const example1 = () => emit('file:open:url', content.exampleUrl)

  const noModel = html`
    <div class="pa0 ma0">
      Start creating a metabolic network by
      <ul>
        <li>Drag and drop an SBML file anywhere on the page</li>
        <li>Go through the file menu to open an SBML file</li>
        <li>Open an <a href=# title=${content.exampleID} onclick=${example}>example model from biomodels</a></li>
        <li>Open an <a href=# title=${content.exampleUrl} onclick=${example1}>example model from a URL</a></li>
      </ul>
    </div>
  `
  const hasModel = !!content.model
  return html`
    <div class="overflow-hidden w-100 v-top dib h-100">
      ${hasModel ? modelView(content) : callout(noModel)}
    </div>
  `
}
