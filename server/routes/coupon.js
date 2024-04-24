const router = require('express').Router()
const ctrls = require('../controllers/coupon')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.post('/', [verifyAccessToken, isAdmin], ctrls.createNewCoupon)
router.get('/',  ctrls.getAllCoupon)
router.put('/:cid',[verifyAccessToken, isAdmin],  ctrls.updateCoupon)
router.delete('/:cid',[verifyAccessToken, isAdmin],  ctrls.deleteCoupon)
module.exports = router