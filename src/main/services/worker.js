const MuxDemux = require('./mux')
const WorkerDuplex = require('./WorkerDuplex')

module.exports = function (self) {
  let logger = null
  const log = (msg) => logger && logger.write(msg)
  const mux = new MuxDemux()

  mux.pipe(new WorkerDuplex(self)).pipe(mux)

  mux.on('channelOpened', function (stream) {
    if (stream.name === 'log') logger = stream
    if (stream.name === 'sbml') {
      const sbml = require('./sbml')
      stream.pipe(sbml()).pipe(stream)
    }
    const {readable, writable, name, id} = stream
    log(`opening ${readable ? 'readable ' : ''}${writable ? 'writable ' : ''}stream '${name}' #${id}`)
  })
}
