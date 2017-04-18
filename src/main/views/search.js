const html = require('choo/html')

const loading = html`
  <li class="vclDisabled vclNavigationItem">
    <a class=vclNavigationItemLabel href=#>
      loading ...
    </a>
  </li>
`

const empty = html`
  <li class="vclDisabled vclNavigationItem">
    <a class=vclNavigationItemLabel href=#>
      no results  
    </a>
  </li>
`


module.exports = function searchView (state, emit) {
  let { busy, term, results } = state
  if (!term) term = ''
  if (results && results.length === 0) results = false
  const setterm = (e) => emit('searchFor', e ? e.target.value : '')
  const clear = () => setterm()
  const hideEraser = term ? '' : 'vclDisplayNone'
  const hideSpinner = busy ? '' : 'vclDisplayNone'

  const result = (r) => {
    const {id, name, names, reaction, href} = r
    if (reaction) {
      return html`
        <li class=vclNavigationItem>
          <a class=vclNavigationItemLabel title=${names} href=${href}>
            <small>${id}</small>
            <b>${names}</b>
            <small>${reaction}</small>
          </a>
        </li>
      `
    }
    return html`
      <li class=vclNavigationItem>
        <a class=vclNavigationItemLabel title=${name} href=${href}>
          <small>${id}</small>
          <b>${names}</b>
          <small>${reaction}</small>
        </a>
      </li>
    `
  }

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
