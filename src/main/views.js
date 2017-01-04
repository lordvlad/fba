/* global alert */
const html = require('choo/html')
const draw = require('./draw')

module.exports = mainView

const notImpl = () => alert('not implemented')
const noop = () => {}
const li = (title, icon = 'angle-right', onclick = notImpl) => html`
  <li class=vclNavigationItem role=presentation aria-selected=false>
    <a class=vclNavigationItemLabel title=${title} href="#"
        onclick=${onclick}>
      <i class="vclIcon fa fa-fw fa-${icon}"></i>
      ${title}
    </a>
  </li>
`

function networkView (state, prev, send) {
  return html`
    <div>
      <nav class="vclNavigation vclLayoutVertical vclLayoutFlex vclVertical">
        <ul>
          ${li('todo')}
        </ul>
      </nav>
    </div>
    `
}

function calcView (state, prev, send) {
  const run = (what) => () => send(`run${what[0].toUpperCase()}${what.substring(1)}`, null, noop)
  return html`
    <div>
      <nav class="vclNavigation vclLayoutVertical vclLayoutFlex vclVertical">
        <ul>
          ${li('fba', undefined, run('FBA'))}
          ${li('dynamic simulation', undefined, run('sim'))}
        </ul>
      </nav>
    </div>
    `
}

function optionsView (state, prev, send) {
  return html`
    <div>
      <nav class="vclNavigation vclLayoutVertical vclLayoutFlex vclVertical">
        <ul>
          ${li('todo')}
        </ul>
      </nav>
    </div>
    `
}

function fileView (state, prev, send) {
  return html`
    <div>
      <nav class="vclNavigation vclLayoutVertical vclLayoutFlex vclVertical">
        <ul>
          ${li('new model', 'file-o', () => send('newModel'))}
          ${li('open sbml', 'folder-open-o', () => send('openFile'))}
          ${li('export sbml', 'save')}
          ${li('search biomodels', 'search')}
        </ul>
      </nav>
    </div>
    `
}

function searchView (state, prev, send) {
  let loading = html`
    <li class="vclDisabled vclNavigationItem">
      <a class=vclNavigationItemLabel href=#>
        loading ...
      </a>
    </li>
  `

  let empty = html`
    <li class="vclDisabled vclNavigationItem">
      <a class=vclNavigationItemLabel href=#>
        no results  
      </a>
    </li>
  `

  let result = ({id, names, reaction, href}) => html`
    <li class=vclNavigationItem>
      <a class=vclNavigationItemLabel title=${names} href=${href}>
        <small>${id}</small>
        <b>${names}</b>
        <small>${reaction}</small>
      </a>
    </li>
  `

  let { busy, term, results } = state
  if (!term) term = ''
  let setterm = (e) => send('searchFor', e ? e.target.value : '')
  let clear = () => setterm()
  let hideEraser = term ? '' : 'vclDisplayNone'
  let hideSpinner = busy ? '' : 'vclDisplayNone'

  return html`
    <div>
      <div class="vclInputGroupEmb">
        <input type=search placeholder=search onkeyup=${setterm}
            class="vclInput vclNoBorder vclAppItem" 
            value=${term} id=search
            autocomplete=off />
        <div class="vclIcogram vlcTransparent vclSquare vclAppended ${hideSpinner}"
            style="right: 1.2em">
          <div class="vclIcon fa fa-spinner fa-spin" aria-hidden="true" aria-label="Clear" role="img"></div>
        </div>
        <button class="vclButton vclTransparent vclSquare vclAppended ${hideEraser}" onclick=${clear}>
          <div class="vclIcogram">
            <div class="vclIcon fa fa-times-circle" aria-hidden="true" aria-label="Clear" role="img"></div>
          </div>
        </button>
      </div>
      <nav class="vclNavigation vvclLayoutVertical vclLayoutFlex vclVertical">
        <ul class="vclScrollable vclYOnHover">
        ${busy ? loading : results ? results.map(result) : empty}
        </ul>
      </nav>
    </div>
  `
}

function menuView (state, prev, send) {
  const selected = (title) => state.active === title ? 'vclSelected' : ''
  const select = (what) => () => send('activeMenu', what)
  const li = (title, icon) => html`
    <li class="vclNavigationItem ${selected(title)}"
        role=presentation aria-selected=${state.active === title}>
      <a class=vclNavigationItemLabel title=${title} href=#
          onclick=${select(title)}>
        <i class="vclIcon fa fa-fw fa-${icon}"></i>
      </a>
    </li>
  `

  function wrap (tab) {
    return html`
      <div class="vclLayoutVertical inner-sidebar" style="width: 240px">
        ${tab}
      </div>
    `
  }

  const tab = ({
    file: () => wrap(fileView(state.file, prev && state.file, send)),
    search: () => wrap(searchView(state.search, prev && prev.search, send)),
    network: () => wrap(networkView(state.network, prev && prev.network, send)),
    calculate: () => wrap(calcView(state.clac, prev && state.calc, send)),
    options: () => wrap(optionsView(state.options, prev && prev.options, send)),
    [null]: () => ''
  })[state.active]()

  return html`
    <div class="vclLayoutHorizontal vlcLayoutFlex">
      <div class="vclLayoutVertical sidebar">
        <nav class="vclNavigation vclLayoutVertical vclLayoutFlex vclVertical">
          <ul>
            ${li('file', 'file-o')}
            ${li('search', 'search')}
            ${li('network', 'code-fork')}
            ${li('calculate', 'calculator')}
            ${li('options', 'wrench')}
          </ul>
        </nav>
      </div>
      ${tab}
    </div>
  `
}

function modelView (state, prev, send) {
  const { model } = state
  const load = (node) => setTimeout(() => draw(model, node), 10)
  const style = 'height:100%; width:100%'
  return html`
    <div id=graph class=graph style=${style} onload=${load}></div>
  `
}

function contentView (state, prev, send) {
  const { model } = state
  const callout = html`
    <div class="vclCallout vclInfo" style="margin: auto">
      Start creating a metabolic network by
      <ul>
        <li>Drag and drop an SBML file anywhere on the page</li>
        <li>Open the search tab and drag and drop reactions onto the page</li>
      </ul> 
    </div>
  `
  return html`
    <div style="overflow: hidden; width: 100%" class="vclCenter vclMiddle vclLayoutCenter vclLayoutHorizontal">
      ${model ? modelView(state, prev, send) : callout} 
    </div>
  `
}

function mainView (state, prev, send) {
  return html`
    <div style="height:100%" class="vclContentArea vclLayoutHorizontal vclLayoutFlex">
      ${menuView(state.menu, prev && prev.menu, send)}
      ${contentView(state.content, prev && prev.content, send)}
    </div>
  `
}
