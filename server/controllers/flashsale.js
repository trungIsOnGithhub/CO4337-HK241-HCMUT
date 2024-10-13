const FlashSale = require('../models/flashsale');
const asyncHandler = require('express-async-handler');

// Handler to create a new coupon
const createNewFlashSaleEvent = asyncHandler(async (req, res) => {
    const {
        discount_type,
        percentageDiscount,
        fixedAmount,
        promotionApplicationDate,
        startTime,
        duration,
        usageLimit,
        services,
        providerId
    } = req.body;

    // Validate required fields
    if (!discount_type || !promotionApplicationDate || !startTime || !duration) {
        return res.status(400).json({ message: 'Missing input.' });
    }

    // Create a new flash sale event
    const newFlashSaleEvent = new FlashSale({
        discount_type,
        percentageDiscount,
        fixedAmount,
        promotionApplicationDate,
        startTime,
        duration,
        usageLimit,
        services,
        usageCount: services.map(serviceId => ({ id: serviceId, value: 0 })), // Khởi tạo giá trị mặc định
        providerId
    });

    // Save the flashsale event to the database
    const savedFlashSaleEvent = await FlashSale.create(newFlashSaleEvent);
    return res.status(200).json({
        success: savedFlashSaleEvent ? true : false,
        mes: savedFlashSaleEvent ? 'Created successfully' : "Cannot create new flash sale event",
        flashSaleEvent: savedFlashSaleEvent
    });
});

const getFlashSaleEventByProviderId = asyncHandler(async (req, res) => {
    const {providerId} = req.params; // Lay ra id cua nha cung cap dich vu
    if(!providerId){
        return res.status(400).json({message: 'Provider ID is required'})
    }

    const flashsales = await FlashSale.find({
        providerId: providerId
    }).populate({
        path: 'percentageDiscount',
        populate:{
            path: 'id',
            select: 'name price thumb description'
        },
    }).populate({
        path: 'fixedAmount',
        populate:{
            path: 'id',
            select: 'name price thumb description'
        },
    })

    const allFlashSale = []
    
    if(flashsales.length === 0){
        return res.status(404).json({ message: 'No flash sale event found for the given provider ID.' });
    }

    flashsales?.map(el => {
        if(el?.discount_type === 'percentage'){
            el?.percentageDiscount?.map(item => {
                let serviceName = item?.id?.name;
                let serviceFlashSalePrice = Math.round(+item?.id?.price * (100-(+item?.value))/100);
                let serviceOriginalPrice = +item?.id?.price;
                let serviceThumb = item?.id?.thumb;
                let serviceDescription = item?.id?.description;
                let serviceId = item?.id?._id;
                let duration = +el?.duration;
                let startTime = el?.startTime;
                let promotionApplicationDate = el?.promotionApplicationDate;
                let usageLimit = el?.usageLimit;
                let usageCount = el?.usageCount?.find(itemm => itemm?.id.equals(serviceId))?.value;

                allFlashSale.push({
                    serviceName, serviceFlashSalePrice, serviceOriginalPrice, serviceThumb, serviceDescription, serviceId, duration, startTime, promotionApplicationDate, usageLimit, usageCount
                })
            })
        }
        else if(el?.discount_type === 'fixed'){
            el?.fixedAmount?.map(item => {
                let serviceName = item?.id?.name;
                let serviceFlashSalePrice = Math.round(+item?.id?.price - (+item?.value));
                let serviceOriginalPrice = +item?.id?.price;
                let serviceThumb = item?.id?.thumb;
                let serviceDescription = item?.id?.description;
                let serviceId = item?.id?._id;
                let duration = +el?.duration;
                let startTime = el?.startTime;
                let promotionApplicationDate = el?.promotionApplicationDate;
                let usageLimit = el?.usageLimit;
                let usageCount = el?.usageCount?.map(itemm => {
                    if(itemm?.id === item?.id?._id){
                        return itemm?.value
                    }
                });
                allFlashSale.push({
                    serviceName, serviceFlashSalePrice, serviceOriginalPrice, serviceThumb, serviceDescription, serviceId, duration, startTime, promotionApplicationDate, usageLimit, usageCount
                })
            })
        }
    })
    return res.status(200).json({
        success: true,
        allFlashSale
    })
});

