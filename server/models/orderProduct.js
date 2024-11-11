const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var orderProductSchema = new mongoose.Schema({
    products: [{
        productId: {type:mongoose.Types.ObjectId, ref: 'Product'},
        quantity: {type: Number},
        color: {type: String},
        colorCode: {type: String},
        originalPrice: {type: Number},
        discountPrice: {type: Number},
        thumb: {type: String},
        title: {type: String},
        variantId: {type: String},
    }],
    shippingPrice: {
        type: Number
    },
    totalProductPrice:{
        type: Number
    },
    totalPrice:{
        type: Number
    },
    savingPrice:{
        type: Number,
        default: 0
    },
    statusPayment:{
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Successful']
    },
    statusShipping:{
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Shipping', 'Delivered']
    },
    orderBy:{
        type: mongoose.Types.ObjectId, 
        ref: 'User'
    },
    provider: {
        type: mongoose.Types.ObjectId,
        ref: 'Service_Provider'
    },
    discountCode: {
        type:mongoose.Types.ObjectId, 
        ref: 'Coupon'
    },
},{
    timestamps: true
});

//Export the model
module.exports = mongoose.model('orderProduct', orderProductSchema);