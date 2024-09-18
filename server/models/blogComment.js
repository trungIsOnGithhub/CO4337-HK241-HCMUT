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
    replies: [
        {
            type: mongoose.Types.ObjectId, 
            ref: 'BlogComment'
        }
    ],
    blog: {
        type: mongoose.Types.ObjectId, 
        ref: 'Blog'
    }
},{
    timestamps: true
});

//Export the model
module.exports = mongoose.model('BlogComment', blogCommentSchema);