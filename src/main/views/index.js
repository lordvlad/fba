const html = require('choo/html')
const css = require('sheetify')

const menuView = require('./menu')
const contentView = require('./content')

css`
  html { height:100%; }
  a { color: inherit;  }
  .disabled a { pointer-events: none }
 `

css('tachyons')
css('font-awesome')
css('nprogress/nprogress.css')
css('../styles/fontawesome-embedded-fonts.css')
css('../styles/graph-styles.css')

module.exports = function mainView (state, emit) {
  return html`
    <body class="f6 sans-serif h-100">
      <div class="flex flex-column h-100 w-100">
        <div class="flex flex-row h-100">
          ${menuView(state, emit)}
          ${contentView(state, emit)}
        </div>
      </div>
    </body>
  `
}
