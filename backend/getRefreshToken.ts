import { google } from "googleapis";
import http from "http";
import url from "url";
import open from "open";
import destroyer from "server-destroy"; 
import fs from "fs";

interface OAuth2Config {
  web: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
    auth_uri: string;
    token_uri: string;
  };
}

const SCOPES = ["https://www.googleapis.com/auth/drive"];
const REDIRECT_URI = "http://localhost:3000/oauth2callback";
const keyPath = "./src/config/oauth2Key.json";
const envPath = "./.env";

let oauth2Config: OAuth2Config;

try {
  const rawData = fs.readFileSync(keyPath, "utf-8");
  oauth2Config = JSON.parse(rawData);
} catch (error) {
  console.error("Error loading OAuth2 Config from", keyPath, ":", error);
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  oauth2Config.web.client_id,
  oauth2Config.web.client_secret,
  REDIRECT_URI
);

async function main() {
  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  const server = http
    .createServer(async (req, res) => {
      try {
        if (req.url!.indexOf("/oauth2callback") > -1) {
          const qs = new url.URL(req.url!, "http://localhost:3000")
            .searchParams;
          const code = qs.get("code");
          res.end("Authentication successful! Please return to the console.");
          server.destroy();

          const { tokens } = await oauth2Client.getToken(code!);
          const refreshToken = tokens.refresh_token;

          if (refreshToken) {
            console.log("Refresh Token:", refreshToken);
            let envContent = fs.readFileSync(envPath, "utf-8");
            const regex = /GOOGLE_REFRESH_TOKEN=.*/;
            if (envContent.match(regex)) {
              envContent = envContent.replace(
                regex,
                `GOOGLE_REFRESH_TOKEN=${refreshToken}`
              );
            } else {
              envContent += `\nGOOGLE_REFRESH_TOKEN=${refreshToken}\n`;
            }
            fs.writeFileSync(envPath, envContent, "utf-8");
            console.log(`Refresh token saved to ${envPath}`);
          } else {
            console.log("No refresh token received.");
          }
        }
      } catch (e) {
        console.error(e);
        res.end("Error occurred");
        server.destroy();
      }
    })
    .listen(3000, () => {
      console.log("Open browser for authorization...");
      open(authorizeUrl);
    });

  destroyer(server);
}

main().catch(console.error);
