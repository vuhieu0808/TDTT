import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";
import { conversationServices } from "../services/conversationServices.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

io.use(socketAuthMiddleware);

const onlineUsers = new Map<string, string>(); // userId => socketId

io.on("connection", async (socket) => {
  const user = socket.data.user;
  console.log(`${user.uid} connected with socket ID: ${socket.id}`);

  onlineUsers.set(user.uid, socket.id);
  
  io.emit("online-users", Array.from(onlineUsers.keys()));

  const conversations = await conversationServices.getConversations(user.uid);
  const conversationIds = conversations.map((conv) => conv.id);
  conversationIds.forEach((id) => {
    socket.join(id);
  })

  // disconnect
  socket.on("disconnect", () => {
    console.log(`${user.uid} disconnected with socket ID: ${socket.id}`);
    onlineUsers.delete(user.uid);
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });
});

export { app, io, server };
