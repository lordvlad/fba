const undoredo = require('cytoscape-undo-redo')
const Nanocomponent = require('nanocomponent')
const panzoom = require('cytoscape-panzoom')
const cycola = require('cytoscape-cola')
const cytoscape = require('cytoscape')
const morph = require('xtend/mutable')
const omit = require('lodash.omit')
const debounce = require('lodash.debounce')
const html = require('choo/html')
const jquery = require('jquery')
const css = require('sheetify')
const Color = require('color')

const select = (s) => document.querySelector(s)

// const purple = Color('#b470d6')
const compartment = Color('#f4f2f4')
const species = Color('#4bc5cf')
// const orange = Color('#f3b70a')
const reaction = Color('#f56169')
const locked = true

// register panzoom extension to use maps-like
// zoom and navigation controls
panzoom(cytoscape, jquery)

// register the cytoscape cola extension
// this allows us to use cola.js for force layouts
cycola(cytoscape)

// register undoredo with cytoscape
undoredo(cytoscape)

css('cytoscape-panzoom')
css`
  .cy-panzoom {
    top: 2.5rem;
    right: 3.5rem;
    opacity: .4;
    transition: opacity .15s ease-in;
  }
  .cy-panzoom:hover { opacity: 1; }
`

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
      'background-color': species.string(),
      'border-color': species.darken(0.5).string(),
      'border-width': 2
    }
  },
  {
    selector: '.species:selected',
    style: {
      'border-color': new Color('#ff0000').string()
    }
  },
  {
    selector: '.reaction',
    style: {
      shape: 'rectangle',
      'background-color': reaction.string(),
      'border-color': reaction.darken(0.5).string(),
      'border-width': 2,
      content: 'data(id)'
    }
  },
  {
    selector: '.reaction:selected',
    style: {
      'border-color': new Color('#ff0000').string()
    }
  },
  {
    selector: '.compartment',
    style: {
      shape: 'roundrectangle',
      'background-color': compartment.string(),
      'border-color': compartment.darken(0.5).string(),
      'border-width': 2,
      content: 'data(id)'
    }
  },
  {
    selector: '.compartment:selected',
    style: {
      'border-color': new Color('#ff0000').string()
    }
  }
]
const layout = { name: 'preset' }

module.exports = class ModelComponent extends Nanocomponent {
  constructor (emitter) {
    super()
    this.state = {}
    this.emitter = emitter
    this.bubbleUp = () => emitter.emit('render')
    this.guardMethods()
    emitter.on('model:pan:toggle', this.togglePan)
    emitter.on('model:lock:toggle', this.toggleLock)
    emitter.on('model:history:undo', this.undo)
    emitter.on('model:history:redo', this.redo)

    this.select = debounce((n) => emitter.emit('model:node:select', n), 100)
  }

  // draw graph after node is mounted or full update is needed
  load () { this.drawGraph() }
  afterupdate () { this.drawGraph() }

  guardMethods () {
    const guard = (fn) => (...args) => this.state.model && fn.apply(this, args)
    for (let m of ['togglePan', 'toggleLock', 'undo', 'redo']) {
      this[m] = guard(this[m])
    }
  }

  createElement (props = {}) {
    // cache props, we'll need them once we'll draw the model
    morph(this.state, props)
    return html`<div class="graph overflow-hidden w-100 v-top dib h-100"></div>`
  }

  // if model is different, redraw completely
  update (props = {}) {
    const redraw = typeof props.model !== 'undefined' && props.model !== this.state.model
    morph(this.state, props)
    return redraw
  }

  // auto layout nodes which don't have a position set
  layout () {
    const c = this.c
    c.elements('node[!position]').layout({
      name: 'cola',
      fit: false,
      unconstrIter: 40,
      randomize: true,
      stop () { c.elements().unlock() }
    }).run()
  }

  togglePan (on) {
    this.state.pan = on
    const ctrl = select('.cy-panzoom')
    if (on) {
      if (!ctrl) this.c.panzoom({})
      else ctrl.style.display = 'block'
    } else if (ctrl) {
      ctrl.style.display = 'none'
    }
  }

  toggleLock (on) {
    this.state.lock = on
    this.c.autolock(on)
    this.c.autoungrabify(on)
  }

  undo () {
    this.history.undo()
  }

  redo () {
    this.history.redo()
  }

  drawGraph () {
    if (!this.state.model) return

    const elements = this.shapeData()
    const c = this.c = cytoscape({ container: this.element, elements, style, layout })
    function reviveAction (action, i, array) {
      if (typeof action.args.nodes[0] !== 'string') return false
      const nodes = action.args.nodes
      array[i] = {
        name: action.name,
        args: morph({
          nodes: nodes.map((id) => c.$('#' + id))
        }, omit(action.args, 'nodes'))
      }
      return true
    }

    this.state.undos.every(reviveAction)
    this.state.redos.every(reviveAction)

    this.history = this.c.undoRedo()
    this.history.reset(this.state.undos, this.state.redos)
    c.on('afterDo', this.bubbleUp)
    c.on('afterUndo', this.bubbleUp)
    c.on('afterRedo', this.bubbleUp)
    c.on('select', (e) => this.select(e.target.data()))
    c.on('boxend', (e) => setTimeout(() => {
      this.select(c.$(':selected').map(t => t.data()))
    }, 10))
    c.on('unselect', (e) => setTimeout(() => {
      if (c.$(':selected').length === 0) this.select(null)
    }, 10))

    this.togglePan(this.state.pan)
    this.toggleLock(this.state.lock)
    this.layout()
  }

  shapeData () {
    const model = this.state.model.model
    const nodes = []
    const edges = []
    const compartmentMap = new Map()

    const annotation = model.annotation
    const layouts = annotation.listOfLayouts
    if (layouts && layouts.length) {
      const sbmlLayout = model.annotation.listOfLayouts[0]
      for (let data of sbmlLayout.listOfCompartmentGlyphs) {
        compartmentMap.set(data.compartment.id, data.id)
        if (data.compartment.outside) {
          data.parent = compartmentMap.get(data.compartment.outside.id)
        }
        const classes = 'compartment'
        const position = {
          x: data.boundingBox.x + data.boundingBox.width / 2,
          y: data.boundingBox.y + data.boundingBox.height / 2
        }
        nodes.push({ data, position, classes, locked })
      }

      for (let data of sbmlLayout.listOfSpeciesGlyphs) {
        if (data.species.compartment) {
          data.parent = compartmentMap.get(data.species.compartment.id)
        }
        const classes = 'species'
        const position = {
          x: data.boundingBox.x + data.boundingBox.width / 2,
          y: data.boundingBox.y + data.boundingBox.height / 2
        }
        nodes.push({ data, position, classes, locked })
      }

      for (let data of sbmlLayout.listOfReactionGlyphs) {
        const classes = 'reaction'
        let compartmentA = null
        let compartmentB = null
        let isTransport = false

        for (let s of data.listOfSpeciesReferenceGlyphs) {
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
          edges.push({ data: s })
        }

        // find the id of the parent node, i.e. the cell compartment
        const parent = (!isTransport || compartmentA.outside === compartmentB) ? compartmentA : compartmentB
        data.parent = compartmentMap.get(parent.id)

        const scratch = { isTransport, compartmentA, compartmentB }
        nodes.push({ data, classes, scratch })
      }

      // for (let data of values(sbmlLayout.textGlyphs)) {
      // }
    }

    return { nodes, edges }
  }
}
