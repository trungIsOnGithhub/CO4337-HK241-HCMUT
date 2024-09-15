const Messages = require("../models/message");
const mongoose = require("mongoose");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    // Chuyển đổi from và to thành ObjectId
    const fromObjectId = new mongoose.Types.ObjectId(from);
    const toObjectId = new mongoose.Types.ObjectId(to);

    const messages = await Messages.find({
      users: {
        $all: [fromObjectId, toObjectId],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    console.error("Error in getMessages:", ex);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getLastMessages = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const messages = await Messages.aggregate([
      { $match: { users: new mongoose.Types.ObjectId(userId) } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: {
            $arrayElemAt: [
              { $filter: {
                input: "$users",
                as: "user",
                cond: { $ne: ["$$user", new mongoose.Types.ObjectId(userId)] }
              }},
              0
            ]
          },
          lastMessage: { $first: "$message.text" },
          updatedAt: { $first: "$updatedAt" },
          sender: { $first: "$sender" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          updatedAt: 1,
          firstname: { $arrayElemAt: ["$userInfo.firstName", 0] },
          lastname: { $arrayElemAt: ["$userInfo.lastName", 0] },
          avatar: { $arrayElemAt: ["$userInfo.avatar", 0] },
          isFromSelf: { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] }
        }
      },
      { $sort: { updatedAt: -1 } }
    ]);

    res.json(messages);
  } catch (ex) {
    console.error("Error in getLastMessages:", ex);
    next(ex);
  }
};