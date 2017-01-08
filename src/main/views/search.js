const html = require('choo/html')

let loading = html`
  <li class="vclDisabled vclNavigationItem">
    <a class=vclNavigationItemLabel href=#>
      loading ...
    </a>
  </li>
`

let empty = html`
  <li class="vclDisabled vclNavigationItem">
    <a class=vclNavigationItemLabel href=#>
      no results  
    </a>
  </li>
`

let result = ({id, name, names, reaction, href}) => reaction ? html`
  <li class=vclNavigationItem>
    <a class=vclNavigationItemLabel title=${names} href=${href}>
      <small>${id}</small>
      <b>${names}</b>
      <small>${reaction}</small>
    </a>
  </li>
` : html`
  <li class=vclNavigationItem>
    <a class=vclNavigationItemLabel title=${name} href=${href}>
      <small>${id}</small>
      <b>${names}</b>
      <small>${reaction}</small>
    </a>
  </li>
`

module.exports = function searchView (state, _, send) {
  let { busy, term, results } = state
  if (!term) term = ''
  let setterm = (e) => send('searchFor', e ? e.target.value : '')
  let clear = () => setterm()
  let hideEraser = term ? '' : 'vclDisplayNone'
  let hideSpinner = busy ? '' : 'vclDisplayNone'

  return html`
    <div>
      <div class="vclInputGroupEmb">
        <input type=search placeholder=search onkeyup=${setterm}
            class="vclInput vclNoBorder vclAppItem" 
            value=${term} id=search
            autocomplete=off />
        <div class="vclIcogram vlcTransparent vclSquare vclAppended ${hideSpinner}"
            style="right: 1.2em">
          <div class="vclIcon fa fa-spinner fa-spin" aria-hidden="true" aria-label="Clear" role="img"></div>
        </div>
        <button class="vclButton vclTransparent vclSquare vclAppended ${hideEraser}" onclick=${clear}>
          <div class="vclIcogram">
            <div class="vclIcon fa fa-times-circle" aria-hidden="true" aria-label="Clear" role="img"></div>
          </div>
        </button>
      </div>
      <nav class="vclNavigation vvclLayoutVertical vclLayoutFlex vclVertical">
        <ul class="vclScrollable vclYOnHover">
        ${busy ? loading : results ? results.map(result) : empty}
        </ul>
      </nav>
    </div>
  `
}
