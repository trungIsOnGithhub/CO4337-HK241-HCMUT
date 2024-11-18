const router = require('express').Router()
const ctrls = require('../controllers/orderProduct')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.post('/',[verifyAccessToken], ctrls.createNewOrder)
router.get('/',[verifyAccessToken, isAdmin], ctrls.getOrdersProductByAdmin)
router.get('/user',[verifyAccessToken], ctrls.getUserOrderProduct)
router.get('/getOrderProduct/:userId',[verifyAccessToken, isAdmin], ctrls.getUserOrderProductByUserId)
router.get('/:oid',[verifyAccessToken], ctrls.getOneOrderProductById)
router.post('/updateShippingStatus', [verifyAccessToken, isAdmin], ctrls.updateShippingStatusOrderProduct)
router.post('/updatePaymentStatus', [verifyAccessToken], ctrls.updatePaymentStatusOrderProduct)

module.exports = router