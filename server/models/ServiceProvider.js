const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var ProviderServiceSchema = new mongoose.Schema({
    bussinessName: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    province: {
        type: String,
        required: true,
        index: true,
    },
    district: {
        type: String,
    },
    ward: {
        type: String,
    },
    address: {
        type: String,
    },
    homeurl: {
        type: String,
    },
    time: {
        type: Object,
    },
    images: {
        type: [],
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
module.exports = mongoose.model('Service_Provider', ProviderServiceSchema);