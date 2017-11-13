const html = require('choo/html')
const css = require('sheetify')

const li = require('./li')
const fileView = require('./file')
const networkView = require('./network')
const calcView = require('./calc')
const optionsView = require('./options')

const width = css`:host > ul { width: 16em }`

module.exports = function menuView (state, emit) {
  const select = (what) => (e) => emit('menu:active', what)
  const {content, menu} = state

  const tab = ({
    file: () => fileView(state, emit),
    network: () => networkView(state, emit),
    calculate: () => calcView(state, emit),
    options: () => optionsView(state, emit),
    [null]: () => ''
  })[menu.active]()

  const lii = (title, icon, onclick, disabled = false, children) => li({title,
    icon,
    onclick,
    selected: menu.active === title,
    disabled,
    text: false,
    styles: 'pa3',
    children
  })

  return html`
    <div class="pa0 ma0 h-100 flex flex-row">
      <div class="pa0 ma0 h-100 bg-black-80">
        <ul class="list pa0 ma0 h-100 flex flex-column">
          ${lii('file', 'file-o', select('file'))}
          ${lii('network', 'code-fork', select('network'), !content.model)}
          ${lii('calculate', 'calculator', select('calculate'), !content.model)}
          <li class="self-stretch" style="flex-grow: 100"> </li>
          ${lii('options', 'wrench', select('options'))}
        </ul>
      </div>
      <div class="${width} pa0 ma0 h-100 bg-black-60">
        ${tab}
      </div>
    </div>
  `
}
