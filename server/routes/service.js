const router = require("express").Router();
const ctrls = require('../controllers/service')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')
const uploader = require('../config/cloudinary.config')

router.post('/', [verifyAccessToken, isAdmin],uploader.fields([
    {
        name: 'images',
        maxCount: 10
    },
    {
        name: 'thumb',
        maxCount: 1
    }]), ctrls.createService)

router.get('/', [verifyAccessToken, isAdmin], ctrls.getAllServicesByAdmin)

module.exports = router




//CREATE : POST       (body) -- khong bi lo
//UPDATE : PUT        (body)

//DELETE : DELETE     (query)
//READ : GET          (query)-- bi lo