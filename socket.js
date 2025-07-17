const { Server } = require("socket.io");
const User = require("./models/user");
const FriendRequest = require("./models/friendRequest");
const OneToOneMessage = require("./models/OneToOneMessage");
const AudioCall = require("./models/audioCall");

let io;

const logUserSocketIDs = async (user1Id, user2Id, context = "") => {
  const user1 = await User.findById(user1Id).select("socket_id");
  const user2 = await User.findById(user2Id).select("socket_id");
  console.log(`${context}: user1 (${user1Id}) socket ID = ${user1?.socket_id}`);
  console.log(`${context}: user2 (${user2Id}) socket ID = ${user2?.socket_id}`);
};

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    const user_id = socket.handshake.query["user_id"];
    console.log(`🔌 User connected: ${socket.id}`);

    if (user_id) {
      await User.findByIdAndUpdate(user_id, { socket_id: socket.id });
    }

    socket.on("friend_request", async (data) => {
      const to = await User.findById(data.to).select("socket_id");
      const from = await User.findById(data.from).select("socket_id");

      console.log(`Friend Request: from (${data.from}) socket ID = ${from?.socket_id}`);
      console.log(`Friend Request: to (${data.to}) socket ID = ${to?.socket_id}`);

      await FriendRequest.create({ sender: data.from, recipient: data.to });
      io.to(to?.socket_id).emit("new_friend_request", { message: "New friend request received" });
      io.to(from?.socket_id).emit("request_sent", { message: "Request Sent successfully!" });
    });

    socket.on("accept_request", async (data) => {
      const request_doc = await FriendRequest.findById(data.request_id);
      if (!request_doc) return;

      const sender = await User.findById(request_doc.sender).select("socket_id");
      const receiver = await User.findById(request_doc.recipient).select("socket_id");

      await User.findByIdAndUpdate(request_doc.sender, {
        $addToSet: { friends: request_doc.recipient },
      });

      await User.findByIdAndUpdate(request_doc.recipient, {
        $addToSet: { friends: request_doc.sender },
      });

      await FriendRequest.findByIdAndDelete(data.request_id);

      io.to(sender?.socket_id).emit("request_accepted", { message: "Friend Request Accepted" });
      io.to(receiver?.socket_id).emit("request_accepted", { message: "Friend Request Accepted" });
    });

    socket.on("get_direct_conversations", async ({ user_id }, callback) => {
      try {
        const user = await User.findById(user_id).populate("friends", "firstName lastName avatar _id email status");
        if (!user) return callback([]);

        const results = [];
        for (const friend of user.friends) {
          let convo = await OneToOneMessage.findOne({
            participants: { $all: [user_id, friend._id], $size: 2 },
          }).populate("participants", "firstName lastName avatar _id email status");

          if (!convo) {
            convo = {
              _id: `${user_id}_${friend._id}`,
              participants: [user, friend],
              messages: [],
              isMock: true,
            };
          }

          results.push(convo);
        }

        callback(results);
      } catch (err) {
        console.error("Error in get_direct_conversations:", err);
        callback([]);
      }
    });

    socket.on("start_conversation", async (data) => {
      const { to, from } = data;
      const existing_conversations = await OneToOneMessage.find({
        participants: { $size: 2, $all: [to, from] },
      }).populate("participants", "firstName lastName _id email status");

      if (existing_conversations.length === 0) {
        let new_chat = await OneToOneMessage.create({ participants: [to, from] });
        new_chat = await OneToOneMessage.findById(new_chat).populate("participants", "firstName lastName _id email status");
        socket.emit("start_chat", new_chat);
      } else {
        socket.emit("start_chat", existing_conversations[0]);
      }
    });

    socket.on("get_messages", async (data, callback) => {
      try {
        const { messages } = await OneToOneMessage.findById(data.conversation_id).select("messages");
        callback(messages);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("text_message", async (data) => {
      const { message, conversation_id, from, to, type } = data;

      const to_user = await User.findById(to);
      const from_user = await User.findById(from);

      const new_message = {
        to,
        from,
        type,
        created_at: Date.now(),
        text: message,
      };

      io.to(to_user?.socket_id).emit("new_message", { conversation_id, message: new_message });
      io.to(from_user?.socket_id).emit("new_message", { conversation_id, message: new_message });
    });

    socket.on("start_audio_call", async (data) => {
      const { from, to, roomID } = data;
      await logUserSocketIDs(from, to, "Audio Call");

      const to_user = await User.findById(to);
      const from_user = await User.findById(from);
      io.to(to_user?.socket_id).emit("audio_call_notification", {
        from: from_user,
        roomID,
        streamID: from,
        userID: to,
        userName: to,
      });
    });

    socket.on("audio_call_not_picked", async (data) => {
      const { to } = data;
      const to_user = await User.findById(to);
      io.to(to_user?.socket_id).emit("audio_call_missed", data);
    });

    socket.on("audio_call_accepted", async (data) => {
      const { to, from } = data;
      const from_user = await User.findById(from);
      await AudioCall.findOneAndUpdate({ participants: { $size: 2, $all: [to, from] } }, { verdict: "Accepted" });
      io.to(from_user?.socket_id).emit("audio_call_accepted", { from, to });
    });

    socket.on("audio_call_denied", async (data) => {
      const { to, from } = data;
      await AudioCall.findOneAndUpdate({ participants: { $size: 2, $all: [to, from] } }, { verdict: "Denied", status: "Ended", endedAt: Date.now() });
      const from_user = await User.findById(from);
      io.to(from_user?.socket_id).emit("audio_call_denied", { from, to });
    });

    socket.on("user_is_busy_audio_call", async (data) => {
      const { to, from } = data;
      await AudioCall.findOneAndUpdate({ participants: { $size: 2, $all: [to, from] } }, { verdict: "Busy", status: "Ended", endedAt: Date.now() });
      const from_user = await User.findById(from);
      io.to(from_user?.socket_id).emit("on_another_audio_call", { from, to });
    });


    socket.on("end", async (data) => {
      if (data.user_id) {
        await User.findByIdAndUpdate(data.user_id, { status: "Offline" });
      }
      console.log("🔌 Closing connection for socket:", socket.id);
      socket.disconnect(0);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

module.exports = { initSocket, getIO };
