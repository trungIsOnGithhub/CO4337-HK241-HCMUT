const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
        required:true,
    },
    avatar:{
        type:String,
    },
    mobile:{
        type:String,
        unique:true,
        required:true,  
    },
},{
    timestamps: true
});


//Export the model
module.exports = mongoose.model('Staff', userSchema);