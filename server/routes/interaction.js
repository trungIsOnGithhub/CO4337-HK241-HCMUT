const router = require('express').Router()
const ctrls = require('../controllers/interaction')

router.post('/', ctrls.createNewInteraction)
router.post('/user_visit', ctrls.getMonthlyVisitByDateRange)
module.exports = router