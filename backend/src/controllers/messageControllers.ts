import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { messageServices } from "../services/messageServices.js";
import { Attachment, SendUser } from "../models/Message.js";
import { driveServices } from "../services/driveServices.js";
import { Readable } from "stream";

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.user?.uid;
    const { conversationId } = req.params;
    const { content } = req.body;
    const attachments = req.files as Express.Multer.File[];
    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!conversationId || (!content && (!attachments || attachments.length === 0))) {
      return res.status(400).json({ message: "Message must have content or attachments" });
    }
    
    const sender: SendUser = {
      uid: senderId,
      displayName: req.user?.name || "Unknown",
      avatarUrl: req.user?.picture || null,
    }

    let uploadedAttachments: Attachment[] = [];
    if (attachments && attachments.length > 0) {
      const uploadPromises = attachments.map(async (file) => {
        const originalNameFixed = Buffer.from(file.originalname, "latin1").toString("utf8");
        const uploadedFile = await driveServices.uploadFileToConversationFolder(
          Readable.from(file.buffer),
          originalNameFixed,
          conversationId,
          file.mimetype
        );
        return uploadedFile;
      });
      uploadedAttachments = await Promise.all(uploadPromises);
    }

    const newMessageFetched = await messageServices.sendMessage(conversationId, sender, content, uploadedAttachments);
    const newMessage = {
      ...newMessageFetched,
      createdAt: newMessageFetched.createdAt.toDate().toISOString(),
    }
    res.status(201).json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Error sending direct message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
