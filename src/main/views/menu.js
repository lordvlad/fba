const html = require('choo/html')
const css = require('sheetify')

const li = require('./li')
const fileView = require('./file')
const networkView = require('./network')
const calcView = require('./calc')
const optionsView = require('./options')

const width = css`:host > ul { width: 12em }`

module.exports = function menuView ({menu, content}, emit) {
  const select = (what) => (e) => emit('menu:active', what)
  const toggleConsole = (e) => emit('console:toggle')

  const tab = ({
    file: () => fileView(menu.file, emit),
    network: () => networkView(menu.network, emit),
    calculate: () => calcView(menu.calculate, emit),
    options: () => optionsView(menu.options, emit),
    [null]: () => ''
  })[menu.active]()

  const lii = (title, icon, onclick, disabled = false) => li({title,
    icon,
    onclick,
    selected: menu.active === title,
    disabled,
    text: false,
    styles: 'pa3'
  })

  return html`
    <div class="pa0 ma0 h-100 flex flex-row">
      <div class="pa0 ma0 h-100 bg-black-80">
        <ul class="list pa0 ma0">
          ${lii('file', 'file-o', select('file'))}
          ${lii('network', 'code-fork', select('network'), !content.model)}
          ${lii('calculate', 'calculator', select('calculate'), !content.model)}
          ${lii('options', 'wrench', select('options'))}
          ${lii('console', 'terminal', toggleConsole)}
        </ul>
      </div>
      <div class="${width} pa0 ma0 h-100 bg-black-60">
        ${tab}
      </div>
    </div>
  `
}
