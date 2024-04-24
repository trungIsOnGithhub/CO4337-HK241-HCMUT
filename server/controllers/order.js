const Order = require('../models/order')
const User = require('../models/user')
const Coupon = require('../models/coupon')
const asyncHandler = require('express-async-handler')

const createNewOrder = asyncHandler(async(req, res)=>{
    const {_id} = req.user
    const {products, total, address} = req.body
    console.log(address)
    if(address){
        await User.findByIdAndUpdate(_id, {address, cart:[]})
    }

    const response = await Order.create({products, total, orderBy: _id, status: 'Successful'})
    return res.status(200).json({
        success: response ? true : false,
        rs: response ? response : "Something went wrong",
    })
})

const updateStatus = asyncHandler(async(req, res)=>{
    const {oid} = req.params
    const {status}  = req.body
    if(!status){
        throw new Error("Missing input")
    }
    const response = await Order.findByIdAndUpdate(oid, {status}, {new: true})
    return res.status(200).json({
        success: response ? true : false,
        response: response ? response : "Something went wrong"
    })
})

const getUserOrder = asyncHandler(async(req, res)=>{
    const queries = { ...req.query };
    const {_id} = req.user
    // Loại bỏ các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach((el) => delete queries[el]);

    // Format lại các toán tử cho đúng cú pháp của mongoose
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
    );

    // chuyen tu chuoi json sang object
    const formatedQueries = JSON.parse(queryString);
    //Filtering
    // let queryFinish = {}
    // if(queries?.q){
    //     delete formatedQueries.q
    //     queryFinish = {
    //         $or: [
    //             {color: {$regex: queries.q, $options: 'i' }},
    //             // {title: {$regex: queries.q, $options: 'i' }},
    //             // {category: {$regex: queries.q, $options: 'i' }},
    //             // {brand: {$regex: queries.q, $options: 'i' }},
               
    //         ]
    //     }
    // }
    const qr = {...formatedQueries, orderBy: _id}
    let queryCommand =  Order.find(qr)
    try {
        // sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ')
            queryCommand.sort(sortBy)
        }

        //filtering
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ')
            queryCommand.select(fields)
        }

        //pagination
        //limit: so object lay ve 1 lan goi API
        //skip: n, nghia la bo qua n cai dau tien
        //+2 -> 2
        //+dgfbcxx -> NaN
        const page = +req.query.page || 1
        const limit = +req.query.limit || process.env.LIMIT_PRODUCT
        const skip = (page-1)*limit
        queryCommand.skip(skip).limit(limit)


        const orders = await queryCommand
        const counts = await Order.countDocuments(qr);
        return res.status(200).json({
            success: true,
            counts: counts,
            order: orders,
            });
        
    } catch (error) {
        // Xử lý lỗi nếu có
        return res.status(500).json({
            success: false,
            error: 'Cannot get orders',
        });
    }
})

const getOrdersByAdmin = asyncHandler(async(req, res)=>{
    const queries = { ...req.query };

    // Loại bỏ các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach((el) => delete queries[el]);

    // Format lại các toán tử cho đúng cú pháp của mongoose
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
    );

    // chuyen tu chuoi json sang object
    const formatedQueries = JSON.parse(queryString);
    //Filtering
    // let queryFinish = {}
    // if(queries?.q){
    //     delete formatedQueries.q
    //     queryFinish = {
    //         $or: [
    //             {color: {$regex: queries.q, $options: 'i' }},
    //             // {title: {$regex: queries.q, $options: 'i' }},
    //             // {category: {$regex: queries.q, $options: 'i' }},
    //             // {brand: {$regex: queries.q, $options: 'i' }},
               
    //         ]
    //     }
    // }
    const qr = {...formatedQueries}
    let queryCommand =  Order.find(qr)
    try {
        // sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ')
            queryCommand.sort(sortBy)
        }

        //filtering
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ')
            queryCommand.select(fields)
        }

        //pagination
        //limit: so object lay ve 1 lan goi API
        //skip: n, nghia la bo qua n cai dau tien
        //+2 -> 2
        //+dgfbcxx -> NaN
        const page = +req.query.page || 1
        const limit = +req.query.limit || process.env.LIMIT_PRODUCT
        const skip = (page-1)*limit
        queryCommand.skip(skip).limit(limit)


        const orders = await queryCommand
        const counts = await Order.countDocuments(qr);
        return res.status(200).json({
            success: true,
            counts: counts,
            order: orders,
            });
        
    } catch (error) {
        // Xử lý lỗi nếu có
        return res.status(500).json({
            success: false,
            error: 'Cannot get orders',
        });
    }
})
module.exports = {
    createNewOrder,
    updateStatus,
    getUserOrder,
    getOrdersByAdmin
}