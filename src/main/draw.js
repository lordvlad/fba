const cola = require('webcola')
const assign = require('object-assign')
const d3 = window.d3 = require('d3')

const { get } = require('./util')
const { Transform, Pool } = require('./classes')

const margin = 6
const pad = 6

const makeEdgeBetween = cola.vpsc.makeEdgeBetween
const makeRoute = (d) => (d.route = makeEdgeBetween(d.source.innerBounds, d.target.innerBounds, pad))
const translateLabel = (d) => `translate(${d.textBounds.x},${d.textBounds.Y})`

function setSize (d) {
  let b = this.getBBox()
  assign(d, {width: b.width + 2 * (pad + margin), height: b.height + 2 * (pad + margin)})
  d.innerBounds = d.bounds.inflate(-margin)
  d.textBounds = d.innerBounds.inflate(-pad)
}

module.exports = function draw (model, root) {
  let {graph} = model
  let width = root.offsetWidth - 10
  let height = root.offsetHeight - 10
  let d3cola = cola.d3adaptor()
    .linkDistance(60)
    .avoidOverlaps(true)
    .size([width, height])

  let outer = d3
    .select(root.createShadowRoot())
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('pointer-events', 'all')

  outer
    .append('rect')
    .attr('class', 'background')
    .attr('width', '100%')
    .attr('height', '100%')

  // define arrow markers for graph links

  let vis = outer.append('g')

  // vis.call(d3.behavior.zoom().scaleExtent([0.1, 10]).on('zoom', function () {
  //   vis.attr('transform', `translate(${d3.event.translate}) scale(${d3.event.scale})`)
  // }))

  let groupsLayer = vis.append('g')
  let nodesLayer = vis.append('g')
  let linksLayer = vis.append('g')

  outer.append('svg:defs')
    .append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 5)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5L2,0')
    .attr('stroke-width', '0px')
    .attr('fill', '#000')

  d3cola
    .nodes(graph.nodes)
    .links(graph.links)
    .groups(graph.groups)
    .constraints(graph.constraints)
    .start()

  let group = groupsLayer
    .selectAll('.group')
    .data(graph.groups)
    .enter()
    .append('rect')
    .attr('class', (d) => `group compartment ${d.id}`)
    .attr('rx', 8)
    .attr('ry', 8)

  let link = linksLayer
    .selectAll('.link')
    .data(graph.links)
    .enter()
    .append('line')
    .attr('class', 'link')

  let reactionNode = nodesLayer
    .selectAll('.node.reaction')
    .data(graph.nodes.filter((n) => n instanceof Transform))
    .enter()
    .append('rect')
    .attr('class', get('className'))
    .call(d3cola.drag)

  let entityNode = nodesLayer
    .selectAll('.node.pool')
    .data(graph.nodes.filter((n) => n instanceof Pool))
    .enter()
    .append('circle')
    .attr('class', get('className'))
    .call(d3cola.drag)

  nodesLayer.selectAll('.node').append('title').text(get('label'))

  let label = nodesLayer
    .selectAll('.label')
    .data(graph.nodes)
    .enter()
    .append('text')
    .text((d) => get('label')(d).substr(0, 5))
    .attr('class', 'label')
    .call(d3cola.drag)

  label.append('title').text(get('label'))

  const tick = function () {
    label.each(setSize)

    label
      .attr('transform', translateLabel)

    reactionNode
      .attr('x', get('innerBounds.x'))
      .attr('y', get('innerBounds.y'))
      .attr('width', get('innerBounds.width'))
      .attr('height', 2 * (pad + margin) + 12)
      // .attr('height', get('innerBounds.height'))

    entityNode
      .attr('cx', get('innerBounds.cx'))
      .attr('cy', get('innerBounds.cy'))
      .attr('r', (d) => d.innerBounds.height() / 2)

    link
      .each(makeRoute)
      .attr('x1', get('route.sourceIntersection.x'))
      .attr('y1', get('route.sourceIntersection.y'))
      .attr('x2', get('route.arrowStart.x'))
      .attr('y2', get('route.arrowStart.y'))

    group
      .attr('x', get('bounds.x'))
      .attr('y', get('bounds.y'))
      .attr('width', get('bounds.width'))
      .attr('height', get('bounds.height'))
  }

  d3cola.on('tick', tick)
  return root
}

