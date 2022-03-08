// here we don't use ";" because... #000

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
    const niceComments = comments.map(msg => {
        return { author:msg.value.author, comment: msg.value.content.comment.set,}})
    res.send({comments:niceComments}) // only gives back the comment text, could also show author, which is automatically added to the messages in ssb 
})


// THIS ONE IS THE BASE FOR GETTING LIST OF 10 LATEST COMMENTS
app.get('/comments', async (req, res) => { 
    const {where, and, slowEqual, type, toPromise }  = require('ssb-db2/operators') // enables the commands to be used
    const comments = await ssb.db.query( 
          where( // select inside the list with the requirements of multiple things, "and"
              and( // two things need to be true  
                  type('comment') //specifically comments
              )
          ), toPromise() // whenever it has promised the await is waiting the responses
      )
    const timelyComments = comments.map(msg => {
        return { id: msg.key, author:msg.value.author, timeStamp:msg.value.timestamp, comment: msg.value.content.comment.set,}})
    res.send({comments:timelyComments}) // only gives back the comment text, could also show author, which is automatically added to the messages in ssb 
})

// in "author:msg.value.author" author is named as a variable with the message value of "author"


// THE BASE FOR GETTING LIST OF PODCASTS

app.get('/podcasts', async (req, res) => { 
    const {where, and, slowEqual, type, toPromise }  = require('ssb-db2/operators') // enables the commands to be used
    const podcast = await ssb.db.query( 
          where( // select inside the list with the requirements of multiple things, "and"
              and( // two things need to be true  
                  type('podcast') //specifically comments
              )
          ), toPromise() // whenever it has promised the await is waiting the responses
      )
    const podcastOverview = podcast.map(msg => {
        return {id: msg.key, author:msg.value.author, timeStamp:msg.value.timestamp, podcast: msg.value.content.title.set, url:msg.value.content.url.set}
    }) //the way ssb msg are structure is that the message "value" is the whole message. When you get a message from the network, it has standard properties (these are value). Everything you put in is "content", (such as message id, things generated when you make content)
    res.send({comments:podcastOverview}) // only gives back the comment text, could also show author, which is automatically added to the messages in ssb 
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



// THIS IS THE BASE FOR UPDATING PODCAST POSTS

app.post('/podcastUpdate', (req, res) => { 
  const { title, url, podcastId, description } = req.body
// my thinking is that it has to update the podcastId, check if it can find it and if it does find it replace it with the newPodcastID    
  podcast.update(podcastId, {title, url, description }, (err) => {
      podcast.read(podcastId, (err, updatedPodcast) => {
        if (err) res.send(err) 
        else res.send({id:podcastId, message: `Your podcast ID is ${podcastId} and the podcast has been updated`, description})  // 000 where is the podcast ID defined?
        // 000 where are the podcasts stored? what defines it as "podcasts"    
      }) 
})
}) 


// THIS IS THE BASE FOR UPDATING COMMENT POSTS

app.post('/commentUpdate', (req, res) => { 
  const { commentId, description } = req.body
// my thinking is that it has to update the podcastId, check if it can find it and if it does find it replace it with the newPodcastID    
  commentCrut.update(commentId, { description }, (err) => {
      commentCrut.read(commentId, (err, updatedComment) => {
        if (err) res.send(err) 
        else res.send({id:commentId, message: `Your comment ID is ${commentId} and the comment has been updated`, description})  // 000 where is the podcast ID defined?
        // 000 where are the podcasts stored? what defines it as "podcasts"    
      }) 
})
}) 


// THIS IS THE BASE FOR TOMBSTONING PODCAST POSTS

app.post('/podcastTombstone', (req, res) => { 
  const { podcastId } = req.body

  podcast.tombstone(podcastId, {}, (err) => {
    if (err) res.send(err) 
    else res.send({id: podcastId, message: `You have removed ${podcastId}` }) // tombstones the podcast?????
  })
})


// THIS IS THE BASE FOR TOMBSTONING COMMENT POSTS

app.post('/commentTombstone', (req, res) => { 
  const { commentId, podcastId } = req.body

  commentCrut.tombstone(commentId, {}, (err) => {
    if (err) res.send(err) 
    else res.send({id: commentId, message: `You have removed the following comment "${commentId}" from the podcast with the following ID: ${podcastId}` }) // tombstones the comment?????
  })
})

// open insomnia_scripts.json in insomnia, will be "pretending" to be in the browser, used for back-end development, write "npm run dev" in the folder in Terminal for every time you update the code to ensure that insomnia is accessing the newest code 

// post changes information, req.body 

app.listen(3000) //listens to local host port 3000

console.log('API running on http://localhost:3000/')

// TASK for NEXT WEEK: 
// - Make tombstone for comments
// - Make updates for comments 

// WHY IT NOT WORKY?


// - Latest 10 comments no matter the podcast (won't work unless we reorder the )
// - Mock up of UX
// NEXT SESSION
// - getting the latest version of the podcast 

// Crut support updating of things and "tombstoning" (deleting things)
// REMEMBER TO RUN NEW CODE, ctrl+C in TERMINAL AND  "npm run dev" TO FETCH NEW CODE 
// https://gitlab.com/ahau/lib/ssb-crut

