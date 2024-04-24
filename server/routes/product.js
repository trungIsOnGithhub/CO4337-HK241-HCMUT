const router = require("express").Router();
const ctrls = require('../controllers/product')
const uploader = require('../config/cloudinary.config')


const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')

router.post('/', [verifyAccessToken, isAdmin],uploader.fields([
    {
        name: 'images',
        maxCount: 10
    },
    {
        name: 'thumb',
        maxCount: 1
    }]), ctrls.createProduct)

    
router.get('/', ctrls.getAllProduct)
router.put('/ratings', [verifyAccessToken], ctrls.ratings)


router.put('/upload_image/:pid', [verifyAccessToken, isAdmin],uploader.fields('images', 10), ctrls.uploadImage)
router.get('/:pid', ctrls.getProduct)
router.put('/variant/:pid', [verifyAccessToken, isAdmin],uploader.fields([
    {
        name: 'images',
        maxCount: 10
    },
    {
        name: 'thumb',
        maxCount: 1
    }]), ctrls.addVariant)

router.put('/:pid', [verifyAccessToken, isAdmin],uploader.fields([
    {
        name: 'images',
        maxCount: 10
    },
    {
        name: 'thumb',
        maxCount: 1
    }]), ctrls.updateProduct)

router.delete('/:pid', [verifyAccessToken, isAdmin], ctrls.deleteProduct)

module.exports = router
