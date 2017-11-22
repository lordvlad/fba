const html = require('choo/html')
const li = require('./li')

const homepage = 'https://github.com/lordvlad/fba'

module.exports = function optionsView (state, send) {
  const about = () => window.open(homepage)
  return html`
    <ul class="list pa0 ma0">
      ${li({title: 'about', icon: 'question', onclick: about})}
    </ul>
    `
}
