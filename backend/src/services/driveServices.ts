import mime from "mime-types";
import { drive_v3 } from "googleapis";
import { Readable } from "stream";
import { drive } from "../config/ggdrive.js";
import { generateUniqueFileName } from "../utils/driveHelper.js";
import { Attachment } from "../models/Message.js";

type DriveFileMetadata = drive_v3.Schema$File;

export const WORKER_DOMAIN = "minhhieuvutran046.workers.dev";
const WORKER_URL = "https://still-night-9727.minhhieuvutran046.workers.dev";

export const driveServices = {
  findOrCreateFolder: async (folderName: string, parentId?: string) => {
    let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    try {
      // 1. Tìm kiếm thư mục
      const res = await drive.files.list({
        q: query,
        fields: "files(id, name)",
        spaces: "drive",
      });

      if (res.data.files && res.data.files.length > 0) {
        // Safe assertion vì đã check length
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return res.data.files[0]!.id!;
      }
      console.log(`Folder ${folderName} not found, creating new one.`);
      // 2. Nếu không thấy thì tạo mới
      const folderMetadata: DriveFileMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      };

      if (parentId) {
        folderMetadata.parents = [parentId];
      }

      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: "id",
      });

      if (!folder.data.id) {
        throw new Error(`Failed to create folder: ${folderName}`);
      }

      return folder.data.id;
    } catch (error) {
      console.error(`Error in findOrCreateFolder (${folderName}):`, error);
      throw error;
    }
  },

  uploadFileToConversationFolder: async (
    fileStream: Readable,
    fileName: string,
    conversationId: string,
    mimeType: string
  ): Promise<Attachment> => {
    try {
      const rootFolderId = await driveServices.findOrCreateFolder("TDTT-Data");
      const conversationsFolderId = await driveServices.findOrCreateFolder(
        "conversations",
        rootFolderId
      );
      const conversationFolderId = await driveServices.findOrCreateFolder(
        conversationId,
        conversationsFolderId
      );

      const storedFileName = generateUniqueFileName(fileName);

      // Tải file lên thư mục cuộc trò chuyện
      const fileMetadata: DriveFileMetadata = {
        name: storedFileName,
        parents: [conversationFolderId],
      };
      const media = {
        body: fileStream,
        mimeType: mimeType || "application/octet-stream",
      };

      const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webViewLink, webContentLink, size",
      });
      const fileId = file.data.id;
      if (!fileId) {
        throw new Error("Failed to upload file: Missing file ID");
      }
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      console.log(
        `File ${storedFileName} uploaded to conversation ${conversationId}`
      );
      const fileAttachment: Attachment = {
        id: fileId,
        // urlView: file.data.webViewLink || "",
        // urlView: `https://lh3.googleusercontent.com/d/${fileId}`,
        urlView: `${WORKER_URL}/${fileId}`,
        urlDownload: file.data.webContentLink || "",
        size: file.data.size ? parseInt(file.data.size) : 0,
        originalName: fileName,
        storedName: storedFileName,
      };
      console.log(`File attachment created:`, fileAttachment);
      return fileAttachment;
    } catch (error) {
      console.error(`Error uploading file to conversation folder:`, error);
      throw error;
    }
  },

  // upload file cho từng users (như avatar, cover, library ảnh cá nhân)
  uploadFileToUserFolder: async (
    fileStream: Readable,
    fileName: string,
    userId: string,
    mimeType: string
  ): Promise<Attachment> => {
    try {
      const rootFolderId = await driveServices.findOrCreateFolder("TDTT-Data");
      const usersFolderId = await driveServices.findOrCreateFolder(
        "users",
        rootFolderId
      );
      const userFolderId = await driveServices.findOrCreateFolder(
        userId,
        usersFolderId
      );
      const storedFileName = generateUniqueFileName(fileName);
      // Tải file lên thư mục user
      const fileMetadata: DriveFileMetadata = {
        name: storedFileName,
        parents: [userFolderId],
      };
      const media = {
        body: fileStream,
        mimeType: mimeType || "application/octet-stream",
      };
      const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webViewLink, webContentLink, size",
      });
      const fileId = file.data.id;
      if (!fileId) {
        throw new Error("Failed to upload file: Missing file ID");
      }
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      console.log(`File ${storedFileName} uploaded to user ${userId}`);
      const fileAttachment: Attachment = {
        id: fileId,
        // urlView: file.data.webViewLink || "",
        // urlView: `https://lh3.googleusercontent.com/d/${fileId}`,
        urlView: `${WORKER_URL}/${fileId}`,
        urlDownload: file.data.webContentLink || "",
        size: file.data.size ? parseInt(file.data.size) : 0,
        originalName: fileName,
        storedName: storedFileName,
      };
      return fileAttachment;
    } catch (error) {
      console.error(`Error uploading file to user folder:`, error);
      throw error;
    }
  },

  uploadFileToUserFolderFromUrl: async (
    fileUrl: string,
    userId: string
  ): Promise<Attachment> => {
    try {
      console.log(`Fetching file from URL: ${fileUrl}`);
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch file from URL: ${response.status} ${response.statusText}`
        );
      }
      const mineType =
        response.headers.get("content-type") || "application/octet-stream";

      const extension = mime.extension(mineType) || "bin";
      const fileName = `user_${userId}_file.${extension}`;

      const buffer = await response.arrayBuffer();
      const stream = Readable.from(Buffer.from(buffer));
      const fileAttachment = await driveServices.uploadFileToUserFolder(
        stream,
        fileName,
        userId,
        mineType
      );
      return fileAttachment;
    } catch (error) {
      console.error(`Error uploading file to user folder from URL:`, error);
      throw error;
    }
  },

  uploadFileToConversationFolderFromUrl: async (
    fileUrl: string,
    conversationId: string
  ): Promise<Attachment> => {
    try {
      console.log(`Fetching file from URL: ${fileUrl}`);
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch file from URL: ${response.status} ${response.statusText}`
        );
      }
      const mineType =
        response.headers.get("content-type") || "application/octet-stream";

      const extension = mime.extension(mineType) || "bin";
      const fileName = `conversation_${conversationId}_file.${extension}`;

      const buffer = await response.arrayBuffer();
      const stream = Readable.from(Buffer.from(buffer));
      const fileAttachment = await driveServices.uploadFileToConversationFolder(
        stream,
        fileName,
        conversationId,
        mineType
      );
      return fileAttachment;
    } catch (error) {
      console.error(`Error uploading file to conversation folder from URL:`, error);
      throw error;
    }
  },
};
