const assign = require('object-assign')
const hyperx = require('hyperx')
const { h, create, diff, patch } = require('virtual-dom')
const hx = hyperx(h)

require('./index.styl')

const substate = require('./sub')
const { DropHook, FocusHook } = require('./hooks')
const { GraphWidget } = require('./widgets')

const setter = (state, update) => (k, v) => update(assign(state, {[k]: v}))

const callout = hx`
  <div class="vclCallout vclInfo" style="margin: auto">
    Start creating a metabolic network by
    <ul>
      <li>Drag and drop an SBML file anywhere on the page</li>
      <li>Open the search tab and drag and drop reactions onto the page</li>
    </ul> 
  </div>
`

const state = {
  side: {
    selected: ''
  }
}

let search = require('./search')(state)

let tree = render() // initial tree
let root = create(tree) // rendered html dom
document.body.appendChild(root) // appended to page

function update () {
  let newTree = render()
  let patches = diff(tree, newTree)
  root = patch(root, patches)
  tree = newTree
}

require('./hotkeys')(state, update)

function render () {
  let updateGraph = (graph) => update(assign(state, {graph}))
  return hx`
    <div class="vclContentArea vclLayoutHorizontal vclLayoutFlex"
          hook=${new DropHook(updateGraph, document.body)}>
      ${sidebar(...substate(state, update, 'side'))}
    <div style="overflow: hidden; width: 100%" class="vclCenter vclMiddle vclLayoutCenter vclLayoutHorizontal">
        ${state.graph
          ? new GraphWidget(state.graph)
          : callout} 
      </div>
    </div>
  `
}

function sidebar (state = {}, update) {
  let set = setter(state, update)
  let selected = state.selected

  let sites = {
    search: () => searchTab(...substate(state, update, 'search')),
    network: () => hx`todo net`,
    calculate: () => hx`todo calc`,
    settings: () => settingsTab(...substate(state, update, 'settings'))
  }

  let li = (title, icon) => hx`
    <li class="vclNavigationItem ${selected === title ? 'vclSelected' : ''}"
        role=presentation aria-selected=false>
      <a class=vclNavigationItemLabel title=${title} href="#"
          onclick=${() => set('selected', selected === title ? null : title)}>
        <i class="vclIcon fa fa-fw fa-${icon}"></i>
      </a>
    </li>
  `

  return hx`
    <div class="vclLayoutHorizontal vlcLayoutFlex" style="height: 100%">
      <div class="vclLayoutVertical sidebar">
        <nav class="vclNavigation vclLayoutVertical vclLayoutFlex vclVertical">
          <ul>
            ${li('search', 'search')}
            ${li('network', 'code-fork')}
            ${li('calculate', 'calculator')}
            ${li('settings', 'wrench')}
          </ul>
        </nav>
      </div>
      ${!selected ? '' : hx`
        <div class="vclLayoutVertical inner-sidebar" style="width: 240px">
          ${sites[selected]()}
        </div>
      `}
    </div>
  `
}

function settingsTab (state = {}, update) {
  return hx`
    <div>
      <nav class="vclNavigation vclLayoutVertical vclLayoutFlex vclVertical">
        <ul>
        <li class="vclNavigationItem">
          <a class=vclNavigationItemLabel title=search href="#">
            todo 
          </a>
        </li>
        </ul>
      </nav>
    </div>
  `
}

function searchTab (state = {}, update) {
  search.output.subscribe((results) => {
    update(assign(state, {results, busy: false}))
  })

  let loading = hx`
    <li class="vclDisabled vclNavigationItem">
      <a class=vclNavigationItemLabel href=#>
        loading ...
      </a>
    </li>
  `
  let empty = hx`
    <li class="vclDisabled vclNavigationItem">
      <a class=vclNavigationItemLabel href=#>
        no results  
      </a>
    </li>
  `

  let result = ({id, names, reaction}) => hx`
    <li class=vclNavigationItem>
      <a class=vclNavigationItemLabel title=${names} href=#>
        <small>${id}</small>
        <b>${names}</b>
        <small>${reaction}</small>
      </a>
    </li>`

  let { busy, term, results, focus } = state
  if (!term) term = ''
  let setterm = (e) => {
    let term = e ? e.target.value : ''
    let busy = !!term
    if (e) search.input.onNext(term)
    update(assign(state, {term, busy}))
  }
  let clear = () => setterm()
  let hideEraser = term ? '' : 'vclDisplayNone'
  let hideSpinner = busy ? '' : 'vclDisplayNone'

  return hx`
    <div>
      <div class="vclInputGroupEmb">
        <input type=search placeholder=search onkeyup=${setterm}
            hook=${focus === false ? null : new FocusHook()}
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
        <ul>
        ${busy ? loading : results ? results.map(result) : empty}
        </ul>
      </nav>
    </div>
  `
}
