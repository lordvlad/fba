const host = process.env.PORT ? '0.0.0.0' : '127.0.0.1'
const port = process.env.PORT || 8080

const corsProxy = require('cors-anywhere')
corsProxy.createServer({
  originWhitelist: [] // Allow all origins
}).listen(port, host, function () {
  console.log('Running CORS Anywhere on ' + host + ':' + port)
})
