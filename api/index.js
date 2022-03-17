// here we don't use ";" because... #000

// Basically our main backend

/* STATES THE FUNCTIONS WE WILL USE */

const express = require('express') // the way you include libraries, aka code other people made. Express is our webserver thingy.

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

  // THIS ONE IS THE BASE FOR GETTING COMMENTS FOR SPECIFIC PODCAST

  // app.get defines the function for the remaining usage where one can for example call comments/15 or comments/7 to call for podcast nr 15 or nr 7
  app.get('/comment/:id', async (req, res) => {
    const { where, and, slowEqual, type, toPromise } = require('ssb-db2/operators') // enables the commands to be used
    let comments = await ssb.db.query(
      where( // select inside the list with the requirements of multiple things, "and"
        and( // two things need to be true
          slowEqual('value.content.podcastId.set', req.params.id), // find a specific field //"value.content.podcastId.set" says what page in the book to look at and "req.params.podcastId" is what specific podcast ID it is
          type('comment') // specifically comments
        )
      ), toPromise() // whenever it has promised the await is waiting the responses
    )
    comments = comments.filter(msg => {
      return msg.value.content.tangles.comment.root === null // comparing to see if it's equal, if it is, then true
    })
    comments = await Promise.all(comments.map(msg => comment.read(msg.key))) // with each of these messages, use crut to load the comments, please!
    /*
      const niceComments = comments.map(msg => {
          return { author:msg.value.author, comment: msg.value.content.comment.set,}}) */
    res.send({ comments }) // only gives back the comment text, could also show author, which is automatically added to the messages in ssb
  })

  // THIS ONE IS THE BASE FOR GETTING ALL COMMENTS
  app.get('/comment', async (req, res) => {
    const { where, and, type, toPromise } = require('ssb-db2/operators') // enables the commands to be used
    let comments = await ssb.db.query( // used to be "const" instead of "let"
      where( // select inside the list with the requirements of multiple things, "and"
        and( // two things need to be true
          type('comment') // specifically comments
        )
      ), toPromise() // whenever it has promised the await is waiting the responses
    )
    comments = comments.filter(msg => {
      return msg.value.content.tangles.comment.root === null // comparing to see if it's equal, if it is, then true
    }) // filter works on arrays, only keeps some elements if it returns true you want to keep it if it returns false, you don't want to keep the messages of the array

    if (req.query.limit) comments = comments.slice(0, req.query.limit)

    comments = await Promise.all(comments.map(msg => comment.read(msg.key))) // with each of these messages, use crut to load the comments, please!
    res.send({ comments }) // only gives back the comment text, could also show author, which is automatically added to the messages in ssb
  })

  // nicer solution is https://github.com/ssb-ngi-pointer/jitdb#pagination - let's you call 10 msgs at a time, can also do oldest first

  // in "author:msg.value.author" author is named as a variable with the message value of "author"

  /*

  // THIS ONE IS THE BASE FOR GETTING 10 LATEST COMMENTS (based on Javascrpit array sorting)

  app.get('/10LatestComments', async (req, res) => {
    const { where, and, type, toPromise } = require('ssb-db2/operators') // enables the commands to be used
    let comments = await ssb.db.query( // used to be "const" instead of "let"
      where( // select inside the list with the requirements of multiple things, "and"
        and( // two things need to be true
          type('comment') // specifically comments
        )
      ), toPromise() // whenever it has promised the await is waiting the responses
    )
    comments = comments.filter(msg => {
      return msg.value.content.tangles.comment.root === null // comparing to see if it's equal, if it is, then true
    }) // filter works on arrays, only keeps some elements if it returns true you want to keep it if it returns false, you don't want to keep the messages of the array

    comments = await Promise.all(comments.map(msg => comment.read(msg.key))) // with each of these messages, use crut to load the comments, please!
    let latestComments = comments[comments.length >= 10]
    console.log(latestComments) // 000 I understand that I'm getting the empty brackets error here due to there being an empty comment, I would have to run it through crut to load the comments as above, yet I'm not sure how to impliment.I will try to impliment it in crut entirely now... I could also do this with loops but I haven't figured out exactly how yet...
          /*
      const timelyComments = comments.map(msg => {
          return {
              id: msg.key,
              author:msg.value.author,
              timeStamp:msg.value.timestamp,
              comment:msg.value.content.comment.set
          }
      }) /*
    res.send({ latestComments }) // only gives back the comment text, could also show author, which is automatically added to the messages in ssb
  })
  */

  // comments = arr.sort((a, b) => a > b ? -1 : 1) // (sorts decending)

  // nicer solution is https://github.com/ssb-ngi-pointer/jitdb#pagination - let's you call 10 msgs at a time, can also do oldest first

  // in "author:msg.value.author" author is named as a variable with the message value of "author"

  // THE BASE FOR GETTING LIST OF PODCASTS

  app.get('/podcast', async (req, res) => {
    const { where, and, type, toPromise } = require('ssb-db2/operators') // enables the commands to be used
    let podcasts = await ssb.db.query(
      where( // select inside the list with the requirements of multiple things, "and"
        and( // two things need to be true
          type('podcast') // specifically comments
        )
      ), toPromise() // whenever it has promised the await is waiting the responses
    )

    podcasts = podcasts.filter(msg => {
      return msg.value.content.tangles.podcast.root === null // comparing to see if it's equal, if it is, then true
    })
    podcasts = await Promise.all(podcasts.map(msg => podcast.read(msg.key))) // with each of these messages, use crut to load the comments, please!
    res.send({ podcasts }) // only gives back the comment text, could also show author, which is automatically added to the messages in ssb
  })
  // Every app.get is like receiving a package

  // Every app.post is like sending a package

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
    const { comment } = req.body

    comment.create({ comment, podcastId: id }, (err, commentId) => { // here is where it changes, it needs to reference the previous podcast ID as well as create a new ID. This means that the code should be a part of the "podcast" section I believe
      if (err) res.send(err)
      else res.send({ id: commentId, message: `Your comment ID is ${commentId} and your podcast ID is ${id}` })
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
