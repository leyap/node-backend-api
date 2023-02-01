import redis from '../app/redis'

describe('redis', () => {
    beforeAll(() => {

    })

    it('getset', async () => {
        await redis.set('key', 'value')
        const value = await redis.get('key')
        expect(value).toEqual(value)
    })

    afterAll(() => {
        redis.del('key')
        // redis.disconnect()
        redis.quit()
    })
})
