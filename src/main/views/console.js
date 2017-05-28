const html = require('choo/html')
const css = require('sheetify')

const aStyle = css`:host {
  transition: height .15s ease-in;
  overflow-y: scroll;
}`
const oStyle = css`:host { height: 5em; }`
const cStyle = css`:host { height: 0px; }`

module.exports = function ({console}, emit) {
  const msg = (m) => html`
    <div>
      <i class="fa fa-fw fa-${m.icon} ${m.color}"></i><span>${m.args}
    </div>
  `
  return html`
    <div class="code f7 ph2 bg-near-black light-silver ${aStyle} ${console.open ? oStyle : cStyle}">
      <div class=pv1>
        ${console.msgs.map(msg)}
      </div>
    </div>
  `
}
