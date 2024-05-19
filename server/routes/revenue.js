const router = require('express').Router()
const ctrls = require('../controllers/revenue')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.post('/daily',[verifyAccessToken, isAdmin], ctrls.getRevenueByDateRange)
module.exports = router