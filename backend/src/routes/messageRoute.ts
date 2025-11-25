import express from "express";
import { sendMessage } from "../controllers/messageControllers.js";
import { verifyUserInConversation } from "../middlewares/friendMiddleware.js";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn kích thước file tải lên là 10MB
});
const messageRouter = express.Router();

messageRouter.post(
  "/send/:conversationId",
  verifyUserInConversation,
  upload.array("attachments", 5),
  sendMessage
);

export default messageRouter;
