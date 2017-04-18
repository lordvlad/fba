const work = require('webworkify')
const { Observable, Subject } = require('rx-lite')

const services = {
  fba: require('./fba'),
  search: require('./search'),
  parse: require('./parse'),
  kegg: require('./kegg')
}

for (let k in services) module.exports[k] = service(k)

function service (name) {
  const srv = work(services[name])

  const input = new Subject()
  const log = new Subject()
  const output = new Subject()

  Observable.fromEvent(srv, 'message').subscribe(({data}) => {
    if (data.log) log.onNext(data.log)
    else if (data !== 'alive') output.onNext(data)
  })
  const error = Observable.fromEvent(srv, 'error')

  input.subscribe((d) => srv.postMessage(d))

  return { input, error, log, output }
}
