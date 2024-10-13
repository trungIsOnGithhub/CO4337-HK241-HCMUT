const router = require("express").Router();
const ctrls = require('../controllers/staff')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')
const uploader = require('../config/cloudinary.config')

router.post('/', uploader.single('avatar'), ctrls.addStaff)
router.get('/',[verifyAccessToken, isAdmin], ctrls.getAllStaffsByAdmin)
router.put('/update_work', ctrls.updateStaffWork)
router.put('/:staffId', [verifyAccessToken, isAdmin],uploader.single('avatar'), ctrls.updateStaffByAdmin)
router.delete('/:staffId', [verifyAccessToken, isAdmin], ctrls.deleteStaffByAdmin)
router.get('/:stid', ctrls.getOneStaff)
router.post('/update_shift', ctrls.updateStaffShift)
module.exports = router

//CREATE : POST       (body) -- khong bi lo
//UPDATE : PUT        (body)

//DELETE : DELETE     (query)
//READ : GET          (query)-- bi lo