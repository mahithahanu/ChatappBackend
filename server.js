// server.js
const http = require("http");
const app = require("./app");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const server = http.createServer(app);
const { initSocket } = require("./socket"); // 👈 Import socket logic
initSocket(server); // 👈 Start socket.io on this server

mongoose.connect(process.env.DBURI).then(() => {
  console.log("✅ DB Connection successful");
});

const port = process.env.PORT || 3001;
server.listen(3001, () => {
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
