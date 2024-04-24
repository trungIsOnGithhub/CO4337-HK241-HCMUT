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
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        unique:true,
        required:true,  
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type: String,
        enum : [1411,202],
        default: 202,
    },
    cart:[{
        product: {type:mongoose.Types.ObjectId, ref: 'Product'},
        quantity: {type: Number},
        color: {type: String},
        price: {type: Number},
        thumb: {type: String},
        title: {type: String},  
    }],
    address:{
        type: String,
    },
    wishlist: [{type: mongoose.Types.ObjectId, ref: 'Product'}],
    isBlocked: {
        type: Boolean,
        default: false,
    },
    refresh_token:{
        type: String,
    },
    passwordChangedAt:{
        type: String,
    },
    passwordResetToken:{
        type: String,
    },
    passwordResetExpires:{
        type: String,
    },
    registerToken:{
        type: String,
    },
},{
    timestamps: true
});

userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        const salt = bcrypt.genSaltSync(10)
        this.password = await bcrypt.hash(this.password, salt)
    }
})

userSchema.methods = {
    isCorrectPassword: async function (password) {
        return await bcrypt.compare(password, this.password)
    },

    createPasswordResetToken: function (){
        const passwordResetToken = crypto.randomBytes(32).toString('hex')
        this.passwordResetToken = crypto.createHash('sha256').update(passwordResetToken).digest('hex')
        this.passwordResetExpires = Date.now() + 15*60*1000; // 15 minutes
        return passwordResetToken
    }
}

//Export the model
module.exports = mongoose.model('User', userSchema);