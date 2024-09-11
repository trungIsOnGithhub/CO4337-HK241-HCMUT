const mongoose = require('mongoose'); // Erase if already required
// Declare the Schema of the Mongo model
var postTagSchema = new mongoose.Schema({
    label:{
        type:String,
        required:true,
        unique:true,
        index: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service_Provider',
        required:true
    }
});
// Export the model
module.exports = mongoose.model('postTag', postTagSchema);