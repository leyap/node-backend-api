const {SERVER_PORT, JWT_SECRET, JWT_EXPIRE, PS_SALT, UPLOAD_DIR, NODE_ENV} = process.env

const config = {
    server: {
        port: SERVER_PORT
    },
    dev: NODE_ENV === 'dev' || NODE_ENV === 'development',
    jwt: {
        secret: JWT_SECRET as string,
        expire: JWT_EXPIRE as string
    },
    sms: {
        user: 'lisper' as string,
        key: '2c6faf313bc7405f8e025a743796e36f' as string
    },
    psSalt: PS_SALT as string,
    uploadDir: UPLOAD_DIR as string
}

export default config
