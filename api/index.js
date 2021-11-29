const express = require('express')
const CRUT = require('ssb-crut')

const SSB = require('../ssb')
const podcastModel = require('./podcast-model')

const app = express()
app.use(express.json())

const ssb = SSB()
const podcast = new CRUT(ssb, podcastModel)

app.get('/whoami', (req, res) => {
  res.send({ data: ssb.id })
})

app.post('/podcast', (req, res) => {
  const { title, url, description } = req.body

  podcast.create({ title, url, description }, (err, podcastId) => {
    if (err) res.send(err)
    else res.send({ id: podcastId })
  })
})

app.listen(3000)

console.log('API running on http://localhost:3000/')
