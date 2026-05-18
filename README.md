# 🔥 StreakMaster — Coding Streak Tracker

Track your coding streaks across **LeetCode, CodeChef, GeeksforGeeks, Codeforces, HackerRank, and HackerEarth** — all in one dashboard. Get reminded **1 hour before midnight** so you never break a streak again.

---

## ✨ Features

- **📊 Multi-Platform Dashboard** — LeetCode, CodeChef, GFG, Codeforces, HackerRank, HackerEarth
- **🔥 Streak Tracking** — Live streak count per platform with fire animation
- **💻 Problems Solved** — Per-platform count + total with a visual breakdown bar
- **⏰ Countdown Timer** — Real-time countdown to midnight with urgent alerts
- **📧 Email Notifications** — HTML-rich email sent at 11 PM every night
- **🔔 Browser Push Notifications** — Native push alerts via Web Push API
- **✏️ Manual Override** — Update stats manually for platforms with limited APIs
- **🔄 Auto-Fetch** — Fetches live data from platform APIs (where available)
- **🏆 Level System** — Beginner → Legendary based on total problems solved
- **🔐 Auth** — JWT-based secure login/register
- **🗄️ MongoDB** — All data persisted in MongoDB

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account (for email notifications)

### 1. Clone & Install

```bash
# Install all dependencies
npm run install:all
```

### 2. Configure Environment

```bash
# Copy the example env
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/streak-tracker

# JWT (change this to something random!)
JWT_SECRET=your_super_secret_key_here_make_it_long

# Gmail (enable 2FA and use App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password

# VAPID Keys for Web Push (generate below)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:your_email@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Generate VAPID Keys (for push notifications)

```bash
cd backend
node -e "const wp = require('web-push'); const k = wp.generateVAPIDKeys(); console.log('Public:', k.publicKey); console.log('Private:', k.privateKey);"
```

Copy the keys into your `.env` file.

### 4. Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App Passwords → create one for "Mail"
4. Use the 16-character password as `EMAIL_PASS`

### 5. Run

```bash
# Terminal 1 — Backend
npm run dev:backend

# Terminal 2 — Frontend
npm run dev:frontend
```

Open **http://localhost:3000**

---

## 🐳 Docker (Easiest Method)

```bash
cp backend/.env.example backend/.env
# Fill in your credentials in backend/.env

docker-compose up -d
```

App runs at **http://localhost:3000**

---

## 🔧 Platform API Notes

| Platform | Auto-Fetch | Notes |
|---|---|---|
| LeetCode | ✅ | Public GraphQL API |
| Codeforces | ✅ | Official public API |
| GeeksforGeeks | ✅ | Third-party API |
| CodeChef | ⚠️ | Unofficial API — limited |
| HackerRank | ⚠️ | Very limited public data |
| HackerEarth | ⚠️ | Very limited public data |

For platforms with limited APIs, use the **✏️ Manual Update** button to enter your stats directly.

---

## 📁 Project Structure

```
streak-tracker/
├── backend/
│   ├── models/User.js          # MongoDB user schema
│   ├── routes/
│   │   ├── auth.js             # Login/register/me
│   │   ├── platforms.js        # Platform CRUD + refresh
│   │   └── notifications.js   # Notif prefs + test
│   ├── services/
│   │   ├── platformService.js  # API scrapers per platform
│   │   ├── notificationService.js  # Email + push
│   │   └── cronService.js      # 11 PM daily cron job
│   ├── middleware/auth.js      # JWT middleware
│   └── server.js              # Express entry point
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── sw.js              # Service worker for push
│   └── src/
│       ├── App.js             # Router + auth context
│       ├── App.css            # All styles
│       ├── pages/
│       │   ├── Dashboard.js   # Main dashboard
│       │   ├── Login.js
│       │   └── Register.js
│       └── components/
│           ├── PlatformCard.js    # Per-platform card
│           └── CountdownTimer.js # Live midnight countdown
├── docker-compose.yml
└── README.md
```

---

## ⏰ How Notifications Work

The backend runs a **cron job at 11:00 PM IST (17:30 UTC)** every night.

It loops through all users who:
- Have `notificationEmail: true` OR `notificationPush: true`
- Have at least one enabled platform with an active streak

For each such user it sends:
1. A beautiful HTML **email** with all at-risk streaks listed
2. A **browser push notification** with the top streak platform

---

## 🔐 Security

- Passwords hashed with **bcryptjs** (12 rounds)
- Auth via **JWT tokens** (30-day expiry)
- All platform routes protected by auth middleware

---

## 📝 License

MIT — Build on it, share it, keep those streaks alive! 🔥
