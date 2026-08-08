const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.get("/health", (_, res) => res.json({ status: "ok" }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.emit("message", { type: "connected", id: socket.id });
});

server.listen(4001, () => console.log("Realtime service running on :4001"));
