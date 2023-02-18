import {configure, getLogger} from 'log4js'

configure({
    appenders: {
        cheese: {type: 'file', filename: "logs/cheese.log"},
        access: {type: 'file', filename: "logs/access.log"}
    },
    categories: {
        default: {appenders: ["cheese"], level: "info"},
        access: {appenders: ["access"], level: "info"}
    },
    pm2: true,
    pm2InstanceVar: "isMaster", // 与pm2的instance_var对应
})

export const accessLogger = getLogger('access')
export default getLogger()
