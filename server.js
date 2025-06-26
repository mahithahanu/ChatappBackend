// server.js
const http = require("http");
const app = require("./app");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const server = http.createServer(app);
const { initSocket } = require("./socket"); 
const clubChatSocket = require("./sockets/chatSocket");


const io = initSocket(server); 
const { setSocketIO } = require("./controllers/clubMessageController");
setSocketIO(io); 

clubChatSocket(io);

mongoose.connect(process.env.DBURI).then(() => {
  console.log("✅ DB Connection successful");
});

const port = process.env.PORT || 3001;
server.listen(3001,'0.0.0.0', () => {
  console.log(`🚀 App running on port ${port}`);
});

process.on("uncaughtException", (err) => {
  console.log("❌ Uncaught Exception!");
  console.log(err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.log("❌ Unhandled Rejection!");
  console.log(err);
  server.close(() => process.exit(1));
});
