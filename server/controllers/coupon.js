const Coupon = require('../models/coupon')
const asyncHandler = require('express-async-handler')

const createNewCoupon = asyncHandler(async(req, res)=>{
    const {name, discount, expiry} = req.body
    if (!name || !discount || !expiry) {
        throw new Error("Missing input")
    }
    const response = await Coupon.create({
        ...req.body,
        expiry: Date.now() + +expiry * 24 * 60 * 60 * 1000,
    })
    return res.status(200).json({
        success: response ? true : false,
        createdCoupon: response ? response : "Cannot create new coupon"
    })
})

const getAllCoupon = asyncHandler(async(req, res)=>{
    const response = await Coupon.find().select('-createdAt -updatedAt')
    return res.status(200).json({
        success: response ? true : false,
        AllCoupons: response ? response : "Cannot get all coupons"
    })
})

const updateCoupon = asyncHandler(async(req, res)=>{
    const {cid} = req.params
    if(Object.keys(req.body).length === 0){
        throw new Error('Missing input')
    }
    if(req.body.expiry){
        req.body.expiry = Date.now() + +req.body.expiry * 24 * 60 * 60 * 1000
    }
    const response = await Coupon.findByIdAndUpdate(cid, req.body, {new: true})
    return res.status(200).json({
        success: response ? true : false,
        updatedCoupon: response ? response : "Cannot update a coupon"
    })
})

const deleteCoupon = asyncHandler(async(req, res)=>{
    const {cid} = req.params
    const response = await Coupon.findByIdAndDelete(cid)
    return res.status(200).json({
        success: response ? true : false,
        deletedCoupon: response ? response : "Cannot delete a coupon"
    })
})

module.exports = {
    createNewCoupon,
    getAllCoupon,
    updateCoupon,
    deleteCoupon
}