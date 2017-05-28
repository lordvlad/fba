const cors = require('../lib/cors-anywhere')

const biomodelsUrl = (id) => `${cors}/http://www.ebi.ac.uk/biomodels-main/download?mid=${id}`

module.exports = {
  biomodelsUrl
}
