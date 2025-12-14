import { google } from "googleapis";
import { Stream } from "stream";
// import oauth2Credentials from "./oauth2Key.json" with { type: "json" };
const oauth2data = process.env.OAUTH2
if(!oauth2data) {
  throw new Error("OAUTH2 missing in .env");
}
let oauth2Credentials: any;
try {
  const decoded = Buffer.from(oauth2data, "base64").toString("utf8");
  oauth2Credentials = JSON.parse(decoded);
} catch {
  throw new Error("failed to parse OAUTH2");
}

const keys = oauth2Credentials.web;
if (!keys) {
  throw new Error("File oauth2Key.json không đúng định dạng (thiếu key 'web' hoặc 'installed')");
}

const CLIENT_ID = keys.client_id;
const CLIENT_SECRET = keys.client_secret;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
if (!REFRESH_TOKEN) {
  throw new Error("Thiếu GOOGLE_REFRESH_TOKEN trong file .env hoặc biến môi trường. File JSON client không chứa token này!");
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Nạp Refresh Token vào để backend tự đăng nhập
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth: oauth2Client });

console.log("Google Drive API initialized with OAuth2 JSON + Refresh Token");

export { drive };
