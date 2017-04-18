const html = require('choo/html')
const { li } = require('./util')

const capitalize = (w) => w[0].toUpperCase() + w.substring(1)

module.exports = function calcView (state, emit) {
  const run = (what) => () => emit(`run${capitalize(what)}`)
  return html`
    <div>
      <nav class="vclNavigation vclLayoutVertical vclLayoutFlex vclVertical">
        <ul>
          ${li('fba', undefined, run('FBA'))}
          ${li('dynamic simulation', undefined, run('sim'))}
        </ul>
      </nav>
    </div>
    `
}
