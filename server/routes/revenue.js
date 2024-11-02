const router = require('express').Router()
const ctrls = require('../controllers/revenue')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.post('/daily',[verifyAccessToken, isAdmin], ctrls.getRevenueByDateRange)
// router.post('/stat',[verifyAccessToken, isAdmin], ctrls.getRevenueStatistic)
router.post('/recent', ctrls.getRevenue3RecentStatistic)
router.post('/recent_new_customer', ctrls.getNewCustomer3RecentStatistic)
router.post('/recent_occupancy', ctrls.getOccupancy3RecentStatistic)
module.exports = router