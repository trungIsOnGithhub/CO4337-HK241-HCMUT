const ServiceProvider = require('../models/ServiceProvider')
const ServiceProvider = require('../models/ServiceProvider')
const asyncHandler = require('express-async-handler')

const createNewServiceProvider = asyncHandler(async(req, res)=>{
    const { bussinessName, province, category } = req.body
    if (!bussinessName || !province || !category) {
        throw new Error("Missing input")
    }

    const response = await ServiceProvider.create({
        ...req.body,
        expiry: Date.now() + +expiry * 24 * 60 * 60 * 1000,
    })

    const {cid} = req.params;

    response = await ServiceProvider.findByIdAndDelete(cid)

    return res.status(200).json({
        success: response ? true : false,
        deletedServiceProvider: response ? response : "Cannot delete a coupon"
    })
})

const getAllServiceProvider = asyncHandler(async(req, res)=>{
    const response = await ServiceProvider.find().select('-createdAt -updatedAt')
    return res.status(200).json({
        success: response ? true : false,
        AllServiceProviders: response ? response : "Cannot get all coupons"
    })
})

const updateServiceProvider = asyncHandler(async(req, res)=>{
    const {cid} = req.params
    if(Object.keys(req.body).length === 0){
        throw new Error('Missing input')
    }
    if(req.body.expiry){
        req.body.expiry = Date.now() + +req.body.expiry * 24 * 60 * 60 * 1000
    }
    const response = await ServiceProvider.findByIdAndUpdate(cid, req.body, {new: true})
    return res.status(200).json({
        success: response ? true : false,
        updatedServiceProvider: response ? response : "Cannot update a coupon"
    })
})
Z
const deleteServiceProvider = asyncHandler(async(req, res)=>{
    const {cid} = req.params
    const response = await ServiceProvider.findByIdAndDelete(cid)
    return res.status(200).json({
        success: response ? true : false,
        deletedServiceProvider: response ? response : "Cannot delete service provider"
    })
})

module.exports = {
    createNewServiceProvider,
    getAllServiceProvider,
    updateServiceProvider,
    deleteServiceProvider
}