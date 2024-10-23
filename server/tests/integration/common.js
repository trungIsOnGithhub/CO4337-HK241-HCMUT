// https://www.chaijs.com/plugins/chai-http/
require('dotenv').config()
const expressApp = require('../../app');
const mongoose = require('mongoose')

const PORT = process.env.PORT || 8888;

const testDBConnect = async function() {
    const MONGODB_URI = "";
    try{
        const conn = await mongoose.connect()
        if(conn.connection.readyState === 1){

        }
        else{

        }
    } catch(error){

        throw new Error(error)
    }
}

module.exports = {
    testDBConnect,
    expressApp,
    TEST_BASE_URL: `http://127.0.0.1:${PORT}`
}