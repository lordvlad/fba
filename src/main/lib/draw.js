const cytoscape = require('cytoscape')
const cycola = require('cytoscape-cola')
const Color = require('color')

const values = Object.values

const purple = Color('#b470d6')
const eggshell = Color('#f4f2f4')
const blue = Color('#4bc5cf')
const orange = Color('#f3b70a')
const brick = Color('#f56169')
const locked = true

cycola(cytoscape) // register the cytoscape cola extension

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

module.exports = function (model, container) {
  const nodes = []
  const edges = []
  const compartmentMap = new Map()
  const sbmlLayout = model.annotation.layouts[0]

  console.log(window.sbmlLayout = sbmlLayout)

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

  // auto layout reaction positions
  c.elements('node[position.x] == undefined').layout({
    name: 'cola',
    fit: false,
    unconstrIter: 20,
    stop () { c.elements().unlock() }
  }).run()
}
