import httpClient from "../../utils/request";
import config from "../config";
import {Context} from "koa";
import {isArray} from "util";

class Helper {
    static sendPhoneCode(phone, code) {
        return httpClient.get('https://api.smsbao.com/sms', {
            params: {
                u: config.sms.user,
                p: config.sms.key,
                m: phone,
                c: `【自由潜水之家】您的验证码是${code}。如非本人操作，请忽略本短信`
            }
        })
    }

    static getClientIp(ctx: Context) {
        let ip = ctx.header['X-Forwarded-For']
        if (Array.isArray(ip)) {
            return ip[0]
        } else {
            return ip || ctx.ip
        }
    }
}

export default Helper
