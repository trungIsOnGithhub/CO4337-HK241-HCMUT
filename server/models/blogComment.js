const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var blogCommentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        required: true
    },
    postedBy:{
        type: mongoose.Types.ObjectId, 
        ref: 'User'
    },
    parentComment: {
        type: mongoose.Types.ObjectId, 
        ref: 'BlogComment', // Reference to the parent comment, if this is a reply
        default: null // Set to null if this is a top-level comment
    },
    blog: {
        type: mongoose.Types.ObjectId, 
        ref: 'Blog'
    },
    like: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
    love: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
    love_love: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
    haha: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
    wow: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
    sad: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
    angry: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
},{
    timestamps: true
});

//Export the model
module.exports = mongoose.model('BlogComment', blogCommentSchema);