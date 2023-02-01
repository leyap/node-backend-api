import {Context, Next} from "koa"
import logger from "../logger";

async function ErrorMiddleware(ctx: Context, next: Next) {
    try {
        await next()
    } catch (e) {
        logger.info("server error", e)
        return ctx.body = {
            r: 5000,
            msg: e.message
        }
    }
}

export default ErrorMiddleware
