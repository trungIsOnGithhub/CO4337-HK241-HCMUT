const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Declare the Schema of the Mongo model
var serviceSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    thumb: {
        type:String,
        required:true,
    },
    image:{
        type:Array
    },
    description:{
        type:Array,
        required:true
    },
    price:{
        type:Number,
        required:true,
    },
    category: {
        type:String,
        required:true,
    },
    duration: {
        type: Number,
        required: true
    },
    provider_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service_Provider',
    },
    assigned_staff: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    }],
    extra: [
        {
           name: {type: String},
           price: {type: Number},
           thumbnail: {type: String},
        }
    ],
    rating:[
        {
            star: {type: Number},
            postedBy: {type: mongoose.Types.ObjectId, ref: 'User'},
            comment: {type: String},
            updatedAt: {
                type: Date}
        }
    ],
    totalRatings: {
        type:Number,
        default:0
    },
    bookingQuantity:{
        type:Number,
        default:0
    },
},{
    timestamps: true
});


//Export the model
module.exports = mongoose.model('Service', serviceSchema);