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
    variants: [
        {
            duration: String,
            price: Number,
            thumb: String,
            image: Array,
            name: String,
            sku: String
        }
    ]
},{
    timestamps: true
});


//Export the model
module.exports = mongoose.model('Service', serviceSchema);