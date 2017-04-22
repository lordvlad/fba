const html = require('choo/html')
const menuView = require('./menu')
const contentView = require('./content')

module.exports = function mainView (state, emit) {
  return html`
    <body>
      <div style="height:100%" class="vclContentArea vclLayoutHorizontal vclLayoutFlex">
        ${menuView(state, emit)}
        ${contentView(state, emit)}
      </div>
    </body>
  `
}
