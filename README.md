# TDTT Final Term Project

## Cấu trúc dự án

Dự án bao gồm 2 phần chính:

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Vite

## Yêu cầu hệ thống

- Node.js (phiên bản 14 trở lên)
- npm hoặc yarn

## Cài đặt

### 1. Cài đặt dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### 2. Cấu hình môi trường

#### Backend

Tạo file `.env` trong thư mục `backend/` với nội dung sau:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Quan trọng:** Đặt file `serviceAccountKey.json` (Firebase Admin SDK) vào thư mục `backend/src/config/`


## Chạy ứng dụng

### Chạy Backend

```bash
cd backend
npm run dev
```

Backend sẽ chạy tại `http://localhost:5000`

### Chạy Frontend

```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173` (hoặc cổng khác nếu 5173 đã được sử dụng)

## Chạy đồng thời Backend và Frontend

Mở 2 terminal riêng biệt:

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

## Cấu trúc thư mục

```
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── firebase.ts
│   │   │   └── serviceAccountKey.json (cần tạo)
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.ts
│   ├── .env (cần tạo)
│   └── package.json
└── frontend/
    ├── src/
    └── package.json
```

## Lưu ý

- Đảm bảo đã tạo file `.env` cho cả backend trước khi chạy
- File `serviceAccountKey.json` phải được đặt đúng vị trí: `backend/src/config/serviceAccountKey.json`
- Không commit file `.env` và `serviceAccountKey.json` lên Git (đã được ignore trong `.gitignore`)
