const Overwrite = require('@tangle/overwrite')

module.exports = {
  type: 'podcast',
  props: {
    title: Overwrite(),
    description: Overwrite(),
    url: Overwrite()
  }
}
