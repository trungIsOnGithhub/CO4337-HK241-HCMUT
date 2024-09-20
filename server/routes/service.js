const router = require("express").Router();
const ctrls = require('../controllers/service')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')
const uploader = require('../config/cloudinary.config')
router.put('/variant/:sid', [verifyAccessToken, isAdmin],uploader.fields([
    {
        name: 'images',
        maxCount: 10
    },
    {
        name: 'thumb',
        maxCount: 1
    }]), ctrls.addVariantService)


router.post('/', [verifyAccessToken, isAdmin],uploader.fields([
    {
        name: 'images',
        maxCount: 10
    },
    {
        name: 'thumb',
        maxCount: 1
    }]), ctrls.createService)

router.get('/', [verifyAccessToken, isAdmin], ctrls.getAllServicesByAdmin)
router.delete('/:sid', [verifyAccessToken, isAdmin], ctrls.deleteServiceByAdmin)
router.put('/rating_service', [verifyAccessToken], ctrls.ratingService)
router.put('/:sid', [verifyAccessToken, isAdmin],uploader.fields([
    {
        name: 'images',
        maxCount: 10
    },
    {
        name: 'thumb',
        maxCount: 1
    }]), ctrls.updateServiceByAdmin)
router.get('/public', ctrls.getAllServicesPublic)
router.get('/public/:provider_id', ctrls.getAllServicesByProviderId)
router.get('/:sid', ctrls.getOneService)
router.post('/most_purchased', ctrls.getMostPurchasedService);
module.exports = router




//CREATE : POST       (body) -- khong bi lo
//UPDATE : PUT        (body)

//DELETE : DELETE     (query)
//READ : GET          (query)-- bi lo