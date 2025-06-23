const OneToOneMessage = require("../models/OneToOneMessage");
const User = require("../models/user");

// Get all one-to-one conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
  return res.status(400).json({ message: "Invalid or missing user ID" });
}

console.log("Incoming userId:", userId);

    const user = await User.findById(userId).populate("friends", "_id firstName lastName email");
    if (!user) return res.status(404).json({ message: "User not found" });

    const results = [];

    for (const friend of user.friends) {
      let convo = await OneToOneMessage.findOne({
        participants: { $all: [userId, friend._id], $size: 2 },
      }).populate("participants", "_id firstName lastName email");

      if (!convo) {
        convo = {
          _id:` ${userId}_${friend._id}`,
          participants: [user, friend],
          messages: [],
          isMock: true,
        };
      }

      results.push(convo);
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Server error" });
  }
};
// POST /api/chat/messages
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.body;

    // Validate conversationId
    if (!conversationId || !conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid or missing conversation ID" });
    }

    const convo = await OneToOneMessage.findById(conversationId).select("messages");

    if (!convo) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.status(200).json(convo.messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error" });
  }
};



// POST /api/chat/send
exports.sendMessageOrCreateConversation = async (req, res) => {
  const { from, to, message, type = "Text" } = req.body;
  console.log("Incoming message body:", req.body);


  if (!from || !to || !from.match(/^[0-9a-fA-F]{24}$/) || !to.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid sender or receiver ID" });
  }

  try {
    let conversation = await OneToOneMessage.findOne({
      participants: { $all: [from, to], $size: 2 },
    });

    if (!conversation) {
      conversation = await OneToOneMessage.create({
        participants: [from, to],
        messages: [],
      });
    }

    const newMessage = {
      from,
      to,
      type,
      text: message,
      created_at: new Date(),
    };

    await OneToOneMessage.findByIdAndUpdate(
      conversation._id,
      { $push: { messages: newMessage } },
      { new: true, useFindAndModify: false }
    );

    res.status(200).json({
      message: "Message sent successfully",
      conversation_id: conversation._id,
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// POST /chat/conversation-id
// ✅ Controller (Backend) -- update your `chatController.js`
exports.getOrCreateConversationId = async (req, res) => {
  const { from, to } = req.body;
  try {
    let convo = await OneToOneMessage.findOne({
      participants: { $all: [from, to], $size: 2 },
    });

    if (!convo) {
      convo = await OneToOneMessage.create({
        participants: [from, to],
        messages: [],
      });
    }

    const populatedConvo = await OneToOneMessage.findById(convo._id).populate(
      "participants",
      "firstName lastName _id email status"
    );

    res.status(200).json({ conversation: populatedConvo });
  } catch (err) {
    console.error("Error getting conversation ID:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /chat/delete-chat

exports.deleteChat = async (req, res) => {
  const { conversation_id } = req.body;

  try {
    const conversation = await OneToOneMessage.findById(conversation_id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    // Clear the messages array
    conversation.messages = [];   
    await conversation.save();

    return res.status(200).json({ success: true, message: "Messages deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting chat:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
