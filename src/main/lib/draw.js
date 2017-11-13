const cytoscape = require('cytoscape')
const cycola = require('cytoscape-cola')
const panzoom = require('cytoscape-panzoom')
const undoredo = require('cytoscape-undo-redo')
const Color = require('color')
const css = require('sheetify')

const values = Object.values

const purple = Color('#b470d6')
const eggshell = Color('#f4f2f4')
const blue = Color('#4bc5cf')
const orange = Color('#f3b70a')
const brick = Color('#f56169')
const locked = true

// register panzoom extension to use maps-like
// zoom and navigation controls
panzoom(cytoscape, require('jquery'))
css('cytoscape-panzoom')
css`
  .cy-panzoom {
    right: 0;
    margin-right: 50px;
    opacity: .4;
    transition: opacity .15s ease-in;
  }
  .cy-panzoom:hover { opacity: 1; }
`

// register the cytoscape cola extension
// this allows us to use cola.js for force layouts
cycola(cytoscape)

// register undoredo with cytoscape
undoredo(cytoscape)

const style = [
  {
    selector: 'node',
    style: {
      'height': (e) => e.data('boundingBox') ? e.data('boundingBox').height : 10,
      'width': (e) => e.data('boundingBox') ? e.data('boundingBox').width : 10
    }
  },
  {
    selector: '.species',
    style: {
      shape: 'ellipse',
      content: 'data(id)',
      'background-color': blue.string(),
      'border-color': blue.darken(0.5).string(),
      'border-width': 2
    }
  },
  {
    selector: '.reaction',
    style: {
      shape: 'rectangle',
      'background-color': brick.string(),
      'border-color': brick.darken(0.5).string(),
      'border-width': 2,
      content: 'data(id)'
    }
  },
  {
    selector: '.compartment',
    style: {
      shape: 'roundrectangle',
      'background-color': eggshell.string(),
      'border-color': eggshell.darken(0.5).string(),
      'border-width': 2,
      content: 'data(id)'
    }
  }
]
const layout = { name: 'preset' }

module.exports = function ({container, events, state, setState}) {
  const {model} = state
  const on = (...args) => events.on(...args)
  const emit = (...args) => events.emit(...args)
  const render = () => emit('render')

  const nodes = []
  const edges = []
  const compartmentMap = new Map()
  const sbmlLayout = model.annotation.layouts[0]

  for (let data of values(sbmlLayout.compartmentGlyphs)) {
    compartmentMap.set(data.compartment.id, data.id)
    if (data.compartment.outside) {
      data.parent = compartmentMap.get(data.compartment.outside.id)
    }
    const classes = 'compartment'
    const position = {
      x: data.boundingBox.x + data.boundingBox.width / 2,
      y: data.boundingBox.y + data.boundingBox.height / 2
    }
    nodes.push({data, position, classes, locked})
  }

  for (let data of values(sbmlLayout.speciesGlyphs)) {
    if (data.species.compartment) {
      data.parent = compartmentMap.get(data.species.compartment.id)
    }
    const classes = 'species'
    const position = {
      x: data.boundingBox.x + data.boundingBox.width / 2,
      y: data.boundingBox.y + data.boundingBox.height / 2
    }
    nodes.push({data, position, classes, locked})
  }

  for (let data of values(sbmlLayout.reactionGlyphs)) {
    const classes = 'reaction'
    let compartmentA = null
    let compartmentB = null
    let isTransport = false

    for (let s of data.speciesReferenceGlyphs) {
      // find out if the reaction is a transport
      if (!isTransport) {
        // check all encountered compartments and see if they are all the same
        if (!compartmentA) {
          compartmentA = s.speciesGlyph.species.compartment
        } else if (compartmentA !== s.speciesGlyph.species.compartment) {
          compartmentB = s.speciesGlyph.species.compartment
          isTransport = true
        }
      }

      // determine role and set source and target nodes accordingly
      const x = s.role === 'substrate'
      s.source = x ? s.speciesGlyph.id : data.id
      s.target = !x ? s.speciesGlyph.id : data.id
      edges.push({data: s})
    }

    // find the id of the parent node, i.e. the cell compartment
    const parent = (!isTransport || compartmentA.outside === compartmentB) ? compartmentA : compartmentB
    data.parent = compartmentMap.get(parent.id)

    const scratch = {isTransport, compartmentA, compartmentB}
    nodes.push({data, classes, scratch})
  }

  // for (let data of values(sbmlLayout.textGlyphs)) {
  // }

  const elements = window.elements = {nodes, edges}
  const c = window.cy = cytoscape({ container, elements, style, layout })
  const history = c.undoRedo()

  on('do_undo', () => {
    history.undo()
    setState({redoable: true, undoable: !history.isUndoStackEmpty()})
    render()
  })


  on('do_redo', () => {
    history.redo()
    setState({undoable: true, redoable: !history.isRedoStackEmpty()})
    render()
  })

  on('pan', (on) => {
    const ctrl = document.querySelector('.cy-panzoom')
    if (on) {
      if (!ctrl) return c.panzoom({})
      ctrl.style.display = 'block'
    } else {
      ctrl.style.display = 'none'
    }
    render()
  })

  on('lock', (lock) => {
    c.autolock(lock)
    c.autoungrabify(lock)
    c.autounselectify(lock)
    render()
  })

  c.once('afterDo', () => {
    setState({undoable: !history.isUndoStackEmpty()})
    render()
  })

  // auto layout nodes which don't have a position set
  c.elements('node[!position]').layout({
    name: 'cola',
    fit: false,
    unconstrIter: 40,
    randomize: true,
    stop () { c.elements().unlock() }
  }).run()

  setState({
    undoable: !history.isUndoStackEmpty(),
    redoable: !history.isRedoStackEmpty()
  })
  render()
}
