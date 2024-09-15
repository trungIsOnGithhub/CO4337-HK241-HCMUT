const mongoose = require('mongoose'); // Erase if already required
// Declare the Schema of the Mongo model
var postTagSchema = new mongoose.Schema({
    label:{
        type:String,
        required:true,
        unique:true,
    }
});
// Export the model
module.exports = mongoose.model('postTag', postTagSchema);