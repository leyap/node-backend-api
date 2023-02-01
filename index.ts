import run from './app'
import config from './app/config'

console.log('NODE PATH:',process.execPath);
console.log('JS PATH:',__dirname)
console.log('NODE_ENV:',process.env.NODE_ENV);
console.log('dev:',config.dev);
console.log('NODE_APP_INSTANCE:', process.env.NODE_APP_INSTANCE)

run(config.server.port)
