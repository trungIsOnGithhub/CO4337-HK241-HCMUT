const router = require('express').Router()
const ctrls = require('../controllers/order')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.post('/',[verifyAccessToken], ctrls.createNewOrder)
router.put('/status/:oid',ctrls.updateStatus) 
router.put('/update_email',[verifyAccessToken] , ctrls.updateEmailByBookingId)
router.get('/admin',[verifyAccessToken, isAdmin], ctrls.getOrdersByAdmin)
router.get('/admin/:bookingid', ctrls.getOneOrderByAdmin)
router.post('/admin/staff_calendar',[verifyAccessToken, isAdmin], ctrls.getOrdersForStaffCalendar)
router.get('/',[verifyAccessToken], ctrls.getUserOrder)
router.post('/updateStatus', [verifyAccessToken], ctrls.updateStatusOrder)
// Thêm route hoàn tiền
router.post('/refund', [verifyAccessToken], ctrls.refundPayment); // Thêm dòng này
module.exports = router