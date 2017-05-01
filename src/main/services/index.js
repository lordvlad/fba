const work = require('webworkify')
const MuxDemux = require('./mux')
const WorkerDuplex = require('./WorkerDuplex')
const worker = work(require('./worker.js'))

const mux = new MuxDemux()
mux.pipe(new WorkerDuplex(worker)).pipe(mux)

setTimeout(() => {
  mux.createReadStream('log').on('data', (x) => console.log(x))
}, 100)

module.exports = mux
