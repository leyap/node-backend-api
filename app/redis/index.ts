import {createClient} from 'redis'

const client = createClient()

client.on('error', err => {
    console.log('redis client error:', err)
    throw err
})

client.connect()

export default client
