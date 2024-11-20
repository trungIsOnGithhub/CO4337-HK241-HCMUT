const Blog = require('../models/blog')
const PostTag = require('../models/postTag')
const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const { prependListener } = require('../models/ServiceProvider');
const ES_CONSTANT = require('../services/constant');
// const esDBModule = require('../services/es');

const createNewBlogPost = asyncHandler(async(req, res)=>{
    const {_id} = req.user
    
    const {title, content} = req.body
    const thumb = req.files?.thumb[0]?.path
    if(thumb){
        req.body.thumb = thumb
    }
    if(!title || !content){
        throw new Error ("Missing input")
    }
    const response = await Blog.create({...req.body, author: _id})

    return res.status(200).json({
        success: response ? true : false,
        createBlog: response ? response : "Cannot create new blog"
    })
})

const getAllBlogTags = asyncHandler(async (req,res) => {
    let { limit, orderBy } = req.query;
    if (!limit) limit = 10;
    
    const sortObj = { tagCount: -1 };
    if (orderBy?.indexOf('-numberView')) {
        sortObj['tagViewCount'] = -1;
    }

    const resp = await Blog.aggregate([
        // { $match: { isHidden: false } },
        // { $addFields: {
        //     numLikes: { "$size": "$likes" }
        //     // numDislikes: { "$size": "$dislikes" }
        // }},
        // { $project: { _id:1, tags:1 } },
        { $unwind: "$tags" },
        // { $addFields: {
        //     tagName: "$tags"
        // }},
        { $group: {
            _id: "$tags",
            tagCount: { $sum: 1 },
            tagViewCount: { $sum: "$numberView" }
        }},
        // { $project: { _id:1, tags:1, tagName:1 } },
        { $sort: sortObj }
    ]);

    return res.status(200).json({
        success: resp ? true : false,
        tags: resp
    }) 
});

// const searchBlogsAdvanced = asyncHandler(async (req, res)=>{
//     return res.status(200).json({
//         success: response ? true : false,
//         blogs: []
//     });
// });

