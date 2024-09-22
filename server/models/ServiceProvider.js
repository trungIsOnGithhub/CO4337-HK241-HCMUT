const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var ProviderServiceSchema = new mongoose.Schema({
    bussinessName: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    province:{
        type: String,
        required: true,
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
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    chatGivenQuestions: [{
        type: String
    }]
},{
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Service_Provider', ProviderServiceSchema);