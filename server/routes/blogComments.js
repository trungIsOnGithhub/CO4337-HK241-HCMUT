const router = require("express").Router();
const ctrls = require('../controllers/blogComment')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.get('/get_comments', ctrls.getAllCommentsForBlog)
router.post('/add_comments', ctrls.createBlogComment)
router.post('/add_reply_comments', ctrls.createReplyComment)
router.get('/get_reply_comments', ctrls.getAllReplyComments)
router.post('/react_comment', [verifyAccessToken], ctrls.reactComment)

module.exports = router;