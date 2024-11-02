const router = require('express').Router()
const ctrls = require('../controllers/revenue')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.post('/daily',[verifyAccessToken, isAdmin], ctrls.getRevenueByDateRange);
// router.post('/stat',[verifyAccessToken, isAdmin], ctrls.getRevenueStatistic)
router.post('/recent', ctrls.getRevenue3RecentStatistic);

router.post('/recent_new_customer', ctrls.getNewCustomer3RecentStatistic);
router.post('/recent_occupancy', ctrls.getOccupancy3RecentStatistic);
router.post('/chart_info', ctrls.getThisMonthRevenueAndOrderStatistic);
router.post('/customer_by_month', ctrls.getCustomerDataByMonth);
router.post('/occupancy_by_month', ctrls.getOccupancyByDayCurrentMonth);
router.post('/performance_by_service', ctrls.getOccupancyByServices);
router.post('/performance_by_staff', ctrls.getOccupancyByStaffs);

module.exports = router;