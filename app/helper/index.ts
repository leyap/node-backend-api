import httpClient from "../../utils/request";
import config from "../config";

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
}

export default Helper
