const work = require('webworkify')
const MuxDemux = require('./mux')
const WorkerDuplex = require('./WorkerDuplex')
const worker = work(require('./worker.js'))

const mux = new MuxDemux()
mux.pipe(new WorkerDuplex(worker)).pipe(mux)

setTimeout(() => {
  console.log('yo')
  mux.createReadStream('log').on('data', (x) => console.log(x))
}, 1000)

module.exports = mux
