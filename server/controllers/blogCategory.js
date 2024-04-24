const BlogCategory = require('../models/blogCategory')
const asyncHandler = require('express-async-handler')

const createCategory = asyncHandler(async(req, res)=>{
    const response = await BlogCategory.create(req.body)
    console.log(response)
    return res.status(200).json({
        success: response ? true : false,
        createCategory: response ? response : "Cannot create new category"
    })
})

const getAllCategory = asyncHandler(async(req, res)=>{
    const response = await BlogCategory.find().select('title')
    return res.status(200).json({
        success: response ? true : false,
        blogCategories: response ? response : "Cannot get all categories"
    })
})

const updateCategory = asyncHandler(async(req, res)=>{
    const {bcid} = req.params
    const response = await BlogCategory.findByIdAndUpdate(bcid, req.body, {new: true})
    return res.status(200).json({
        success: response ? true : false,
        updatedCategory: response ? response : "Cannot update category"
    })
})

const deteteCategory = asyncHandler(async(req, res)=>{
    const {bcid} = req.params
    const response = await BlogCategory.findByIdAndDelete(bcid)
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