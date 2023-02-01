import run from '../app'
import request from 'supertest'
import {Server} from "http";

describe('http', () => {
    let server: Server
    beforeAll(() => {
        server = run(3003)
    })
    it('GET /api', () => {
        return request(server).get('/api').expect(200)
            // .then(response => {
            // expect(response.body).toStrictEqual([1,2,3,4])
            // expect(response.body.length).toEqual(4)
        // })
    })
    afterAll(async () => {
        server.close()
    })
})
