const startSSB = require('./ssb')
const startAPI = require('./api')

const ssb = startSSB()

const port = 3000
startAPI(ssb, port)

console.log(`API running on http://localhost:${port}/`)
