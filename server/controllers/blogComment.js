const mongoose = require('mongoose');
const BlogComment = require('../models/blogComment');
const asyncHandler = require('express-async-handler');

const getAllCommentsForBlog = asyncHandler(async(req, res)=>{
    const {blogCommentId} = req.query;
    if (!blogCommentId) {
        throw new Error("Missing Input");
    }

    const response = await BlogComment.find({
        blog: blogCommentId,
        parentComment: null
    }).populate({
        path: 'postedBy',
        select: 'firstName lastName avatar'
    }).populate({
        path: 'like',
        select: 'firstName lastName avatar'
    }).populate({
        path: 'love',
        select: 'firstName lastName avatar'
    }).populate({
        path: 'love_love',
        select: 'firstName lastName avatar'
    }).populate({
        path: 'haha',
        select: 'firstName lastName avatar'
    }).populate({
        path: 'wow',
        select: 'firstName lastName avatar'
    }).populate({
        path: 'sad',
        select: 'firstName lastName avatar'
    }).populate({
        path: 'angry',
        select: 'firstName lastName avatar'
    }).
    sort({ createdAt: -1 });;

    return res.status(200).json({
        success: response ? true : false,
        allComments: response ? response : "Cannot get all blog comments"
    })
})

const createBlogComment = asyncHandler(async(req, res)=>{
    let { comment, postedBy, updatedAt, blog } = req.body


    if (!postedBy) {
        return res.status(401).json({
            success: false,
            msg: "Unauthorized",
            comments: []
        })
    }

    if (!comment|| !blog || !updatedAt) {
        throw new Error("Missing Input");
    }

    const response = await BlogComment.create(req.body);

    return res.status(200).json({
        success: response ? true : false,
        comments: response ? response : "Cannot create comment!"
    })
})

const createReplyComment = asyncHandler(async(req, res)=>{
    let { comment, postedBy, updatedAt, blog, parent} = req.body


    if (!postedBy) {
        return res.status(401).json({
            success: false,
            msg: "Unauthorized",
            comments: []
        })
    }

    if (!comment|| !blog || !updatedAt || !parent) {
        throw new Error("Missing Input");
    }

    const response = await BlogComment.create({...req.body, parentComment: parent});

    return res.status(200).json({
        success: response ? true : false,
        comments: response ? response : "Cannot reply"
    })
})

const getAllReplyComments = asyncHandler(async (req, res) => {
    const { blogCommentId } = req.query;
    if (!blogCommentId) {
        throw new Error("Missing Input");
    }

    // Lấy ra tất cả các bình luận là phản hồi
    const replies = await BlogComment.find({
        blog: blogCommentId,
        parentComment: { $ne: null } // Lấy các bình luận có parentComment khác null
    })
    .populate({
        path: 'postedBy',
        select: 'firstName lastName avatar'
    })
    .sort({ createdAt: -1 }); // Sắp xếp theo thứ tự mới nhất

    // Nhóm các bình luận phản hồi theo parentComment
    const groupedReplies = replies.reduce((acc, reply) => {
        const parentId = reply.parentComment.toString(); // Chuyển đổi ObjectId thành string
        if (!acc[parentId]) {
            acc[parentId] = []; // Nếu chưa có nhóm cho parentComment này, khởi tạo mảng
        }
        acc[parentId].push(reply); // Thêm reply vào nhóm
        return acc;
    }, {});

    return res.status(200).json({
        success: true,
        replies: groupedReplies
    });
});

const reactComment = asyncHandler(async (req, res) => {
    const {_id} = req.user
    const { blogCommentId, reactionType} = req.body;
    console.log(req.body)
    if (!blogCommentId || !reactionType) {
        throw new Error("Missing Input");
    }
    const validReactions = ['like', 'love', 'love_love', 'haha', 'wow', 'sad', 'angry'];
    if (!validReactions.includes(reactionType)) {
        throw new Error("Invalid reaction type");
    }

    // find comment by id
    const comment = await BlogComment.findById(blogCommentId);
    if (!comment) {
        return res.status(404).json({ success: false, message: "Comment not found" });
    }
    
    // Check if user has already reacted in any of the reactions
    let currentReaction = null;
    validReactions.forEach(reaction => {
        if (comment[reaction].includes(_id)) {
            currentReaction = reaction;
        }
    });

    if (currentReaction === reactionType) {
        comment[reactionType] = comment[reactionType].filter(id => id.toString() !== _id.toString());
    } else {
        // Remove user from the current reaction, if it exists
        if (currentReaction) {
            comment[currentReaction] = comment[currentReaction].filter(id => id.toString() !== _id.toString());
        }
        // Add user to the new reaction
        comment[reactionType].push(_id);
    }

    await comment.save();
    return res.status(200).json({
        success: true,
        message: "Reaction updated successfully",
        comment
    });
});

module.exports = {
    createBlogComment,
    getAllCommentsForBlog,
    createReplyComment,
    getAllReplyComments,
    reactComment
}