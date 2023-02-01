import jwt, {JwtPayload} from 'jsonwebtoken'
import config from '../app/config'
import argon2 from 'argon2'

function sign(data: any) {
    return jwt.sign(data, config.jwt.secret, {expiresIn: config.jwt.expire})
}

function verify(token: string) {
    try {
        const decoded = jwt.verify(token, config.jwt.secret, {complete: true}) as JwtPayload
        console.log(decoded)
        return {
            user: decoded,
            error: null
        }
    } catch (err) {
        return {
            user: null,
            error: err
        }

    }
}

function hash(data: string) {
    return argon2.hash(data)
}

function hashVerify(hashCode: string, data: string) {
    return argon2.verify(hashCode, data)
}

export {
    sign,
    verify,
    hash,
    hashVerify
}
