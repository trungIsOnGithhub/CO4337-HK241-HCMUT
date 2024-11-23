const mongoose = require('mongoose');
const Service = require('../models/service')
const ServiceProvider = require('../models/ServiceProvider')
const User = require('../models/user')
const asyncHandler = require("express-async-handler")
// const slugify = require('slugify')
const makeSku = require('uniqid')
const Order = require('../models/order')
const esIndexNameList = require('../services/constant');
const esDBModule = require('../services/es');
const ES_CONSTANT = require('../services/constant');

const createService = asyncHandler(async(req, res)=>{
    const {name, price, description, category, assigned_staff, hour, minute, provider_id,  elastic_query} = req.body

    const thumb = req.files?.thumb[0]?.path
    const image = req.files?.images?.map(el => el.path)

    if(!category){
        throw new Error("Missing category")
    }
    if(!name || !price || !description || !assigned_staff || !hour || !minute || !provider_id){
        throw new Error("Missing input")
    }
    req.body.duration = +hour*60 + +minute
    if(thumb) req.body.thumb = thumb
    if(image) req.body.image = image
    const newService = await Service.create(req.body)

    // if (!elastic_query && newService) {
    //     const newServiceFull = await Service.findById(newService._id)
    //     .populate({
    //         path: 'provider_id'
    //     }).populate({
    //         path: 'assigned_staff'
    //     });

    //     const esClient = esDBModule.esDBModule.initializeElasticClient();
    //     const response = esDBModule.addToElasticDB(esClient, esIndexNameList.SERVICES ,newServiceFull);
    // }

    return res.status(200).json({
        success: newService ? true : false,
        mes: newService ? 'Created successfully' : "Cannot create new service"
    })
})

