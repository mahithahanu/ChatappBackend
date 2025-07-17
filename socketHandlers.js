const User = require("./models/user");
const FriendRequest = require("./models/friendRequest");
const OneToOneMessage = require("./models/OneToOneMessage");
const AudioCall = require("./models/audioCall");
const VideoCall = require("./models/videoCall");

module.exports = function (io) {
  io.on("connection", async (socket) => {
    const user_id = socket.handshake.query["user_id"];
    console.log(`User connected: ${socket.id}`);

    if (user_id) {
      await User.findByIdAndUpdate(user_id, {
        socket_id: socket.id,
        status: "Online",
      });
    }

    socket.on("send_message", async ({ from, to, conversationId, message, type }) => {
      const newMessage = {
        from,
        to,
        type,
        text: message,
        created_at: new Date(),
      };

      const chat = await OneToOneMessage.findById(conversationId);
      if (!chat) return;

      chat.messages.push(newMessage);
      await chat.save();

      const toUser = await User.findById(to);
      const fromUser = await User.findById(from);

      io.to(toUser?.socket_id).emit("receive_message", {
        conversation_id: conversationId,
        message: newMessage,
      });

      io.to(fromUser?.socket_id).emit("receive_message", {
        conversation_id: conversationId,
        message: newMessage,
      });
    });

    socket.on("disconnect", async () => {
      if (user_id) {
        await User.findByIdAndUpdate(user_id, { status: "Offline" });
        console.log(`User disconnected: ${socket.id}`);
      }
    });
  });
};
