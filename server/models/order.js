const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({
    info: [{
        service: {type:mongoose.Types.ObjectId, ref: 'Service'},
        provider: {type:mongoose.Types.ObjectId, ref: 'Service_Provider'},
        staff:  {type:mongoose.Types.ObjectId, ref: 'Staff'},
        date: String,
        time: String,
        dateTime: Date
    }],
    status:{
        type: String,
        default: 'Cancelled',
        enum: ['Cancelled', 'Successful', 'Pending']
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
    }]
},{
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Order', orderSchema);