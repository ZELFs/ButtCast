const Stack = require('secret-stack')
const caps = require('ssb-caps')
const ssbKeys = require('ssb-keys')
const path = require('path')
const CRUT = require('ssb-crut') // loads module "crut" which is used by Ahau, to make it easy to create and update posts, similar to gatherings in current SSB stack, compared to static messages

const podcastModel = require('./model/podcast') // related to the crut framework, it tells the crut how it should be able to work with "podcasts", could also be "gatherings" or "posts", hypothetically. It automatically knows that it's a .json so no need to write out

const commentModel = require('./model/comment') // links to the dependancies for the object Comment (which is created later on) in this case "commentModel"

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

  if (opts.logging !== false) {
    ssb.db.post(msg => {
      console.log(msg.key)
      console.log(JSON.stringify(msg.value.content, null, 2))
      console.log('')
    })
  }

  ssb.podcast = new CRUT(ssb, podcastModel) // new calls upon crut to create a new thing, in this case a podcastModel
  ssb.comment = new CRUT(ssb, commentModel) // 000 why are there no ; after each line? Not needed?

  return ssb
}
