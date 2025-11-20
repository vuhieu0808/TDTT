import { Socket } from "socket.io";
import { admin } from "../config/firebase.js";

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  console.log("Socket authentication middleware triggered");
  try {
    const token = 
      socket.handshake.auth?.token || 
      socket.handshake.headers?.token || 
      socket.handshake.query?.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken) {
      return next(new Error("Authentication error: Invalid token"));
    }
    socket.data.user = decodedToken;
    console.log("Xác minh thành công trong socketMiddleware:", decodedToken);
    next();
  } catch (error) {
    console.error("Authentication error in socketMiddleware:", error);
    next(new Error("Authentication error"));
  }
}