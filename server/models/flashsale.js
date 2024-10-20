const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var flashsaleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        defaultValue: 'Flash Sale Event'
    },
    discount_type: {
        type: String,
        enum: ['percentage', 'fixed'], // Ensure only these types are allowed
        required: true,
    },
    percentageDiscount: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service' // Assuming you have a Service model
        },
        value: {
            type: Number,
            min: 0,
            max: 100,
        }
    }],
    fixedAmount: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service' // Assuming you have a Service model
        },
        value: {
            type: Number,
            min: 0,
        }
    }],
    promotionApplicationDate: {
        type: String,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    usageLimit: {
        type: Number,
        min: 0,
        default: 0, // 0 means unlimited if noUsageLimit is true
    },    
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service' // Assuming you have a Service model
    }],
    usageCount: [{ 
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service' // Assuming you have a Service model
        },
        value: {
            type: Number,
            default: 0,
        }
    }],
    providerId: {type:mongoose.Types.ObjectId, ref: 'Service_Provider'},
},{
    timestamps: true
});

//Export the model
module.exports = mongoose.model('FlashSale', flashsaleSchema);