const Stack = require('secret-stack')
const caps = require('ssb-caps')
const DB = require('ssb-db2')
const ssbKeys = require('ssb-keys')
const path = require('path')

module.exports = function ssb (opts = {}) {
  if (!opts.path) opts.path = path.join(__dirname, 'data')
  if (!opts.keys) {
    const keyPath = path.join(opts.path, 'secret')
    opts.keys = ssbKeys.loadOrCreateSync(keyPath)
  }

  const stack = Stack({ caps })
    .use(DB)

  return stack(opts)
}
