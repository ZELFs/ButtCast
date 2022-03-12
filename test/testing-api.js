const path = require('path')
const os = require('os')

const startSSB = require('../ssb')
const startAPI = require('../api')

module.exports = function testingAPI (opts = {}) {
  if (!opts.name) {
    opts.name = `buttcast-test-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }
  if (!opts.path) opts.path = path.join(os.tmpdir(), opts.name)

  opts.logging = false
  const ssb = startSSB(opts)

  const port = 3001
  const api = startAPI(ssb, port)

  return {
    podcast: ssb.podcast,
    comment: ssb.comment,
    close: () => {
      // we return a close method so each test can close down the
      // SSB server + API it's running, so we're ready to start the next test
      api.close()
      ssb.close()
    }
  }
}
