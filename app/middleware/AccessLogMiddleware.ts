import {Context, Next} from "koa"
import {accessLogger} from "../logger";

function AccessLogMiddleware(ctx: Context, next: Next) {
    const ip = ctx.header['X-Forwarded-For'] || ctx.ip
    accessLogger.info("", `${ip} | ${ctx.method} | ${ctx.path} | ${ctx.headers['user-agent']}`)
    return next()
}

export default AccessLogMiddleware
