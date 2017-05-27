const html = require('choo/html')
const menuView = require('./menu')
const contentView = require('./content')
const css = require('sheetify')

css`
  html { height:100%; font-size: 14px; }
  a { color: inherit;  }
  .disabled a { pointer-events: none }
 `

css('tachyons')
css('tachyons-debug-grid')
css('font-awesome')
css('nprogress')
css('../styles/fontawesome-embedded-fonts.css')

module.exports = function mainView (state, emit) {
  return html`
    <body class=h-100>
      <div class="flex flex-row h-100">
        ${menuView(state, emit)}
        ${contentView(state, emit)}
      </div>
    </body>
  `
}
