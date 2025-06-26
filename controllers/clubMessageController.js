const ClubMessage = require('../models/message');


let ioInstance;

// Inject socket instance
const setSocketIO = (io) => {
  ioInstance = io;
};

// Controller to send and emit message
//POST 
const sendMessageToClub = async (req, res) => {
  const { clubId, senderEmail, senderName, message } = req.body;

  try {
    const newMessage = new ClubMessage({
      clubId,
      senderEmail,
      senderName,
      message,
      timestamp: new Date(),
    });

    await newMessage.save();

    // Emit message via socket
    if (ioInstance) {
  console.log("📤 Emitting via io to club:", clubId);
console.log("📤 Message content:", newMessage);
  ioInstance.of("/club").to(clubId).emit("receiveMessage", newMessage);
} else {
  console.log("ioInstance not set!");
}


    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Message send error:", error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};

module.exports = {
  setSocketIO,
  sendMessageToClub,
};
