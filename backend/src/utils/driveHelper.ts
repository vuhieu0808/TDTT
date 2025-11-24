import { Attachment } from "../models/Message.js";
import { WORKER_DOMAIN } from "../services/driveServices.js";

export const generateUniqueFileName = (originalName: string): string => {
  const ext = originalName.substring(originalName.lastIndexOf("."));
  const name = originalName.substring(0, originalName.lastIndexOf("."));
  const timestamp = Date.now();
  return `${name}_${timestamp}${ext}`;
}

export const quickReconstructAttachment = (clouldflareUrl: string) : Attachment | null => {
  if (!clouldflareUrl || !clouldflareUrl.includes(WORKER_DOMAIN)) {
    return null;
  }
  const fileId = clouldflareUrl.split("/").pop();
  if (!fileId) {
    return null;
  }
  const attachment: Attachment = {
    id: fileId,
    urlView: clouldflareUrl,
    urlDownload: `https://drive.google.com/uc?export=download&id=${fileId}`,
    size: 0,
    originalName: "File",
    storedName: `file_${fileId}`,
  };
  return attachment;
}