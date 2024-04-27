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
    homeurl: {
        type: String,
    },
    phone: {
        type: String,
    },
    time: {
        type: Object,
    }
},{
    timestamps: true
});

//Export the model
module.exports = mongoose.model('ProviderService', ProviderServiceSchema);