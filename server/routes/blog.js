const router = require('express').Router()
const ctrls = require('../controllers/blog')
const uploader = require('../config/cloudinary.config')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.post('/', [verifyAccessToken, isAdmin], ctrls.createNewBlog)
router.get('/', ctrls.getAllBlogs)
router.get('/one/:bid', ctrls.getBlog)
router.delete('/delete/:bid',[verifyAccessToken, isAdmin], ctrls.deleteBlog)
router.put('/update/:bid', [verifyAccessToken, isAdmin], ctrls.updateBlog)
router.put('/like/:bid', [verifyAccessToken], ctrls.likeBlog)
router.put('/dislike/:bid', [verifyAccessToken], ctrls.dislikeBlog)
router.put('/upload_image/:bid', [verifyAccessToken, isAdmin],uploader.single('image'), ctrls.uploadImage)
module.exports = router