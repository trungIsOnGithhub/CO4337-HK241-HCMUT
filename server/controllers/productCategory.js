const ProductCategory = require('../models/productCategory')
const asyncHandler = require('express-async-handler')

const createCategory = asyncHandler(async(req, res)=>{
    const response = await ProductCategory.create(req.body)
    console.log(response)
    return res.status(200).json({
        success: response ? true : false,
        createCategory: response ? response : "Cannot create new category"
    })
})

const getAllCategory = asyncHandler(async(req, res)=>{
    const response = await ProductCategory.find()
    return res.status(200).json({
        success: response ? true : false,
        productCategories: response ? response : "Cannot get all categories"
    })
})

const updateCategory = asyncHandler(async(req, res)=>{
    const {pcid} = req.params
    const response = await ProductCategory.findByIdAndUpdate(pcid, req.body, {new: true})
    return res.status(200).json({
        success: response ? true : false,
        updatedCategory: response ? response : "Cannot update category"
    })
})

const deteteCategory = asyncHandler(async(req, res)=>{
    const {pcid} = req.params
    const response = await ProductCategory.findByIdAndDelete(pcid)
    return res.status(200).json({
        success: response ? true : false,
        deletedCategory: response ? response : "Cannot delete category"
    })
})

module.exports = {
    createCategory,
    getAllCategory,
    updateCategory,
    deteteCategory
}