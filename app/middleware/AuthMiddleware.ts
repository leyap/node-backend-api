import {Context, Next} from "koa"
import logger from "../logger";
import {verify} from "../../utils/auth";

function AuthMiddleware(ctx: Context, next: Next) {
    if (ctx.path === '/api/login' || ctx.path === '/api/register') {
        return next()
    }

    const tokenStr = ctx.headers['authorization']
    if (tokenStr) {
        const tokenArr = tokenStr.match(/^Bearer (.*)/) || []
        const token: string = tokenArr.length === 2 ? tokenArr[1] : ''
        if (!token) {
            ctx.body = {
                msg: 'authorization verify failed',
                r: 4000
            }
            return
        }
        const {decoded, error} = verify(token)
        if (error) {
            if (error.name === 'TokenExpiredError') {
                // ctx.status = 301
                // ctx.redirect('http://localhost:3008/login')
                // return
                return ctx.body = {r: 4002, msg: "登陆过期！"}
            } else {
                logger.info('auth', error)
                return ctx.body = {
                    r: 4000,
                    msg: "authorization verify failed"
                }
            }
        }
        ctx.state.user = decoded.payload
        return next()
    } else {
        logger.info('auth', 'require authorization')
        ctx.body = {
            r: 4001,
            msg: "require authorization"
        }
    }
}

export default AuthMiddleware
