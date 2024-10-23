require('dotenv').config()
const expressApp = require('../../app');

const PORT = process.env.PORT || 8888;

module.exports = {
    expressApp,
    TEST_BASE_URL: `http://127.0.0.1:${PORT}`
}