const getAllBlogs = asyncHandler(async (req, res)=>{
    const { title, sortBy, provinces } = req.body;

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
    let { searchTerm, selectedTags, selectedSort,
            page, pageSize } = req.query;

    if (!searchTerm) {
        searchTerm = '';
    }
    if (!selectedTags) {
        selectedTags = [];
    }
    if (!selectedSort) {
        selectedSort = "";
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

    let queryFinish = {}
    if(searchTerm?.length){
        queryFinish = {
            $or: [
                {title: {$match: searchTerm}},
                // {author: {$regex: searchTerm}}
                {'provider_id.bussinessName': {$regex: searchTerm, $options: 'i' }}
                // {'provider_id.province': {$regex: searchTerm, $options: 'i' }}
            ]
        }
    }

    const qr = { ...queryFinish }

    let queryCommand = Blog.find(qr).populate({
        path: 'provider_id',
        select: 'bussinessName province',
    });

    let blogs = await queryCommand;

    // console.log(blogs.length);

    if (selectedTags?.length) {
        blogs = blogs.filter(blog => {
            for (const tag of selectedTags) {
                if (blog?.tags.includes(tag)) {
                    return true;
                }
            }
            return false;
        });    
    }

    let fieldToSort = selectedSort;
    if (selectedSort.indexOf('-') === 0) {
        fieldToSort = selectedSort.slice(1);
    }
    if (selectedSort?.length && selectedSort.indexOf('-') === 0) {
        blogs = blogs.sort(function(x, y) {
            if (x[fieldToSort] > y[fieldToSort])
              return -1;
            if (x[fieldToSort] < y.createdAt)
              return 1;
            return 0;
        });
    }
    else if (selectedSort?.length) {
        blogs = blogs.sort(function(x, y) {
            if (x.createdAt < y.createdAt)
              return -1;
            if (x.createdAt > y.createdAt)
              return 1;
            return 0;
        });
    }
    

    const startIdx = page * pageSize;
    console.log('-->', page, pageSize);
    const endIdx = startIdx + pageSize;
    blogs = blogs.slice(startIdx, endIdx);

    return res.status(200).json({
        success: blogs ? true : false,
        counts: blogs.length,
        blogs: blogs ? blogs : "Cannot Find Post Blogs"
    })
});

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


const searchBlogAdvanced = asyncHandler(async (req, res) => {
    console.log("INCOMING REQUESTS:", req.body);

    let { searchTerm, limit, offset, categories, sortBy,
        selectedTags } = req.body;

    if ( (typeof(offset) != "number") ||
        !limit || offset < 0 || limit > 20)
    {
        return res.status(400).json({
            success: false,
            searched: [],
            msg: "Bad Request"
        });
    }

    let sortOption = [];
    if (sortBy?.indexOf("-numberView") > -1) {
        sortOption.push({numberView: {order : "desc"}});
    }
    else if (sortBy?.indexOf("numberView") > -1) {
        sortOption.push({numberView : {order : "asc"}});
    }

    if (sortBy?.indexOf("-likes") > -1) {
        sortOption.push({likes: {order : "desc"}});
    }
    if (sortBy?.indexOf("-createdAt") > -1) {
        sortOption.push({createdAt : {order : "desc"}});
    }

    // if (sortBy?.indexOf("location") > -1) { geoSortOption = { unit: "km", order: "desc" }; }

    // let geoLocationQueryOption = null;
    // if ( clientLat <= 180 && clientLon <= 180 &&
    //     clientLat >= -90 && clientLon >= -90 &&
    //     /[1-9][0-9]*(km|m)/.test(distanceText) )
    // {
    //     geoLocationQueryOption = { distanceText,  clientLat, clientLon };
    // }

    const columnNamesToMatch = ["title", "providername", "authorname"];
    const columnNamesToGet = ["id", "title", "providername", "authorname", "numberView", "provider_id", "likes", "dislikes", "tags", "createdAt"];

    let blogs;
    // blogs = await esDBModule.fullTextSearchAdvanced(
    //     ES_CONSTANT.BLOGS,
    //     searchTerm,
    //     columnNamesToMatch,
    //     columnNamesToGet,
    //     limit,
    //     offset,
    //     sortOption,
    //     null,
    //     null,
    //     null,
    //     null,
    //     selectedTags
    // );
    blogs = blogs?.hits;

    // console.log("REAL DATA RETURNED: ", blogs);

    return res.status(200).json({
        success: blogs ? true : false,
        blogs
    });
});

const getTopBlogWithSelectedTags = asyncHandler(async(req, res)=>{
    let { limit, selectedTags } = req.body
    if(!limit){
        limit = 5;
    }
    const response = await Blog.find({tags: { $in: selectedTags }}).sort({ likes: -1 }).limit(limit);

    return res.status(200).json({
        success: response ? true : false,
        blogs: response ? response : "Cannot Get Post Tags!"
    })
})

const updateViewBlog = asyncHandler(async(req, res)=>{
    const {bid} = req.params
    if(!bid) {
        throw new Error("Missing input")
    }
    const blog = await Blog.findById(bid)
    blog.numberView = (blog.numberView || 0) + 1
    await blog.save()
    return res.status(200).json({
        success: blog ? true : false,
        blog: blog
    })
})

const getAllBlogByProviderId = asyncHandler(async(req, res)=>{
    const {provider_id} = req.params
    if(!provider_id){
        throw new Error("Missing input")
    }

    const queries = { ...req.query };

    // Loại bỏ các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach((el) => delete queries[el]);

    // Format lại các toán tử cho đúng cú pháp của mongoose
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
    );

    // chuyen tu chuoi json sang object
    const formatedQueries = JSON.parse(queryString);
    let queryFinish = {}
    if(queries?.q){
        delete formatedQueries.q
        queryFinish = {
            $or: [
                {title: {$regex: queries.q, $options: 'i' }},
                {category: {$regex: queries.q, $options: 'i' }},
            ]
        }
    }
    
    const qr = {...formatedQueries, ...queryFinish, provider_id}
    let queryCommand =  Blog.find(qr).populate({
        path: 'author'
    })

    try {
        // sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ')
            queryCommand.sort(sortBy)
        }

        //filtering
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ')
            queryCommand.select(fields)
        }

        //pagination
        //limit: so object lay ve 1 lan goi API
        //skip: n, nghia la bo qua n cai dau tien
        //+2 -> 2
        //+dgfbcxx -> NaN
        const page = +req.query.page || 1
        const limit = +req.query.limit || process.env.LIMIT_PRODUCT
        const skip = (page-1)*limit
        queryCommand.skip(skip).limit(limit)
        
        const blogs = await queryCommand
        const counts = await Blog.countDocuments(qr);
        return res.status(200).json({
            success: true,
            counts: counts,
            blogs: blogs,
            });
    } catch (error) {
        // Xử lý lỗi nếu có
        return res.status(500).json({
        success: false,
        error: 'Cannot get blog',
        });
    }
    
})