const searchServiceAdvanced = asyncHandler(async (req, res) => {
    console.log("INCOMING REQUESTS:", req.body);

    let { searchTerm, limit, offset, categories, sortBy,
        clientLat, clientLon, distanceText, province } = req.body;

    if ( (typeof(offset) != "number") ||
        !limit || offset < 0 || limit > 20)
    {
        return res.status(400).json({
            success: false,
            searched: [],
            msg: "Bad Request"
        });
    }

    let sortOption = [];
    let geoSortOption = null;
    if (sortBy?.indexOf("-price") > -1) {
        sortOption.push({price : {order : "desc"}});
    }
    else if (sortBy?.indexOf("price") > -1) {
        sortOption.push({price : {order : "asc"}});
    }

    if (sortBy?.indexOf("location") > -1) { geoSortOption = { unit: "km", order: "asc" }; }

    let categoriesIncluded = [];
    if (categories?.length) {
        categoriesIncluded = categories;
    }

    let geoLocationQueryOption = null;
    if ( clientLat <= 180.0 && clientLon <= 180.0 &&
        clientLat >= -90.0 && clientLon >= -90.0 )
    {
        geoLocationQueryOption = { clientLat, clientLon };
    }
    if (/[1-9][0-9]*(km|m)/.test(distanceText)) {
        geoLocationQueryOption = { ...geoLocationQueryOption, distanceText };
    }

    // console.log('+++++++', geoLocationQueryOption);

    const columnNamesToMatch = ["name", "providername", "province"];
    const columnNamesToGet = ["id", "name","thumb","price","category","duration","provider_id", "province", "totalRatings"];

    let services;
    services = await esDBModule.fullTextSearchAdvanced(
        ES_CONSTANT.SERVICES,
        searchTerm,
        columnNamesToMatch,
        columnNamesToGet,
        limit,
        offset,
        sortOption,
        geoLocationQueryOption,
        geoSortOption,
        categoriesIncluded,
        province,
        null,
        false
    );
    services = services?.hits;

    console.log("Query Input Parameter: ", sortOption);
    console.log("Query Input Parameter: ", categoriesIncluded

    );
    // onsole.log("REAL DATA RETURNED: ", services);

    return res.status(200).json({
        success: services ? true : false,
        services: services
    });
});

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
    if (queries?.name) formatedQueries.name = { $regex: queries.name, $options: 'i' };
    if (queries?.category){
        delete formatedQueries.category
        const categoryArray = queries.category;
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


const getAllServicesPublic = asyncHandler(async (req, res) => {
    let queries = { ...req.query };

    // Loại bỏ các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach((el) => delete queries[el]);

    // Format lại các toán tử cho đúng cú pháp của mongoose
    let queryString = JSON.stringify(queries);
    // let queryString = JSON.stringify({});
    queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
    );

    // chuyen tu chuoi json sang object
    const formatedQueries = JSON.parse(queryString);
    //Filtering
    let categoryFinish = {}
    if (queries?.name) formatedQueries.name = { $regex: queries.name, $options: 'i' };
    if (queries?.category){
        delete formatedQueries.category
        const categoryArray = queries.category?.split(',')
        const categoryQuery = categoryArray.map(el => ({
            category: {$regex: el, $options: 'i' }
        }))
        categoryFinish = {$or: categoryQuery}
    }

    let queryFinish = {}
    const qr = {...formatedQueries, ...queryFinish, ...categoryFinish, 
        $and: [
            queryFinish || {}, // Điều kiện tìm kiếm từ queries.q (nếu có)
            {
                $or: [
                    { isHidden: false },
                    { isHidden: { $exists: false } },
                ],
            },
        ],
    }

    let services = await Service.find(qr);


    try {
        // sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ')
            queryCommand.sort(sortBy)
        }

        let aggregations = []
        // let providersQueryCommand = ServiceProvider.find({});
        if (req?.query?.current_client_location) {
            let {longtitude, lattitude, maxDistance} = req.query.current_client_location;

            longtitude = parseFloat(longtitude);
            lattitude = parseFloat(lattitude);

            if (longtitude < -180 || longtitude > 180
                || lattitude < -90 || lattitude > 90) {// valid long and lat
                return res.status(500).json({
                    success: false,
                    error: 'Invalid Input Data!',
                });
            }

            let nearbyFilterObj = {
                type:"Point",
                coordinates:[longtitude, lattitude]
            };

            maxDistance = parseFloat(maxDistance);
            const maxDistanceInMeter = maxDistance * 1000.0;
            if (!isNaN(maxDistance)) {
                aggregations.push({
                    $geoNear: {
                        "near": nearbyFilterObj,
                        "distanceField": "clientDistance",
                        "maxDistance": maxDistanceInMeter,
                        "spherical": true
                    }
                });
            }
            else {
                aggregations.push({
                    $geoNear: {
                        "near": nearbyFilterObj,
                        "distanceField": "clientDistance",
                        // "maxDistance": maxDistance,
                        "spherical": true
                    }
                });
            }
        }
        else {
            for (let i=0; i < services?.length; ++i) {
                services[i] = {
                    sv: services[i],
                };
            }
        }

        if (req?.query?.province?.length > 0) {
            aggregations.push({
                $match: {
                    province: {$regex: req.query.province, $options: 'i' }
                }
            });
        }

        let serviceProviders = [];
        if (aggregations?.length > 0) {
            serviceProviders = await ServiceProvider.aggregate(aggregations);
        }
        if (req?.query?.province?.length > 0 || req?.query?.current_client_location){
            const mapByProviderId = new Map();
            for (const provider of serviceProviders) {
                mapByProviderId.set(provider._id.toString(), [provider.clientDistance]);
            }
            for (let i=0; i < services?.length; ++i) {
                mapByProviderId.get(services[i]?.provider_id.toString())?.push(services[i]);
            }
            services = [];
            mapByProviderId.forEach((value, _, __) => {
                services = services.concat(value.slice(1));
            })

            for (let i=0; i < services?.length; ++i) {
                const clientDistance = mapByProviderId.get(services[i]?.provider_id.toString())[0];
                services[i] = {
                    sv: services[i],
                    clientDistance
                };
            }
        }

        const page = +req.query.page || 1
        const limit = +req.query.limit || process.env.LIMIT_PRODUCT
        const skip = (page-1)*limit

        // queryCommand.skip(skip).limit(limit)
        const results = services.slice(+skip, (+skip) + (+limit))

        const counts = services.length;
        return res.status(200).json({
            success: true,
            counts: counts,
            services: results,
        });
    } catch (error) {
        return res.status(500).json({
        success: false,
        error: 'Cannot get services',
        });
    }
})


