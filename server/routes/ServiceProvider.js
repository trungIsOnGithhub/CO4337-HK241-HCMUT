const router = require("express").Router();
const ctrls = require('../controllers/ServiceProvider')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.post('/', ctrls.createBrand)
router.get('/', ctrls.getAllBrand)

module.exports = router