const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({
    info: [{
        service: {type:mongoose.Types.ObjectId, ref: 'Service'},
        provider: {type:mongoose.Types.ObjectId, ref: 'Service_Provider'},
        staff:  {type:mongoose.Types.ObjectId, ref: 'Staff'},
        date: String,
        time: String,
        dateTime: Date,
        discountCode: {type:mongoose.Types.ObjectId, ref: 'Coupon'}
    }],
    status:{
        type: String,
        default: 'Cancelled',
        enum: ['Cancelled', 'Successful', 'Pending'] //pending thi user co the huy, con Success thi phai nhan voi admin neu muon huy
    },
    total:{
        type: Number
    },
    orderBy:{
        type: mongoose.Types.ObjectId, 
        ref: 'User'
    },
    emails: [{
        type: String,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] //add google calendar
    }],
    capturedId: {
        type: String,
    },
    paymentMethod:{
        type: String,
        enum: ['paypal', 'cod'],
    }
},{
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Order', orderSchema);