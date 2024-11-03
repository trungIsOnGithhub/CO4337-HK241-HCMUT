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
        type: Array,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    geolocation: {
        type:
        {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates:
        {
            type: [Number],
            required: true
        }
    },
    chatGivenQuestions: [{
        question: {
            type: String
        },
        answer: {
            type: String,
        }
    }],
    theme: {
        type: String,
        defaultValue: 'light'
    }
},{
    timestamps: true
});

//Export the model
ProviderServiceSchema.index({ geolocation: '2dsphere' });
module.exports = mongoose.model('Service_Provider', ProviderServiceSchema);