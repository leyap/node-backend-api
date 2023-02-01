import KoaRouter from '@koa/router'
import indexController from "../controller/indexController";
import UserController from "../controller/UserController";
import SmsController from "../controller/SmsController";

const router = new KoaRouter({prefix: '/api'})

// router.get("/", ctx => {
//     ctx.body = "hello world"
// })

router.get('/test', indexController.test)
router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/users/getcaptcha', UserController.getCaptcha)
router.post('/users/verifycaptcha', UserController.verifyCaptcha)
router.post('/users/getcode', UserController.getPhoneCode)
router.post('/users/loginor', UserController.loginOr)

export default router
