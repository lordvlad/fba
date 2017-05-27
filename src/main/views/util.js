const html = require('choo/html')
const css = require('sheetify')

const pointer = css`:host {cursor: pointer}`

const notImpl = () => console.log('not implemented')
const noop = () => {}
const li = ({title = 'blub', icon = 'angle-right', onclick = notImpl, selected = false, disabled = false, text = true, styles = ''}) => html`
  <li class="${styles}
        ${disabled ? 'white-60 disabled' : `hover-black hover-bg-white-80 white ${pointer}`}
        ${selected ? 'bg-white-80 black-20' : ''}"
      role=presentation
      onclick=${disabled ? noop : onclick}
      aria-selected=${selected}>
    <a title=${title}
        href=#
        tabindex=${disabled ? -1 : 0}
        onclick=${disabled ? noop : onclick}>
      <i class="fa fa-fw fa-${icon}"></i>
      ${text ? title : ''}
    </a>
  </li>
`

const killEvent = (e) => {
  e.preventDefault()
  e.stopPropagation()
  return true
}

module.exports = { killEvent, notImpl, noop, li }
