import {Context} from "koa"
import logger from "../logger"
import {hash, hashVerify, sign} from "../../utils/auth"
import UserService from "../db/UserService"
import config from "../config"
import redis from '../redis'
import httpClient from "../../utils/request";
import Helper from "../helper";
import {getCaptchaImageGif} from "../../utils/captcha";
import {randomUUID} from "crypto";
import Utils from "../../utils";

class UserController {

    static async buildCpatcha() {
        const {capCode, data} = getCaptchaImageGif()
        const capid = randomUUID()
        await redis.set('captcha.' + capid, capCode, {'EX': 60 * 10})
        return {capid, img: Buffer.from(data).toString('base64').slice(0, -1)}
    }

    static async getCaptcha(ctx: Context) {
        const {capid, img} = await UserController.buildCpatcha()
        ctx.status = 200
        return ctx.body = {
            capid,
            img
        }
    }

    static async verifyCaptcha(ctx: Context) {
        const {capid, captcha, phone} = ctx.request.body
        if (capid && (!captcha || !phone)) {
            ctx.status = 600
            return ctx.body = 'require captcha,phone'
        }
        const realCode = await redis.get('captcha.' + capid)
        if (realCode === captcha) {
            if (!phone) {
                ctx.status = 601
                return ctx.body = 'require phone'
            }
            await redis.set('captcha.' + capid, phone, {'EX': 60 * 5, XX: true})
            ctx.status = 200
            ctx.body = 'ok'
        } else {
            let msg = '';
            if (capid && !realCode) {
                msg = 'captcha input error!'
                await redis.del('captcha.' + capid)
            }
            const {capid: newCapid, img} = await UserController.buildCpatcha()
            ctx.status = 220
            ctx.body = {
                msg,
                capid: newCapid,
                img
            }
        }
    }

    static async getPhoneCode(ctx: Context) {
        const {phone} = ctx.request.body || {}
        if (!phone) {
            ctx.status = 221
            return ctx.body = '??????????????????????????????'
        }

        // const clientIp = Helper.getClientIp(ctx)
        // const codeIpDayLimitKey = 'codeIpLimit.' + '.' + clientIp
        // if (await redis.get(codeIpDayLimitKey)) {
        //     ctx.status = 224
        //     return ctx.body = '???????????????????????????????????????'
        // }

        const codeFreqLimitKey = 'codeFreq.' + '.' + phone
        if (await redis.get(codeFreqLimitKey)) {
            ctx.status = 222
            return ctx.body = '????????????????????????????????????'
        }

        const codeDayLimitKey = 'codeLimit.' + (new Date()).toLocaleDateString() + '.' + phone
        const codeSendCount = Number(await redis.get(codeDayLimitKey))

        if (codeSendCount > 10) {
            ctx.status = 223
            return ctx.body = '????????????????????????????????????'
        }

        let code = Math.random().toString().slice(3, 9)
        if (config.dev) {
            code = '123456'
        }

        let r: any = {}
        if (config.dev) {
            r = 0
        } else {
            r = await Helper.sendPhoneCode(phone, code)
        }

        await redis.set(codeFreqLimitKey, 1, {EX: 60})

        // const r = 0
        // await redis.set('code.' + phone, code, {'EX': 60 * 3}, 'limit.'+(new Date()).getDate()+'.'+phone, "1"")
        // await redis.multi().set('code.' + phone, code, {'EX': 60 * 3})
        //     .incr('codeLimit.'+(new Date()).toLocaleDateString()+ '.'+phone,1,{'EX': '24h'} )
        //     .exec()
        await redis.set('code.' + phone, code, {'EX': 60 * 5})
        if (await redis.get(codeDayLimitKey)) {
            await redis.incr(codeDayLimitKey)
        } else {
            await redis.set(codeDayLimitKey, 1, {'EX': 60 * 60 * 24})
        }

        if (r === 0) {
            ctx.status = 200
            return ctx.body = '???????????????????????????????????????'
        } else {
            ctx.status = 220
            return ctx.body = '?????????????????????????????????'
        }
    }

    static async loginOr(ctx: Context) {
        const {phone, code, capid} = ctx.request.body || {}
        if (!phone || !code || !capid) {
            ctx.status = 220
            // return ctx.body = 'require: phone,code,capid'
            return ctx.body = '?????????????????????'
        }

        const realCode = await redis.get('code.' + phone)
        const markPhone = await redis.get('captcha.' + capid)

        if (!realCode || !markPhone) {
            ctx.status = 222
            return ctx.body = '?????????????????????'
        }

        const codeErrorCount = Number(await redis.get('codeErrorLimit.' + phone + '.' + realCode))
        if (codeErrorCount > 3) {
            ctx.status = 223
            return ctx.body = '???????????????????????????????????????'
        }

        if (code === realCode && phone === markPhone) {
            await redis.del('code.' + phone)
            await redis.del('captcha.' + capid)
            const user = await UserService.getUserByPhone(phone)
            if (user) { // ???????????????
                const {username, email, id} = user
                const token = sign({id})
                ctx.status = 200
                return ctx.body = {username, id, email, token}
            } else {    //???????????????????????????
                const userRes = await UserService.register({phone})
                const token = sign({id: userRes.id})
                ctx.status = 200
                return ctx.body = {id: userRes.id, token}
            }
        } else {
            if (await redis.get('codeErrorLimit.' + phone + '.' + realCode)) {
                await redis.incr('codeErrorLimit.' + phone + '.' + realCode)
            } else {
                await redis.set('codeErrorLimit.' + phone + '.' + realCode, 1, {EX: 60 * 10})
            }
            ctx.status = 221
            ctx.body = "??????????????????"
        }
    }

