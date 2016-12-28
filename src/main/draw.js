const toKebab = require('./kebab')
const cola = require('webcola')
const d3 = window.d3 = require('d3')
const { get } = require('./util')

module.exports = function draw (graph, root) {
  let width = root.offsetWidth - 10
  let height = root.offsetHeight - 10
  let margin = 6
  let pad = 12

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


  let vis = outer
    .append('g')
    .attr('transform', 'translate(80,80) scale(0.7)')

  outer.call(d3.behavior.zoom().scaleExtent([0.1, 10]).on('zoom', function () {
    vis.attr('transform', `translate(${d3.event.translate}) scale(${d3.event.scale})`)
  }))

  let groupsLayer = vis.append('g')
  let nodesLayer = vis.append('g')
  let linksLayer = vis.append('g')

  d3cola
    .nodes(graph.nodes)
    .links(graph.links)
    .groups(graph.groups)
    .constraints(graph.constraints)
    .start(10, 15, 20)

  // define arrow markers for graph links
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

  let group = groupsLayer
    .selectAll('.group')
    .data(graph.groups)
    .enter()
    .append('rect')
    .attr('rx', 8)
    .attr('ry', 8)
    .attr('class', (d) => `group compartment ${d.id}`)
    .attr('style', (d) => d.style)
    //.call(d3cola.drag)

  let link = linksLayer
    .selectAll('.link')
    .data(graph.links)
    .enter()
    .append('line')
    // .append('svg:path')
    .attr('class', 'link')

  let node = nodesLayer
    .selectAll('.node')
    .data(graph.nodes)
    .enter()
    .append('rect')
    .attr('class', (d) => `node ${toKebab(d.constructor.name)}`)
    .attr('width', (d) => (d.width || 0) + 2 * pad + 2 * margin)
    .attr('height', (d) => (d.height || 0) + 2 * pad + 2 * margin)
    .attr('rx', (d) => d.rx || 0)
    .attr('ry', (d) => d.rx || 0)
    //.call(d3cola.drag)

  let label = nodesLayer
    .selectAll('.label')
    .data(graph.nodes)
    .enter()
    .append('text')
    .attr('class', 'label')
    //.call(d3cola.drag)

  let insertLinebreaks = function (d) {
    let el = d3.select(this)
    el.text('')

    d.label.split(' ').forEach((w) => {
      el.append('tspan')
        .text(w)
        .attr('x', 0)
        .attr('dy', '15')
        .attr('font-size', '12')
    })
  }

  label.each(insertLinebreaks)

  node.append('title').text((d) => d.label)

  const makeEdgeBetween = cola.vpsc.makeEdgeBetween
  const makeRoute = (d) => (d.route = makeEdgeBetween(d.source.innerBounds, d.target.innerBounds, 5))
  const translateLabel = (d) => 'translate(' + d.x + margin + ',' + (d.y + margin - d.height / 2) + ')'
  const setLabelSize = function (d) {
    let b = this.getBBox()
    d.width = (b.width || 0) + 2 * margin + 8
    d.height = (b.height || 0) + 2 * margin + 8
  }

  const tick = function () {
    node
      .each((d) => (d.innerBounds = d.bounds.inflate(-margin)))

    link
      .each(makeRoute)
      .attr('x1', get('route.sourceIntersection.x'))
      .attr('y1', get('route.sourceIntersection.y'))
      .attr('x2', get('route.arrowStart.x'))
      .attr('y2', get('route.arrowStart.y'))

    label
      .each(setLabelSize)

    node
      .attr('x', get('innerBounds.x'))
      .attr('y', get('innerBounds.y'))
      .attr('width', get('innerBounds.width'))
      .attr('height', get('innerBounds.height'))

    group
      .attr('x', get('bounds.x'))
      .attr('y', get('bounds.y'))
      .attr('width', get('bounds.width'))
      .attr('height', get('bounds.height'))

    label
      .attr('transform', translateLabel)
  }

  d3cola.on('tick', tick)
  return root
}

