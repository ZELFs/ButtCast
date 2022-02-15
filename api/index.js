// here we don't use ";" 

// Basically our main backend 

/* STATES THE FUNCTIONS WE WILL USE */

const express = require('express') // the way you include libraries, aka code other people made. Express is our webserver thingy.
const CRUT = require('ssb-crut') // loads module "crut" which is used by Ahau, to make it easy to create and update posts, similar to gatherings in current SSB stack, compared to static messages

const SSB = require('../ssb') // ".." goes backwards to the ssb.js file that is in the main folder
const podcastModel = require('./podcast-model') // related to the crut framework, it tells the crut how it should be able to work with "podcasts", could also be "gatherings" or "posts", hypothetically. It automatically knows that it's a .json so no need to write out

const commentModel = require('./commentModel') // links to the dependancies for the object Comment (which is created later on) in this case "commentModel" 

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
    const {where, and, slowEqual, type, toPromise }  = require('ssb-db2/operators') // enables the commands to be used
    const comments = await ssb.db.query( 
          where( // select inside the list with the requirements of multiple things, "and"
              and( // two things need to be true   
              slowEqual('value.content.podcastId.set', req.params.podcastId), // find a specific field //"value.content.podcastId.set" says what page in the book to look at and "req.params.podcastId" is what specific podcast ID it is 
                  type('comment') //specifically comments
              )
          ), toPromise() // whenever it has promised the await is waiting the responses
      )
    const niceComments = comments.map(msg => {return { author:msg.value.author, comment: msg.value.content.comment.set,}})
    res.send({comments:niceComments}) // only gives back the comment text, could also show author, which is automatically added to the messages in ssb 
})

// THIS ONE IS THE BASE FOR GETTING LIST OF 10 LATEST COMMENTS
app.get('/comments', async (req, res) => { 
    const {where, and, slowEqual, type, toPromise }  = require('ssb-db2/operators') // enables the commands to be used
    const comments = await ssb.db.query( 
          where( // select inside the list with the requirements of multiple things, "and"
              and( // two things need to be true   
              slowEqual('value.content.comment.set', req.params.timestamp), // find a specific field //"value.content.timestamp.set" says what page in the book to look at and "req.params.timestamp" is what specific timestamp the comment has 
                  type('comment') //specifically comments
              )
          ), toPromise() // whenever it has promised the await is waiting the responses
      )
    const timelyComments = comments.map(msg => {return { author:msg.value.author, timeStamp.value.comment.set, comment: msg.value.content.comment.set,}})
    res.send({comments:timelyComments}) // only gives back the comment text, could also show author, which is automatically added to the messages in ssb 
})

// THE BASE FOR GETTING LIST OF PODCASTS

app.get('/podcasts', async (req, res) => {
  res.send({ data: podcast }) 
})

// Every app.get is like receiving a package

// Every app.post is like sending a package

// THIS IS THE BASE FOR MAKING PODCAST POSTS

app.post('/podcast', (req, res) => { 
  const { title, url, description } = req.body

  podcast.create({ title, url, description }, (err, podcastId) => {
    if (err) res.send(err) 
    else res.send({id: podcastId, message: `Your podcast ID is ${podcastId}` }) // 000 where is the podcast ID defined?
    // 000 where are the podcasts stored? what defines it as "podcasts" 
  })
})

// THIS IS THE BASE FOR MAKING COMMENT POSTS

app.post('/comment', (req, res) => { 
  const { comment, podcastId } = req.body

  commentCrut.create({ comment, podcastId}, (err, commentId) => { // here is where it changes, it needs to reference the previous podcast ID as well as create a new ID. This means that the code should be a part of the "podcast" section I believe
    if (err) res.send(err) 
    else res.send({id: commentId, message: `Your comment ID is ${commentId} and your podcast ID is ${podcastId}` })
  })
})

// open insomnia_scripts.json in insomnia, will be "pretending" to be in the browser, used for back-end development

// post changes information, req.body 

app.listen(3000) //listens to local host port 3000

console.log('API running on http://localhost:3000/')


// TASK for NEXT WEEK: 
// - make a fetch for all the podcasts 
// - Latest 10 comments no matter the podcast 
