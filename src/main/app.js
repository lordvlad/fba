const choo = require('choo')
const frs = require('filereader-stream')
const { Observable } = require('rx-lite')
const np = require('nprogress')
const through = require('through2')

const service = require('./services')
const { Model, revive } = require('./model')
const mainView = require('./views')
const hotkeys = require('./hotkeys')
const { noop, dnd } = require('./util')
const filePicker = require('./file-picker')

const app = module.exports = choo()

app.route('/', mainView)

app.use(function (state, emitter) {
  emitter.on('log:debug', (...args) => console.log(...args))
  emitter.on('log:error', (...args) => console.error(...args))
  emitter.on('log:info', (...args) => console.info(...args))
})

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
      // search.input.onNext(term) FIXME
    },
    setModel (s, model) {
      emit('log:debug', `loaded model '${model.id}'`)
      s.content.model = model
    },
    setFluxes (s, fluxes) {
      emit('log:debug', fluxes)
      if (s.content.model) s.content.model.fluxes = fluxes
      else throw new Error('Cannot set fluxes when no model is loaded')
    },
    newModel (state, _, emit) {
      emit('setModel', new Model())
    },
    openModelFile (state, _, emit) {
      filePicker({accept: 'xml'}, (files) => emit('loadModelFile', files))
    },
    loadModelFile (state, files, emit) {
      emit('log:debug', `loading model file '${files[0].name}'`)
      np.start()
      const pipewrap = (fn) => through.obj(function (o) { this.push(fn(o)) })
      frs(files[0]).pipe(service.createStream('sbml')).pipe(pipewrap(revive))
        .on('data', (m) => {
          np.done()
          emit('setModel', m)
        })
    },
    dropItems (state, [href], emit) {
      // if (!state.content.model) return FIXME
      // kegg.input.onNext({href})
      // kegg.output.filter((m) => m.href === href).subscribe((m) => {
      //   emit('log:debug', m)
      // })
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
      // if (state.content.model) { FIXME
      //   const model = state.content.model
      //   const options = {}

        // fba({model, options})
        //   .then((result) => emit('setFluxes', result))
        //   .catch((e) => emit('log:error', e))
      // }
    }
  }).forEach(reduce)
})

app.use(function (state, emitter) {
  const emit = emitter.emit.bind(emitter)

  // searchResultStream
  // search.output.subscribe((results) => emit('searchResults', results, noop)) FIXME
  // search.log.subscribe((m) => emit('log:debug', m))
  // search.error.subscribe((e) => emit('log:error', e))

  // parse
  // parse.output FIXME
  //   .tap((x) => emit('log:debug', 'done parsing'))
  //   .map((m) => revive(m))
  //   .tap(() => np.done())
  //   .subscribe((m) => emit('setModel', m))
  // parse.log.subscribe((m) => emit('log:debug', m))
  // parse.error.subscribe((e) => emit('log:error', e))

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
    if (files.length) emit('loadModelFile', files, noop)
  })
})
