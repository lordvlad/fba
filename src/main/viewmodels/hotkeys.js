const { Observable } = require('rx-lite')

const hotkeys = require('../lib/hotkeys')

module.exports = function () {
  return function (state, emitter) {
    const emit = emitter.emit.bind(emitter)
    const noop = () => {}

    Observable.fromEvent(document.body, 'keydown')
      .merge(Observable.fromEvent(document.body, 'keyup'))
      .filter((e) => e.key === 'Escape' || (e.target ? e.target.nodeName !== 'INPUT' : true))
      .map(hotkeys)
      .filter(Boolean)
      .subscribe((args) => args.forEach((a) => emit(...[...a, noop])))
  }
}
