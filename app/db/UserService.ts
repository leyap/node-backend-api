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
                        id: true,
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
        const userId = uuidv4().replace(/-/g, '')

        return db.user.create({
            data: {
                id: userId,
                username,
                phone, email, password,
                Profile: {
                    create: {
                        bio: ''
                    }
                }
            }
        })

        // return db.$transaction([
        //     db.user.create({
        //         data: {
        //             id: userId,
        //             username,
        //             phone,
        //             email,
        //             password
        //         }
        //     }),
        //     db.profile.create({
        //         data: {
        //             bio: '',
        //             userId
        //         }
        //     }),
        // ]);

    }

    //更新密码hash
    static updatePassword(params: any) {
        const {password, id} = params
        return db.user.update({
            where: {id},
            data: {
                password
            }
        })
    }

    //忽略大小写
    static checkUsername(username: string) {
        return db.user.findUnique({
            where: {
                username
            },
            select: {
                id: true
            }
        })
    }

    //忽略大小写
    static checkUseremail(email: string) {
        return db.user.findUnique({
            where: {email},
            select: {
                id: true
            }
        })
    }

    static updateUserInfo(params: any) {
        const {userId, username, email, bio} = params
        return db.user.update({
            where: {id: userId},
            data: {
                username,
                email,
                Profile: {
                    update: {
                        bio
                    }
                }
            },
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                createdAt: true,
                Profile: {
                    select: {
                        id: true,
                        avatar: true,
                        bio: true
                    }
                }
            }
        })

        // return db.$transaction([
        // db.user.update({
        //         where: {id: userId},
        //         data: {
        //             username,
        //             email,
        //         },
        //     }
        // ),
        // db.profile.update({
        //     where: {userId},
        //     data: {
        //         bio,
        //     }
        // })])
    }
}

export default UserService
