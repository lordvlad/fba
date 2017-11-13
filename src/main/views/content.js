const html = require('choo/html')

const modelView = require('./model')

module.exports = function (state, emit) {
  return html`
    <div class="overflow-hidden w-100 v-top dib h-100">
      ${modelView(state, emit)}
    </div>
  `
}
