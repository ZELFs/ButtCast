const test = require('tape')
const axios = require('axios')
const testAPI = require('../testing-api')

test('POST /podcast', async t => {
  // t.equal(2 + 2, 4, 'addition is working!')

  const api = testAPI()

  const result = await axios.post('http://localhost:3001/podcast', {
    title: 'my buttcast adventure!',
    description: 'season 1, episode 1'
  })

  // console.log('result', result.data)
  t.equal(typeof result.data.id, 'string', 'returns a podcast id!')
  t.true(result.data.message.startsWith('Your podcast ID is'), 'returns a helpful human message')

  api.close()

  t.end()
})
