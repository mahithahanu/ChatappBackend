const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  author: String,
  time: Date,
  message: String,
  avatar: String,
});

const DiscussionSchema = new mongoose.Schema({
  content: String,
  avatar: String,
  author: String,
  time: { type: Date, default: Date.now },
  // category: {
  //   type: String,
  //   required: true,
  //   // enum: ["fsd", "flutter", "coding", "aws"],
  // },
  replies: [
    {
      message: String,
      avatar: String,
      time: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Discussion", DiscussionSchema);