const router = require("express").Router();
const ctrls = require('../controllers/productCategory')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.post('/',[verifyAccessToken, isAdmin], ctrls.createCategory)
router.get('/', ctrls.getAllCategory)
router.delete('/:pcid',[verifyAccessToken, isAdmin], ctrls.deteteCategory)
router.put('/:pcid',[verifyAccessToken, isAdmin], ctrls.updateCategory)

module.exports = router
