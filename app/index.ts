// import dotenv from 'dotenv'
const dotenv = require('dotenv').config()
if (dotenv.error) {
    // throw dotenvResult.error.toString()
    console.error(dotenv.error.toString())
    process.exit(100)
}

import logger from './logger'
import path from "path";
import Koa, {Context, Next} from 'koa'
import cors from '@koa/cors'
import authRouter from './router/authRouter'
import router from './router'
import {Server} from 'http'
import KoaBody from 'koa-body'
import AccessLogMiddleware from "./middleware/AccessLogMiddleware";
import AuthMiddleware from "./middleware/AuthMiddleware"
import ErrorMiddleware from "./middleware/ErrorMiddleware";
import config from "./config";
import {createDir} from '../utils/createDir'

const env = process.env.NODE_ENV || 'development';

const uploadDir = config.uploadDir
createDir(uploadDir)

const app = new Koa()

app.use(cors({
    // origin: "*",
    // allowMethods:"*",
    credentials: true
}))

app.use(ErrorMiddleware)
// if (config.dev) { //log4js error in pm2
    app.use(AccessLogMiddleware);
// }

app.use(KoaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, uploadDir),
        keepExtensions: true,
        // maxFileSize: 5000, // 文件大小
        onFileBegin: (name, file) => {
            // filepath:
            //newFilename:
            //originalFilename:
            //mimetype: 'text/plain',

            // 获取后缀, 如: .js  .txt
            // const reg = /\.[A-Za-z]+$/g
            // const ext = file.name.match(reg)[0]
            //修改上传文件名
            // file.path = path.join(__dirname, "./upload/") + Date.now() + ext;
        },
    },
    onError: (err) => {
        logger.info('body error:', err)
        throw new Error(err.message)
    }
}));

app.use((ctx: Context, next: Next) => {
    ctx.request.body = ctx.request.body || {}
    return next()
})

app.use(router.routes())

app.use(router.allowedMethods());
app.use(AuthMiddleware);
app.use(authRouter.routes())


app.on('error', (error) => {
    console.log('app on error:')
    console.error(error);
});

const run = (port: any): Server => {
    console.log(`start server on localhost:${port}`)
    return app.listen(port)
}

export default run
