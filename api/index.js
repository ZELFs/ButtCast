// here we don't use ";" because... #000

// Basically our main backend

/* STATES THE FUNCTIONS WE WILL USE */

const express = require('express') // the way you include libraries, aka code other people made. Express is our webserver thingy.
const CRUT = require('ssb-crut') // loads module "crut" which is used by Ahau, to make it easy to create and update posts, similar to gatherings in current SSB stack, compared to static messages

const SSB = require('../ssb') // ".." goes backwards to the ssb.js file that is in the main folder
const podcastModel = require('./podcast-model') // related to the crut framework, it tells the crut how it should be able to work with "podcasts", could also be "gatherings" or "posts", hypothetically. It automatically knows that it's a .json so no need to write out

const commentModel = require('./commentModel') // links to the dependancies for the object Comment (which is created later on) in this case "commentModel"
const { length } = require('ssb-db2')

// all above is just setting up what we're using, the following is starting to use it

/* ASSIGNS NAMES TO FUNCTIONS */

const app = express() // app is now assigned to express() as a funcion

app.use(express.json()) // express now understands .json

const ssb = SSB() // continues naming our functions
const podcast = new CRUT(ssb, podcastModel) // new calls upon crut to create a new thing, in this case a podcastModel
const commentCrut = new CRUT(ssb, commentModel) // 000 why are there no ; after each line? Not needed?

/* Starts sending out requests and responses */

// install insomnia.rest desktop app to easily start working with the app

app.get('/whoami', (req, res) => {
  res.send({ data: ssb.id }) // request and respond, shows what ID is in ssb. In this case we use a test SSB ID. To see how to interact, search express.js https://expressjs.com/en/starter/hello-world.html
})

// THIS ONE IS THE BASE FOR GETTING COMMENTS FOR SPECIFIC PODCAST

// app.get defines the function for the remaining usage where one can for example call comments/15 or comments/7 to call for podcast nr 15 or nr 7
app.get('/comments/:podcastId', async (req, res) => {
  const { where, and, slowEqual, type, toPromise } = require('ssb-db2/operators') // enables the commands to be used
  let comments = await ssb.db.query(
    where( // select inside the list with the requirements of multiple things, "and"
      and( // two things need to be true
        slowEqual('value.content.podcastId.set', req.params.podcastId), // find a specific field //"value.content.podcastId.set" says what page in the book to look at and "req.params.podcastId" is what specific podcast ID it is
        type('comment') // specifically comments
      )
    ), toPromise() // whenever it has promised the await is waiting the responses
  )
  comments = comments.filter(msg => {
    return msg.value.content.tangles.comment.root === null // comparing to see if it's equal, if it is, then true
  })
  comments = await Promise.all(comments.map(msg => commentCrut.read(msg.key))) // with each of these messages, use crut to load the comments, please!
  /*
    const niceComments = comments.map(msg => {
        return { author:msg.value.author, comment: msg.value.content.comment.set,}}) */
  res.send({ comments }) // only gives back the comment text, could also show author, which is automatically added to the messages in ssb
})



// THIS ONE IS THE BASE FOR GETTING ALL COMMENTS
app.get('/comments', async (req, res) => {
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

  comments = await Promise.all(comments.map(msg => commentCrut.read(msg.key))) // with each of these messages, use crut to load the comments, please!
  res.send({ comments }) // only gives back the comment text, could also show author, which is automatically added to the messages in ssb
})



