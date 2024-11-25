router = require('express').Router()
const ctrls = require('../controllers/blog')
const uploader = require('../config/cloudinary.config')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

// router.post('/', [verifyAccessToken, isAdmin], ctrls.createNewBlog)
router.get('/tags', ctrls.getAllBlogTags)
router.get('/blogofprovider/:provider_id', ctrls.getAllBlogByProviderId)
router.get('/getAllBlogByAdmin', [verifyAccessToken, isAdmin], ctrls.getAllBlogsByAdmin)
router.post('/', ctrls.getAllBlogs)
router.get('/', ctrls.getBlogsBySearchTerm)
router.post('/create', [verifyAccessToken, isAdmin], uploader.fields([
    {
        name: 'thumb',
        maxCount: 1
    },
]), ctrls.createNewBlogPost)
router.post('/create_tag', ctrls.createNewPostTag)
router.get('/:bid', ctrls.getBlog)
router.delete('/:bid',[verifyAccessToken, isAdmin], ctrls.deleteBlog)
router.put('/update_hidden_status/:blogId', [verifyAccessToken, isAdmin], ctrls.updateHiddenStatus)
router.put('/:bid', [verifyAccessToken, isAdmin],uploader.fields([
    {
        name: 'thumb',
        maxCount: 1
    }]), ctrls.updateBlog)
router.post('/like', [verifyAccessToken], ctrls.likeBlog)
router.post('/dislike', [verifyAccessToken], ctrls.dislikeBlog)
router.put('/upload_image/:bid', [verifyAccessToken, isAdmin], uploader.single('image'), ctrls.uploadImage)
router.post('/top_blogs', ctrls.getTopBlogs)
router.post('/top_tags', ctrls.getTopTags)
// router.post('/add_comment', ctrls.addBlogComments)
module.exports = router