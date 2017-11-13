const html = require('choo/html')
const css = require('sheetify')
const xtend = require('xtend')

const ModelComponent = require('../components/model')
const { killEvent } = require('../lib/util')

const modelComponent = new ModelComponent()

const constStyle = css`
  :host {
    cursor: pointer;
    transition: color .15s ease-in;
  }
`
const disabledLink = css`
  :host {
    cursor: default;
  }
 `

const callout = (inner) => html`
  <div class="measure pa4 mt4 bg-lightest-blue center v-mid">${inner}</div>
`

const notImpl = () => console.log('not implemented')
const noop = () => {}
const li = ({title = 'blub', icon = 'angle-right', onclick = notImpl, styles = '', flip = false, disabled = false}) => html`
  <li class="pa3 pr0 ${styles} ${disabled ? '' : constStyle} dib hover-black black-40 ${disabled ? 'hover-black-40' : ''}"
      role=presentation
      title=${title}
      onclick=${disabled ? noop : (e) => { killEvent(e); onclick(e) }}>
    <a title=${title}
        href=#
        tabindex=0
        class="link ${disabled ? disabledLink : ''}"
        onclick=${disabled ? noop : (e) => { killEvent(e); onclick(e) }}>
      <i class="fa fa-fw fa-${icon} ${flip ? 'fa-flip-horizontal' : ''}"></i>
    </a>
  </li>
`
const lii = (icon, title, onclick, disabled = false, flip = false) => li({icon, title, onclick, flip, disabled})


module.exports = function contentView ({content}, emit) {
  const example = () => emit('file:open:biomodelsid', content.exampleId)
  const example1 = () => emit('file:open:url', content.exampleUrl)

  if (!content.model) {
    return callout(html`
      <div class="pa0 ma0">
        Start creating a metabolic network by
        <ul>
          <li>Drag and drop an SBML file anywhere on the page</li>
          <li>Go through the file menu to open an SBML file</li>
          <li>Open an <a href=# title=${content.exampleID} onclick=${example}>example model from biomodels</a></li>
          <li>Open an <a href=# title=${content.exampleUrl} onclick=${example1}>example model from a URL</a></li>
        </ul>
      </div>
    `)
  }

  const { undoable, redoable, lock, pan } = modelComponent.state
  modelComponent.bubbleUp = () => emit('render')

  return html`
    <div class="w-100 h-100">
      <ul class="w-100 list dib pa0 ma0">
        ${lii('undo', 'undo', () => modelComponent.undo(), !undoable)}
        ${lii('undo', 'redo', () => modelComponent.redo(), !redoable, true)}
        ${lii(lock ? 'lock' : 'unlock', `${lock ? 'unlock' : 'lock'} positions`, () => modelComponent.toggleLock())}
        ${lii(pan ? 'hand-paper-o' : 'arrows', `${pan ? 'disable' : 'enable'} pan and zoom controls`, () => modelComponent.togglePan())}
      </ul>
      ${modelComponent.render(content)}
    </div>
  `
}
