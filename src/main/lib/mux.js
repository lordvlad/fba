const { Duplex } = require('stream')

class Sattelite extends Duplex {
  constructor ({mux, name, readable, writable, id}) {
    super({readableObjectMode: true, writableObjectMode: true, readable, writable})
    this.mux = mux
    this.name = name
    this.id = id
  }
  _read () {}
  _write (data, _, cb) {
    this.mux.push({id: this.id, data})
    cb()
  }
}

class MuxDemux extends Duplex {
  constructor () {
    super({readableObjectMode: true, writableObjectMode: true})
    this.i = 0
    this.satellites = new Map()
  }
  _read () {}
  _write ({data, open, close, id, name, readable, writable}, _, cb) {
    if (data) {
      if (this.satellites.get(id)) this.satellites.get(id).push(data)
    } else if (!this.satellites.get(id)) {
      [readable, writable] = [writable, readable]
      let stream = this.createStream(name, {readable, writable, id})
      this.emit(`channel${open ? 'Opened' : 'Closed'}`, stream)
    }
    cb()
  }
  createReadStream (name) { return this.createStream(name, {writable: false}) }
  createWriteStream (name) { return this.createStream(name, {readable: false}) }
  createStream (name, opts) {
    if (!opts) opts = {}
    if (typeof opts.readable === 'undefined') opts.readable = true
    if (typeof opts.writable === 'undefined') opts.writable = true
    if (typeof opts.id === 'undefined') opts.id = this.satellites.size
    const {readable, writable, id} = opts
    const stream = new Sattelite({mux: this, name, readable, writable, id})
    this.satellites.set(id, stream)
    this.push({open: true, name, id, readable: stream.readable, writable: stream.writable})
    stream.once('close', () => {
      this.push({close: true, name, id, readable: stream.readable, writable: stream.writable})
      // delete this.satellites[id]
    })
    return stream
  }
}

module.exports = MuxDemux
