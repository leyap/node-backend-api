import db from "./index";

class AdminService {
    static createUser() {
        db.user.create({
            data: {
                id:'',
                username: '',
                phone: '',
                email: '',
                password: ''
            }
        })
    }
}
