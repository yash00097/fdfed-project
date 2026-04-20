<div align="center">

# 🚗 PRIMEWHEELS — Find Your Dream Ride

### *A modern full-stack car dealership platform*

Browse. Buy. Sell. Test Drive. All in one place.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Node](https://img.shields.io/badge/Node-Express%205-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)

</div>

---

## ✨ What is PRIMEWHEELS?

PRIMEWHEELS is a complete online car marketplace. Whether you are hunting for your next ride, selling the one in your garage, or booking a test drive before committing — PRIMEWHEELS covers the full journey. Built for **buyers**, **sellers**, **agents**, and **admins**, each with their own tailored experience.

---

## 🎯 Features at a Glance

| 🚙 **For Buyers** | 💰 **For Sellers** | 🧑‍💼 **For Agents** | 🛡️ **For Admins** |
|---|---|---|---|
| Browse inventory | List your car | Manage listings | Oversee platform |
| Filter by type, price, brand | Upload photos | Approve test drives | Approve agent applications |
| Book test drives | Track purchase requests | Respond to customers | Monitor users & cars |
| Leave reviews | Google OAuth login | Dashboard view | Full control |
| Add to cart & purchase | OTP-based password reset | — | — |

---

## 🚀 How To Use the Website

### 1️⃣ Sign Up / Log In
- Head to `/signup` — use **email + password** or **Google OAuth** for one-click login.
- Forgot password? Use the OTP flow — we email a code to reset.

### 2️⃣ Browse Cars 🔍
- Visit the **Inventory** page.
- Filter by **vehicle type**, **brand**, **price range**, or **fuel type**.
- Click any car for full specs, gallery, and seller info.

### 3️⃣ Book a Test Drive 🛣️
- On a car detail page, hit **Book Test Drive**.
- Pick a date & time slot. An agent confirms your booking.
- Check status in your dashboard under **My Test Drives**.

### 4️⃣ Buy a Car 🛒
- Click **Add to Cart** → head to checkout.
- Complete purchase. Your order shows up under **My Purchases**.

### 5️⃣ Sell Your Car 📤
- Go to **Sell a Car**.
- Fill in details (make, model, year, km driven, price), upload photos.
- Submit. An agent reviews & lists it publicly.

### 6️⃣ Leave a Review ⭐
- Bought a car? Drop a review on the seller or the vehicle.
- Helps other buyers make informed choices.

### 7️⃣ Apply as an Agent 🧑‍💼
- Career in auto sales? Submit an **Agent Application**.
- Admin reviews. On approval, you get agent privileges.

### 8️⃣ Notifications 🔔
- Real-time bell icon — test drive confirmations, purchase updates, agent responses. All live.

---

## 🛠️ Tech Stack

**Frontend** — React 19 · Vite 7 · Redux Toolkit · Tailwind CSS 4 · Material UI 7 · GSAP · Framer Motion · Firebase Auth
**Backend** — Express 5 · MongoDB (Mongoose) · Redis (ioredis) · JWT · Nodemailer · Multer · Cloudinary · Swagger
**DevOps** — Docker Compose · Nginx · Render

---

## 🧑‍💻 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis
- Cloudinary account (image uploads)

### Clone & Install
```bash
git clone https://github.com/yash00097/fdfed-project.git
cd fdfed-project
```
> Repo folder name `fdfed-project`; product brand is **PRIMEWHEELS**.

### Backend
```bash
cd backend
cp .env.example .env     # fill in MONGO_URI, JWT_SECRET, Cloudinary, etc.
npm install
npm run dev              # → http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev              # → http://localhost:5173
```

### Or — One-Command Docker 🐳
```bash
docker-compose up
```
Spins up MongoDB, Redis, backend, and frontend (Nginx) together.

---

## 🔐 Environment Variables

**Backend** (`backend/.env`):
```
MONGO_URI=...
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
ADMIN_EMAILS=admin@example.com
AGENT_EMAILS=agent@example.com
```

**Frontend** (`frontend/.env`):
```
VITE_FIREBASE_API_KEY=...
```

---

## 📚 API Docs

Swagger UI available at **`/backend/api-docs`** once backend is running.

---

## 🗺️ Project Structure

```
fdfed-project/
├── backend/           Express API, Mongoose models, auth, routes
├── frontend/          React app, Redux, Tailwind, components
├── docs/              Project documentation
├── docker-compose.yml Container orchestration
└── render.yaml        Render deployment config
```

---

<div align="center">

### Built with ❤️ by the PRIMEWHEELS team

**Drive the future. Starting now.** 🏁

</div>
