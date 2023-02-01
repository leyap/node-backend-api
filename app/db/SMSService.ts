import db from "./index";
import {v4 as uuidv4} from 'uuid';

class SMSService {

    static getPhones() {
        return db.sms.groupBy({
            by: ['phone'],
            _count: {
                phone: true
            }
        })
    }

    static getContentsByPhone(phone: string) {
        return db.sms.findMany({
            where: {
                phone
            },
            select: {
                id: true,
                content: true,
                createdAt: true
            }
        })
    }

    static create(params: any) {
        const {phone, content} = params
        return db.sms.create({
            data: {
                phone,
                content
            }
        })
    }
}

export default SMSService
