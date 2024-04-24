const Blog = require('../models/blog')
const asyncHandler = require('express-async-handler')

const createNewBlog = asyncHandler(async(req, res)=>{
    const {title, description, category} = req.body
    if(!title || !description || !category){
        throw new Error ("Missing input")
    }
    const response = await Blog.create(req.body)
    console.log(response)
    return res.status(200).json({
        success: response ? true : false,
        createBlog: response ? response : "Cannot create new blog"
    })
})

const updateBlog = asyncHandler(async(req, res)=>{
    const {bid} = req.params
    if(Object.keys(req.body).length === 0){
        throw new Error("Missing input")
    }
    const response = await Blog.findByIdAndUpdate(bid, req.body, {new: true})
    console.log(response)
    return res.status(200).json({
        success: response ? true : false,
        updatedBlog: response ? response : "Cannot update blog"
    })
})

const getAllBlogs = asyncHandler(async(req, res)=>{
    const response = await Blog.find()
    return res.status(200).json({
        success: response ? true : false,
        getAllBlogs: response ? response : "Cannot get all blogs"
    })
})

// LIKE
const likeBlog = asyncHandler(async(req, res)=>{
    const {_id} = req.user
    const {bid} = req.params
    if(!bid) {
        throw new Error("Missing input")
    }
    const blog = await Blog.findById(bid)
    const alreadyDisliked = blog?.dislikes?.find(e1 => e1.toString() === _id)
    if(alreadyDisliked) {
        const response = await Blog.findByIdAndUpdate(bid, {$pull: {dislikes: _id}},{new: true})
        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }
    const alreadyLiked = blog?.likes?.find(e1 => e1.toString() === _id)
    if(alreadyLiked) {
        const response = await Blog.findByIdAndUpdate(bid, {$pull: {likes: _id}},{new: true})
        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }
    else{
        const response = await Blog.findByIdAndUpdate(bid, {$push: {likes: _id}},{new: true})
        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }

})

// DISLIKE
const dislikeBlog = asyncHandler(async(req, res)=>{
    const {_id} = req.user
    const {bid} = req.params
    if(!bid) {
        throw new Error("Missing input")
    }
    const blog = await Blog.findById(bid)
    const alreadyLiked = blog?.likes?.find(e1 => e1.toString() === _id)
    if(alreadyLiked) {
        const response = await Blog.findByIdAndUpdate(bid, {$pull: {likes: _id}},{new: true})
        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }
    const alreadyDisliked = blog?.dislikes?.find(e1 => e1.toString() === _id)
    if(alreadyDisliked) {
        const response = await Blog.findByIdAndUpdate(bid, {$pull: {dislikes: _id}},{new: true})
        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }
    else{
        const response = await Blog.findByIdAndUpdate(bid, {$push: {dislikes: _id}},{new: true})
        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }

})

const excludeField = '-refresh_token -password -role -createdAt -updatedAt'
const getBlog = asyncHandler(async(req, res)=>{
    const {bid} = req.params
    const blog = await Blog.findByIdAndUpdate(bid, {$inc: {numberView:1}}, {new: true})
                .populate('likes', excludeField)
                .populate('dislikes', excludeField)
    return res.status(200).json({
        success: blog ? true : false,
        rs: blog
    })
})

const deleteBlog = asyncHandler(async(req, res)=>{
    const {bid} = req.params
    const blog = await Blog.findByIdAndDelete(bid)
    return res.status(200).json({
        success: blog ? true : false,
        deletedBlog: blog ? blog : "Something went wrong"
    })
})

const uploadImage = asyncHandler(async(req, res)=>{
    const {bid} = req.params
    if(!req.file){
        throw new Error("Missing input")
    }
    else{
        const response = await Blog.findByIdAndUpdate(bid, {image: req.file.path},{new: true})
        return res.status(200).json({
            status: response? true : false,
            uploadImage: response? response : "Cannot upload image"
        })
    }
})

module.exports = {
    createNewBlog,
    updateBlog,
    getAllBlogs,
    likeBlog,
    dislikeBlog,
    getBlog,
    deleteBlog,
    uploadImage
}