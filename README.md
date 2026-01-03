# Computational Thinking course project: The Right Type

A work-oriented dating application that helps users find compatible partners and discover venues for meetups.

## Members
#### Group name: Lorem_Ipsum
- 24127003 - Vũ Trần Minh Hiếu
- 24127240 - Hoàng Đức Thịnh
- 24127270 - Trần Viết Bảo
- 24127326 - Đoàn Quốc Bảo

## Tech stack
- **Backend:** Node.js + Express + Firebase + Google Drive
- **Frontend:** Axios + React + Vite

---

> **Note:** This is README.md for development. Switch to `deploy` branch for the deployment instructions  

---

## Prerequisites
- Node.js v18 or later (v22.18.0 or later for native TypeScript execution)
- npm for package installation
- A Firebase project with these services set up:
  - Authentication, with Google as a sign-in option
  - Realtime Database, with a URL to the database (example for an RTDB located in the SEA server: `https://abc-xyz-default-rtdb.asia-southeast1.firebasedatabase.app`). Denote this as `<realtime_db_url>`
  - Firestore
  - Firebase Admin credential. Example:
    ```
    {
        type: "service_account",
        project_id: "abcxyz",
        private_key_id: "....",
        private_key: "-----BEGIN PRIVATE KEY-----
        .....
        -----END PRIVATE KEY-----
        ",
        client_email: "...",
        client_id: "...",
        auth_uri: https://accounts.google.com/o/oauth2/auth,
        token_uri: https://oauth2.googleapis.com/token,
        auth_provider_x509_cert_url: https://www.googleapis.com/oauth2/v1/certs,
        client_x509_cert_url: ...,
        universe_domain: "googleapis.com"
    }
    ```
  Save the file as `backend/src/config/serviceAccountKey.json`

- Google Drive API:
    - Refresh token (example: `1//...`). Denote this as `<ggdrive_token>`
    - OAuth2 credential. Example:
    ```
    {
        web: 
        {
            client_id: "123456789.apps.googleusercontent.com",
            project_id: "abcxyz",
            auth_uri: https://accounts.google.com/o/oauth2/auth,
            token_uri: https://oauth2.googleapis.com/token,
            auth_provider_x509_cert_url: https://www.googleapis.com/oauth2/v1/certs,
            client_secret: "G....."
        }
    }
    ```
  Save the file as `backend/src/config/oauth2Key.json`.

- Gemini API key (example: `AIz...`). Denote this as `<gemini_key>`.
- Cloudflare worker proxying to Google Drive to upload
  1. Navigate to "Workers & Pages -> Create application -> Start with Hello world -> Deploy
  2. Edit the `worker.js`
  ```js
  export default {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      
      // https://worker-name.user.workers.dev/FILE_ID
      const fileId = url.pathname.slice(1);

      if (!fileId) {
        return new Response("Missing File ID", { status: 400 });
      }

      const cache = caches.default;
      let response = await cache.match(request);

      if (response) {
        return response;
      }

      const googleUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=s4000`;

      try {
        const imageResponse = await fetch(googleUrl);

        if (!imageResponse.ok) {
          return new Response("Error fetching image from Google", { status: imageResponse.status });
        }

        response = new Response(imageResponse.body, imageResponse);
        
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Cache-Control", "public, max-age=2592000, immutable");
        response.headers.delete("Set-Cookie");
        response.headers.delete("Expires");
        ctx.waitUntil(cache.put(request, response.clone()));
        
        return response;
      } catch (error) {
        return new Response("Internal Error", { status: 500 });
      }
    },
  };
  ```
  Your worker domain name would be like this: `still-night-9727.minhhieuvutran046.workers.dev`

  Navigate to `backend/src/services/driveServices.ts` ([link](./backend/src/services/driveServices.ts)) and modify the code as follow
  ```ts
  //existing code
  type DriveFileMetadata = drive_v3.Schema$File;

  export const WORKER_DOMAIN = "minhhieuvutran046.workers.dev";
  const WORKER_URL = "https://still-night-9727.minhhieuvutran046.workers.dev";

  export const driveServices = {
  //existing code
  ```

  The variable `WORKER_DOMAIN` is the plain domain name, while `WORKER_URL` is the whole domain name with `https` protocol path

## Run instruction
### A. Backend
#### 1. Prepare environments
Create a `.env` file like this:
```
PORT=5000
CLIENT_URL=<client_url_1>,<client_url_2>,...
RTDB_URL=<realtime_db_url>
GOOGLE_REFRESH_TOKEN=<ggdrive_token>
GEMINI_API_KEY=<gemini_key>
```

`<client_url_1>,<client_url_2>,...` is the list of client URLs that are allowed to connect. Example:
```
CLIENT_URL=http://localhost:5173,https://hoppscotch.io
```

#### 2. Run
In the `backend` directory, run:
```
npm run dev
```
Alternatively, you can run
```
npm run dev2
```
if you hate Nodemon and want to utilize native Typescript execution

#### 3. Note on expiring token
- The GOOGLE_REFRESH_TOKEN by default for Testing app expire in 2 weeks. User may either
  - Switch app to Production mode
  - Manually retrieve new token every 2 weeks. This can be done of Google Cloud Console, or by running the [script](./backend/getRefreshToken.ts). The script will write straight into `.env`, which isn't the greatest thing to do...

### B. Frontend

#### 1. Setup client-facing Firebase credentials
- Create your project's Firebase configuration (to access the database).
- Open `frontend/src/config/firebase.ts` and modify the credential:
```
const firebaseConfig = {
  apiKey: "AIz...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};
```

#### 2. Setup environment
Create a `.env` file like this:
```
VITE_API_URL="http://localhost:5000/api"
VITE_SOCKET_URL="http://localhost:5000/"
```
Change `http://localhost:5000` to your backend's URL.

#### 3. Run
In the `frontend` directory, run:
```
npm run dev
```

#### 4. Add frontend URL to Firebase authorized domains
- Go to Firebase Console -> Authentication -> Settings -> Authorized domains
- Add your frontend domain name

## A.I. Acknowledgement
This project utilized various Large Language Models (LLMs) for development assistance:

- **Models Used:**
  - Google Gemini (Flash 2.5, Pro 2.5, Flash 3)
  - Anthropic Claude (Haiku 4.5, Sonnet 4.5, Opus 4.5)
  - OpenAI GPT (GPT-5, GPT-5.1)

- **Delivery Method:** 
  All AI models were accessed through GitHub Copilot with Visual Studio Code integration, providing context-aware code suggestions and development assistance.

- **Usage Areas:**
  - Code generation and refactoring
  - Documentation writing
  - Bug fixing and debugging
  - Architecture design suggestions