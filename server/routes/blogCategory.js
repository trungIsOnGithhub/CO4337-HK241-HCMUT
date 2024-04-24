const router = require("express").Router();
const ctrls = require('../controllers/blogCategory')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.post('/',[verifyAccessToken, isAdmin], ctrls.createCategory)
router.get('/', ctrls.getAllCategory)
router.delete('/:bcid',[verifyAccessToken, isAdmin], ctrls.deteteCategory)
router.put('/:bcid',[verifyAccessToken, isAdmin], ctrls.updateCategory)

module.exports = router
