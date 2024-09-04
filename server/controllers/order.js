const mongoose = require('mongoose');

const Order = require('../models/order')
const User = require('../models/user')
const Coupon = require('../models/coupon')
const asyncHandler = require('express-async-handler')
const Staff = require('../models/staff')

const createNewOrder = asyncHandler(async(req, res)=>{
    const {_id} = req.user
    const {info, total} = req.body
    if(!info || !total){
        throw new Error("Missing input");
    }
    else{
        await User.findByIdAndUpdate(_id, {$set: {cart: []}}, {new: true});
        let response;
        await Staff.findByIdAndUpdate(info[0]?.staff, {$push: {work: {service : info[0]?.service, provider: info[0]?.provider, time: info[0]?.time, date: info[0]?.date, duration: info[0]?.duration}}}, {new: true});
        try {
            response = await Order.create({info, total, orderBy: _id, status: 'Successful'})
        } catch (error) {
            // Xử lý lỗi nếu có
            return res.status(500).json({ success: false, mes: "Something went wrong" });
        }
        return res.status(200).json({
            success: response ? true : false,
            rs: response ? response : "Something went wrong",
        })
    }
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
    const {_id} = req.user
    const {provider_id} = await User.findById({_id}).select('provider_id')
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
    const qr = {...formatedQueries, 'info.provider': provider_id};
    let queryCommand =  Order.find(qr).populate({
        path: 'orderBy',
        select: 'firstName lastName avatar email mobile',
    }).populate({
        path: 'info',
        populate:{
            path: 'service',
            select: 'name price duration thumb'
        },
    }).populate({
        path: 'info',
        populate:{
            path: 'provider',
            select: 'bussinessName address'
        },
    }).populate({
        path: 'info',
        populate:{
            path: 'staff',
            select: 'firstName lastName'
        },
    })
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

const getOneOrderByAdmin = asyncHandler(async(req, res)=>{
    const {bookingid} = req.params

    const booking = await Order.findById(bookingid).populate({
        path: 'orderBy',
        select: 'firstName lastName avatar email mobile',
    }).populate({
        path: 'info',
        populate:{
            path: 'service',
            select: 'name price duration thumb'
        },
    }).populate({
        path: 'info',
        populate:{
            path: 'provider',
            select: 'bussinessName address'
        },
    }).populate({
        path: 'info',
        populate:{
            path: 'staff',
            select: 'firstName lastName avatar mobile email'
        },
    })

    
    return res.status(200).json({
        success: booking ? true : false,
        booking: booking ? booking : "Cannot find Booking"
    })
})

const getOrdersForStaffCalendar = asyncHandler(async(req, res) => {
    const { provider_id, assigned_staff_ids, service_ids } = req.body;


    if (!provider_id || typeof(service_ids.length) !== 'number' || typeof(assigned_staff_ids.length) !== 'number') {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    // const service_obj_ids = service_ids.map(objIdStr => new mongoose.Types.ObjectId(objIdStr))

    const providerObjectId = new mongoose.Types.ObjectId(provider_id)

    let orders = await Order.aggregate([
        {
            $match: {
                'info.provider': provider_id
            }
        },
        {
            $lookup: {
                from: 'services',
                localField: 'info.service',
                foreignField: '_id',
                as: 'service'
            }
        },
        {
            $unwind: "$service"
        },
        // {
        //     $match
        // }
        // {
        //     $match: {
        //         "$$this.service._id": { $in: service_obj_ids }
        //     }
        // },
        // {
        //     $lookup: {
        //         from: 'staffs',
        //         localField: 'info.staff',
        //         foreignField: '_id',
        //         as: 'staffs'
        //     }
        // }
    ])

    if (!orders || typeof(orders.length) !== 'number') {
        return res.status(500).json({
            success: false,
            error: 'Cannot Get Order'
        });
    }

    // temp
    // orders = orders.filter(order => {
    //     return service_ids.includes(order.service._id.toString())
    // })
    // orders = orders.filter(order => {
    //     const thisOrderStaffs = order?.staffs || [];
    //     for (const staff of thisOrderStaffs) {
    //         if (assigned_staff_ids.includes(staff._id.toString()))
    //             return true;
    //     }
    //     return false;
    // })

    res.status(200).json({
        success: true,
        order: orders,
    })
})

module.exports = {
    createNewOrder,
    updateStatus,
    getUserOrder,
    getOrdersByAdmin,
    getOrdersForStaffCalendar,
    getOneOrderByAdmin
}