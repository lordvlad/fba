const choo = require('choo')
const frs = require('filereader-stream')
const { Observable } = require('rx-lite')

const { search, fba, parse } = require('./services')
const { Model } = require('./model')
const mainView = require('./views')
const hotkeys = require('./hotkeys')
const { noop, dnd } = require('./util')
const filePicker = require('./file-picker')

const app = module.exports = choo()

app.router(['/', mainView])
app.model({
  state: {
    menu: {
      active: null,
      search: {searchId: 'search', term: '', busy: false, results: []}
    },
    content: {}
  },
  reducers: {
    activeMenu (s, active) {
      s.menu.active = active === s.menu.active ? null : active
      return s
    },
    setModel (s, model) {
      s.content.model = model
      return s
    },
    setFluxes (s, fluxes) {
      s.content.model.fluxes = fluxes
      console.log(fluxes)
      return s
    },
    setSearchTerm (s, term) {
      s.menu.search.term = term
      return s
    },
    setSearchBusy (s, busy) {
      s.menu.search.busy = busy
      return s
    },
    searchResults (s, results) {
      s.menu.search.busy = false
      s.menu.search.results = results
      return s
    }
  },
  effects: {
    searchFor (state, term, send, done) {
      if (term && term.length) search.input.onNext(term)
      send('setSearchTerm', term, done)
      done()
    },
    newModel (state, _, send, done) {
      send('setModel', new Model(), done)
    },
    openModelFile (state, _, send, done) {
      filePicker({accept: 'xml'}, (files) => send('dropFiles', files, done))
    },
    dropFiles (state, files, send, done) {
      frs(files[0]).pipe(parse()).on('data', (m) => send('setModel', m, done))
    },
    blur (state, data, send, done) {
      document.activeElement.blur()
      done()
    },
    focus (state, id, send, done) {
      setTimeout(() => {
        let e = document.querySelector(id)
        if (e) e.focus()
        done()
      }, 10)
    },
    runFBA (state, _, send, done) {
      if (state.content.model) {
        const model = state.content.model
        const options = {}

        fba({model, options})
          .then((result) => send('setFluxes', result, done))
          .catch((e) => console.error(e))
      }
    }
  },
  subscriptions: {
    searchResultStream (send, done) {
      search.busy.subscribe((busy) => send('setSearchBusy', busy, noop))
      search.output.subscribe((results) => send('searchResults', results, noop))
      done()
    },
    hotkeys (send, done) {
      Observable.fromEvent(document.body, 'keydown')
        .merge(Observable.fromEvent(document.body, 'keyup'))
        .filter((e) => e.key === 'Escape' || (e.target ? e.target.nodeName !== 'INPUT' : true))
        .map(hotkeys)
        .filter(Boolean)
        .subscribe((args) => args.forEach((a) => send(...[...a, noop])))
      done()
    },
    drop (send, done) {
      dnd(document.body, ({items, files}) => {
        if (items.length) send('dropItems', items, noop)
        if (files.length) send('dropFiles', files, noop)
      })
      done()
    }
  }
})
