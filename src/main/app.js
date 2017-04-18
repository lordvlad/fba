const choo = require('choo')
const frs = require('filereader-stream')
const { Observable } = require('rx-lite')
const np = require('nprogress')

const { search, fba, parse, kegg } = require('./services')
const { Model, revive } = require('./model')
const mainView = require('./views')
const hotkeys = require('./hotkeys')
const { noop, dnd } = require('./util')
const filePicker = require('./file-picker')

const app = module.exports = choo()

app.route('/', mainView)

app.use(function (state) {
  state.content = {}
  state.menu = {
    active: null,
    search: {
      searchId: 'search',
      term: '',
      busy: false,
      results: []
    }
  }
})

app.use(function (state, emitter) {
  const emit = emitter.emit.bind(emitter)
  const done = () => emitter.emit('render')

  const reduce = ([name, fn]) => emitter.on(name, (data) => {
    if (fn.length === 4) fn(state, data, emit, done)
    else {
      fn(state, data, emit)
      done()
    }
  })

  Object.entries({
    activeMenu (s, active) {
      s.menu.active = active === s.menu.active ? null : active
    },
    searchResults (s, results) {
      s.menu.search.results = results
      s.menu.search.busy = false
    },
    searchFor (s, term, emit) {
      if (term === s.menu.search.term) return
      s.menu.search.term = term
      s.menu.search.busy = term && term.length > 2
      s.menu.search.results = []
      search.input.onNext(term)
    },
    setModel (s, model) {
      s.content.model = model
    },
    setFluxes (s, fluxes) {
      console.log(fluxes)
      if (s.content.model) s.content.model.fluxes = fluxes
      else throw new Error('Cannot set fluxes when no model is loaded')
    },
    newModel (state, _, emit) {
      emit('setModel', new Model())
    },
    openModelFile (state, _, emit) {
      filePicker({accept: 'xml'}, (files) => emit('dropFiles', files))
    },
    dropFiles (state, files, emit) {
      np.start()
      frs(files[0])
        .on('data', (data) => parse.input.onNext({data}))
        .on('end', () => parse.input.onNext({end: true}))
    },
    dropItems (state, [href], emit) {
      if (!state.content.model) return
      kegg.input.onNext({href})
      kegg.output.filter((m) => m.href === href).subscribe((m) => {
        console.log(m)
      })
    },
    blur (state, data, emit) {
      document.activeElement.blur()
    },
    focus (state, id, emit) {
      setTimeout(() => {
        let e = document.querySelector(id)
        if (e) e.focus()
      }, 10)
    },
    runFBA (state, _, emit) {
      if (state.content.model) {
        const model = state.content.model
        const options = {}

        fba({model, options})
          .then((result) => emit('setFluxes', result))
          .catch((e) => console.error(e))
      }
    }
  }).forEach(reduce)
})

app.use(function (state, emitter) {
  const emit = emitter.emit.bind(emitter)

  // searchResultStream
  search.output.subscribe((results) => emit('searchResults', results, noop))
  search.log.subscribe((m) => console.log(m))
  search.error.subscribe((e) => console.error(e))

  // parse
  parse.output
    .map((m) => revive(m))
    .tap(() => np.done())
    .subscribe((m) => emit('setModel', m, noop))
  parse.log.subscribe((m) => console.log(m))
  parse.error.subscribe((e) => console.error(e))

  // hotkeys
  Observable.fromEvent(document.body, 'keydown')
    .merge(Observable.fromEvent(document.body, 'keyup'))
    .filter((e) => e.key === 'Escape' || (e.target ? e.target.nodeName !== 'INPUT' : true))
    .map(hotkeys)
    .filter(Boolean)
    .subscribe((args) => args.forEach((a) => emit(...[...a, noop])))

  // drop
  dnd(document.body, ({ items, files }) => {
    if (items.length) emit('dropItems', items, noop)
    if (files.length) emit('dropFiles', files, noop)
  })
})
