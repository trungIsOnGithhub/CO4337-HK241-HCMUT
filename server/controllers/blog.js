const Blog = require('../models/blog')
const PostTag = require('../models/postTag')
const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const { prependListener } = require('../models/ServiceProvider');
const ES_CONSTANT = require('../services/constant');
const esDBModule = require('../services/es');

const createNewBlogPost = asyncHandler(async(req, res)=>{
    const {title, content} = req.body;

    if(!title || !content){
        throw new Error ("Missing input")
    }
    // const response = await Blog.create(req.body)

    const response = {
        _id: "66377327edf989f1ae865513",
        title: "Sample Title",
        content: "An interesting blog...",
        category: "Sample category",
        numberView: 9999,
        likes:[],
        dislikes:[],
        image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.123rf.com%2Fphoto_133391293_creative-blogging-sketch-on-white-brick-wall-background-blog-and-media-concept-3d-rendering.html&psig=AOvVaw0nd0jBQJauaxJrqQ8TtS9z&ust=1699960308658000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCLia9eTrwIIDFQAAAAAdAAAAABAI"
    };

    return res.status(200).json({
        success: response ? true : false,
        createBlog: response ? response : "Cannot create new blog"
    })
})

const updateBlog = asyncHandler(async(req, res)=>{
    const {bid} = req.params;
    // console.log("-----", req, "----");

    if(Object.keys(req.body).length === 0){
        throw new Error("Missing input")
    }
    // const response = await Blog.findByIdAndUpdate(bid, req.body, {new: true})
    const response = [];
    return res.status(200).json({
        success: response ? true : false,
        updatedBlog: response ? response : "Cannot update blog"
    });
})

const getAllBlogTags = asyncHandler(async (req,res) => {
    let { limit, orderBy } = req.query;
    if (!limit) limit = 10;
    
    const sortObj = { tagCount: -1 };
    if (orderBy?.indexOf('-numberView')) {
        sortObj['tagViewCount'] = -1;
    }

    const resp = await Blog.aggregate([
        { $unwind: "$tags" },
        { $group: {
            _id: "$tags",
            tagCount: { $sum: 1 },
            tagViewCount: { $sum: "$numberView" }
        }},
        { $sort: sortObj }
    ]);

    return res.status(200).json({
        success: resp ? true : false,
        tags: resp
    }) 
});

const getAllBlogs = asyncHandler(async (req, res)=>{
    const { provider_id, title, sortBy, provinces } = req.body;

    if(!provider_id){
        throw new Error ("Missing input")
    }
    const searchFilter = {};
    if (title) {
        searchFilter.title = title;
    }
    let response = await Blog.find(searchFilter).populate({
        path: 'provider_id',
        select: 'bussinessName province',
    }).populate({
        path: 'author',
        select: 'firstName lastName',
    });

    if (sortBy?.length) {
        if (sortBy[0] === 1) {
            response.sort((b1,b2) => {
                if (b1.createdAt > b2.createdAt) {
                    return -1;
                }
                else if (b1.createdAt < b2.createdAt) {
                    return 1;
                }
                return 0;
            });
        }
        else if (sortBy[0] === 2) {
            response.sort((b1,b2) => {
                if (b1.likes < b2.likes) {
                    return -1;
                }
                else if (b1.likes > b2.likes) {
                    return 1;
                }
                return 0;
            });
        }
        else if (sortBy[0] === 3) {
            response.sort((b1,b2) => {
                if (b1.dislikes > b2.dislikes) {
                    return -1;
                }
                else if (b1.dislikes <   b2.dislikes) {
                    return 1;
                }
                return 0;
            });
        }
    }

    if (provinces?.length) {
        response = response.filter(blog => {
            for (let province of provinces) {
                // let province_words_tokens = province.split(' ');
                
                // for (let token of province_words_tokens) {
                    if (blog?.provider_id?.province?.indexOf(province) >= 0
                        || province.indexOf(blog?.provider_id?.province || '~') >= 0) { // ~ = random  string to make it fail
                        return true;
                    }
                // }
            }
            return false;
        });
    }

    return res.status(200).json({
        success: response ? true : false,
        blogs: response ? response : "Cannot get all blogs"
    })
})

// LIKE
const likeBlog = asyncHandler(async(req, res)=>{
    const {_id, bid } = req.body;
    const response = {};
    const alreadyDisliked = true;
    const alreadyLiked = true;

    if(!bid) {
        throw new Error("Missing input")
    }
    // const blog = await Blog.findById(bid)

    // const alreadyDisliked = blog?.dislikes?.find(e1 => e1.toString() === _id)
    if(alreadyDisliked) {
        // const response = await Blog.findByIdAndUpdate(bid, {$pull: {dislikes: _id}, $push: {likes: _id}},{new: true}).populate({
        //     path: 'provider_id'
        // }).populate({
        //     path: 'author'
        // });

        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }
    // const alreadyLiked = blog?.likes?.find(e1 => e1.toString() === _id)
    if(alreadyLiked) {
        // const response = await Blog.findByIdAndUpdate(bid, {$pull: {likes: _id}},{new: true}).populate({
        //     path: 'provider_id'
        // }).populate({
        //     path: 'author'
        // });

        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }
    else{
        // const response = await Blog.findByIdAndUpdate(bid, {$push: {likes: _id}},{new: true}).populate({
        //     path: 'provider_id'
        // }).populate({
        //     path: 'author'
        // });

        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }
})

