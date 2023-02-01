import {Context} from "koa"
import logger from "../logger"
import {hash, hashVerify, sign} from "../../utils/auth"
import config from "../config"
import SMSService from "../db/SMSService"
import redis from '../redis'

class SmsController {

    static async create(ctx: Context) {
        const {m: phone, c: content} = ctx.query
        if (!phone || !content) {
            return ctx.body = -1
        }
        const r = await SMSService.create({phone, content})
        ctx.body = 0
    }

    static async getPhones(ctx: Context) {
        const list = await SMSService.getPhones()
        ctx.body = {
            r: 0,
            data: list
        }
    }

    static async getContentsByPhone(ctx: Context) {
        const phone = ctx.params.phone
        const contents = await SMSService.getContentsByPhone(phone)
        ctx.body = {
            r: 0,
            data: contents
        }
    }
}

export default SmsController
