// here we don't use ";" because... #000

// Basically our main backend

/* STATES THE FUNCTIONS WE WILL USE */

const express = require('express') // the way you include libraries, aka code other people made. Express is our webserver thingy.
const req = require('express/lib/request')

// all above is just setting up what we're using, the following is starting to use it

module.exports = function startAPI (ssb, PORT = 3000) {
  const { podcast, comment } = ssb

  /* ASSIGNS NAMES TO FUNCTIONS */

  const app = express() // app is now assigned to express() as a funcion
  app.use(express.json()) // express now understands .json

  /* Starts sending out requests and responses */

  // install insomnia.rest desktop app to easily start working with the app

  app.get('/whoami', (req, res) => {
    res.send({ data: ssb.id }) // request and respond, shows what ID is in ssb. In this case we use a test SSB ID. To see how to interact, search express.js https://expressjs.com/en/starter/hello-world.html
  })

  // THIS IS THE BASE FOR MAKING PODCAST POSTS

  app.post('/podcast', (req, res) => {
    podcast.create(req.body, (err, podcastId) => {
      if (err) res.status(500).send(err.message)
      else res.send({ id: podcastId, message: `Your podcast ID is ${podcastId}` }) // 000 where is the podcast ID defined?
      // 000 where are the podcasts stored? what defines it as "podcasts"
    })
  })

  // THIS IS THE BASE FOR MAKING COMMENT POSTS

  app.post('/podcast/:id/comment', (req, res) => {
    const { id } = req.params

    comment.create({ comment: req.body.comment, podcastId: id }, (err, commentId) => { // here is where it changes, it needs to reference the previous podcast ID as well as create a new ID. This means that the code should be a part of the "podcast" section I believe
      console.log("err", err, commentId)
      if (err) res.send(err)
      else res.send({ id: commentId, message: `Your comment ID is ${commentId} and your podcast ID is ${id}` })
    })
  })

  // THE BASE FOR GETTING LIST OF PODCASTS

  app.get('/podcasts', (req, res) => {
    podcast.list({}, (err, podcasts) => {
      if (err) res.status(500).send(err.message)
      else res.send({ podcasts })
    })
  })

  // Every app.get is like receiving a package

  // Every app.post is like sending a package

  // THIS ONE IS THE BASE FOR GETTING ALL COMMENTS

  app.get('/comments', (req, res) => {
    comment.list({ limit: req.query.limit }, (err, comments) => {
      if (err) res.status(500).send(err.message)
      else res.send({ comments })
    })
  console.log(req.query.limit)
  })


  // /comments?limit=10 for front end quering 

  // needs to contain req.query.limit comment.list({ limit: req.query.limit }, (err, ....

  // req.query.limit means that you request a limit of something 

  // in "author:msg.value.author" author is named as a variable with the message value of "author"

  // THIS ONE IS THE BASE FOR GETTING COMMENTS FOR SPECIFIC PODCAST

  app.get('/comment/:podcastId', async (req, res) => {
    function podcastFilter(comment) {
      return comment.podcastId === req.params.podcastId
    }

    comment.list({ filter: podcastFilter }, (err, comments) => {
      if (err) res.status(500).send(err.message)
      else res.send({ comments })
    })
  })

  // THIS IS THE BASE FOR UPDATING PODCAST POSTS

  app.put('/podcast/:id', (req, res) => {
    const { id } = req.params
    const { title, url, description } = req.body
    // my thinking is that it has to update the podcastId, check if it can find it and if it does find it replace it with the newPodcastID
    podcast.update(id, { title, url, description }, (err) => {
      if (err) {
        res.send(err)
        return // return here means don't continue the function, stop here.
      }

      podcast.read(id, (err) => {
        if (err) res.send(err)
        else res.send({ id, message: `Your podcast ID is ${id} and the podcast has been updated`, description }) // 000 where is the podcast ID defined?
        // 000 where are the podcasts stored? what defines it as "podcasts"
      })
    })
  })

  // THIS IS THE BASE FOR UPDATING COMMENT POSTS

  app.put('/comment/:id', (req, res) => {
    const { id } = req.params
    const { comment } = req.body
    // my thinking is that it has to update the podcastId, check if it can find it and if it does find it replace it with the newPodcastID
    comment.update(id, { comment }, (err) => {
      console.log(`got ${err}`)
      comment.read(id, (err, updateId) => {
        if (err) res.send(err)
        else res.send({ id, message: `Your comment ID is ${id} and the comment has been updated`, comment }) // 000 where is the podcast ID defined?
        // 000 where are the podcasts stored? what defines it as "podcasts"
        console.log(`got 2 ${err}`)
      })
    })
  })

  // THIS IS THE BASE FOR TOMBSTONING PODCAST POSTS

  app.delete('/podcast/:id', (req, res) => {
    const { id } = req.params

    podcast.tombstone(id, {}, (err) => {
      if (err) res.send(err)
      else res.send({ id, message: `You have removed podcast ${id}` }) // tombstones the podcast?????
    })
  })

  // THIS IS THE BASE FOR TOMBSTONING COMMENT POSTS

  app.delete('/comment/:id', (req, res) => {
    const { id } = req.params
    comment.tombstone(id, {}, (err) => {
      if (err) res.send(err)
      else res.send({ id, message: `You have removed the following comment "${id}"` }) // tombstones the comment?????
    })
  })

  // open insomnia_scripts.json in insomnia, will be "pretending" to be in the browser, used for back-end development, write "npm run dev" in the folder in Terminal for every time you update the code to ensure that insomnia is accessing the newest code

  // post changes information, req.body

  const api = app.listen(PORT, console.log) // listens to local host port 3000

  return api
}

// TASK for NEXT WEEK:

// - Latest 10 comments no matter the podcast (won't work unless we reorder the )

// NEXT SESSION
// - getting the latest version of the podcast

// Crut support updating of things and "tombstoning" (deleting things)
// REMEMBER TO RUN NEW CODE, ctrl+C in TERMINAL AND  "npm run dev" TO FETCH NEW CODE
// https://gitlab.com/ahau/lib/ssb-crut

// got started with UI via: https://create-react-app.dev/docs/getting-started/

// npm run lint to clean up code :)

/*
  paginate(10),
  startFrom(15),
  descending(),
*/
