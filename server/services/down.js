const { multiFunc } = require('./es');
const ELASTIC_INDEX_NAME_MAP = require('./constant');

(async function () {
    await multiFunc(ELASTIC_INDEX_NAME_MAP.BLOGS, true, false);
    console.log('setup.js RUN DONE!!');
})();