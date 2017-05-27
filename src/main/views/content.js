const html = require('choo/html')
const draw = require('./draw')

function modelView (model, emit) {
  const id = 'model_' + model.id
  let done = false
  const load = () => setTimeout(() => {
    if (done) return
    done = true
    draw(model, document.body.querySelector(`#${id}`))
  }, 1000)
  const style = 'height:100%; width:100%'
  const node = html`<div id=${id} class=graph style=${style} onload=${load}></div>`
  node.isSameNode = function (o) {
    const r = o && o.nodeName && o.id === this.id
    if (!r) load()
    return r
  }
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
    <div class="v-top dib h-100">
      content
    </div>
  `
  // return html`
  //   <div style="overflow: hidden; width: 100%" class="vclCenter vclMiddle vclLayoutCenter vclLayoutHorizontal">
  //     ${!model ? callout(noModel) : model.error ? callout(model.error) : modelView(model, emit)}
  //   </div>
  // `
}
