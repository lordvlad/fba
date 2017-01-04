const cola = require('webcola')
const assign = require('object-assign')
const d3 = window.d3 = require('d3')

const { get } = require('./util')

const margin = 6

const makeEdgeBetween = cola.vpsc.makeEdgeBetween
const makeRoute = (d) => {
  assign(d, {route: makeEdgeBetween(d.source.innerBounds, d.target.innerBounds, margin)})
}
const translateLabel = (d) => `translate(${d.innerBounds.cx()},${d.y + margin - d.height / 2})`

function setSize (d) {
  let b = this.getBBox()
  assign(d, {width: b.width + 2 * margin + 8, height: b.height + 2 * margin + 8})
  d.innerBounds = d.bounds.inflate(-margin)
}

function insertLineBreaks (d) {
  var el = d3.select(this)
  var words = d.label.split(' ')
  el.text('')

  for (var i = 0; i < words.length; i++) {
    el.append('tspan')
      .text(words[i])
      .attr('x', 0)
      .attr('dy', '15')
      .attr('font-size', '12')
  }
};

module.exports = function draw (model, root) {
  let { graph } = model
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


  let vis = outer.append('g')

  // vis.call(d3.behavior.zoom().scaleExtent([0.1, 10]).on('zoom', function () {
  //   vis.attr('transform', `translate(${d3.event.translate}) scale(${d3.event.scale})`)
  // }))

  let groupsLayer = vis.append('g')
  let nodesLayer = vis.append('g')
  let linksLayer = vis.append('g')

  // define arrow markers for graph links
  let defs = outer.append('svg:defs')

  defs.append('svg:marker')
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

  defs.append('svg:marker')
    .attr('id', 'end-circle')
    .attr('viewBox', '-5 -5 10 10')
    .attr('refX', 2)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
    .append('svg:circle')
    .attr('r', 5).attr('cy', 0).attr('cx', 0)
    .attr('stroke-width', '0px')
    .attr('fill', '#000')

  d3cola
    .nodes(graph.nodes)
    .links(graph.links)
    .groups(graph.groups)
    .constraints(graph.constraints)
    .start(10, 10, 10)

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
    .attr('class', get('className'))

  let node = nodesLayer
    .selectAll('.node')
    .data(graph.nodes)
    .enter()
    .append('rect')
    .attr('class', get('className'))
    .call(d3cola.drag)

  node.append('title').text(get('label'))

  let label = nodesLayer
    .selectAll('.label')
    .data(graph.nodes)
    .enter()
    .append('text')
    .attr('class', 'label')
    .call(d3cola.drag)

  label.each(insertLineBreaks)

  const tick = function () {
    label.each(setSize)
    label.attr('transform', translateLabel)

    link
      .each(makeRoute)
      .attr('x1', get('route.sourceIntersection.x'))
      .attr('y1', get('route.sourceIntersection.y'))
      .attr('x2', get('route.arrowStart.x'))
      .attr('y2', get('route.arrowStart.y'))

    node
      .attr('rx', get('rx'))
      .attr('ry', get('rx'))
      .attr('x', get('innerBounds.x'))
      .attr('y', get('innerBounds.y'))
      .attr('width', get('innerBounds.width'))
      .attr('height', get('innerBounds.height'))

    group
      .attr('x', get('bounds.x'))
      .attr('y', get('bounds.y'))
      .attr('width', get('bounds.width'))
      .attr('height', get('bounds.height'))
  }

  d3cola.on('tick', tick)
  return root
}

