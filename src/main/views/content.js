const html = require('choo/html')
const draw = require('./draw')

function modelView (model, _, send) {
  const load = (node) => setTimeout(() => draw(model, node), 10)
  const style = 'height:100%; width:100%'
  return html`
    <div id=graph class=graph style=${style} onload=${load}></div>
  `
}

module.exports = function contentView (appstate = {}, prev, send) {
  const { content } = appstate
  const { model } = content || {}
  const callout = html`
    <div class="vclCallout vclInfo" style="margin: auto">
      Start creating a metabolic network by
      <ul>
        <li>Drag and drop an SBML file anywhere on the page</li>
        <li>Go through the file menu to open an SBML file</li>
        <li>Open the search tab and drag and drop reactions onto the page</li>
      </ul> 
    </div>
  `
  return html`
    <div style="overflow: hidden; width: 100%" class="vclCenter vclMiddle vclLayoutCenter vclLayoutHorizontal">
      ${model ? modelView(model, null, send) : callout} 
    </div>
  `
}