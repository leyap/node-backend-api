import db from "./index";
import {v4 as uuidv4} from 'uuid';

class UserService {
    static getUserByName(username: string) {
        return db.user.findUnique({where: {username}})
    }

    static getUserByPhone(phone: string) {
        return db.user.findUnique({where: {phone}})
    }

    static getUserInfo(id: string) {
        return db.user.findUnique({
            where: {id},
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                createdAt: true,
                Profile: {
                    select: {
                        avatar: true,
                        bio: true
                    }
                }
            }
        })
    }

    static getUsers() {
        return db.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                phone: true,
                _count: {
                    select: {
                        Post: true
                    }
                },
                Profile: {
                    select: {
                        bio: true
                    }
                },
                // Post: {
                //     select: {
                //         id: true,
                //         title: true,
                //     }
                // }
            },
            // include: {
            //     Profile: {
            //         select: {
            //             bio: true
            //         }
            //     }
            // }
        })
    }


    static register(params: any) {
        const {username, email, password, phone} = params
        return db.user.create({
            data: {
                id: uuidv4().replace(/-/g, ''),
                username,
                phone,
                email,
                password
            }
        })
    }
}

export default UserService
