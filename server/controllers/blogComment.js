const BlogComment = require('../models/blogComment')
const asyncHandler = require('express-async-handler')

// const createBrand = asyncHandler(async(req, res)=>{
//     const response = await Brand.create(req.body)

//     return res.status(200).json({
//         success: response ? true : false,
//         createdBrand: response ? response : "Cannot create new brand"
//     })
// })

const getAllCommentsForBlog = asyncHandler(async(req, res)=>{
    const {blogCommentId} = req.body;

    if (!blogCommentId) {
        throw new Error("Missing Input");
    }

    const bcs = await BlogComment.aggregate([
        {
            $match: {
                blog: blogCommentId
            }
        },
        {
            $graphLookup: {
                from: 'blogcomments',
                startWith: '$replies',
                connectFromField: 'replies',
                connectToField: '_id',
                as: 'AllRecursiveReplies'
            }
        }
    ]);

    return res.status(200).json({
        success: bcs ? true : false,
        blogComments: bcs ? bcs : "Cannot get all blog comments"
    })
})

const createBlogComment = asyncHandler(async(req, res)=>{
    let { comment, uid, updatedAt, bid } = req.body

    console.log('----->', req.body);

    if (!uid) {
        return res.status(401).json({
            success: false,
            msg: "Unauthorized",
            comments: []
        })
    }

    if (!comment|| !bid || updatedAt) {
        throw new Error("Missing Input");
    }

    const response = await BlogComment.Create(req.body);
    // .findByIdAndUpdate(bid, { $push: { comments: {comment, postedBy: uid, updatedAt} } }, {new: true}).populate({
    //     path: 'comments',
    //     populate: {
    //         path: 'postedBy',
    //         select: 'firstName lastName avatar',
    //     }
    // });

    return res.status(200).json({
        success: response ? true : false,
        comments: response ? response : "Cannot Get Post Tags!"
    })
})

const replyBlogComment = asyncHandler(async(req, res)=>{
    let { comment, uid, updatedAt, bid, repliedCommentId } = req.body

    console.log('----->', req.body);

    if (!uid) {
        return res.status(401).json({
            success: false,
            msg: "Unauthorized",
            comments: []
        })
    }

    if (!comment|| !bid || updatedAt) {
        throw new Error("Missing Input");
    }

    const addedBcs = await BlogComment.Create(req.body);
    // .findByIdAndUpdate(bid, { $push: { comments: {comment, postedBy: uid, updatedAt} } }, {new: true}).populate({
    //     path: 'comments',
    //     populate: {
    //         path: 'postedBy',
    //         select: 'firstName lastName avatar',
    //     }
    // });
    if (!addedBcs?._id) {
        throw new Error("Cannot create!!");
    }

    let repliedComment = await BlogComment.updateOne({ _id: repliedCommentId }, { $push: { replies: addedBcs._id } });

    return res.status(200).json({
        success: repliedComment ? true : false,
        comments: repliedComment ? response : "Cannot Update Comment Replied!"
    })
})

module.exports = {
    createBlogComment,
    replyBlogComment,
    getAllCommentsForBlog
}