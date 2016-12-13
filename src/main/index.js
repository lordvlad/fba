const assign = require('object-assign')
const hyperx = require('hyperx')
const { h, create, diff, patch } = require('virtual-dom')

require('./index.styl')

const substate = require('./sub')
const { DropHook, GraphHook } = require('./hooks')

const hx = hyperx(h)
const state = {page: {}}

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
      <div class="vclLayoutVertical sidebar">
        <nav class="vclNavigation vclLayoutVertical vclLayoutFlex vclVertical">
          <ul>
            <li class=vclNavigationItem role=presentation aria-selected=false>
              <a class=vclNavigationItemLabel title=search href="#">
                <i class="vclIcon fa fa-fw fa-search"></i>
              </a>
            </li>
            <li class=vclNavigationItem role=presentation aria-selected=false>
              <a class=vclNavigationItemLabel title=network href="#">
                <i class="vclIcon fa fa-fw fa-code-fork"></i>
              </a>
            </li>
            <li class=vclNavigationItem role=presentation aria-selected=false>
              <a class=vclNavigationItemLabel title=calc href="#">
                <i class="vclIcon fa fa-fw fa-calculator"></i>
              </a>
            </li>
            <li class=vclNavigationItem role=presentation aria-selected=false>
              <a class=vclNavigationItemLabel title=config href="#">
                <i class="vclIcon fa fa-fw fa-wrench"></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div class="vclScrollable vclLayoutFlex">
        ${state.graph
          ? hx`<div hook=${new GraphHook(state.graph)}></div>`
          : hx`<div class="vclCallout vclInfo">Drag and drop an SBML file anywhere on the page</div>`} 
      </div>
    </div>
  `
}
