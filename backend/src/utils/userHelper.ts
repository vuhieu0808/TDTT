import { driveServices, WORKER_DOMAIN } from "../services/driveServices.js";

export const getLinkFileFromUser = async (userId: string, currentFileUrl: string): Promise<string> => {
  if (!currentFileUrl || currentFileUrl.includes(WORKER_DOMAIN)) {
    return currentFileUrl;
  }
  try {
    const newFileData = await driveServices.uploadFileToUserFolderFromUrl(currentFileUrl, userId);
    return newFileData.urlView;
  } catch (error) {
    console.error("Error ensuring internal File:", error);
    return currentFileUrl;
  }
}