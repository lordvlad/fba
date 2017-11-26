const html = require('choo/html')
const css = require('sheetify')

const li = require('./li')
const fileView = require('./file')
const networkView = require('./network')
const calcView = require('./calc')
const optionsView = require('./options')

const query = (s) => document.querySelector(s)

const guard = css`:host { width: 50px; }`
const drag = css`:host { width: 5px; cursor: col-resize; }`
const submenu = css`
  :host .guard { display: none; }
  :host:hover .guard { display: inline-block; }
  :host > div > ul { width: 100%; }
`

module.exports = function menuView (state, emit) {
  const select = (what) => (e) => emit('menu:active', what)
  const { content, menu } = state
  const getMainMenuWidth = (() => {
    let w = null
    return () => {
      if (w == null) w = query('.main-menu').offsetWidth
      return w
    }
  })()

  const tab = ({
    file: () => fileView(state, emit),
    network: () => networkView(state, emit),
    calculate: () => calcView(state, emit),
    options: () => optionsView(state, emit),
    [null]: () => ''
  })[menu.active]()

  const lii = (title, icon, onclick, disabled = false, children) => li({
    title,
    icon,
    onclick,
    selected: menu.active === title,
    disabled,
    text: false,
    styles: 'pa3',
    children
  })

  const ondrag = (e) => {
    if (e.clientX <= 0) return
    menu.width = e.clientX - getMainMenuWidth()
    emit('render')
  }

  const ondragstart = (e) => { menu.dragging = true; emit('render') }
  const ondragend = (e) => { menu.dragging = false; emit('render') }

  return html`
    <div class="pa0 ma0 h-100 flex flex-row z-2">
      <div class="pa0 ma0 h-100 bg-dark-gray">
        <ul class="main-menu list pa0 ma0 h-100 flex flex-column">
          ${lii('file', 'file-o', select('file'))}
          ${lii('network', 'code-fork', select('network'), !content.model)}
          ${lii('calculate', 'calculator', select('calculate'), !content.model)}
          <li class="self-stretch" style="flex-grow: 100"> </li>
          ${lii('options', 'wrench', select('options'))}
        </ul>
      </div>
      ${!tab ? '' : html`<div class=${submenu}>
        <div style="width: ${menu.width}px" class="${submenu} v-top dib pa0 ma0 h-100 bg-gray">
          ${tab}
        </div>
        <div class="v-top h-100 dib pa0 ma0 hover-bg-dark-gray ${drag} ${menu.dragging ? 'bg-dark-gray' : ''}"
          ondragstart=${ondragstart} ondragend=${ondragend} ondrag=${ondrag} draggable=true></div>
        <div class="guard v-top h-100 dib pa0 ma0 ${guard}"></div>
      </div>`}
    </div>
  `
}