    static async setupPassword(ctx: Context) {
        const {password} = ctx.request.body
        if (!password || password.length < 6) {
            ctx.status = 220
            return ctx.body = "??????????????????6???"
        }
        const psHash = await hash(password + config.psSalt)
        try {
            const res = await UserService.updatePassword({
                id: ctx.state.user.id,
                password: psHash
            })
            ctx.status = 200
            ctx.body = 'ok'
        } catch (e) {
            ctx.status = 220
            ctx.body = 'error'
        }
    }

    static async login(ctx: Context) {
        const {username, password} = ctx.request.body
        if (!username || !password) {
            return ctx.body = {
                r: 2,
                msg: 'require username and password!'
            }
        }
        const user = await UserService.getUserByName(username)
        if (!user) {
            return ctx.body = {r: 1, msg: "username or password error"}
        }
        const {email, password: psHash} = user
        if (hashVerify(psHash, username + email + password + config.psSalt)) {
            const token = sign({id: user.id})
            redis.set(user.id, token)
            ctx.body = {r: 0, data: {id: user.id, username, email, token}}
        } else {
            ctx.body = {r: 1, msg: "username or password error"}
        }
    }

    static async register(ctx: Context) {
        const {username, password, email} = ctx.request.body || {}
        if (!username || !password || !email) {
            return ctx.body = {
                r: 4001,
                msg: 'need username, email and password'
            }
        }
        if (password.length < 6) {
            return ctx.body = {
                r: 4002,
                msg: 'Password must be longer than 6 characters'
            }
        }
        const psHash = await hash(username + email + password + config.psSalt)
        try {
            const userRes = await UserService.register({
                username, email, password: psHash
            })
            const token = sign({id: userRes.id})
            ctx.body = {username, id: userRes.id, email, token}
        } catch (e) {
            if (e.code === 'P2002') {
                let r = 4003;
                let msg = '';
                switch (e.meta.target) {
                    case 'User_email_key':
                        r = 4004
                        msg = '???email???????????????'
                        break;
                    case 'User_username_key':
                        r = 4005
                        msg = '???????????????????????????'
                        break;
                }
                return ctx.body = {r, msg}
            } else {
                console.error(e)
                logger.error("db", e)
                return ctx.body = {r: 4004, msg: e?.meta?.target || 'unknown error!'}
            }
        }
    }

    static async getMyProfile(ctx: Context) {
        console.log(ctx.state)
        const id = ctx.state.user.id
        if (!id) {
            ctx.status = 220
            return ctx.body = 'require id'
        }
        try {
            const profile = await UserService.getUserInfo(id)
            ctx.status = 200
            ctx.body = profile
        } catch (e) {
            ctx.status = 221
            ctx.body = e.message
        }
    }

    static async getUserInfo(ctx: Context) {
        const {id} = ctx.request.body || {}
        if (!id) {
            ctx.status = 220
            return ctx.body = 'require id'
        }

        const userInfo = await UserService.getUserInfo(id)
        ctx.status = 200
        ctx.body = userInfo
    }

    static async getUsers(ctx: Context) {
        const list = await UserService.getUsers()
        ctx.status = 200
        ctx.body = list
    }

    static async checkUsername(ctx: Context) {
        const username = ctx.params.username
        if (!username) {
            ctx.status = 220
            ctx.body = "require username"
        }
        const res = await UserService.checkUsername(username)
        ctx.status = 200
        if (res) {
            ctx.body = {exist: true}
        } else {
            ctx.body = {exist: false}
        }
    }

    static async checkUseremail(ctx: Context) {
        const email = ctx.params.email
        if (!email) {
            ctx.status = 220
            ctx.body = "require email"
        }
        const res = await UserService.checkUseremail(email)
        ctx.status = 200
        if (res) {
            ctx.body = {exist: true}
        } else {
            ctx.body = {exist: false}
        }
    }

    static async updateUserInfo(ctx: Context) {
        const {username, email, bio, profileId} = ctx.request.body
        const userId = ctx.state.user.id

        if (!Utils.checkUser(username)) {
            ctx.status = 220
            return ctx.body = '??????????????????????????????'
        }
        if (!Utils.checkEmail(email)) {
            ctx.status = 221
            return ctx.body = '??????????????????Email???'
        }
        if (bio.length > 180) {
            ctx.status = 223
            return ctx.body = '???????????????????????????'
        }

        const [usernameRes, emailRes] = await Promise.all([
            UserService.checkUsername(username),
            UserService.checkUseremail(email)
        ])
        if (usernameRes && usernameRes.id !== userId) {
            ctx.status = 224
            return ctx.body = '?????????????????????'
        }
        if (emailRes && emailRes.id !== userId) {
            ctx.status = 225
            return ctx.body = 'Email????????????'
        }

        try {
            const userRes = await UserService.updateUserInfo({username, email, bio, userId, profileId})
            ctx.status = 200
            ctx.body = userRes
        } catch (e) {
            logger.info('db error', e)
            console.error(Object.getOwnPropertyNames(e))
            console.log(e.meta)
            console.log(e.message)
            ctx.status = 226
            ctx.body = e.meta.target ?? "db error!"
        }

    }
}

export default UserController
