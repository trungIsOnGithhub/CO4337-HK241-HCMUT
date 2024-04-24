const router = require("express").Router();
const ctrls = require('../controllers/brand')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.post('/',[verifyAccessToken, isAdmin], ctrls.createBrand)
router.get('/', ctrls.getAllBrand)
router.delete('/:bid',[verifyAccessToken, isAdmin], ctrls.deteteBrand)
router.put('/:bid',[verifyAccessToken, isAdmin], ctrls.updateBrand)

module.exports = router
