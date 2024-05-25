const router = require('express').Router()
const ctrls = require('../controllers/orderProduct')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.post('/',[verifyAccessToken], ctrls.createNewOrder)
router.get('/',[verifyAccessToken, isAdmin], ctrls.getOrdersProductByAdmin)

module.exports = router