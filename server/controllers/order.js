const mongoose = require('mongoose');

const Order = require('../models/order')
const User = require('../models/user')
const Coupon = require('../models/coupon')
const asyncHandler = require('express-async-handler')
const Staff = require('../models/staff')

const createNewOrder = asyncHandler(async(req, res)=>{
    const {_id} = req.user
    const {info, total} = req.body

    console.log('ORDER CREATE: ', req.body);

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
    // const {status} = req.body;
    const {date, time, stfid } = req.body;
    const updateObj = {
        'info.0.date': date
    };
    // if(!status){
    //     throw new Error("Missing input")
    // }
    const response = await Order.findByIdAndUpdate(oid, updateObj, {new: true})
    return res.status(200).json({
        success: response ? true : false,
        order: response ? response : "Something went wrong"
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

const getOrdersByAdmin = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { provider_id } = await User.findById({ _id }).select('provider_id');
    const queries = { ...req.query };

    // Remove special query fields
    const excludeFields = ['limit', 'sort', 'page', 'fields', 'q'];
    excludeFields.forEach((el) => delete queries[el]);

    // Format query operators for MongoDB
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
    );
    const formatedQueries = JSON.parse(queryString);

    let qr = { ...formatedQueries, 'info.provider': provider_id };
    
    const {startDate, endDate} = req.query;
    const aggregationPipeline = [];

    // Trường hợp 1: Có startDate và endDate
    if (startDate && endDate) {
        aggregationPipeline.push({
            $match: {
                'info.dateTime': {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                },
                'info.provider': provider_id
            }
        });

        delete formatedQueries.startDate;
        delete formatedQueries.endDate;
        qr = {
            ...formatedQueries,
            'info.provider': provider_id,
            'info.dateTime': {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };
    }
    else {
        aggregationPipeline.push({ $match: qr });
    }

    // Tiến hành tìm kiếm với các điều kiện đã định nghĩa
    try {
        // Populate service details
        aggregationPipeline.push(
            { $lookup: {
                from: "services",
                localField: "info.service",
                foreignField: "_id",
                as: "serviceDetails"
            }},
            { $unwind: "$serviceDetails" },

            // Populate user (orderBy) details
            { $lookup: {
                from: "users",
                localField: "orderBy",
                foreignField: "_id",
                as: "userDetails"
            }},
            { $unwind: "$userDetails" },

            // Populate staff details
            { $lookup: {
                from: "staffs",
                localField: "info.staff",
                foreignField: "_id",
                as: "staffDetails"
            }},
            { $unwind: "$staffDetails" }
        );

        // Apply search filter if search term is provided
        if (req.query.q) {
            aggregationPipeline.push({
                $match: {
                    $or: [
                        { "serviceDetails.name": { $regex: req.query.q, $options: "i" } },
                        { $expr: { $regexMatch: { input: { $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"] }, regex: req.query.q, options: 'i' } } },
                        { $expr: { $regexMatch: { input: { $concat: ["$userDetails.lastName", " ", "$userDetails.firstName"] }, regex: req.query.q, options: 'i' } } },
                        { $expr: { $regexMatch: { input: { $concat: ["$userDetails.firstName", "", "$userDetails.lastName"] }, regex: req.query.q, options: 'i' } } },
                        { $expr: { $regexMatch: { input: { $concat: ["$userDetails.lastName", "", "$userDetails.firstName"] }, regex: req.query.q, options: 'i' } } },
                        { $expr: { $regexMatch: { input: { $concat: ["$staffDetails.firstName", " ", "$staffDetails.lastName"] }, regex: req.query.q, options: 'i' } } },
                        { $expr: { $regexMatch: { input: { $concat: ["$staffDetails.lastName", " ", "$staffDetails.firstName"] }, regex: req.query.q, options: 'i' } } },
                        { $expr: { $regexMatch: { input: { $concat: ["$staffDetails.firstName", "", "$staffDetails.lastName"] }, regex: req.query.q, options: 'i' } } },
                        { $expr: { $regexMatch: { input: { $concat: ["$staffDetails.lastName", "", "$staffDetails.firstName"] }, regex: req.query.q, options: 'i' } } }
                    ]
                }
            });
        }

        // Sorting
        if (req.query.sort) {
            aggregationPipeline.push({
                $sort: req.query.sort.split(',').reduce((acc, sortBy) => {
                    const [field, order] = sortBy.split(':');
                    acc[field] = order === 'desc' ? -1 : 1;
                    return acc;
                }, {})
            });
        }

        // Project specific fields (field selection)
        if (req.query.fields) {
            aggregationPipeline.push({
                $project: req.query.fields.split(',').reduce((acc, field) => {
                    acc[field.trim()] = 1;
                    return acc;
                }, {})
            });
        }

        // Pagination
        const limit = +req.query.limit || process.env.LIMIT_PRODUCT;
        const page = +req.query.page || 1;
        aggregationPipeline.push(
            { $skip: (page - 1) * limit },
            { $limit: limit }
        );

        const orders = await Order.aggregate(aggregationPipeline);

        const counts = await Order.countDocuments(qr); // Counts for pagination

        return res.status(200).json({
            success: true,
            counts: counts,
            orders: orders,
        });

    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({
            success: false,
            error: 'Cannot get orders',
        });
    }
});


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
    const {_id} = req.user
    const {provider_id} = await User.findById({_id}).select('provider_id')

    const { assigned_staff_ids, service_ids } = req.body;

    if (!provider_id || typeof(service_ids.length) !== 'number' || typeof(assigned_staff_ids.length) !== 'number') {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }


    if(assigned_staff_ids.length === 0 && service_ids.length === 0){
        const orders = await Order.find({
            'info.provider': provider_id
        }).select('info.date info.time info.staff info.service total status').populate({
            path: 'info.service',
            select: 'name duration thumb category'
        }).populate({
            path: 'info.staff',
            select: 'firstName lastName avatar'
        })
    
        return res.status(200).json({
            success: true,
            orders
        });
    }
    else if(assigned_staff_ids.length === 0){
        const orders = await Order.find({
            'info.provider': provider_id,
            'info.service': { $in: service_ids }
        }).select('info.date info.time info.staff info.service total status').populate({
            path: 'info.service',
            select: 'name duration thumb category'
        }).populate({
            path: 'info.staff',
            select: 'firstName lastName avatar'
        })
    
        return res.status(200).json({
            success: true,
            orders
        });
    }
    else if(service_ids.length === 0){
        const orders = await Order.find({
            'info.provider': provider_id,
            'info.staff': { $in: assigned_staff_ids }
        }).select('info.date info.time info.staff info.service total status').populate({
            path: 'info.service',
            select: 'name duration thumb category'
        }).populate({
            path: 'info.staff',
            select: 'firstName lastName avatar'
        })
    
        return res.status(200).json({
            success: true,
            orders
        });
    }
    else {
        const orders = await Order.find({
            'info.provider': provider_id,
            'info.staff': { $in: assigned_staff_ids },
            'info.service': { $in: service_ids }
        }).select('info.date info.time info.staff info.service total status').populate({
            path: 'info.service',
            select: 'name duration thumb category'
        }).populate({
            path: 'info.staff',
            select: 'firstName lastName avatar'
        })
    
        return res.status(200).json({
            success: true,
            orders
        });
    }
})

const updateEmailByBookingId = asyncHandler(async(req,res) => {
    const {bookingId, email} = req.body;

    // Tìm kiếm đơn hàng theo bookingId
    const order = await Order.findById(bookingId);
    if (!order) {
        return res.status(404).json({
            success: false,
            error: 'Order not found'
        });
    }

    // Kiểm tra xem email đã tồn tại trong danh sách emails chưa
    if (!order.emails.includes(email)) {
        order.emails.push(email);
        await order.save();
    
        return res.status(200).json({
            success: true,
            order: order
        });
    }
})

module.exports = {
    createNewOrder,
    updateStatus,
    getUserOrder,
    getOrdersByAdmin,
    getOrdersForStaffCalendar,
    getOneOrderByAdmin,
    updateEmailByBookingId
}