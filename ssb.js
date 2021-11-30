const Stack = require('secret-stack')
const caps = require('ssb-caps')
const ssbKeys = require('ssb-keys')
const path = require('path')

module.exports = function ssb (opts = {}) {
  if (!opts.path) opts.path = path.join(__dirname, 'data')
  if (!opts.keys) {
    const keyPath = path.join(opts.path, 'secret')
    opts.keys = ssbKeys.loadOrCreateSync(keyPath)
  }

  const stack = Stack({ caps })
    .use(require('ssb-db2'))
    .use(require('ssb-db2/compat/db'))
    .use(require('ssb-db2/compat/history-stream'))
    .use(require('ssb-db2/compat/feedstate'))

  const ssb = stack(opts)

  ssb.db.post(msg => {
    console.log(JSON.stringify(msg, null, 2))
  })

  return ssb
}
