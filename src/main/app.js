const devtools = require('choo-devtools')
const choo = require('choo')

const components = require('./viewmodels/components')
const content = require('./viewmodels/content')
const hotkeys = require('./viewmodels/hotkeys')
const model = require('./viewmodels/model')
const file = require('./viewmodels/file')
const menu = require('./viewmodels/menu')

const nprogress = require('./lib/nprogress')
const conductor = require('./lib/conductor')
const logger = require('./lib/logger')
const focus = require('./lib/focus')

const mainView = require('./views')

const app = module.exports = choo()

app.route('/', mainView)

app.use(conductor(require('./worker/search'), 'search'))
app.use(conductor(require('./worker/sbml'), 'sbml'))

app.use(logger('fba'))
app.use(components())
app.use(nprogress())
app.use(devtools())
app.use(content())
app.use(hotkeys())
app.use(model())
app.use(focus())
app.use(file())
app.use(menu())
