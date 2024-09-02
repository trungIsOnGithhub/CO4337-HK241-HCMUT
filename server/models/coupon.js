const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
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
    expirationDate: {
        type: {
            date: String,
            time: String
        },
        required: true,
    },
    usageLimit: {
        type: Number,
        min: 0,
        default: 0, // 0 means unlimited if noUsageLimit is true
    },
    noUsageLimit: {
        type: Boolean,
        default: false,
    },
    limitPerUser: {
        type: Number,
        min: 0,
        default: 0, // 0 means unlimited if noLimitPerUser is true
    },
    noLimitPerUser: {
        type: Boolean,
        default: false,
    },
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service' // Assuming you have a Service model
    }],
    usageCount: {
        type: Number,
        default: 0
    },
    usedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        usageCount: {
            type: Number,
            default: 0
        }
    }],
    providerId: {type:mongoose.Types.ObjectId, ref: 'Service_Provider'},
},{
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Coupon', couponSchema);