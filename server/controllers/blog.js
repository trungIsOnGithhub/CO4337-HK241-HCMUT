const Blog = require('../models/blog')
const PostTag = require('../models/postTag')
const asyncHandler = require('express-async-handler');
const User = require('../models/user');

const createNewBlogPost = asyncHandler(async(req, res)=>{
    const {title, content} = req.body
    if(!title || !content){
        throw new Error ("Missing input")
    }
    const response = await Blog.create(req.body)

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

    return res.status(200).json({
        success: response ? true : false,
        updatedBlog: response ? response : "Cannot update blog"
    })
})

const getAllBlogTags = asyncHandler(async (req,res) => {
    const response = await PostTag.find()
    // const response = [
    //     {
    //         "_id": {
    //           "$oid": "66377327edf989f1ae865513"
    //         },
    //         label: "Tag 68",
    //       },
    //       {
    //         "_id": {
    //           "$oid": "66377327edf989f1ae865513"
    //         },
    //         label: "Sample Tag 999",
    //       },
    //       {
    //         "_id": {
    //           "$oid": "66377327edf989f1ae865513"
    //         },
    //         label: "Label Tag 99",
    //       },
    //       {
    //         "_id": {
    //           "$oid": "66377327edf989f1ae865513"
    //         },
    //         label: "Tag 96",
    //       }
    //   ]
    return res.status(200).json({
        success: response ? true : false,
        tags: response ? response : []
    }) 
});

const getAllBlogs = asyncHandler(async (req, res)=>{

    const { provider_id, title } = req.body;
    // if(!provider_id){
    //     throw new Error ("Missing input")
    // }
    const searchFilter = {};
    if (provider_id) {
        searchFilter.provider_id = provider_id;
    }
    if (title) {
        searchFilter.title = title;
    }
    const response = await Blog.find(searchFilter).populate({
        path: 'provider_id',
        select: 'bussinessName province',
    });

    return res.status(200).json({
        success: response ? true : false,
        blogs: response ? response : "Cannot get all blogs"
    })
})

// LIKE
const likeBlog = asyncHandler(async(req, res)=>{
    const {_id, bid } = req.body;

    if(!bid) {
        throw new Error("Missing input")
    }
    const blog = await Blog.findById(bid)

    const alreadyDisliked = blog?.dislikes?.find(e1 => e1.toString() === _id)
    if(alreadyDisliked) {
        const response = await Blog.findByIdAndUpdate(bid, {$pull: {dislikes: _id}, $push: {likes: _id}},{new: true}).populate({
            path: 'provider_id'
        }).populate({
            path: 'author'
        });

        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }
    const alreadyLiked = blog?.likes?.find(e1 => e1.toString() === _id)
    if(alreadyLiked) {
        const response = await Blog.findByIdAndUpdate(bid, {$pull: {likes: _id}},{new: true}).populate({
            path: 'provider_id'
        }).populate({
            path: 'author'
        });

        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }
    else{
        const response = await Blog.findByIdAndUpdate(bid, {$push: {likes: _id}},{new: true}).populate({
            path: 'provider_id'
        }).populate({
            path: 'author'
        });

        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }
})

// DISLIKE
const dislikeBlog = asyncHandler(async(req, res)=>{
    const {_id, bid } = req.body;

    if(!bid) {
        throw new Error("Missing input")
    }
    const blog = await Blog.findById(bid)
    const alreadyLiked = blog?.likes?.find(e1 => e1.toString() === _id)
    if(alreadyLiked) {
        const response = await Blog.findByIdAndUpdate(bid, {$pull: {likes: _id}, $push: {dislikes: _id}},{new: true}).populate({
            path: 'provider_id'
        }).populate({
            path: 'author'
        });

        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }
    const alreadyDisliked = blog?.dislikes?.find(e1 => e1.toString() === _id)
    if(alreadyDisliked) {
        const response = await Blog.findByIdAndUpdate(bid, {$pull: {dislikes: _id}},{new: true}).populate({
            path: 'provider_id'
        }).populate({
            path: 'author'
        });

        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }
    else{
        const response = await Blog.findByIdAndUpdate(bid, {$push: {dislikes: _id}},{new: true}).populate({
            path: 'provider_id'
        }).populate({
            path: 'author'
        });

        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }

})

