const { Observable } = require('rx-lite')

const keggReaction = require('./keggreaction')
const biomodels = require('./biomodels')

module.exports = function (self) {
  Observable.fromEvent(self, 'message')
    .map((m) => m.data)
    .distinctUntilChanged()
    .filter((t) => t.length > 2)
    .debounce(300)
    .flatMapLatest((t) => {
      if (t.startsWith('model')) {
        return biomodels(t.replace('model', '').trim())
      }
      return keggReaction(t)
    })
    .subscribe((d) => self.postMessage(d))
}
