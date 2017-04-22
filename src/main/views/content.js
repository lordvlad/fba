const html = require('choo/html')
const draw = require('./draw')

function modelView (model, emit) {
  const load = () => setTimeout(() => draw(model, document.body.querySelector('#graph')), 1000)
  const style = 'height:100%; width:100%'
  const node = html`
    <div id=graph class=graph style=${style} onload=${load}></div>
  `
  node.isSameNode = function (o) { return o && o.nodeName && o.id === 'graph' }
  return node
}

const callout = (inner) => html`
  <div class="vclCallout vclInfo" style="margin: auto">${inner}</div>
`

const noModel = html`
  <div>
    Start creating a metabolic network by
    <ul>
      <li>Drag and drop an SBML file anywhere on the page</li>
      <li>Go through the file menu to open an SBML file</li>
      <li>Open the search tab and drag and drop reactions onto the page</li>
    </ul> 
  </div>
`

module.exports = function contentView (appstate, emit) {
  const { content } = appstate
  const { model } = content || {}
  return html`
    <div style="overflow: hidden; width: 100%" class="vclCenter vclMiddle vclLayoutCenter vclLayoutHorizontal">
      ${!model ? callout(noModel) : model.error ? callout(model.error) : modelView(model, emit)} 
    </div>
  `
}
