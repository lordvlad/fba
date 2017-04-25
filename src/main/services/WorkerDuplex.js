const { Duplex } = require('stream')

class WorkerDuplex extends Duplex {
  constructor (worker) {
    super({readableObjectMode: true, writableObjectMode: true})
    this.worker = worker
    this.worker.addEventListener('message', ({data}) => {
      this.push(data)
    })
  }
  _write (data, _, cb) {
    this.worker.postMessage(data)
    cb()
  }
  _read () {}
}

module.exports = WorkerDuplex
