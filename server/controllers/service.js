const mongoose = require('mongoose');
const Service = require('../models/service')
const User = require('../models/user')
const asyncHandler = require("express-async-handler")
const slugify = require('slugify')
const makeSku = require('uniqid')
const Order = require('../models/order')

const createService = asyncHandler(async(req, res)=>{
    const {name, price, description, category, assigned_staff, hour, minute, provider_id} = req.body



    const thumb = req.files?.thumb[0]?.path
    const image = req.files?.images?.map(el => el.path)

    if(!name || !price || !description || !assigned_staff || !category || !hour || !minute || !provider_id){
        throw new Error("Missing input")
    }
    req.body.duration = +hour*60 + +minute
    if(thumb) req.body.thumb = thumb
    if(image) req.body.image = image
    const newService = await Service.create(req.body)
    return res.status(200).json({
        success: newService ? true : false,
        mes: newService ? 'Created successfully' : "Cannot create new service"
    })
})

// get all staffs
const getAllServicesByAdmin = asyncHandler(async (req, res) => {
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
    let categoryFinish = {}
    if (queries?.name) formatedQueries.name = { $regex: queries.title, $options: 'i' };
    if (queries?.category){
        delete formatedQueries.category
        const categoryArray = queries.category?.split(',')
        const categoryQuery = categoryArray.map(el => ({
            category: {$regex: el, $options: 'i' }
        }))
        categoryFinish = {$or: categoryQuery}
    }

    let queryFinish = {}
    if(queries?.q){
        delete formatedQueries.q
        queryFinish = {
            $or: [
                {name: {$regex: queries.q, $options: 'i' }},
                {category: {$regex: queries.q, $options: 'i' }},
            ]
        }
    }
    const qr = {...formatedQueries, ...queryFinish, ...categoryFinish, provider_id}
    let queryCommand =  Service.find(qr).populate({
        path: 'assigned_staff',
        select: 'firstName lastName avatar',
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


        const services = await queryCommand
        const counts = await Service.countDocuments(qr);
        return res.status(200).json({
            success: true,
            counts: counts,
            services: services,
            });
        
    } catch (error) {
        // Xử lý lỗi nếu có
        return res.status(500).json({
        success: false,
        error: 'Cannot get services',
        });
    }
})

// get all staffs
const deleteServiceByAdmin = asyncHandler(async (req, res) => {
    const {sid} = req.params
    const service = await Service.findByIdAndDelete(sid)
    return res.status(200).json({
        success: service ? true : false,
        mes: service ? 'Deleted successfully' : "Cannot delete service"
    })
})

const updateServiceByAdmin = asyncHandler(async(req, res)=>{
    const {sid} = req.params

    const files = req?.files
    if(files?.thumb){
        req.body.thumb = files?.thumb[0]?.path
    }
    if(files?.images){
        req.body.image = files?.images?.map(el => el.path)
    }
    const service = await Service.findByIdAndUpdate(sid, req.body, {new: true})
    return res.status(200).json({
        success: service ? true : false,
        mes: service ? 'Updated successfully' : "Cannot update service"
    })
})
//update staff by admin
// const updateStaffByAdmin = asyncHandler(async (req, res) => {
//     const {staffId} = req.params

//     if(!staffId || Object.keys(req.body).length === 0){
//         throw new Error("Missing input")
//     }
//     else{
//         const response = await Staff.findByIdAndUpdate(staffId, req.body, {new: true}).select('-refresh_token -password -role')
//         return res.status(200).json({
//             success: response ? true : false,
//             mes: response ? `Staff with email ${response.email} updated successfully` : "Something went wrong"
//         })
//     }
// })

// delete staff by admin
// const deleteStaffByAdmin = asyncHandler(async (req, res) => {
//     const {staffId} = req.params
//     if(!staffId){
//         throw new Error("Missing input")
//     }
//     else{
//         const response = await Staff.findByIdAndDelete(staffId)  
//         return res.status(200).json({
//             success: response ? true : false,
//             mes: response ? `Staff with email ${response.email} deleted successfully` : "Something went wrong"
//         })
//     }
// })


// get all staffs
const getAllServicesPublic = asyncHandler(async (req, res) => {
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
    let categoryFinish = {}
    if (queries?.name) formatedQueries.name = { $regex: queries.title, $options: 'i' };
    if (queries?.category){
        delete formatedQueries.category
        const categoryArray = queries.category?.split(',')
        const categoryQuery = categoryArray.map(el => ({
            category: {$regex: el, $options: 'i' }
        }))
        categoryFinish = {$or: categoryQuery}
    }

    let queryFinish = {}
    if(queries?.q){
        delete formatedQueries.q
        queryFinish = {
            $or: [
                {name: {$regex: queries.q, $options: 'i' }},
                {category: {$regex: queries.q, $options: 'i' }},
            ]
        }
    }
    const qr = {...formatedQueries, ...queryFinish, ...categoryFinish}
    let queryCommand =  Service.find(qr).populate({
        path: 'assigned_staff',
        select: 'firstName lastName avatar',
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


        const services = await queryCommand
        const counts = await Service.countDocuments(qr);
        return res.status(200).json({
            success: true,
            counts: counts,
            services: services,
            });
        
    } catch (error) {
        // Xử lý lỗi nếu có
        return res.status(500).json({
        success: false,
        error: 'Cannot get services',
        });
    }
})

const getOneService = asyncHandler(async(req, res)=>{
    const {sid} = req.params

    const service = await Service.findById(sid).populate({
        path: 'assigned_staff',
        select: 'firstName lastName avatar mobile email work',
    }).populate({
        path: 'rating',
        populate: {
            path: 'postedBy',
            select: 'firstName lastName avatar',
        }
    }).populate({
        path: 'provider_id',
        select: 'bussinessName address province latitude longitude'
    })


    
    return res.status(200).json({
        success: service ? true : false,
        service: service ? service : "Cannot find product"
    })
})

const addVariantService = asyncHandler(async(req, res)=>{
    const {sid} = req.params
    const {name, price, hour, minute, description} = req.body
    const thumb = req.files?.thumb[0]?.path
    const image = req.files?.images?.map(el => el.path)
    const duration = +hour*60 + +minute

    if(!name || !price || !hour || !minute || !description){
        throw new Error("Missing input")
    }
    const response = await Service.findByIdAndUpdate(sid, {$push: {variants: {name, price, thumb, image, duration, description, sku: makeSku().toUpperCase()}}},{new: true})
    return res.status(200).json({
        success: response? true : false,
        mes: response? 'Add variant successfully' : "Cannot add variant"
    })
    
})

const ratingService = asyncHandler(async(req, res)=>{
    const {_id} = req.user
    const {star, comment, sid, updatedAt} = req.body

    if(!star || !sid){
        throw new Error("Missing input")
    }
    const ratingService = await Service.findById(sid)
    
    //alreadyRating tra ve element trong Rating neu co
    const alreadyRating = ratingService?.rating?.find(e1 => e1.postedBy.toString() === _id)

    if(alreadyRating){
        await Service.updateOne(
            {rating: {$elemMatch: alreadyRating}},
            {$set: {"rating.$.star": star, "rating.$.comment": comment,  "rating.$.updatedAt": updatedAt}}
            )
    }
    else{
        await Service.findByIdAndUpdate(
            sid,
            {$push:{rating :{star, comment, postedBy: _id, updatedAt}}},
            {new: true})
    }

    // Average rating
    const updatedService = await Service.findById(sid)
    const totalRatings = updatedService.rating.length
    
    // reduce: 2 doi so (callback + initial value)
    const totalScores = updatedService.rating.reduce((sum,ele) => sum + (+ele.star),0)
    updatedService.totalRatings = Math.round(totalScores/totalRatings)
    await updatedService.save()

    return res.status(200).json({
        success: true,
        updatedService
    })
})

const getMostPurchasedService = asyncHandler(async(req, res) => {
    const {provider_id, year} = req.body;

    if (!provider_id || !year) {
        throw new Error("Missing input")
    }

    const providerObjectId = new mongoose.Types.ObjectId(provider_id)

    let orders = await Order.aggregate([
        {
            $match: {
                'info.provider': providerObjectId
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

    return res.status(200).json({
        success: true,
        services: orders
    });
})


const getAllServicesByProviderId = asyncHandler(async (req, res) => {
    const {provider_id} = req.params
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
    let categoryFinish = {}
    if (queries?.name) formatedQueries.name = { $regex: queries.title, $options: 'i' };
    if (queries?.category){
        delete formatedQueries.category
        const categoryArray = queries.category?.split(',')
        const categoryQuery = categoryArray.map(el => ({
            category: {$regex: el, $options: 'i' }
        }))
        categoryFinish = {$or: categoryQuery}
    }

    let queryFinish = {}
    if(queries?.q){
        delete formatedQueries.q
        queryFinish = {
            $or: [
                {name: {$regex: queries.q, $options: 'i' }},
                {category: {$regex: queries.q, $options: 'i' }},
            ]
        }
    }
    const qr = {...formatedQueries, ...queryFinish, ...categoryFinish, provider_id}
    let queryCommand =  Service.find(qr).populate({
        path: 'assigned_staff',
        select: 'firstName lastName avatar',
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


        const services = await queryCommand
        const counts = await Service.countDocuments(qr);
        return res.status(200).json({
            success: true,
            counts: counts,
            services: services,
            });
        
    } catch (error) {
        // Xử lý lỗi nếu có
        return res.status(500).json({
        success: false,
        error: 'Cannot get services',
        });
    }
})

module.exports = {
    createService,
    getAllServicesByAdmin,
    deleteServiceByAdmin,
    updateServiceByAdmin,
    getAllServicesPublic,
    getOneService,
    addVariantService,
    ratingService,
    getMostPurchasedService,
    getAllServicesByProviderId
}