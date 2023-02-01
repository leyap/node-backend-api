import {Context} from "koa"
import logger from "../logger"
import {hash, hashVerify, sign} from "../../utils/auth"
import LoginService from "../db/UserService"
import config from "../config"
import UserService from "../db/UserService"
import redis from '../redis'
import httpClient from "../../utils/request";
import Helper from "../helper";
import {getCaptchaImageGif} from "../../utils/captcha";
import {randomUUID} from "crypto";

class UserController {

    static async buildCpatcha() {
        const {capCode, data} = getCaptchaImageGif()
        const capid = randomUUID()
        await redis.set('captcha.' + capid, capCode, {'EX': 60 * 10})
        return {capid, img: Buffer.from(data).toString('base64').slice(0, -1)}
    }

    static async getCaptcha(ctx: Context) {
        const {capid, img} = await UserController.buildCpatcha()
        return ctx.body = {
            r: 0,
            data: {
                capid,
                img
            }
        }
    }

    static async verifyCaptcha(ctx: Context) {
        const {capid, captcha, phone} = ctx.request.body
        if (capid && (!captcha || !phone)) {
            return ctx.body = {
                r: 2,
                msg: 'require captcha,phone'
            }

        }
        const realCode = await redis.get('captcha.' + capid)
        if (realCode === captcha) {
            if (!phone) {
                return ctx.body = {
                    r: 3,
                    msg: 'require phone'
                }
            }
            await redis.set('captcha.' + capid, phone, {'EX': 60 * 3, XX: true})
            ctx.body = {
                r: 0
            }
        } else {
            if (capid && !realCode) {
                await redis.del('captcha.' + capid)
            }
            const {capid: newCapid, img} = await UserController.buildCpatcha()
            ctx.body = {
                r: 1,
                data: {
                    capid: newCapid,
                    img
                }
            }
        }
    }

    static async getPhoneCode(ctx: Context) {
        const {phone} = ctx.request.body || {}
        if (!phone) {
            return ctx.body = {
                r: 2,
                msg: '请输入合法的手机号！'
            }
        }
        const codeLimitKey = 'codeLimit.' + (new Date()).toLocaleDateString() + '.' + phone
        const codeSendCount = Number(await redis.get(codeLimitKey))

        if (codeSendCount > 3) {
            return ctx.body = {
                r: 3,
                msg: '发送太频繁！请次日再发！'
            }
        }

        let code = Math.random().toString().slice(3, 7)
        if (config.dev) {
            code = '1234'
        }

        let r: any = {}
        if (config.dev) {
            r = 0
        } else {
            r = await Helper.sendPhoneCode(phone, code)
        }

        // const r = 0
        // await redis.set('code.' + phone, code, {'EX': 60 * 3}, 'limit.'+(new Date()).getDate()+'.'+phone, "1"")
        // await redis.multi().set('code.' + phone, code, {'EX': 60 * 3})
        //     .incr('codeLimit.'+(new Date()).toLocaleDateString()+ '.'+phone,1,{'EX': '24h'} )
        //     .exec()
        await redis.set('code.' + phone, code, {'EX': 60 * 3})
        if (await redis.get(codeLimitKey)) {
            await redis.incr(codeLimitKey)
        } else {
            await redis.set(codeLimitKey, 1, {'EX': 60 * 60 * 24})
        }

        if (r === 0) {
            ctx.body = {
                r: 0,
                msg: '发送成功！请注意查收！'
            }
        } else {
            ctx.body = {
                r: 1,
                msg: '发送失败！请稍后重试！'
            }
        }
    }

    static async loginOr(ctx: Context) {
        const {phone, code, capid} = ctx.request.body || {}
        if (!phone || !code || !capid) {
            return ctx.body = {
                r: 2,
                msg: 'require: phone,code,capid'
            }
        }
        const realCode = await redis.get('code.' + phone)
        const markPhone = await redis.get('captcha.' + capid)
        if (code === realCode && phone === markPhone) {
            await redis.del('code.' + phone)
            await redis.del('captcha.' + capid)
            const user = await UserService.getUserByPhone(phone)
            if (user) { // 用户已存在
                const {username, email, id} = user
                const token = sign({id})
                return ctx.body = {r: 0, data: {username, id, email, token}}
            } else {    //用户不存在，先添加
                const user = await UserService.register({phone})
                const token = sign({id: user.id})
                return ctx.body = {r: 0, data: {id: user.id, token}}
            }
        } else {
            ctx.body = {r: 1, msg: "验证码错误！"}
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
        const user = await LoginService.getUserByName(username)
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
            const r = await LoginService.register({
                username, email, password: psHash
            })
            const token = sign({id: r.id})
            ctx.body = {username, id: r.id, email, token}
        } catch (e) {
            if (e.code === 'P2002') {
                let r = 4003;
                let msg = '';
                switch (e.meta.target) {
                    case 'User_email_key':
                        r = 4004
                        msg = '该email已被使用！'
                        break;
                    case 'User_username_key':
                        r = 4005
                        msg = '该用户名已被使用！'
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
        const id = ctx.state.user.id
        if (!id) {
            return ctx.body = {r: 1, msg: 'require id'}
        }
        try {
            const profile = await UserService.getUserInfo(id)
            ctx.body = {
                r: 0,
                data: profile
            }
        } catch (e) {
            ctx.body = {
                r: 1,
                msg: e.message
            }
        }
    }

    static async getUserInfo(ctx: Context) {
        const {id} = ctx.request.body || {}
        if (!id) {
            return ctx.body = {r: 1, msg: 'require id'}
        }

        const userInfo = await UserService.getUserInfo(id)
        ctx.body = {
            r: 0,
            data: userInfo
        }
    }

    static async getUsers(ctx: Context) {
        const list = await UserService.getUsers()
        ctx.body = {
            r: 0,
            data: list
        }
    }
}

export default UserController
