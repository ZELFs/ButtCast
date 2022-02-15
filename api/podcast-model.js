const Overwrite = require('@tangle/overwrite') // connects to library "tangle" as "overwrite"

module.exports = {
  type: 'podcast', // property 
  props: // object with the following three attributes
    {
    title: Overwrite(),
    description: Overwrite(),
    url: Overwrite() //soundcloud link for example
  }
}