const excludeField = '-refresh_token -password -role -createdAt -updatedAt'
const getBlog = asyncHandler(async(req, res)=>{
    const {bid} = req.params
    if(!bid) {
        throw new Error("Missing input")
    }
    const blog = await Blog.findById(bid).populate({
        path: 'provider_id'
    }).populate({
        path: 'author'
    });
    const provider_admin = await User.find({provider_id: blog?.provider_id?._id});
    blog.author = "" + provider_admin?.firstName + " " + provider_admin?.lastName;
                // .populate('likes', excludeField)
                // .populate('dislikes', excludeField)
   
    return res.status(200).json({
        success: blog ? true : false,
        blog: blog
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

const createNewPostTag = asyncHandler(async(req, res)=>{

    const {label, created_by} = req.body
    if(!label || !created_by){
        throw new Error ("Missing input")
    }
    const response = await PostTag.create(req.body)

    return res.status(200).json({
        success: response ? true : false,
        postTag: response ? response : "Cannot create new blog post tag"
    })
})

const getBlogsBySearchTerm = asyncHandler(async(req, res) => {
    let { searchTerm, selectedTags } = req.query;


    if (!searchTerm) {
        searchTerm = '';
    }
    if (!selectedTags) {
        selectedTags = [];
    }

    // Loại bỏ các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach((el) => delete req.query[el]);

    // Format lại các toán tử cho đúng cú pháp của mongoose
    // let queryString = JSON.stringify(queries);
    // queryString = queryString.replace(
    //     /\b(gte|gt|lt|lte)\b/g,
    //     (matchedEl) => `$${matchedEl}`
    // );

    let queryFinish = {}
    if(searchTerm?.length){
        queryFinish = {
            $or: [
                {title: {$regex: searchTerm, $options: 'i' }},
                {author: {$regex: searchTerm, $options: 'i' }},
                {'provider_id.bussinessName': {$regex: searchTerm, $options: 'i' }},
                {'provider_id.province': {$regex: searchTerm, $options: 'i' }},
                {tags: {$regex: searchTerm, $options: 'i' }}
            ]
        }
    }

    const qr = { ...queryFinish }

    let queryCommand = Blog.find({}).populate({
        path: 'provider_id',
        select: 'bussinessName province',
    }).find(qr);

    let blogs = await queryCommand;

    blogs = blogs.filter(blog => {
        for (const tag of selectedTags) {
            if (blog?.tags.includes(tag)) {
                return true;
            }
        }
        return false;
    })

    return res.status(200).json({
        success: blogs?.length ? true : false,
        blogs: blogs?.length ? blogs : "Cannot Find Post Blogs"
    })
})

const getTopBlogs = asyncHandler(async(req, res)=>{
    let { limit } = req.body
    if(!limit){
        limit = 5;
    }
    let response = await Blog.find({});
    response.sort((a,b) => a.likes.length - b.likes.length);
    response.slice(0, 5);
    // .aggregate([
    //     {$unwind: "$likes"}, 
    //     {$group: {_id:"$_id", likes: {$push:"$answers"}, size: {$sum:1}}}, 
    //     {$sort:{size:1}}]).limit(5);

    return res.status(200).json({
        success: response ? true : false,
        blogs: response ? response : "Cannot Get Blogs!"
    })
})

const getTopTags = asyncHandler(async(req, res)=>{
    let { limit } = req.body
    if(!limit){
        limit = 5;
    }
    const response = await PostTag.find({}).limit(5)

    return res.status(200).json({
        success: response ? true : false,
        tags: response ? response : "Cannot Get Post Tags!"
    })
})

const addBlogComments = asyncHandler(async(req, res)=>{
    let { comment, uid, updatedAt, bid } = req.body

    if (!comment || !uid || !bid) {
        throw new Error('Missing input');
    }

    const response = await Blog.findByIdAndUpdate(bid, { $push: { comments: {comment, postedBy: uid, updatedAt} } }, {new: true}).populate({
        path: 'comments',
        populate: {
            path: 'postedBy',
            select: 'firstName lastName avatar',
        }
    });

    return res.status(200).json({
        success: response ? true : false,
        comments: response ? response : "Cannot Get Post Tags!"
    })
})

module.exports = {
    updateBlog,
    getAllBlogs,
    likeBlog,
    dislikeBlog,
    getBlog,
    deleteBlog,
    uploadImage,
    getAllBlogTags,
    createNewBlogPost,
    createNewPostTag,
    getBlogsBySearchTerm,
    getTopBlogs,
    getTopTags,
    addBlogComments
}