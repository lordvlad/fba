const choo = require('choo')
const devtools = require('choo-devtools')
const persist = require('choo-persist')
const {join} = require('path')

const mainView = require('./views')

const focus = require('./lib/focus')
const logger = require('./lib/logger')
const nprogress = require('./lib/nprogress')
const conductor = require('./lib/conductor')

const file = require('./viewmodels/file')
const content = require('./viewmodels/content')
const menu = require('./viewmodels/menu')
const hotkeys = require('./viewmodels/hotkeys')

const app = module.exports = choo()
app.use(devtools())
app.use(persist())

app.route('/', mainView)

app.use(logger('fba'))
app.use(content())
app.use(nprogress())
app.use(file())
app.use(menu())
app.use(hotkeys())
app.use(focus())

app.use(conductor(require('./worker/search'), 'search'))
app.use(conductor(require('./worker/sbml'), 'sbml'))
