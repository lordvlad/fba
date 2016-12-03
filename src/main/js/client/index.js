const shoe = require('shoe')
const domready = require('domready')
const dnd = require('drag-and-drop-files')
const frs = require('filereader-stream')
const cycle = require('../shared/cycle')
const cola = require('webcola')
const d3 = window.d3 = require('d3')
const insert = require('insert-css')
const maybeEval = (x, c) => typeof x === 'function' ? x.call(c) : x
const get = (keys) => (o) => keys.split('.').reduce((o, k) => o && maybeEval(o[k], o), o)

const stream = shoe('/reader')
const classes = require('../shared')
const { SpeciesReference, Species } = classes

const css = `

* { margin: 0; padding: 0;}

html {
  height: 100%;
  width: 100%;
}

body {
  font-family: "Helvetica Neue", Helvetica, sans-serif;
  height: 100%;
  width: 100%;
}

#body {
  position: relative;
}

h1 {
  font-size: 64px;
  font-weight: 300;
  letter-spacing: -2px;
  margin: .3em 0 .1em 0;
}

h2 {
  margin-top: 2em;
}

h1, h2 {
  text-rendering: optimizeLegibility;
}

h2 a {
  color: #ccc;
  left: -20px;
  position: absolute;
  width: 740px;
}

footer {
  font-size: small;
  margin-top: 8em;
}

header aside {
  margin-top: 82px;
}

header aside,
footer aside {
  color: #636363;
  text-align: right;
}

aside {
  font-size: small;
  left: 780px;
  position: absolute;
  width: 180px;
}

.attribution {
  font-size: small;
  margin-bottom: 2em;
}

#body > p, li > p {
  line-height: 1.5em;
}

#body > p {
  width: 720px;
}

#body > blockquote {
  width: 640px;
}

li {
  width: 680px;
}

a {
  color: steelblue;
}

a:not(:hover) {
  text-decoration: none;
}

pre, code, textarea {
  font-family: "Menlo", monospace;
}

code {
  line-height: 1em;
}

textarea {
  font-size: 100%;
}

#body > pre {
  border-left: solid 2px #ccc;
  padding-left: 18px;
  margin: 2em 0 2em -20px;
}

.html .value,
.javascript .string,
.javascript .regexp {
  color: #756bb1;
}

.html .tag,
.css .tag,
.javascript .keyword {
  color: #3182bd;
}

.comment {
  color: #636363;
}

.html .doctype,
.javascript .number {
  color: #31a354;
}

.html .attribute,
.css .attribute,
.javascript .class,
.javascript .special {
  color: #e6550d;
}

svg {
  font: 10px sans-serif;
}

.axis path, .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}

sup, sub {
  line-height: 0;
}

q:before,
blockquote:before {
  content: "â";
}

q:after,
blockquote:after {
  content: "â";
}

blockquote:before {
  position: absolute;
  left: 2em;
}

blockquote:after {
  position: absolute;
}

.background {
    stroke: white;
    stroke-width: 1px;
    fill: white;
}

.node {
  stroke: black;
  stroke-width: 1px;
  cursor: move;
}

.node.reaction {
  fill: lightcoral;
}

.node.species {
  fill: steelblue;
}

.node.species-reference {
  fill: lightblue;
}

.group.compartment.cell, .group.compartment.cytosol {
  fill: cadetblue;
}

.group.compartment.ext, .group.compartment.extracellular {
  fill: salmon;
}

.link {
    fill: none;
    stroke: #000;
    stroke-width: 3px;
    opacity: 0.7;
    marker-end: url(#end-arrow);
}

.label {
    fill: black;
    font-family: Verdana;
    font-size: 25px;
    text-anchor: middle;
    cursor: move;
}

.guideline {
    stroke: orangered;
    stroke-width: 4px;
}
`

function reviver (key, value) {
  if (value && value.constructor.name === 'Object' && value.$class && classes[value.$class]) {
    return new classes[value.$class](value)
  }
  return value
}

domready(function () {
  insert(css)

  dnd(document.body, ([file]) => frs(file).pipe(stream, { end: false }))

  stream.on('data', (x) => {
    setTimeout(() => {
      let graph = cycle.retrocycle(JSON.parse(x, reviver))
      let width = window.innerWidth - 20
      let height = window.innerHeight - 20
      let margin = 6
      let pad = 12

      let d3cola = cola.d3adaptor()
        .linkDistance(60)
        .avoidOverlaps(true)
        .size([width, height])

      let outer = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('pointer-events', 'all')

      outer.append('rect')
        .attr('class', 'background')
        .attr('width', '100%')
        .attr('height', '100%')
        .call(d3.behavior.zoom().on('zoom', redraw))

      let vis = outer
        .append('g')
        .attr('transform', 'translate(80,80) scale(0.7)')

      function redraw () {
        vis.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')')
      }

      let groupsLayer = vis.append('g')
      let nodesLayer = vis.append('g')
      let linksLayer = vis.append('g')

      d3cola
        .nodes(graph.nodes)
        .links(graph.links)
        .groups(graph.groups)
        // .constraints(graph.constraints)
        .start()

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
        .call(d3cola.drag)

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
        .attr('class', (d) => `node ${d instanceof SpeciesReference ? 'species-reference' : d instanceof Species ? 'species' : 'reaction'}`)
        .attr('width', (d) => (d.width || 0) + 2 * pad + 2 * margin)
        .attr('height', (d) => (d.height || 0) + 2 * pad + 2 * margin)
        .attr('rx', (d) => d.rx || 0)
        .attr('ry', (d) => d.rx || 0)
        .call(d3cola.drag)

      let label = nodesLayer
        .selectAll('.label')
        .data(graph.nodes)
        .enter()
        .append('text')
        .attr('class', 'label')
        .call(d3cola.drag)

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

      d3cola.on('tick', function () {
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
      }, 10)
    })
  })
})
