const router = require('express').Router()
const ctrls = require('../controllers/booking')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.get('/',[verifyAccessToken], ctrls.getUserBookingsById);
router.post('/options', ctrls.getTimeOptionsAvailableForDate);
router.post('/options_by_range', ctrls.getTimeOptionsAvailableByDateRange);

module.exports = router