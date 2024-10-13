const router = require("express").Router();
const ctrls = require('../controllers/user')
const {verifyAccessToken, isAdmin} = require('../middlewares/verify_token')
const uploader = require('../config/cloudinary.config')

router.post('/register', ctrls.register)
router.post('/mock', ctrls.createUsers)
router.put('/final_register/:token', ctrls.finalRegister)
router.post('/login', ctrls.login)
router.get('/current', verifyAccessToken, ctrls.getOneUser)
router.post('/refreshtoken', ctrls.refreshAccessToken)
router.get('/logout', ctrls.logout)
router.post('/forgotpassword', ctrls.forgotPassword)
router.put('/reset_password', ctrls.resetPassword)

router.get('/',[verifyAccessToken, isAdmin], ctrls.getAllCustomers)
router.put('/current', [verifyAccessToken],uploader.single('avatar'), ctrls.updateUser)
router.put('/address/', [verifyAccessToken], ctrls.updateUserAddress)
router.put('/cart_service/', [verifyAccessToken], ctrls.updateCartService)
router.put('/cart_product/', [verifyAccessToken], ctrls.updateCartProduct)
router.delete('/remove_cart_product/:pid/:color', [verifyAccessToken], ctrls.removeProductFromCart)
router.delete('/:userId', [verifyAccessToken, isAdmin], ctrls.deleteUser)
router.put('/wishlist/:sid', [verifyAccessToken], ctrls.updateWishlist)
router.put('/:userId', [verifyAccessToken, isAdmin], ctrls.updateUserByAdmin)

router.get('/getAllContact/:userId', ctrls.getAllContact)
router.post('/add_contact', ctrls.addContact)

module.exports = router

//CREATE : POST       (body) -- khong bi lo
//UPDATE : PUT        (body)

//DELETE : DELETE     (query)
//READ : GET          (query)-- bi lo