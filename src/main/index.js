const assign = require('object-assign')
const hyperx = require('hyperx')
const { h, create, diff, patch } = require('virtual-dom')
const Rx = require('rx-lite')

require('./index.styl')

const substate = require('./sub')
const { DropHook, GraphHook } = require('./hooks')

const setter = (state, update) => (k, v) => update(assign(state, {[k]: v}))
const hx = hyperx(h)

const state = {
  page: {
    side: {
      selected: 'search'
    }
  }
}

const searchInput = new Rx.Subject()
const searchOutput = searchInput
  .filter((t) => t.length > 2)
  .debounce(750)
  .distinctUntilChanged()
  .flatMapLatest((t) => {
    if (!state.page.settings.db) {
      return Promise.resolve([{title: `No databases connected, nowhere to look for ${t}. 
      Go to settings and set up a database connection.`}])
    }
  })

let tree = render(...substate(state, update, 'page')) // initial tree
let rootNode = create(tree) // rendered html dom
document.body.appendChild(rootNode) // appended to page

function update (state) {
  let newTree = render(...substate(state, update, 'page'))
  let patches = diff(tree, newTree)
  rootNode = patch(rootNode, patches)
  tree = newTree
}

function render (state, update) {
  let updateGraph = (graph) => update(assign({}, state, {graph}))
  return hx`
    <div class="vclContentArea vclLayoutHorizontal vclLayoutFlex"
          hook=${new DropHook(updateGraph, document.body)}>
      ${sidebar(...substate(state, update, 'side'))}
      <div class="vclScrollable vclLayoutFlex">
        ${state.graph
          ? hx`<div hook=${new GraphHook(state.graph)}></div>`
          : hx`<div class="vclCallout vclInfo">Drag and drop an SBML file anywhere on the page</div>`} 
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
    <div class="vclLayoutFlex vclVertical vclLayoutVertical">
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
    </div>
  `
}

function settingsTab (state = {}, update) {
  return hx`
    <div>
      <nav class="vclNavigation vvclLayoutVertical vclLayoutFlex vclVertical">
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
  searchOutput.subscribe((results) => {
    console.log(results)
    update(assign(state, {results}, {busy: false}))
  })

  let result = ({title, href} = {title: 'type in the searchbar'}) => hx`
    <li class="${href ? '' : 'vclDisabled'} vclNavigationItem">
      <a class=vclNavigationItemLabel title=search href="#" 
          onclick={href ? () => set('active', href) : () => {}}>
        ${title}
      </a>
    </li>`

  let { busy, term, results } = state
  if (!term) term = ''
  let setterm = (e) => {
    let term = e ? e.target.value : ''
    let busy = !!term
    if (e) searchInput.onNext(term)
    update(assign(state, {term, busy}))
  }
  let clear = () => setterm()
  let hideEraser = term ? '' : 'vclDisplayNone'
  let hideSpinner = busy ? '' : 'vclDisplayNone'

  return hx`
    <div>
      <div class="vclInputGroupEmb">
        <input type=search placeholder=search onkeyup=${setterm}
            class="vclInput vclNoBorder vclAppItem" 
            value=${term} style="padding-left: 1.25em; height: 3em" autocomplete=off />
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
        ${busy ? result({title: '...'}) : results ? results.map(result) : result()}
        </ul>
      </nav>
    </div>
  `
}
