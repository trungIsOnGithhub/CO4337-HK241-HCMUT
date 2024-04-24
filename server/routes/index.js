const userRouter = require('./user')
const productRouter = require('./product')
const productCategoryRouter = require('./productCategory')
const blogCategoryRouter = require('./blogCategory')
const blogRouter = require('./blog')
const brandRouter = require('./brand')
const couponRouter = require('./coupon')
const orderRouter = require('./order')
const insertRouter = require('./insert')

const {notFound,errorHandler} = require('../middlewares/errorHandler')

const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    app.use('/api/product', productRouter)
    app.use('/api/product_category', productCategoryRouter)
    app.use('/api/blog_category', blogCategoryRouter)
    app.use('/api/blog', blogRouter)
    app.use('/api/brand', brandRouter)
    app.use('/api/coupon', couponRouter)
    app.use('/api/order', orderRouter)
    app.use('/api/insert', insertRouter)
    
    app.use(notFound)
    app.use(errorHandler)
}

module.exports = initRoutes

//CREATE : POST       (body) -- khong bi lo
//READ : GET          (query)-- bi lo
//UPDATE : PUT        (body)
//DELETE : DELETE     (query)