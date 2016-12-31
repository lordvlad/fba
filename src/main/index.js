const choo = require('choo')
const frs = require('filereader-stream')
const {Observable} = require('rx-lite')
const show = require('ndarray-show')

require('./index.styl')
const mainView = require('./views')
const hotkeys = require('./hotkeys')
const { dnd } = require('./util')
const { read, build } = require('./parser')
const search = require('./search')

const app = choo()

app.router(['/', mainView])
app.model({
  state: {
    menu: { active: null, search: {term: '', busy: false, results: []} },
    content: {}
  },
  reducers: {
    activeMenu: (s, active) => {
      s.menu.active = active === s.menu.active ? null : active
      return s
    },
    setModel: (s, model) => {
      s.content.model = model
      return s
    },
    searchFor: (s, term) => {
      if (term && term.length) search.input.onNext(term)
      s.menu.search.term = term
      s.menu.search.busy = term && term.length
      return s
    },
    searchResults: (s, results) => {
      s.menu.search.busy = false
      s.menu.search.results = results
      return s
    }
  },
  effects: {
    blur: (state, data, send, done) => {
      document.activeElement.blur()
      done()
    },
    focus: (state, id, send, done) => {
      setTimeout(() => {
        let e = document.querySelector(id)
        if (e) e.focus()
        done()
      }, 10)
    },
    dropFiles: (state, files, send, done) => {
      frs(files[0]).pipe(read()).pipe(build()).on('data', (m) => {
        send('setModel', m, done)
      })
    },
    runFBA: (state, files, send, done) => {
      if (state.content.model) {
        const model = state.content.model
        const m = model.stoichiometricMatrix

        console.log(show(m))
      }
    }
  },
  subscriptions: {
    searchResultStream: (send, done) => {
      search.output.subscribe((results) => {
        send('searchResults', results, () => {})
      })
    },
    hotkeys: (send, done) => {
      Observable
        .fromEvent(document.body, 'keyup')
        .filter((e) => e.key === 'Escape' || (e.target ? e.target.nodeName !== 'INPUT' : true))
        .map(hotkeys)
        .filter(Boolean)
        .subscribe((args) => args.forEach((a) => send(...[...a, () => {}])))
      done()
    },
    drop: (send, done) => {
      dnd(document.body, ({items, files}) => {
        if (items.length) send('dropItems', items, () => {})
        if (files.length) send('dropFiles', files, () => {})
      })
      done()
    }
  }
})

const tree = app.start()
document.body.appendChild(tree)
