const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim: true
    },
    slug:{
        type:String,
        required:true,
        lowercase:true
    },
    description:{
        type:Array,
        required:true
    },
    price:{
        type:Number,
        required:true,
    },
    category: {
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        default:0
    },
    soldQuantity:{
        type:Number,
        default:0
    },
    thumb: {
        type:String,
        required:true,
    },
    image:{
        type:Array
    },
    color:{
        type:String,
    },
    colorCode: {
        type:String,
    },
    rating:[
        {
            star: {type: Number},
            postedBy: {type: mongoose.Types.ObjectId, ref: 'User'},
            comment: {type: String},
            updatedAt: {
                type: Date}
        }
    ],
    totalRatings: {
        type:Number,
        default:0
    },
    variants: [
        {
            title: String,
            color: String,
            quantity: Number,
            colorCode: String,
            thumb: String,
            image: Array,
            soldQuantity:{
                type:Number,
                default:0
            },
        }
    ],
    provider_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service_Provider',
    },
    specifications: [
        {
            key: { type: String, required: true }, // Tên thông số
            value: { type: String, required: true } // Giá trị của thông số
        }
    ],
    isHidden: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Product', productSchema);