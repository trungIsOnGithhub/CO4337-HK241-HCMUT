const Coupon = require('../models/coupon');
const asyncHandler = require('express-async-handler');
const User = require('../models/user')

// Handler to create a new coupon
const createNewCoupon = asyncHandler(async (req, res) => {
    let {
        name,
        code,
        discount_type,
        percentageDiscount,
        fixedAmount,
        expirationDate,
        usageLimit,
        noUsageLimit,
        limitPerUser,
        noLimitPerUser,
        services,
        providerId,
        products,
        fixedAmountProduct,
        percentageDiscountProduct
    } = req.body;

    if(noUsageLimit === 'true') noUsageLimit = true
    else if(noUsageLimit === 'false') noUsageLimit = false

    if(noLimitPerUser === 'true') noLimitPerUser = true
    else if(noLimitPerUser === 'false') noLimitPerUser = false


    const image = req.files?.image[0]?.path
    // Validate required fields
    if (!name || !code || !discount_type || !expirationDate || !providerId) {
        return res.status(400).json({ message: 'Name, code, discount_type, and expirationDate are required fields.' });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists.' });
    }
    // Create a new coupon
    const newCoupon = new Coupon({
        name,
        code,
        discount_type,
        percentageDiscount,
        fixedAmount,
        expirationDate,
        usageLimit: noUsageLimit ? 0 : +usageLimit,
        noUsageLimit,
        limitPerUser: noLimitPerUser ? 0 : +limitPerUser,
        noLimitPerUser,
        services,
        usageCount: 0, // Khởi tạo giá trị mặc định
        usedBy: [], // Khởi tạo mảng rỗng
        providerId,
        image,
        products,
        fixedAmountProduct,
        percentageDiscountProduct
    });

    // Save the coupon to the database
    const savedCoupon = await Coupon.create(newCoupon);
    return res.status(200).json({
        success: savedCoupon ? true : false,
        mes: savedCoupon ? 'Created successfully' : "Cannot create new coupon",
        coupon: savedCoupon
    });
});

const getCouponsByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params; // Lấy serviceId từ tham số của request

    if (!serviceId) {
        return res.status(400).json({ message: 'Service ID is required.' });
    }

    // Tìm tất cả các mã giảm giá mà thuộc tính services chứa serviceId
    const coupons = await Coupon.find({
        services: serviceId
    });

    if (coupons.length === 0) {
        return res.status(404).json({ message: 'No coupons found for the given service ID.' });
    }

    return res.status(200).json({ success: true, coupons });
});

const getCouponsByProductId = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ message: 'Product IDs must be a non-empty array.' });
    }
    const coupons = await Coupon.find({
        products: { $in: productIds }
    });

    res.status(200).json({
        success: true,
        coupons
    });

});

const validateAndUseCoupon = asyncHandler(async (req, res) => {
    const { couponCode, userId } = req.body;
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    if (coupon.expirationDate < new Date()) {
        return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    if (!coupon.noUsageLimit && coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    const userUsage = coupon.usedBy.find(usage => usage.user.toString() === userId);

    if (!coupon.noLimitPerUser && userUsage && userUsage.usageCount >= coupon.limitPerUser) {
        return res.status(400).json({ success: false, message: 'User has reached the usage limit for this coupon' });
    }

    // Không cập nhật thông tin sử dụng coupon ở đây
    // Chỉ trả về thông tin coupon hợp lệ

    return res.status(200).json({ 
        success: true, 
        message: 'Coupon is valid and can be applied',
        coupon: coupon
    });
});

const updateCouponUsage = asyncHandler(async (req, res) => {
    console.log('Updating coupon usage')
    const { couponCode, userId } = req.body;

    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const userUsageIndex = coupon.usedBy.findIndex(usage => usage.user.toString() === userId);

    if (userUsageIndex !== -1) {
        // Người dùng đã sử dụng coupon này trước đó
        coupon.usedBy[userUsageIndex].usageCount += 1;
    } else {
        // Người dùng chưa từng sử dụng coupon này
        coupon.usedBy.push({ user: userId, usageCount: 1 });
        coupon.usageCount += 1; // Chỉ tăng tổng số lần sử dụng khi có người dùng mới
    }

    await coupon.save();

    return res.status(200).json({ success: true, message: 'Coupon usage updated successfully' });
});

const getCouponsByProviderId = asyncHandler(async (req, res) => {
    const { providerId } = req.params; // Lấy providerId từ tham số của request

    if (!providerId) {
        return res.status(400).json({ message: 'Provider ID is required.' });
    }

    // Tìm tất cả các mã giảm giá mà thuộc tính providerId trùng với providerId
    // và populate trường services với thông tin name từ bảng Service
    const coupons = await Coupon.find({ providerId })
        .populate('services', 'name'); // Populate trường services với thông tin name

    if (coupons.length === 0) {
        return res.status(404).json({ message: 'No coupons found for the given provider ID.' });
    }

    return res.status(200).json({ success: true, coupons });
});

const getAllCouponsByAdmin = asyncHandler(async (req, res) => {
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

    let queryFinish = {}
    if(queries?.q){
        delete formatedQueries.q
        queryFinish = {
            $or: [
                {name: {$regex: queries.q, $options: 'i' }},
                {code: {$regex: queries.q, $options: 'i' }},
            ]
        }
    }
    const qr = {...formatedQueries, ...queryFinish, providerId: provider_id}
    let queryCommand =  Coupon.find(qr).populate('services', 'name thumb').populate('products', 'title thumb'); // Populate trường services với thông tin name

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


        const coupons = await queryCommand
        const counts = await Coupon.countDocuments(qr);
        return res.status(200).json({
            success: true,
            counts: counts,
            coupons: coupons,
            });
        
    } catch (error) {
        // Xử lý lỗi nếu có
        return res.status(500).json({
        success: false,
        error: 'Cannot get coupons',
        });
    }
});

module.exports = { createNewCoupon, getCouponsByServiceId, validateAndUseCoupon, updateCouponUsage, getCouponsByProviderId, getAllCouponsByAdmin, getCouponsByProductId};