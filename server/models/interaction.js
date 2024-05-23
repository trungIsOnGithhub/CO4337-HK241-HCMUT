const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var interactionSchema = new mongoose.Schema({
    provider_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service_Provider',
        default: null
    },
    service_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        default: null
    },
    activity:{
        type: Number,
        enum : [1,2],
    },
    // type = 1 mean user visit provider details, type = 2 mean user view service detail
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
},{
    timestamps: true
});
//Export the model
module.exports = mongoose.model('Interaction', interactionSchema);