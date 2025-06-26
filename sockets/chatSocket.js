const ClubMessage = require("../models/message"); // ✅ Make sure this file exists

module.exports = function clubChatSocket(io) {
  const clubNamespace = io.of("/club");

  clubNamespace.on("connection", (socket) => {
    console.log("User connected to /club namespace:", socket.id);

    // Join club room
    socket.on("joinRoom", (clubId) => {
      socket.join(clubId);
      console.log(`User joined club room: ${clubId}`);
    });

    // Send message to club
    // socket.on("sendMessage", async (data) => {
    //   try {
    //     const { clubId, senderEmail, senderName, message } = data;

    //     // Create message object
    //     const newMessage = new ClubMessage({
    //       clubId,
    //       senderEmail,
    //       senderName,
    //       message,
    //       timestamp: new Date(),
    //     });

    //     await newMessage.save();

    //     // Emit message to all clients in the same club room
  
    //     clubNamespace.to(clubId).emit("receiveMessage", newMessage);

    //   } catch (err) {
    //     console.error("Error saving or sending message:", err);
    //   }
    // });

    // Optional: old-style club_message if still needed
    socket.on("club_message", ({ roomId, user, message }) => {
      clubNamespace.to(roomId).emit("club_message", {
        user,
        message,
        time: new Date(),
      });
    });

    // Leave club room
    socket.on("leave_club", ({ roomId, user }) => {
      socket.leave(roomId);
      clubNamespace.to(roomId).emit("user_left", {
        user,
        message: `${user} left room ${roomId}`,
      });
    });

    socket.on("disconnect", () => {
      console.log("Club user disconnected from namespace:", socket.id);
    });
  });
};
