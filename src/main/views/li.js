const html = require('choo/html')
const css = require('sheetify')

const { killEvent } = require('../lib/util')

const constStyle = css`
  :host {
    cursor: pointer;
    transition: background-color .15s ease-in;
  }
`

const notImpl = () => console.log('not implemented')
const noop = () => {}
const li = ({title = 'blub', icon = 'angle-right', onclick = notImpl, selected = false, disabled = false, text = true, styles = '', children}) => html`
  <li class="pa3 ${styles}
        ${disabled ? 'white-60 disabled' : `hover-black hover-bg-white-80 white ${constStyle}`}
        ${selected ? 'bg-white-80 black-20' : ''}"
      role=presentation
      onclick=${disabled ? noop : (e) => { killEvent(e); onclick(e) }}
      aria-selected=${selected}>
    <a title=${title}
        href=#
        tabindex=${disabled ? -1 : 0}
        class="link"
        onclick=${disabled ? noop : (e) => { killEvent(e); onclick(e) }}>
      <i class="fa fa-fw fa-${icon}"></i>${children || (text ? `\u00a0${title}` : '')}
    </a>
  </li>
`


module.exports = li
