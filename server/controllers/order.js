const mongoose = require('mongoose');

const Order = require('../models/order')
const User = require('../models/user')
const Coupon = require('../models/coupon')
const asyncHandler = require('express-async-handler')
const Staff = require('../models/staff')

const createNewOrder = asyncHandler(async(req, res)=>{
    const {_id} = req.user
    console.log('test')
    console.log(req.body)
    const {service, provider, staff, date, time, dateTime, captureId, originalPrice, discountPrice, status, coupon, paymentMethod} = req.body
    if(!service || !provider || !staff || !date || !time || !dateTime){
        throw new Error("Missing input");
    }
    else{
        await User.findByIdAndUpdate(_id, {$set: {cart: []}}, {new: true});
        let response;
        await Staff.findByIdAndUpdate(staff?._id, {$push: {work: {service : service?._id, provider: provider?._id, time: time, date: date, duration: service?.duration}}}, {new: true});
        try {
            response = await Order.create({
                info: [{
                    service: service._id,
                    provider: provider._id,
                    staff: staff._id,
                    date,
                    time,
                    dateTime,
                    discountCode: coupon // Thay đổi nếu bạn có coupon
                }],
                orderBy: _id,
                total: discountPrice > 0 ? discountPrice : originalPrice,
                capturedId: captureId,
                paymentMethod: paymentMethod,
                emails: [], // Thêm email nếu cần
                status: status
            });
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


        const orders = await queryCommand.populate({
            path: 'info',
            populate: {
                path: 'service',
                select: 'name price duration thumb'
            },
        }).populate({
            path: 'info',
            populate: {
                path: 'provider'
            },
        });
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

const getAccessToken = async () => {
    const clientId = "AYKmbDetUzEsuzEuSEU54izuOjqvD9z9m9HNfpzGLpjaYUDmS69P9kSqLueKqfOXm4BvpWuGDGx2bYnn"; // Thay thế bằng clientId thực tế
    const clientSecret = "EJ3rnafAZJz6uoFHaTIPtFNdmlyQrfras2yonDooZkeyb5AqZqutRFJh7ekIqZSD2fnpFifMQp2RW6e-"; // Thay thế bằng clientSecret thực tế
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64'); // Base64 encode clientId và clientSecret

    const response = await fetch("https://api.sandbox.paypal.com/v1/oauth2/token", {
        method: "POST",
        headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials&scope=https://uri.paypal.com/services/payments/refund" // Yêu cầu phạm vi hoàn tiền
    });

    if (response.ok) {
        const data = await response.json();
        return data.access_token;
    } else {
        throw new Error("Failed to get access token");
    }
};

const refundPayment = asyncHandler(async (req, res) => {
    const { captureId } = req.body; // Lấy captureId từ body của yêu cầu
    if (!captureId) {
        return res.status(400).json({ success: false, message: "Missing captureId" });
    }

    const accessToken = await getAccessToken(); // Lấy access token

    const response = await fetch(`https://api.sandbox.paypal.com/v2/payments/captures/${captureId}/refund`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}` // Sử dụng access token
        },
        body: JSON.stringify({
            // amount: {
            //     value: "10.00", // Số tiền bạn muốn hoàn lại
            //     currency_code: "USD"
            // }
        })
    });

    if (response.ok) {
        const refundData = await response.json();
        return res.status(200).json({ success: true, refundData });
    } else {
        const errorData = await response.json();
        return res.status(500).json({ success: false, message: "Failed to refund", error: errorData });
    }
});
module.exports = {
    createNewOrder,
    updateStatus,
    getUserOrder,
    getOrdersByAdmin,
    getOrdersForStaffCalendar,
    getOneOrderByAdmin,
    updateEmailByBookingId,
    refundPayment
}

