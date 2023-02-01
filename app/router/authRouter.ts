import KoaRouter from '@koa/router'
import indexController from "../controller/indexController";
import UserController from "../controller/UserController";
import UploadController from "../controller/UploadController";
import SmsController from "../controller/SmsController";

const router = new KoaRouter({prefix: '/api'})

// router.get("/", ctx => {
//     ctx.body = "hello world"
// })

router.get('/users/myprofile', UserController.getMyProfile)
router.get('/users/getusers', UserController.getUsers)
router.post('/upload', UploadController.upload)
router.get('/sms/phones', SmsController.getPhones)
router.get('/smsinput', SmsController.create)
router.get('/sms/:phone/content', SmsController.getContentsByPhone)

export default router
