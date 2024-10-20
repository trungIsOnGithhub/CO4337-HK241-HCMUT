const FlashSale = require('../models/flashsale');
const asyncHandler = require('express-async-handler');
const User = require('../models/user')

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
                let type = el?.discount_type;
                let value = item?.value

                allFlashSale.push({
                    serviceName, serviceFlashSalePrice, serviceOriginalPrice, serviceThumb, serviceDescription, serviceId, duration, startTime, promotionApplicationDate, usageLimit, usageCount, type, value
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
                let type = el?.discount_type;
                let value = item?.value

                allFlashSale.push({
                    serviceName, serviceFlashSalePrice, serviceOriginalPrice, serviceThumb, serviceDescription, serviceId, duration, startTime, promotionApplicationDate, usageLimit, usageCount, type, value
                })
            })
        }
    })
    return res.status(200).json({
        success: true,
        allFlashSale
    })
});


const getAllFlashSalesByAdmin = asyncHandler(async (req, res) => { 
    const {_id} = req.user
    const {provider_id} = await User.findById({_id}).select('provider_id')
    console.log(provider_id)

    let queryCommand =  FlashSale.find({
        providerId: provider_id
    })
    try {
        const flashsales = await queryCommand
        return res.status(200).json({
            success: true,
            flashsales: flashsales,
            });
        
    } catch (error) {
        // Xử lý lỗi nếu có
        return res.status(500).json({
        success: false,
        error: 'Cannot get flashsales',
        });
    }
})

module.exports = {createNewFlashSaleEvent, getFlashSaleEventByProviderId, getAllFlashSalesByAdmin};