const html = require('choo/html')
const menuView = require('./menu')
const contentView = require('./content')

module.exports = function mainView (state, prev, send) {
  return html`
    <div style="height:100%" class="vclContentArea vclLayoutHorizontal vclLayoutFlex">
      ${menuView(state, prev, send)}
      ${contentView(state, prev, send)}
    </div>
  `
}
