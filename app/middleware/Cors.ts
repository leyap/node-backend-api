import {Context, Next} from "koa"

async function Cors(ctx: Context, next: Next) {
    // const REG_WHITE_LIST = /^https?:\/\/(?:[0-9a-zA-Z-]+\.)*\.(?:ws|biz|com)(?::\d+)?$/;
    const origin = ctx.get('Origin');
    // if (origin && REG_WHITE_LIST.test(origin)) {
    if (true) {
        ctx.set('Access-Control-Allow-Origin', origin); // 允许跨域
        ctx.set('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,HEAD,PUT,DELETE'); // 支持的方法
        ctx.set('Access-Control-Allow-Credentials', 'true'); // 允许传入Cookie
        ctx.set('Access-Control-Max-Age', '2592000'); // 过期时间一个月
        // 如果有特殊的请求头，直接响应
        if (ctx.get('Access-Control-Request-Headers')) {
            ctx.set('Access-Control-Allow-Headers', ctx.get('Access-Control-Request-Headers'));
        }
        // FIX：浏览器某些情况下没有带Origin头
        ctx.set('Vary', 'Origin');

        // 如果是 OPTIONS 请求，则直接返回
        if (ctx.method === 'OPTIONS') {
            ctx.status = 204;
            return;
        }
    }

    await next();
}

export default Cors
