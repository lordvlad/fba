const html = require('choo/html')
const modelView = require('./model')

module.exports = function (state, emit) {
  return html`
    <div class="absolute overflow-hidden w-100 h-100 v-top dib">
      ${modelView(state, emit)}
    </div>
  `
}
