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
        default: 'dark'
    },
    slogan: {
        type: String,
        default: '',
    },
    mobile:{
        type:String
    },
    indexFooter: {
        type: [{
            field: {
                type: String,
                enum: ['logo', 'slogan', 'address', 'mobile', 'businessName', 'social'],
                required: true
            },
            order: {
                type: Number,
                required: true,
            },
            column: {
                type: String,
                enum: ['left', 'right'],
                required: true,
            },
            isVisible: {
                type: Boolean,
                default: true,
            }
        }],
        default: [
            { field: 'logo', order: 1, column: 'left', isVisible: true },
            { field: 'slogan', order: 2, column: 'left', isVisible: true },
            { field: 'businessName', order: 3, column: 'right', isVisible: true },
            { field: 'address', order: 4, column: 'right', isVisible: true },
            { field: 'mobile', order: 5, column: 'right', isVisible: true },
            { field: 'social', order: 6, column: 'right', isVisible: true }
        ]
    },
    socialMedia: {
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        youtube: { type: String, default: '' },
        twitter: { type: String, default: '' },
        tiktok: { type: String, default: '' }
    },
    logoSize: {
        type: String,
        enum: ['small', 'large'],
        default: 'small',
    },
    advancedSetting: {
        type: Object
    }
},{
    timestamps: true
});

//Export the model
ProviderServiceSchema.index({ geolocation: '2dsphere' });
module.exports = mongoose.model('Service_Provider', ProviderServiceSchema);