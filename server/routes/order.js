const router = require('express').Router()
const ctrls = require('../controllers/order')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.post('/',[verifyAccessToken], ctrls.createNewOrder)
router.put('/status/:oid',[verifyAccessToken, isAdmin], ctrls.updateStatus)
router.get('/admin',[verifyAccessToken, isAdmin], ctrls.getOrdersByAdmin)
router.get('/',[verifyAccessToken], ctrls.getUserOrder)
module.exports = router