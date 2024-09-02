const router = require('express').Router()
const ctrls = require('../controllers/coupon')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.post('/', [verifyAccessToken, isAdmin], ctrls.createNewCoupon)
router.get('/getCouponsByServiceId/:serviceId', ctrls.getCouponsByServiceId)
router.get('/getCouponsByProviderId/:providerId', ctrls.getCouponsByProviderId)
router.post('/validate', verifyAccessToken, ctrls.validateAndUseCoupon)
router.post('/update-usage', verifyAccessToken, ctrls.updateCouponUsage)

module.exports = router