// DISLIKE
const dislikeBlog = asyncHandler(async(req, res)=>{
    const {_id, bid } = req.body;
    const response = {};
    const alreadyDisliked = true;
    const alreadyLiked = true;

    if(!_id && !bid) {
        throw new Error("Missing input")
    }
    // const blog = await Blog.findById(bid)
    // const alreadyLiked = blog?.likes?.find(e1 => e1.toString() === _id)
    if(alreadyLiked) {
        // const response = await Blog.findByIdAndUpdate(bid, {$pull: {likes: _id}, $push: {dislikes: _id}},{new: true}).populate({
        //     path: 'provider_id'
        // }).populate({
        //     path: 'author'
        // });

        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }
    // const alreadyDisliked = blog?.dislikes?.find(e1 => e1.toString() === _id)
    if(alreadyDisliked) {
        // const response = await Blog.findByIdAndUpdate(bid, {$pull: {dislikes: _id}},{new: true}).populate({
        //     path: 'provider_id'
        // }).populate({
        //     path: 'author'
        // });

        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }
    else{
        // const response = await Blog.findByIdAndUpdate(bid, {$push: {dislikes: _id}},{new: true}).populate({
        //     path: 'provider_id'
        // }).populate({
        //     path: 'author'
        // });

        return res.status(200).json({
            success: response ? true : false,
            rs: response
        })
    }

})

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
    const response = {};
    if(!req.file){
        throw new Error("Missing input")
    }
    else{
        // const response = await Blog.findByIdAndUpdate(bid, {image: req.file.path},{new: true})
        return res.status(200).json({
            status: response? true : false,
            uploadImage: response? response : "Cannot upload image"
        })
    }
})

const createNewPostTag = asyncHandler(async(req, res)=>{

    const {label} = req.body
    if(!label){
        throw new Error ("Missing input")
    }
    const response = await PostTag.create(req.body)

    return res.status(200).json({
        success: response ? true : false,
        postTag: response ? response : "Cannot create new blog post tag"
    })
})

const getBlogsBySearchTerm = asyncHandler(async(req, res) => {
    let { searchTerm, selectedTags } = req.body;

    console.log("hhehehheeheh")

    if (!searchTerm) {
        searchTerm = '';
    }
    if (!selectedTags) {
        selectedTags = [];
    }

    // Loại bỏ các trường đặc biệt ra khỏi query
    // const excludeFields = ['limit', 'sort', 'page', 'fields'];
    // excludeFields.forEach((el) => delete req.query[el]);

    // Format lại các toán tử cho đúng cú pháp của mongoose
    // let queryString = JSON.stringify(queries);
    // queryString = queryString.replace(
    //     /\b(gte|gt|lt|lte)\b/g,
    //     (matchedEl) => `$${matchedEl}`
    // );

    // let queryFinish = {}
    // if(searchTerm?.length){
    //     queryFinish = {
    //         $or: [
    //             {title: {$regex: searchTerm, $options: 'i' }},
    //             {author: {$regex: searchTerm, $options: 'i' }},
    //             {'provider_id.bussinessName': {$regex: searchTerm, $options: 'i' }},
    //             {'provider_id.province': {$regex: searchTerm, $options: 'i' }},
    //             {tags: {$regex: searchTerm, $options: 'i' }}
    //         ]
    //     }
    // }

    // const qr = { ...queryFinish }

    // let queryCommand = Blog.find({}).populate({
    //     path: 'provider_id',
    //     select: 'bussinessName province',
    // }).find(qr);

    // let blogs = await queryCommand;

    // blogs = blogs.filter(blog => {
    //     for (const tag of selectedTags) {
    //         if (blog?.tags.includes(tag)) {
    //             return true;
    //         }
    //     }
    //     return false;
    // })
    let blogs = [];
    return res.status(200).json({
        success: blogs.length ? true : false,
        blogs: blogs.length ? blogs : "Cannot Find Post Blogs"
    })
})

const updateHiddenStatus = asyncHandler(async (req, res) => {
    const {blogId} = req.params
    const {status} = req.query 

    console.log(blogId)
   
    //status la false -> falsy -> !status return true 
    if (!blogId || status === undefined) {
        throw new Error("Missing input");
    }

    // Kiểm tra giá trị status phải là true hoặc false
    const isValidStatus = status === "true" || status === "false";
    if (!isValidStatus) {
        throw new Error("Invalid status value. Use 'true' or 'false'.");
    }
    // const response = await PostTag.find({}).limit(5)
    const response = [];
    return res.status(200).json({
        success: response ? true : false,
        tags: response ? response : "Cannot Get Post Tags!"
    })
})

const getAllBlogSampleTest = asyncHandler(async(req, res)=>{
    const sampleData = require("../tests/mocks/api.blogs.data.test");

    let { testMode } = req.body;

    if (!testMode) {

        const lossData = sampleData.slice(1);

        return res.status(400).json({
            success: false,
            tags: lossData,
            msg: "Data Loss"
        })
    }

    return res.status(200).json({
        success: true,
        tags: sampleData
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
    getAllBlogSampleTest
}