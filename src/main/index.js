const choo = require('choo')
const frs = require('filereader-stream')
const { Observable } = require('rx-lite')
const ndarray = require('ndarray')
const { assign } = require('ndarray-ops')
const show = require('ndarray-show')
const fill = require('ndarray-fill')


require('./styles/index.styl')

const optimize = require('./simplex')
const mainView = require('./views')
const hotkeys = require('./hotkeys')
const { dnd } = require('./util')
const { read, build } = require('./parser')
const search = require('./search')
const filePicker = require('./file-picker')

const noop = () => {}

const app = choo()

app.router(['/', mainView])
app.model({
  state: {
    menu: { active: null, search: {term: '', busy: false, results: []} },
    content: {}
  },
  reducers: {
    activeMenu (s, active) {
      s.menu.active = active === s.menu.active ? null : active
      return s
    },
    setModel (s, model) {
      s.content.model = modelk
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
    openFile (state, _, send, done) {
      filePicker({accept: 'xml'}, (files) => send('dropFiles', files, done))
    },
    dropFiles (state, files, send, done) {
      frs(files[0]).pipe(read()).pipe(build()).on('data', (m) => send('setModel', m, done))
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
    runFBA (state, files, send, done) {
      if (state.content.model) {
        const model = state.content.model
        const S = model.stoichiometricMatrix
        const n = model.reactions.size
        const m = model.species.size
        const constraints = []

        const v = ndarray(new Float64Array(n), [n, 1])
        const objective = ndarray(new Float64Array(n), [n, 1])
        const lbs = ndarray(new Float64Array(n), [n, 1])
        const ubs = ndarray(new Float64Array(n), [n, 1])
        const _0 = ndarray(new Float64Array(n), [n, 1])

        for (let i = 0; i < m; i++) {
          let coef = ndarray(new Float64Array(n), [n])
          assign(coef, S.pick(i, null))
          constraints.push([coef.data, '=', 0])
        }

        fill(v, () => 0)
        fill(objective, () => 1)
        fill(lbs, () => -1)
        fill(ubs, () => 1)
        fill(_0, () => 0)

        const result = optimize({
          objective: { coef: objective },
          constraints,
          lbs,
          ubs
        })

        console.log(result)
        console.log(show(v))
      }
    }
  },
  subscriptions: {
    searchResultStream (send, done) {
      search.busy.subscribe((busy) => send('setSearchBusy', busy, noop))
      search.output.subscribe((results) => send('searchResults', results, noop))
    },
    hotkeys (send, done) {
      Observable
        .fromEvent(document.body, 'keydown')
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

const tree = app.start()
document.body.appendChild(tree)
