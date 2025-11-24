import { google } from "googleapis";
import { Stream } from "stream";

const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.appdata",
];

const auth = new google.auth.GoogleAuth({
  scopes: SCOPES,
  keyFile: "serviceAccountKeyGoogleDrive.json",
});

const drive = google.drive({ version: "v3", auth });
console.log("Google Drive API initialized");

export { drive };
