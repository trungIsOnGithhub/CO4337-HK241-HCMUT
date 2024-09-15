const userRouter = require('./user')
const productRouter = require('./product')
const productCategoryRouter = require('./productCategory')
const blogCategoryRouter = require('./blogCategory')
const blogRouter = require('./blog')
const brandRouter = require('./brand')
const couponRouter = require('./coupon')
const orderRouter = require('./order')
const orderProductRouter = require('./orderProduct')
const insertRouter = require('./insert')
const staffRouter = require('./staff')

const serviceRouter = require('./service')
const serviceCategoryRouter = require('./serviceCategory')
const ServiceProviderRouter = require('./ServiceProvider');

const revenueRouter = require('./revenue')
const interactionRouter = require('./interaction')

const messageRouter = require('./message')

const {notFound,errorHandler} = require('../middlewares/errorHandler')
const ServiceProvider = require('../models/ServiceProvider')

const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    app.use('/api/product', productRouter)
    app.use('/api/product_category', productCategoryRouter)
    app.use('/api/blog_category', blogCategoryRouter)
    app.use('/api/blog', blogRouter)
    app.use('/api/brand', brandRouter)
    app.use('/api/coupon', couponRouter)
    app.use('/api/order', orderRouter)
    app.use('/api/order_product', orderProductRouter)
    app.use('/api/insert', insertRouter)
    app.use('/api/staff', staffRouter)

    app.use('/api/service', serviceRouter)
    app.use('/api/service_category', serviceCategoryRouter)
    app.use('/api/service_provider', ServiceProviderRouter)
    app.use('/api/revenue', revenueRouter)
    app.use('/api/interaction', interactionRouter)

    app.use('/api/message', messageRouter)

    app.use(notFound)
    app.use(errorHandler)
}

module.exports = initRoutes

//CREATE : POST       (body) -- khong bi lo
//READ : GET          (query)-- bi lo
//UPDATE : PUT        (body)
//DELETE : DELETE     (query)