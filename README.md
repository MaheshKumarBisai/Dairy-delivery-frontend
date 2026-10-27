# 🥛 Dairy Delivery Partner Frontend (`Dairy-delivery-frontend`)

Dedicated delivery partner mobile web application for courier dispatch, order acceptance, real-time turn-by-turn navigation, and proof of delivery. Built with **Expo (React Native for Web)**, **Expo Router**, and **Leaflet / ESRI Map Engine**.

- **GitHub Repository:** [https://github.com/MaheshKumarBisai/Dairy-delivery-frontend.git](https://github.com/MaheshKumarBisai/Dairy-delivery-frontend.git)
- **Port:** `5174`

---

## 🚀 Features
- **Available Orders Queue:** Live pool of dispatch orders ready for pickup.
- **Active Deliveries:** Real-time active delivery tracker with one-touch stage advancement (`ASSIGNED` → `ACCEPTED` → `PICKED_UP` → `OUT_FOR_DELIVERY` → `DELIVERED`).
- **Live Turn-by-Turn GPS Navigation:**
  - Full-screen edge-to-edge interactive street map with ESRI tiles.
  - Multi-touch finger pinch-to-zoom and pan.
  - Real street routing via OSRM (turn-by-turn routing).
  - Stack-safe back routing returning to the exact origin screen.
- **Delivery Confirmation:** Mark delivery as complete with notes, or record failure reasons with instant customer support alert.
- **Delivery History & Earnings:** Comprehensive record of completed and delivered orders.

---

## 📋 Prerequisites
- **Node.js:** `v20.x` or higher (`node -v`)
- **npm:** `v10.x` or higher (`npm -v`)
- **Main Backend:** Running on `http://localhost:4000`

---

## ⚡ Local Setup

### 1. Clone & Navigate
```bash
git clone https://github.com/MaheshKumarBisai/Dairy-delivery-frontend.git
cd Dairy-delivery-frontend
```

### 2. Configure Environment Variables
Create your local `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Default settings in `.env`:
```env
# Leave empty for local development to use the default http://localhost:4000/api/v1
EXPO_PUBLIC_API_URL=
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npx expo start -c
```
- Press `w` to open web browser
- Press `s` to switch Expo Go
- Or scan the QR code with Expo Go on your mobile device (Android / iOS)

---

## 🔑 Demo Delivery Partner Login
| Field | Value |
| --- | --- |
| **Email** | `driver.raj@farmfresh.com` |
| **Password** | `Password@123` |
| **Partner ID** | `DEL-100001` (Rajesh Kumar, FarmFresh Dairy) |

---

## 🛠 Available Scripts
- `npx expo start -c`: Start Expo server with cleared cache.
- `npm run typecheck`: Run TypeScript compiler check without emitting files.
- `npm test`: Run automated Vitest test suite.
- `npm run build`: Export production-ready static web bundle to `dist/`.
