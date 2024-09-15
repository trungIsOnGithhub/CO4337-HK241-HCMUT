const { addMessage, getMessages, getLastMessages } = require("../controllers/message");
const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);
router.post("/getLastMessages/", getLastMessages);

module.exports = router;