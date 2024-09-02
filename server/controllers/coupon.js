const Coupon = require('../models/coupon');
const asyncHandler = require('express-async-handler');

// Handler to create a new coupon
const createNewCoupon = asyncHandler(async (req, res) => {
    const {
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
        providerId
    } = req.body;

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
        usageLimit: noUsageLimit ? 0 : usageLimit,
        noUsageLimit,
        limitPerUser: noLimitPerUser ? 0 : limitPerUser,
        noLimitPerUser,
        services,
        usageCount: 0, // Khởi tạo giá trị mặc định
        usedBy: [], // Khởi tạo mảng rỗng
        providerId
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

module.exports = { createNewCoupon, getCouponsByServiceId, validateAndUseCoupon, updateCouponUsage, getCouponsByProviderId };