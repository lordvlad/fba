const { Observable } = require('rx-lite')

const MuxDemux = require('../lib/mux')
const WorkerDuplex = require('../lib/WorkerDuplex')

const keggReaction = require('./keggreaction')
const biomodels = require('./biomodels')

module.exports = function (self) {
  let logger = null
  const logit = (msg) => logger && logger.write(msg)
  const mux = new MuxDemux()

  mux.pipe(new WorkerDuplex(self)).pipe(mux)

  function sbml (stream) {
    stream.pipe(require('./sbml')()).pipe(stream)
  }

  function log (stream) {
    logger = stream
  }

  function search (stream) {
    Observable.fromEvent(stream, 'data')
      .distinctUntilChanged()
      .filter((t) => t.length > 2)
      .debounce(300)
      .flatMapLatest((t) => {
        if (t.startsWith('model')) {
          return biomodels(t.replace('model', '').trim())
        }
        return keggReaction(t)
      })
      .subscribe((d) => stream.write(d))
  }

  const services = { search, log, sbml }

  mux.on('channelOpened', function (stream) {
    const {readable, writable, name, id} = stream
    if (name in services) services[name](stream)
    logit(`opening ${readable ? 'readable ' : ''}${writable ? 'writable ' : ''}stream '${name}' #${id}`)
  })
}
