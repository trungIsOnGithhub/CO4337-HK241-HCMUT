const router = require('express').Router()
const ctrls = require('../controllers/coupon')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')
const uploader = require('../config/cloudinary.config')
router.post('/', [verifyAccessToken, isAdmin], uploader.fields([
    {
        name: 'image',
        maxCount: 1
    },
]), ctrls.createNewCoupon)
router.get('/getCouponsByServiceId/:serviceId', ctrls.getCouponsByServiceId)
router.get('/getCouponsByProviderId/:providerId', ctrls.getCouponsByProviderId)
router.get('/getAllCouponsByAdmin', [verifyAccessToken, isAdmin], ctrls.getAllCouponsByAdmin)
router.post('/validate', verifyAccessToken, ctrls.validateAndUseCoupon)
router.post('/update-usage', verifyAccessToken, ctrls.updateCouponUsage)


module.exports = router