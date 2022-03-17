const test = require('tape')
const axios = require('axios')
const testAPI = require('../testing-api')

test('POST /podcast', async t => {
  // t.equal(2 + 2, 4, 'addition is working!')

  const api = testAPI()

  // create a new podcast!
  const result = await axios.post('http://localhost:3001/podcast', {
    title: 'my buttcast adventure!',
    description: 'season 1, episode 1'
  })
  // console.log('result', result.data)

  t.equal(typeof result.data.id, 'string', 'returns a podcast id!')
  t.true(result.data.message.startsWith('Your podcast ID is'), 'returns a helpful human message')

  // try to create a podcast with the wrong shaped data
  const result2 = await axios.post('http://localhost:3001/podcast', {
    height: 123 // wrong!
  })
    .catch(err => {
      // we end up in this catch only if there was and error with the request
      // console.log(err.response.data)
      t.true(err.response.data.includes('unallowed inputs'), 'bad request => helpful error')
    })
  t.equal(result2, undefined, 'bad request means no result')

  api.close()
  t.end()
})
