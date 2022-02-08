const Overwrite = require('@tangle/overwrite') // connects to library "tangle" as "overwrite"
// in this case the overwrite function would not be necessary maybe? That's a Q of UX

module.exports = {
  type: 'comment', // property 
  props: // object with the following three attributes
    {
    comment: Overwrite(), // the text input
    podcastId: Overwrite(),
  } 
}

