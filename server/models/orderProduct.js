const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var orderProductSchema = new mongoose.Schema({
    products: [{
        product: {type:mongoose.Types.ObjectId, ref: 'Product'},
        quantity: {type: Number},
        color: {type: String},
        price: {type: Number},
        thumb: {type: String},
        title: {type: String},
    }],
    status:{
        type: String,
        default: 'Cancelled',
        enum: ['Cancelled', 'Successful']
    },
    total:{
        type: Number
    },
    orderBy:{
        type: mongoose.Types.ObjectId, 
        ref: 'User'
    },
    provider: {
        type: mongoose.Types.ObjectId,
        ref: 'Service_Provider'
    }
},{
    timestamps: true
});

//Export the model
module.exports = mongoose.model('orderProduct', orderProductSchema);