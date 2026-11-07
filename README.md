# 🤖 Handsome Rating System - Hệ thống AI Đánh giá Độ đẹp trai

> **Hệ thống nhận diện khuôn mặt, chấm điểm độ đẹp trai và so sánh với tiêu chuẩn vàng bằng AI (Gemini Vision + Face Recognition)**

![Demo](https://img.shields.io/badge/Status-Working-brightgreen)
![Node](https://img.shields.io/badge/Node.js-20+-green)
![NestJS](https://img.shields.io/badge/NestJS-12-red)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688)
![MongoDB](https://img.shields.io/badge/MongoDB-9+-green)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📖 Giới thiệu

**Handsome Rating System** là một ứng dụng web full-stack sử dụng trí tuệ nhân tạo để:
1. **Nhận diện khuôn mặt** từ webcam realtime
2. **Chấm điểm độ đẹp trai** (0-100) dựa trên việc so sánh với "Ảnh Chuẩn Vàng" (Standard Face)
3. **Đăng ký hồ sơ** khuôn mặt kèm điểm số và nhận xét AI hài hước
4. **Hiển thị bảng xếp hạng** top đẹp trai

### ✨ Tính năng chính
- 🎥 **Camera Realtime**: Quét khuôn mặt tự động mỗi 4 giây hoặc thủ công
- 🤖 **AI Scoring**: Gemini Vision API so sánh với ảnh chuẩn + fallback random
- 🔐 **Face Recognition**: face_recognition (dlib) extract vector 128D
- 📊 **Leaderboard**: Sắp xếp theo điểm giảm dần, realtime
- 💾 **MongoDB**: Lưu trữ encoding, điểm số, nhận xét
- ⚡ **Architecture**: Microservices (NestJS + FastAPI + MongoDB)

---

## 🏗️ Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | Vanilla JS + Vite | ES Modules | SPA single-page, no framework |
| **Styling** | Tailwind CSS | CDN | Utility-first, dark mode |
| **Backend API** | NestJS | 12.x | REST API, DI, Guards, Pipes |
| **AI Service** | FastAPI + face_recognition | 0.110 / 1.3 | Face detection, 128D encoding |
| **AI Vision** | Google Gemini 1.5 Flash | Latest | So sánh khuôn mặt, chấm điểm, nhận xét |
| **Database** | MongoDB + Mongoose | 9.x | User, Rating collections |
| **Build** | Vite + esbuild | 5.x | Fast dev & production build |
| **Test** | Vitest | 4.x | Unit & E2E testing |
---

## 📁 Cấu trúc thư mục

```
face_recognition_web/
├── .gitignore                    # Root gitignore
├── README.md                     # This file
├── ai-service/                   # Python FastAI Service
│   ├── venv/                     # Virtual environment (ignored)
│   ├── __pycache__/              # Python cache (ignored)
│   ├── main.py                   # FastAPI app (2 endpoints)
│   └── requirements.txt          # Python deps
│
├── backend/                      # NestJS Backend API
│   ├── src/
│   │   ├── app.controller.ts     # REST endpoints (/api/users/*, /api/scan/*)
│   │   ├── app.service.ts        # Business logic (register, scan, leaderboard)
│   │   ├── app.module.ts         # NestJS module config
│   │   └── schemas/
│   │       ├── user.schema.ts    # User: name, studentId, faceEncoding[128], score, comment
│   │       └── rating.schema.ts  # Rating history: userId, score, distance, timestamp
│   ├── test/
│   │   └── app.controller.spec.ts
│   ├── dist/                     # Build output (ignored)
│   ├── node_modules/             # (ignored)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                      # ENV config (ignored)
│
├── frontend/                     # Vite + Vanilla JS Frontend
│   ├── index.html                # SPA entry point (3 tabs)
│   ├── src/
│   │   └── main.js               # All logic: camera, tabs, API calls, modal
│   ├── dist/                     # Build output (ignored)
│   ├── node_modules/             # (ignored)
│   ├── package.json
│   └── vite.config.js (optional)
│
└── docs/
    └── ki_n_tr_c_h_th_ng_nh_gi_p_trai.md  # Design doc (VN)
```

---

## 🔑 Các file quan trọng

| File | Mô tả |
|------|-------|
| `backend/src/app.controller.ts` | Định nghĩa 4 REST endpoints: `POST /api/users/register`, `POST /api/scan/recognize`, `GET /api/users/leaderboard` |
| `backend/src/app.service.ts` | Logic cốt lõi: gọi AI Service, Gemini Vision, MongoDB CRUD, Euclidean distance |
| `backend/src/schemas/user.schema.ts` | Schema MongoDB: faceEncoding (Array<Number> 128D), handsomeScore, aiComment |
| `ai-service/main.py` | FastAPI: `/api/ai/extract-encoding` (đăng ký), `/api/ai/recognize` (quét) |
| `frontend/index.html` | UI: 3 tabs (Quét, Đăng ký, Leaderboard), Modal kết quả, Tailwind CDN |
| `frontend/src/main.js` | Logic frontend: switchTab, camera streams, fetch API, showModal, confetti |

---

## 🔄 Luồng hoạt động (Data Flow)

### 1. 📝 **Đăng ký & Chấm điểm** (`Tab: Đăng ký Khuôn mặt`)
```
User nhập Tên + MSSV → Chụp ảnh webcam → POST /api/users/register
    ↓
Backend (NestJS) nhận file + name + studentId
    ↓
Gửi ảnh → Python AI Service: POST /api/ai/extract-encoding
    ↓
Python (face_recognition) → Trả về vector 128D (faceEncoding)
    ↓
Backend đọc file standard_face.jpg (src/assets/)
    ↓
Gửi 2 ảnh (user + standard) → Gemini Vision API
    ↓
Gemini trả về: { score: 0-100, comment: "string" }
    ↓
Lưu MongoDB: { name, studentId, faceEncoding, handsomeScore, aiComment }
    ↓
Trả về Frontend → showModal(user) → Confetti 🎉
```

### 2. 📸 **Quét & Nhận diện** (`Tab: Quét & Chấm điểm`)
```
User bật Camera → setInterval 4s hoặc click "Quét Ngay"
    ↓
Canvas capture frame → POST /api/scan/recognize
    ↓
Backend gửi frame → Python AI: POST /api/ai/recognize
    ↓
Python detect faces → Trả về [{ box, encoding }] (có thể nhiều khuôn mặt)
    ↓
Backend duyệt users trong DB → Tính Euclidean distance
    ↓
Nếu minDistance < 0.6 → Match!
    ↓
Lưu Rating history → Trả về { success: true, user: {...}, distance }
    ↓
Frontend showModal(user) → Confetti 🎉
```

### 3. 🏆 **Bảng xếp hạng** (`Tab: Bảng Xếp Hạng`)
```
GET /api/users/leaderboard
    ↓
MongoDB: find().sort({ handsomeScore: -1 }).limit(50)
    ↓
Trả về: { success: true, data: [{ rank, name, studentId, score, comment }] }
    ↓
Frontend render table với badge vàng/bạc/đồng top 3
```
---

## 🚀 Cách cài đặt & Chạy

### Yêu cầu hệ thống
- **Node.js** ≥ 20
- **Python** ≥ 3.10
- **MongoDB** (local hoặc Atlas)
- **Google Gemini API Key** (tùy chọn, có fallback)

---

### 1️⃣ Cài đặt Python AI Service

```bash
cd ai-service

# Tạo virtual environment
python -m venv venv

# Kích hoạt (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Hoặc CMD
venv\Scripts\activate.bat

# Cài dependencies
pip install -r requirements.txt

# Chạy server (port 8000)
python -m uvicorn main:app --reload --port 8000
```
✅ Test: Mở `http://localhost:8000/` → `{"message": "Face Recognition AI Service is running!"}`

---

### 2️⃣ Cấu hình & Chạy Backend (NestJS)

```bash
cd backend

# Cài dependencies
npm install   # hoặc pnpm install

# Tạo file .env (xem mẫu bên dưới)
cp .env.example .env   # hoặc tạo thủ công
```

**File `.env` cần thiết:**
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/handsome-rating

# Python AI Service
AI_SERVICE_URL=http://localhost:8000

# Gemini Vision (tùy chọn - có fallback random nếu thiếu)
GEMINI_API_KEY=your_gemini_api_key_here

# Server
PORT=3000
```

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod
```
✅ Test: `http://localhost:3000/api` → `"Handsome Rating System API is running!"`

---

### 3️⃣ Cài đặt & Chạy Frontend

```bash
cd frontend

# Cài dependencies
npm install   # hoặc pnpm install

# Development server (port 5173)
npm run dev

# Production build
npm run build
# Output: frontend/dist/
```
✅ Test: Mở `http://localhost:5173/` → Giao diện 3 tabs đẹp mắt

---

### 4️⃣ Chuẩn bị Ảnh Chuẩn (Standard Face)

Đặt file ảnh tiêu chuẩn tại:
```
backend/src/assets/standard_face.jpg
```
- Nên dùng ảnh khuôn mặt rõ nét, cân đối (ví dụ: nhân vật tiêu chuẩn đẹp trai)
- Nếu thiếu, hệ thống tự fallback dùng ảnh đăng ký đầu tiên

---

## ✅ Kiểm tra & Test

### Backend Tests
```bash
cd backend

# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### Frontend Build Test
```bash
cd frontend
npm run build
# Kiểm tra folder dist/ có index.html + assets/
```

### Integration Test (Manual)
1. Mở frontend `http://localhost:5173`
2. Tab **Đăng ký** → Nhập tên/MSSV → Bật camera → Chụp → Gửi
3. Kết quả: Modal hiện điểm + nhận xét AI
4. Tab **Quét** → Bật camera → Quét khuôn mặt vừa đăng ký
5. Kết quả: Modal nhận diện thành công
6. Tab **Bảng Xếp Hạng** → Xem ranking

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users/register` | Đăng ký khuôn mặt + chấm điểm (multipart: file, name, studentId) |
| `POST` | `/api/scan/recognize` | Nhận diện khuôn mặt từ frame webcam (multipart: file) |
| `GET`  | `/api/users/leaderboard` | Lấy top 50 bảng xếp hạng |

### Python AI Service Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/extract-encoding` | Trích xuất vector 128D từ 1 ảnh (đăng ký) |
| `POST` | `/api/ai/recognize` | Phát hiện nhiều khuôn mặt, trả về box + encoding (quét) |

---

## 🐛 Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| `404 /users/recognize` | Sai endpoint | Dùng `/scan/recognize` (xem app.controller.ts) |
| `MongoDB connection failed` | Sai URI / chưa chạy MongoDB | Kiểm tra `.env` MONGODB_URI, đảm bảo MongoDB đang chạy |
| `Gemini API quota exceeded` | Hết quota free tier | Hệ thống auto-fallback random score 80-99 |
| `Camera không mở` | HTTPS required / permission | Dùng localhost, cho phép camera trong browser |
| `face_recognition import error` | Thiếu dlib/CMake | `pip install cmake` trước, hoặc dùng wheel prebuilt |

---

## 📝 Môi trường phát triển

```bash
# Terminal 1: AI Service
cd ai-service && .\venv\Scripts\Activate.ps1 && python -m uvicorn main:app --reload --port 8000

# Terminal 2: Backend
cd backend && npm run start:dev

# Terminal 3: Frontend
cd frontend && npm run dev
```

---

## 📄 License

MIT License - Tự do sử dụng, sửa đổi, phân phối.

---

## 👨‍💻 Tác giả & Credits

- **Architecture**: NestJS + FastAPI Microservices
- **Face Recognition**: `face_recognition` (dlib) - Adam Geitgey
- **AI Vision**: Google Gemini 1.5 Flash
- **UI**: Tailwind CSS + Canvas Confetti
- **Database**: MongoDB + Mongoose ODM

---

> **Lưu ý**: Đây là dự án demo/giáo dục. Để production cần thêm: Auth/JWT, Rate limiting, Input validation mạnh hơn, Docker compose, CI/CD, Monitoring.