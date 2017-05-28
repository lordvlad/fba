const choo = require('choo')

const mainView = require('./views')

const expose = require('./lib/expose')
const nprogress = require('./lib/nprogress')
const file = require('./viewmodels/file')
const content = require('./viewmodels/content')
const menu = require('./viewmodels/menu')
const hotkeys = require('./viewmodels/hotkeys')
const console = require('./viewmodels/console')

const app = module.exports = choo()

app.route('/', mainView)

app.use(expose('fba'))
app.use(content())
app.use(nprogress())
app.use(file())
app.use(menu())
app.use(hotkeys())
app.use(console())

app.use(function (state, emitter) {
  const select = (id) => document.querySelector(id) || {focus: () => {}}
  const blur = () => document.activeElement.blur()
  const focus = (id) => select(id).focus()
  const focusLater = (id) => setTimeout(() => focus(id), 10)

  emitter.on('blur', blur)
  emitter.on('focus', focusLater)

  emitter.emit('log:info', 'application started')
})
