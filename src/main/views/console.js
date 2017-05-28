/* global alert */
const html = require('choo/html')
const css = require('sheetify')

const { killEvent } = require('../lib/util')

const aStyle = css`:host {
  transition: height .15s ease-in;
  overflow-y: scroll;
}`
const oStyle = css`:host { height: 7em; }`
const cStyle = css`:host { height: 0px; }`

module.exports = function ({console}, emit) {
  const err = ({args}) => {
    const click = (e) => {
      killEvent(e)
      alert('not implemented')
    }
    return html`
      <div>
        <i class="fa fa-fw fa-exclamation-circle red"></i>
        <span>
          ${args[0].message}
          (<a class="link light-blue hover-blue" href=# onclick=${click}>details <i class="fa fa-external-link"></i></a>)
        </span>
      </div>
    `
  }
  const info = ({args}) => html`
    <div><i class="fa fa-fw fa-info-circle blue"></i><span>${args}</div>
  `
  const warn = ({args}) => html`
    <div><i class="fa fa-fw fa-exclamation-circle yellow"></i><span>${args}</div>
  `
  const msg = (m) => {
    switch (true) {
      case m.error: return err(m)
      case m.warning: return warn(m)
      case m.info: return info(m)
    }
  }

  return html`
    <div id="console" class="code f7 ph2 bg-near-black light-silver ${aStyle} ${console.open ? oStyle : cStyle}">
      <div class=pv1>
        ${console.msgs.map(msg)}
      </div>
    </div>
  `
}
