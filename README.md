en | [vi](README-vi.md)

# Computational Thinking course project: The Right Type

## Members
#### Group name: Lorem_Ipsum
- 24127003 - Vũ Trần Minh Hiếu
- 24127240 - Hoàng Đức Thịnh
- 24127270 - Trần Viết Bảo
- 24127326 - Đoàn Quốc Bảo

## Tech stack
- **Backend**: Node.js + Express + Firebase + Google Drive
- **Frontend**: Axios + React + Vite

## Prerequisite
- Node.js v18 or later (v22.18.0 or later for native Typescript execution)
- npm for package installation
- A Firebase project with these service set up 
    - Authentication, with Google as a sign-in option
    - Realtime database, with an URL to the database (example for a RTDB located in SEA server : `https://abc-xyz-default-rtdb.asia-southeast1.firebasedatabase.app`). Denote this as `<realtime_db_url>`
    - Firestore database
    - Obtain Firebase Admin credential. Example:
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

    Perform base64 encode for the credential content. Denote this as `<firebase_admin_base64>`
- Google Drive API 
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

    Perform base64 encode for the credential content. Denote this as `<ggdrive_oauth_base64>`
    
- Gemini API key (example: `AIz...`). Denote this as `<gemini_key>`

## Deployment
### A. Backend
#### 1. Prepare environments
- Your `.env` file would be like this
```
PORT=5000
CLIENT_URL=<client_url_1>,<client_url_2>,...
RTDB_URL=<realtime_db_url>
GOOGLE_REFRESH_TOKEN=<ggdrive_token>
GEMINI_API_KEY=<gemini_key>
FIREBASE_ADMIN=<firebase_admin_base64>
OAUTH2=<ggdrive_oauth_base64>
```

`<client_url_1>,<client_url_2>,...` is the list of client urls that are allowed to connet
Example:
```
CLIENT_URL=http://localhost:5173,https://hoppscotch.io
```

#### 2. Install & compile
In `backend` directory, run
```
npm install
npm run build
```
The compiled code is written to `backend/dist`

#### 3. Run
In `backend` directory, run
```
npm run start
```

### B. Frontend

#### 1. Setup client-facing Firebase credential
- Create project's Firebase key (to access database)
- Navigate to `frontend/src/config/firebase.ts`
- Modify the credential
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
- Your `.env` file would be like this
```
VITE_API_URL="http://localhost:5000/api
VITE_SOCKET_URL="http://localhost:5000/"
```
Change `http://localhost:5000` to backend's URL

#### 3. Install & compile
In `backend` directory, run
```
npm install
npm run build
```
The compiled code is written to `backend/dist`

#### 4. Run
In `backend` directory, run
```
npm run start
```

#### 5. Add frontend URL to Firebase authorized domains
- Navigate to Authentication -> Settings -> Authorized domains
- Add your frontend domain name