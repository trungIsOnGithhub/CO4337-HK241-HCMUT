const router = require("express").Router();
const ctrls = require('../controllers/ServiceProvider.js')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.post('/', ctrls.createServiceProvider)
router.get('/', ctrls.getAllServiceProvider)

module.exports = router