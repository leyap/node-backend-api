import {Context} from "koa";
import logger from "../logger";

class UploadController {
    static async upload(ctx: Context) {
        const files = ctx.request.files
        ctx.body = files
    }
}

export default UploadController
