# Computational Thinking course project: The Right Type

## Members
#### Group name: Lorem_Ipsum
- 24127003 - Vũ Trần Minh Hiếu
- 24127240 - Hoàng Đức Thịnh
- 24127270 - Trần Viết Bảo
- 24127326 - Đoàn Quốc Bảo

## Tech stack
- **Backend:** Node.js + Express + Firebase + Google Drive
- **Frontend:** Axios + React + Vite

### * This is README.md for deployment. Switch to `main` branch for the developement instructions  

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
  Perform base64 encoding for the credential content. Denote this as `<firebase_admin_base64>`.

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
  Perform base64 encoding for the credential content. Denote this as `<ggdrive_oauth_base64>`.

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

      const googleUrl = https://drive.google.com/thumbnail?id=${fileId}&sz=s4000;

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
  Your worker domain name would be like this: `still-night-9727.minhhieuvutran046.workers.dev`. Denote this as `<worker_domain>`

## Deployment
### A. Backend
#### 1. Prepare environments
Create a `.env` file like this:
```
PORT=5000
CLIENT_URL=<client_url_1>,<client_url_2>,...
RTDB_URL=<realtime_db_url>
GOOGLE_REFRESH_TOKEN=<ggdrive_token>
GEMINI_API_KEY=<gemini_key>
FIREBASE_ADMIN=<firebase_admin_base64>
OAUTH2=<ggdrive_oauth_base64>
WORKER_DOMAIN_NAME=<worker_domain>
```

`<client_url_1>,<client_url_2>,...` is the list of client URLs that are allowed to connect. Example:
```
CLIENT_URL=http://localhost:5173,https://hoppscotch.io
```

#### 2. Install & compile
In the `backend` directory, run:
```
npm install
npm run build
```
The compiled code is written to `backend/dist`.

#### 3. Run
In the `backend` directory, run:
```
npm run start
```

#### 4. Post-deployment
- The GOOGLE_REFRESH_TOKEN by default for Testing app expire in 2 weeks. User may either
  - Switch app to Production mode
  - Manually retrieve new token every 2 weeks. This can be done of Google Cloud Console, or by running the [script](./backend/getRefreshToken.ts). The script will write straight into `.env`, which isn't the greatest thing to do on deployment since many service store `.env` separately

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

#### 3. Install & compile
In the `frontend` directory, run:
```
npm install
npm run build
```
The compiled code is written to `frontend/dist`.

#### 4. Run
In the `frontend` directory, run:
```
npm run start
```

#### 5. Add frontend URL to Firebase authorized domains
- Go to Firebase Console -> Authentication -> Settings -> Authorized domains
- Add your frontend domain name