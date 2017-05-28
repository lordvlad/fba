const work = require('webworkify')

const MuxDemux = require('../lib/mux')
const WorkerDuplex = require('../lib/WorkerDuplex')

const worker = work(require('./worker.js'))

const mux = new MuxDemux()
const log = console.log.bind(console)

mux.pipe(new WorkerDuplex(worker)).pipe(mux)
setTimeout(() => mux.createReadStream('log').on('data', log), 100)

module.exports = mux
