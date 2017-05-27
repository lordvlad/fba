const html = require('choo/html')
const css = require('sheetify')

const { killEvent, li } = require('./util')
const fileView = require('./file')
const networkView = require('./network')
const calcView = require('./calc')
const optionsView = require('./options')

const width = css`:host { width: 240px; }`

module.exports = function menuView (appstate, emit) {
  const state = appstate.menu
  const select = (what) => (e) => killEvent(e) && emit('activeMenu', what)

  const wrap = (e) => html`<div class="${width} dib">${e}</div>`

  const tab = ({
    file: () => wrap(fileView(state.file, emit)),
    network: () => wrap(networkView(state.network, emit)),
    calculate: () => wrap(calcView(state.clac, emit)),
    options: () => wrap(optionsView(state.options, emit)),
    [null]: () => ''
  })[state.active]()

  const lii = (title, icon, disabled = false) => li({title,
    icon,
    onclick: select(title),
    selected: state.active === title,
    disabled,
    text: false,
    styles: 'pa3'
  })

  return html`
    <div class="pa0 ma0 h-100 dib v-top flex flex-row">
      <div class="dib pa0 ma0 h-100 v-top bg-black-80">
        <ul class="list pa0 ma0">
          ${lii('file', 'file-o')}
          ${lii('network', 'code-fork', !appstate.content.model)}
          ${lii('calculate', 'calculator', !appstate.content.model)}
          ${lii('options', 'wrench')}
        </ul>
      </div>
      <div class="dib pa0 ma0 h-100 v-top bg-black-60">
        ${tab}
      </div>
    </div>
  `
}