// const getCouponsByServiceId = asyncHandler(async (req, res) => {
//     const { serviceId } = req.params; // Lấy serviceId từ tham số của request

//     if (!serviceId) {
//         return res.status(400).json({ message: 'Service ID is required.' });
//     }

//     // Tìm tất cả các mã giảm giá mà thuộc tính services chứa serviceId
//     const coupons = await Coupon.find({
//         services: serviceId
//     });

//     if (coupons.length === 0) {
//         return res.status(404).json({ message: 'No coupons found for the given service ID.' });
//     }

//     return res.status(200).json({ success: true, coupons });
// });

// const validateAndUseCoupon = asyncHandler(async (req, res) => {
//     const { couponCode, userId } = req.body;
//     const coupon = await Coupon.findOne({ code: couponCode });

//     if (!coupon) {
//         return res.status(404).json({ success: false, message: 'Coupon not found' });
//     }

//     if (coupon.expirationDate < new Date()) {
//         return res.status(400).json({ success: false, message: 'Coupon has expired' });
//     }

//     if (!coupon.noUsageLimit && coupon.usageCount >= coupon.usageLimit) {
//         return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
//     }

//     const userUsage = coupon.usedBy.find(usage => usage.user.toString() === userId);

//     if (!coupon.noLimitPerUser && userUsage && userUsage.usageCount >= coupon.limitPerUser) {
//         return res.status(400).json({ success: false, message: 'User has reached the usage limit for this coupon' });
//     }

//     // Không cập nhật thông tin sử dụng coupon ở đây
//     // Chỉ trả về thông tin coupon hợp lệ

//     return res.status(200).json({ 
//         success: true, 
//         message: 'Coupon is valid and can be applied',
//         coupon: coupon
//     });
// });

// const updateCouponUsage = asyncHandler(async (req, res) => {
//     const { couponCode, userId } = req.body;

//     const coupon = await Coupon.findOne({ code: couponCode });

//     if (!coupon) {
//         return res.status(404).json({ success: false, message: 'Coupon not found' });
//     }

//     const userUsageIndex = coupon.usedBy.findIndex(usage => usage.user.toString() === userId);

//     if (userUsageIndex !== -1) {
//         // Người dùng đã sử dụng coupon này trước đó
//         coupon.usedBy[userUsageIndex].usageCount += 1;
//     } else {
//         // Người dùng chưa từng sử dụng coupon này
//         coupon.usedBy.push({ user: userId, usageCount: 1 });
//         coupon.usageCount += 1; // Chỉ tăng tổng số lần sử dụng khi có người dùng mới
//     }

//     await coupon.save();

//     return res.status(200).json({ success: true, message: 'Coupon usage updated successfully' });
// });

// const getCouponsByProviderId = asyncHandler(async (req, res) => {
//     const { providerId } = req.params; // Lấy providerId từ tham số của request

//     if (!providerId) {
//         return res.status(400).json({ message: 'Provider ID is required.' });
//     }

//     // Tìm tất cả các mã giảm giá mà thuộc tính providerId trùng với providerId
//     // và populate trường services với thông tin name từ bảng Service
//     const coupons = await Coupon.find({ providerId })
//         .populate('services', 'name'); // Populate trường services với thông tin name

//     if (coupons.length === 0) {
//         return res.status(404).json({ message: 'No coupons found for the given provider ID.' });
//     }

//     return res.status(200).json({ success: true, coupons });
// });

module.exports = {createNewFlashSaleEvent, getFlashSaleEventByProviderId };