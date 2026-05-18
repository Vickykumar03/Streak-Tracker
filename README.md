# 🔥 StreakMaster

> Never break your coding streak again.

StreakMaster is a full-stack web application that tracks your coding streaks across multiple platforms — LeetCode, CodeChef, GeeksforGeeks, Codeforces, HackerRank, and HackerEarth — and sends you a reminder **1 hour before midnight** so you never lose a streak.

🌐 **Live Demo:** [streak-tracker-bice.vercel.app](https://streak-tracker-bice.vercel.app)

---

## 📸 Screenshots

> Dashboard · Platform Cards · Notifications

---

## ✨ Features

- 📊 **Multi-Platform Dashboard** — Track LeetCode, CodeChef, GFG, Codeforces, HackerRank & HackerEarth in one place
- 🔥 **Streak Tracking** — Live streak count per platform with animated fire indicators
- 💻 **Problems Solved** — Per-platform count + total with a visual breakdown bar
- ⏰ **Midnight Countdown** — Real-time countdown timer with urgent alerts when time is running out
- 📧 **Email Notifications** — Beautiful HTML reminder email sent daily at 11 PM
- 🔔 **Push Notifications** — Native browser push alerts via Web Push API
- ✏️ **Manual Override** — Update stats manually for platforms with limited public APIs
- 🔄 **Auto-Fetch** — Pulls live stats from platform APIs where available
- 🏆 **Level System** — Beginner → Legendary ranking based on total problems solved
- 🔐 **Authentication** — Secure JWT-based login and registration
- 🗄️ **Persistent Storage** — All data stored in MongoDB

---

## 🛠️ Tech Stack

**Frontend**
- React 18
- React Router v6
- Axios
- React Hot Toast
- Inter font (Google Fonts)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer (Gmail)
- Web Push (VAPID)
- Node-Cron

**Deployment**
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

## 🔧 Platform API Support

| Platform | Auto-Fetch | Method |
|---|---|---|
| LeetCode | ✅ | Public GraphQL API |
| Codeforces | ✅ | Official Public API |
| GeeksforGeeks | ⚠️ | Third-party scraper |
| CodeChef | ⚠️ | Unofficial API |
| HackerRank | ❌ | Manual update |
| HackerEarth | ❌ | Manual update |

For platforms marked ❌ or ⚠️, use the **✏️ Manual Update** button on the platform card.

---

## 🚀 Running Locally

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- Gmail account with App Password enabled

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/streak-tracker.git
cd streak-tracker
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Set up environment variables

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in your values — see the [Environment Variables](#-environment-variables) section below.

### 4. Generate VAPID keys (for push notifications)

```bash
cd backend
node -e "const wp = require('web-push'); const k = wp.generateVAPIDKeys(); console.log('Public:', k.publicKey); console.log('Private:', k.privateKey);"
```

### 5. Run the app

```bash
# Terminal 1 — Backend (runs on port 5000)
npm run dev:backend

# Terminal 2 — Frontend (runs on port 3000)
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

Create `backend/.env` with the following keys. **Never commit this file to GitHub.**

```env
# Server
PORT=5000

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT — use a long random string
JWT_SECRET=your_secret_key_here

# Gmail — use App Password, not your real password
EMAIL_USER=your_project_email@gmail.com
EMAIL_PASS=your_16_char_app_password

# VAPID Keys — generate using the command above
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:your_email@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

> ⚠️ **Security Note:** The `.env` file is listed in `.gitignore` and will never be pushed to GitHub. Only commit the `.env.example` file with placeholder values.

### How to get each value

| Variable | How to get it |
|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Connect → Drivers |
| `JWT_SECRET` | Any long random string you make up |
| `EMAIL_USER` | A Gmail address you create for this project |
| `EMAIL_PASS` | Gmail → Security → App Passwords → create one |
| `VAPID_PUBLIC_KEY` | Run the generate command above |
| `VAPID_PRIVATE_KEY` | Run the generate command above |

---

## 📁 Project Structure

```
streak-tracker/
├── backend/
│   ├── models/
│   │   └── User.js                 # MongoDB schema
│   ├── routes/
│   │   ├── auth.js                 # Register, login, /me
│   │   ├── platforms.js            # Platform CRUD + refresh
│   │   └── notifications.js        # Push subscription + prefs
│   ├── services/
│   │   ├── platformService.js      # API fetchers per platform
│   │   ├── notificationService.js  # Email + push sender
│   │   └── cronService.js          # Daily 11 PM cron job
│   ├── middleware/
│   │   └── auth.js                 # JWT verification
│   ├── .env.example                # Template (safe to commit)
│   └── server.js                   # Express entry point
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── sw.js                   # Service worker (push notifications)
│   └── src/
│       ├── App.js                  # Router + Auth context
│       ├── App.css                 # Global styles
│       ├── pages/
│       │   ├── Dashboard.js        # Main dashboard
│       │   ├── Login.js
│       │   └── Register.js
│       └── components/
│           ├── PlatformCard.js     # Per-platform card
│           └── CountdownTimer.js   # Midnight countdown
├── .gitignore
├── docker-compose.yml
└── package.json
```

---

## ⏰ How Notifications Work

A `node-cron` job runs every day at **11:00 PM IST** on the backend server.

It finds all users who:
- Have at least one enabled platform with an active streak
- Have email or push notifications turned on

For each user it sends:
1. An HTML **email** listing all at-risk streaks
2. A **browser push notification** showing the top streak

---

## 🐳 Docker

```bash
cp backend/.env.example backend/.env
# Fill in your values

docker-compose up -d
```

---

## 🚢 Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Set `REACT_APP_API_URL` env var |
| Backend | Render | Set all `.env` variables, Root Directory = `backend` |
| Database | MongoDB Atlas | Whitelist `0.0.0.0/0` for Render access |

---

## 🔐 Security

- Passwords hashed with **bcryptjs** (12 salt rounds)
- Auth via **JWT tokens** (30-day expiry)
- All platform and notification routes protected by auth middleware
- `.env` file excluded from version control via `.gitignore`
- CORS restricted to frontend URL only

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License — free to use, modify and distribute.

---

<p align="center">Built with ❤️ to keep coding streaks alive 🔥</p>
