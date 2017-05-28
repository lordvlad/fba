const html = require('choo/html')
const draw = require('./draw')

const exampleId = 'BIOMD0000000172'

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
  <div class="measure pa4 mt4 bg-lightest-blue center v-mid">${inner}</div>
`

module.exports = function contentView ({content}, emit) {
  const example = () => emit('file:open:biomodelsid', exampleId)

  const noModel = html`
    <div class="pa0 ma0">
      Start creating a metabolic network by
      <ul>
        <li>Drag and drop an SBML file anywhere on the page</li>
        <li>Go through the file menu to open an SBML file</li>
        <li>Open the search tab and drag and drop reactions onto the page</li>
        <li>Open an <a href=# onclick=${example}>example model</a></li>
      </ul>
    </div>
  `
  const { model } = content || {}
  return html`
    <div class="overflow-hidden w-100 v-top dib h-100">
      ${!model ? callout(noModel) : model.error ? callout(model.error) : modelView(model, emit)}
    </div>
  `
}
