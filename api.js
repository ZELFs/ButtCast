const express = require('express')
const SSB = require('./ssb')

const ssb = SSB()
const app = express()

console.log(Object.entries(ssb))

app.get('/', (req, res) => {
  res.send({ data: ssb.id })
})

app.listen(3000)

console.log('API running on http://localhost:3000/')
