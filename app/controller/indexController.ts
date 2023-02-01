import {Context} from "koa";

class IndexController {
    static async test(ctx: Context) {
        // ctx.status = 301
        // ctx.redirect('https://freediver.icu')
        ctx.body = {r: 0, msg: 'test'}
    }

    static async createUser(ctx: Context) {
        ctx.body = {r: 0}
    }
}

export default IndexController
