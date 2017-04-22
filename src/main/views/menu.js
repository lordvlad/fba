const html = require('choo/html')

const { killEvent } = require('./util')
const fileView = require('./file')
const searchView = require('./search')
const networkView = require('./network')
const calcView = require('./calc')
const optionsView = require('./options')

function wrap (tab) {
  return html`
    <div class="vclLayoutVertical inner-sidebar" style="width: 240px">
      ${tab}
    </div>
  `
}

module.exports = function menuView (appstate, emit) {
  const state = appstate.menu
  const selected = (title) => state.active === title ? 'vclSelected' : ''
  const disabled = (t) => t ? 'vclDisabled' : ''
  const select = (what) => () => emit('activeMenu', what)
  const li = (title, icon, dis = false) => html`
    <li class="vclNavigationItem ${disabled(dis)} ${selected(title)}"
        role=presentation href=# aria-selected=${state.active === title}>
      <a class=vclNavigationItemLabel title=${title}
          onclick=${dis ? killEvent : select(title)}>
        <i class="vclIcon fa fa-fw fa-${icon}"></i>
      </a>
    </li>
  `

  const tab = ({
    file: () => wrap(fileView(state.file, emit)),
    search: () => wrap(searchView(state.search, emit)),
    network: () => wrap(networkView(state.network, emit)),
    calculate: () => wrap(calcView(state.clac, emit)),
    options: () => wrap(optionsView(state.options, emit)),
    [null]: () => ''
  })[state.active]()

  return html`
    <div class="vclLayoutHorizontal vlcLayoutFlex">
      <div class="vclLayoutVertical sidebar">
        <nav class="vclNavigation vclLayoutVertical vclLayoutFlex vclVertical">
          <ul>
            ${li('file', 'file-o')}
            ${li('search', 'search')}
            ${li('network', 'code-fork', !appstate.content.model)}
            ${li('calculate', 'calculator', !appstate.content.model)}
            ${li('options', 'wrench')}
          </ul>
        </nav>
      </div>
      ${tab}
    </div>
  `
}
