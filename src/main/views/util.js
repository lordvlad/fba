/* global alert */
const html = require('choo/html')

const notImpl = () => alert('not implemented')
const noop = () => {}
const li = (title, icon = 'angle-right', onclick = notImpl) => html`
  <li class=vclNavigationItem role=presentation aria-selected=false>
    <a class=vclNavigationItemLabel title=${title} href="#"
        onclick=${onclick}>
      <i class="vclIcon fa fa-fw fa-${icon}"></i>
      ${title}
    </a>
  </li>
`

function killEvent (e) {
  e.preventDefault()
  e.stopPropagation()
}

module.exports = { killEvent, notImpl, noop, li }