// THIS ONE IS THE BASE FOR GETTING 10 LATEST COMMENTS (using crut)
app.get('/10LatestCommentsCrut', async (req, res) => {
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
  comments = comments.slice(-10)
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

  comments = await Promise.all(comments.map(msg => commentCrut.read(msg.key))) // with each of these messages, use crut to load the comments, please!
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

app.get('/podcasts', async (req, res) => {
  const { where, and, type, toPromise } = require('ssb-db2/operators') // enables the commands to be used
  const podcast = await ssb.db.query(
    where( // select inside the list with the requirements of multiple things, "and"
      and( // two things need to be true
        type('podcast') // specifically comments
      )
    ), toPromise() // whenever it has promised the await is waiting the responses
  )
  const podcastOverview = podcast.map(msg => {
    return { id: msg.key, author: msg.value.author, timeStamp: msg.value.timestamp, podcast: msg.value.content.title.set, url: msg.value.content.url.set }
  }) // the way ssb msg are structure is that the message "value" is the whole message. When you get a message from the network, it has standard properties (these are value). Everything you put in is "content", (such as message id, things generated when you make content)
  res.send({ comments: podcastOverview }) // only gives back the comment text, could also show author, which is automatically added to the messages in ssb
})
// Every app.get is like receiving a package

// Every app.post is like sending a package

// THIS IS THE BASE FOR MAKING PODCAST POSTS

app.post('/podcast', (req, res) => {
  const { title, url, description } = req.body

  podcast.create({ title, url, description }, (err, podcastId) => {
    if (err) res.send(err)
    else res.send({ id: podcastId, message: `Your podcast ID is ${podcastId}` }) // 000 where is the podcast ID defined?
    // 000 where are the podcasts stored? what defines it as "podcasts"
  })
})

// THIS IS THE BASE FOR MAKING COMMENT POSTS

app.post('/comment', (req, res) => {
  const { comment, podcastId } = req.body

  commentCrut.create({ comment, podcastId }, (err, commentId) => { // here is where it changes, it needs to reference the previous podcast ID as well as create a new ID. This means that the code should be a part of the "podcast" section I believe
    if (err) res.send(err)
    else res.send({ id: commentId, message: `Your comment ID is ${commentId} and your podcast ID is ${podcastId}` })
  })
})

// THIS IS THE BASE FOR UPDATING PODCAST POSTS

app.post('/podcastUpdate', (req, res) => {
  const { title, url, podcastId, description } = req.body
  // my thinking is that it has to update the podcastId, check if it can find it and if it does find it replace it with the newPodcastID
  podcast.update(podcastId, { title, url, description }, (err) => {
    if (err) {
      res.send(err)
      return // return here means don't continue the function, stop here.
    }

    podcast.read(podcastId, (err) => {
      if (err) res.send(err)
      else res.send({ id: podcastId, message: `Your podcast ID is ${podcastId} and the podcast has been updated`, description }) // 000 where is the podcast ID defined?
      // 000 where are the podcasts stored? what defines it as "podcasts"
    })
  })
})

// THIS IS THE BASE FOR UPDATING COMMENT POSTS

app.post('/commentUpdate', (req, res) => {
  const { commentId, comment } = req.body
  // my thinking is that it has to update the podcastId, check if it can find it and if it does find it replace it with the newPodcastID
  console.log('You got the ${commentId}')
  commentCrut.update(commentId, { comment }, (err) => {
    console.log(`got ${err}`)
    commentCrut.read(commentId, (err, updatedComment) => {
      if (err) res.send(err)
      else res.send({ id: commentId, message: `Your comment ID is ${commentId} and the comment has been updated`, comment }) // 000 where is the podcast ID defined?
      // 000 where are the podcasts stored? what defines it as "podcasts"
      console.log(`got 2 ${err}`)
    })
  })
})

// THIS IS THE BASE FOR TOMBSTONING PODCAST POSTS

app.post('/podcastTombstone', (req, res) => {
  const { podcastId } = req.body

  podcast.tombstone(podcastId, {}, (err) => {
    if (err) res.send(err)
    else res.send({ id: podcastId, message: `You have removed ${podcastId}` }) // tombstones the podcast?????
  })
})

// THIS IS THE BASE FOR TOMBSTONING COMMENT POSTS

app.post('/commentTombstone', (req, res) => {
  const { commentId, podcastId } = req.body
  commentCrut.tombstone(commentId, {}, (err) => {
    if (err) res.send(err)
    else res.send({ id: commentId, message: `You have removed the following comment "${commentId}" from the podcast with the following ID: ${podcastId}` }) // tombstones the comment?????
  })
})

// open insomnia_scripts.json in insomnia, will be "pretending" to be in the browser, used for back-end development, write "npm run dev" in the folder in Terminal for every time you update the code to ensure that insomnia is accessing the newest code

// post changes information, req.body

app.listen(3000) // listens to local host port 3000

console.log('API running on http://localhost:3000/')

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
