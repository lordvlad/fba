const { Observable } = require('rx-lite')

const keggReaction = require('../lib/keggreaction')
const { search: biomodelsSearch } = require('../lib/biomodels')

module.exports = function (self) {
  Observable.fromEvent(self, 'message')
    .map((m) => m.data)
    .distinctUntilChanged()
    .filter((t) => t.length > 2)
    .debounce(300)
    .flatMapLatest((t) => {
      if (t.startsWith('model')) {
        return biomodelsSearch(t.replace('model', '').trim())
      }
      return keggReaction(t)
    })
    .subscribe((d) => self.postMessage(d))
}