const getAllBlogsByAdmin = asyncHandler(async (req, res) => {
    const {_id} = req.user
    const {provider_id} = await User.findById({_id}).select('provider_id')
    const queries = { ...req.query };

    // Loại bỏ các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach((el) => delete queries[el]);

    // Format lại các toán tử cho đúng cú pháp của mongoose
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
    );

    // chuyen tu chuoi json sang object
    const formatedQueries = JSON.parse(queryString);

    //Filtering
    let categoryFinish = {}
    if (queries?.name) formatedQueries.name = { $regex: queries.name, $options: 'i' };
    if (queries?.category){
        delete formatedQueries.category
        const categoryArray = queries.category?.split(',')
        const categoryQuery = categoryArray.map(el => ({
            category: {$regex: el, $options: 'i' }
        }))
        categoryFinish = {$or: categoryQuery}
    }

    let queryFinish = {}
    if(queries?.q){
        delete formatedQueries.q
        queryFinish = {
            $or: [
                {name: {$regex: queries.q, $options: 'i' }},
                {category: {$regex: queries.q, $options: 'i' }},
            ]
        }
    }
    const qr = {...formatedQueries, ...queryFinish, ...categoryFinish, provider_id}

    let queryCommand =  Blog.find(qr)
    try {
        // sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ')
            queryCommand.sort(sortBy)
        }

        //filtering
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ')
            queryCommand.select(fields)
        }

        //pagination
        //limit: so object lay ve 1 lan goi API
        //skip: n, nghia la bo qua n cai dau tien
        //+2 -> 2
        //+dgfbcxx -> NaN
        const page = +req.query.page || 1
        const limit = +req.query.limit || process.env.LIMIT_PRODUCT
        const skip = (page-1)*limit
        queryCommand.skip(skip).limit(limit)
        
        const blogs = await queryCommand
        const counts = await Blog.countDocuments(qr);
        return res.status(200).json({
            success: true,
            counts: counts,
            blogs: blogs,
            });
    } catch (error) {
        // Xử lý lỗi nếu có
        return res.status(500).json({
        success: false,
        error: 'Cannot get blog',
        });
    }
})

const updateBlog = asyncHandler(async(req, res) => {
    const {bid} = req.params

    const files = req?.files
    if(files?.thumb){
        req.body.thumb = files?.thumb[0]?.path
    }
    const blog = await Blog.findByIdAndUpdate(bid, req.body, {new: true})
    return res.status(200).json({
        success: blog ? true : false,
        mes: blog ? 'Updated successfully' : "Cannot update blog"
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
    getTopBlogWithSelectedTags,
    getTopBlogs,
    getAllBlogByProviderId,
    getAllBlogsByAdmin,
    searchBlogAdvanced,
    updateViewBlog
}