const searchAllServicesPublic = asyncHandler(async (req, res) => {
    // let { elastic_query } = req.params;

    const queries = { ...req.query };
    // Loại bỏ các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach((el) => delete queries[el]);

    let esClient = {};
    // esClient = esDBModule.initializeElasticClient();

    // if (!elastic_query) {
        // const sortBy = queries.sort?.split(',');
        // console.log(sortBy, "----------");
        const { name, category } = queries;
        const { sort } = req.query;
        console.log('-------', req.query, '---------')

        const queryObject = {
            track_scores: true,
            query: {},
            sort: []
        }

        if (name) {
            if (!queryObject.query.bool) {
                queryObject.query.bool = {};
            }
        }
        if (category) {
            if (!queryObject.query.bool) {
                queryObject.query.bool = {};
            }

            let categoryArray = category.split(',');

            queryObject.query.bool.should = categoryArray.map(cate => {
                return { term: { category: cate } }
            });
        }
        if (!name && !category) {
            queryObject.query = {
                match_all: {}
            }
        }

        // console.log('====', sort);
        if (sort) {
            console.log('====', queryObject?.sort);
            if (sort?.indexOf('-') >= 0) {
                const fieldName = sort.slice(1);//get field name

                queryObject.sort.push({ [fieldName]: { order: 'desc' } });
            }
            else {
                console.log(queryObject, "]]]]]]]]]]]]]]]]]]]]]]]");
                queryObject.sort.push({ [sort]: { order: 'asc' } });
            }
        }
        
        console.log('Elastic Query: ', queryObject?.sort, '-------------')
        let queryResult = [];
        // queryResult = await esDBModule.queryElasticDB(esClient, esIndexNameList.SERVICES, queryObject);

        const hitsRecord = queryResult?.hits?.hits?.map(record => {
            return record._source
        });

        // if (hitsRecord?.length > 0) {
            return res.status(200).json({
                success: hitsRecord?.length > 0,
                counts: hitsRecord.length,
                services: hitsRecord,
            });  
        // }
    // }

    // // Format lại các toán tử cho đúng cú pháp của mongoose
    // let queryString = JSON.stringify(queries);
    // queryString = queryString.replace(
    //     /\b(gte|gt|lt|lte)\b/g,
    //     (matchedEl) => `$${matchedEl}`
    // );

    // // chuyen tu chuoi json sang object
    // const formatedQueries = JSON.parse(queryString);
    // //Filtering
    // let categoryFinish = {}
    // if (queries?.name) formatedQueries.name = { $regex: queries.title, $options: 'i' };
    // if (queries?.category){
    //     delete formatedQueries.category
    //     const categoryArray = queries.category?.split(',')
    //     const categoryQuery = categoryArray.map(el => ({
    //         category: {$regex: el, $options: 'i' }
    //     }))
    //     categoryFinish = {$or: categoryQuery}
    // }

    // let queryFinish = {}
    // if(queries?.q){
    //     delete formatedQueries.q
    //     queryFinish = {
    //         $or: [
    //             {name: {$regex: queries.q, $options: 'i' }},
    //             {category: {$regex: queries.q, $options: 'i' }},
    //         ]
    //     }
    // }
    // const qr = {...formatedQueries, ...queryFinish, ...categoryFinish}
    // let queryCommand =  Service.find(qr).populate({
    //     path: 'assigned_staff',
    //     select: 'firstName lastName avatar',
    // })
    // try {
    //     // sorting
    //     if(req.query.sort){
    //         const sortBy = req.query.sort.split(',').join(' ')
    //         queryCommand.sort(sortBy)
    //     }

    //     //filtering
    //     if(req.query.fields){
    //         const fields = req.query.fields.split(',').join(' ')
    //         queryCommand.select(fields)
    //     }

    //     //pagination
    //     //limit: so object lay ve 1 lan goi API
    //     //skip: n, nghia la bo qua n cai dau tien
    //     //+2 -> 2
    //     //+dgfbcxx -> NaN
    //     const page = +req.query.page || 1
    //     const limit = +req.query.limit || process.env.LIMIT_PRODUCT
    //     const skip = (page-1)*limit
    //     queryCommand.skip(skip).limit(limit)


    //     const services = await queryCommand
    //     const counts = await Service.countDocuments(qr);
    //     return res.status(200).json({
    //         success: true,
    //         counts: counts,
    //         services: services,
    //         });
        
    // } catch (error) {
    //     // Xử lý lỗi nếu có
    //     return res.status(500).json({
    //     success: false,
    //     error: 'Cannot get services',
    //     });
    // }
})


const getOneService = asyncHandler(async(req, res)=>{
    console.log('aaaa')
    const {sid} = req.params

    const service = await Service.findById(sid).populate({
        path: 'assigned_staff',
        select: 'firstName lastName avatar mobile email work shifts',
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
        service: service ? service : "Cannot find service"
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
    const qr = {...formatedQueries, ...queryFinish, ...categoryFinish, provider_id,
        $and: [
            queryFinish || {}, // Điều kiện tìm kiếm từ queries.q (nếu có)
            {
                $or: [
                    { isHidden: false },
                    { isHidden: { $exists: false } },
                ],
            },
        ],
    }
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

const updateHiddenStatus = asyncHandler(async (req, res) => {
    const {serviceId} = req.params
    const {status} = req.query
   
    //status la false -> falsy -> !status return true 
    if (!serviceId || status === undefined) {
        throw new Error("Missing input");
    }

    // Kiểm tra giá trị status phải là true hoặc false
    const isValidStatus = status === "true" || status === "false";
    if (!isValidStatus) {
        throw new Error("Invalid status value. Use 'true' or 'false'.");
    }

    // Chuyển đổi giá trị status thành boolean
    const isHidden = status === "true";

    // Cập nhật thuộc tính isHidden
    const updatedService = await Service.findByIdAndUpdate(
        serviceId,
        { isHidden }, // Cập nhật isHidden
        { new: true, upsert: false } // Trả về document sau khi update + upsert:false de khong tao moi
    );

    if (!updatedService) {
        throw new Error("Service not found");
    }

    res.status(200).json({
        success: true,
        mes: "Service updated successfully",
    });
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
    getAllServicesByProviderId,
    searchAllServicesPublic,
    searchServiceAdvanced,
    updateHiddenStatus
}