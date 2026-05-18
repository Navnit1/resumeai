<<<<<<< HEAD
# ⚡ ResumeAI — Intelligent Resume Builder & ATS Optimizer

> Full-stack AI-powered resume builder with ATS scoring, GPT-4 content generation, admin dashboard, JWT auth, PDF export, and Cloudinary image uploads.

---

## 📁 Project Structure

```
resumeai/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   └── cloudinary.config.js
│   ├── controllers/
│   │   ├── auth.controller.js   # JWT auth, register/login/refresh
│   │   ├── resume.controller.js # Full CRUD + ATS + PDF export
│   │   ├── ai.controller.js     # All AI/LLM features
│   │   └── admin.controller.js  # Admin user & analytics management
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT protect + role-based access
│   │   ├── error.middleware.js  # Global error handler
│   │   └── upload.middleware.js # Multer file upload
│   ├── models/
│   │   ├── User.model.js        # Full user schema w/ stats
│   │   └── Resume.model.js      # Comprehensive resume schema
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── resume.routes.js
│   │   ├── ai.routes.js
│   │   ├── user.routes.js
│   │   └── admin.routes.js
│   ├── services/
│   │   ├── ats.service.js       # ATS keyword matching algorithm
│   │   └── pdf.service.js       # Puppeteer PDF generation
│   ├── utils/
│   │   ├── AppError.js
│   │   └── asyncHandler.js
│   ├── server.js                # Express app entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/                   # React + Redux + Tailwind
    ├── src/
    │   ├── components/
    │   │   ├── common/index.jsx  # Button, Card, Badge, Modal, ScoreRing...
    │   │   ├── layout/
    │   │   │   ├── AppLayout.jsx
    │   │   │   ├── Sidebar.jsx
    │   │   │   ├── Header.jsx
    │   │   │   └── AuthLayout.jsx
    │   │   └── resume/
    │   │       └── ResumePaper.jsx  # Resume renderer (preview + PDF)
    │   ├── pages/
    │   │   ├── DashboardPage.jsx
    │   │   ├── ResumesPage.jsx
    │   │   ├── ResumeBuilderPage.jsx  # Multi-step builder + live preview
    │   │   ├── ResumeDetailPage.jsx
    │   │   ├── ATSCheckerPage.jsx     # Full ATS analysis UI
    │   │   ├── AIGeneratorPage.jsx    # 6 AI tools
    │   │   ├── AdminPage.jsx          # Admin dashboard
    │   │   ├── ProfilePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── PublicResumePage.jsx   # Shareable resume link
    │   │   └── NotFoundPage.jsx
    │   ├── store/
    │   │   ├── index.js
    │   │   └── slices/
    │   │       ├── authSlice.js       # JWT auth + refresh logic
    │   │       ├── resumeSlice.js     # Full resume CRUD + ATS + PDF
    │   │       ├── aiSlice.js         # All AI feature thunks
    │   │       └── uiSlice.js         # Sidebar, modals, tabs
    │   ├── utils/
    │   │   └── api.js                 # Axios + auto token refresh
    │   └── styles/
    │       └── index.css
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key
- Cloudinary account (for image uploads)

---

### 1. Clone & Install

```bash
git clone https://github.com/yourname/resumeai.git
cd resumeai

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

---

### 2. Configure Environment

```bash
# Copy example env
cd backend && cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

MONGODB_URI=mongodb://localhost:27017/resumeai

JWT_SECRET=your_jwt_secret_at_least_32_characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

OPENAI_API_KEY=sk-...your_openai_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

### 3. Create Admin User

```bash
cd backend

# Start MongoDB, then run:
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User.model');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@resumeai.dev',
    password: 'Admin1234!',
    role: 'admin',
    plan: 'enterprise',
    isEmailVerified: true
  });
  console.log('Admin created:', admin.email);
  process.exit(0);
});
"
```

---

### 4. Start Development Servers

```bash
# Terminal 1: Backend
cd backend && npm run dev
# → API running at http://localhost:5000

# Terminal 2: Frontend
cd frontend && npm start
# → App running at http://localhost:3000
```

---

## 🔑 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns JWT |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout (clears cookie) |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/change-password` | Change password |
| POST | `/api/auth/forgot-password` | Request reset email |
| PUT | `/api/auth/reset-password/:token` | Reset password |

### Resumes (all require JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resumes` | Get all my resumes |
| POST | `/api/resumes` | Create new resume |
| GET | `/api/resumes/:id` | Get single resume |
| PUT | `/api/resumes/:id` | Update resume |
| DELETE | `/api/resumes/:id` | Delete resume |
| POST | `/api/resumes/:id/duplicate` | Duplicate resume |
| POST | `/api/resumes/:id/analyze-ats` | Run ATS scoring |
| GET | `/api/resumes/:id/export-pdf` | Download PDF |
| POST | `/api/resumes/:id/toggle-share` | Toggle public sharing |
| GET | `/api/resumes/share/:token` | Get public resume |

### AI Features (all require JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/generate-summary` | Generate professional summary |
| POST | `/api/ai/generate-bullets` | Generate experience bullets |
| POST | `/api/ai/extract-keywords` | Extract ATS keywords from JD |
| POST | `/api/ai/optimize-content` | Improve/rewrite text |
| POST | `/api/ai/analyze-resume` | Full AI resume analysis |
| POST | `/api/ai/suggest-skills` | Suggest skills for role |
| POST | `/api/ai/improve-sentence` | Improve individual sentence |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/analytics` | Platform analytics |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/:id` | Get user details |
| PUT | `/api/admin/users/:id` | Update user role/plan |
| DELETE | `/api/admin/users/:id` | Delete user + data |
| POST | `/api/admin/users/:id/toggle-status` | Suspend/activate |
| GET | `/api/admin/resumes` | List all resumes |

---

## 🤖 ATS Scoring Algorithm

The ATS scorer calculates a **weighted score (0-100)** based on:

| Factor | Weight | Description |
|--------|--------|-------------|
| Keyword Match | 35% | Keywords from JD found in resume |
| Formatting | 20% | Contact info, bullet count, dates present |
| Section Coverage | 20% | Required sections present (summary, exp, edu, skills) |
| Action Verbs | 15% | Strong action verbs starting bullets |
| Quantified Impact | 10% | Metrics (%, $, numbers) in bullets |

---

## 🎨 Resume Templates

| Template | Style |
|----------|-------|
| `modern` | Dark gradient header, indigo accents |
| `classic` | Times New Roman, black & white, traditional |
| `minimal` | Clean, gray accents, whitespace-focused |
| `executive` | Dark slate header, gold accents |

---

## 🔒 Security Features

- **JWT Access Tokens** (15min) + **Refresh Tokens** (7 days, httpOnly cookie)
- **bcrypt** password hashing (12 rounds)
- **Helmet.js** security headers
- **express-rate-limit** — 100 req/15min API, 20/hr AI
- **xss-clean** input sanitization
- **express-validator** schema validation
- **Role-based access** — User / Admin
- **Plan-based gating** — Free / Pro / Enterprise limits

---

## 📦 Deployment

### Backend (Railway / Render / Heroku)
```bash
# Set environment variables in platform dashboard
# Deploy with:
npm start
```

### Frontend (Vercel / Netlify)
```bash
npm run build
# Deploy /build folder
# Set REACT_APP_API_URL=https://your-api.railway.app/api
```

### MongoDB Atlas
- Create free cluster at mongodb.com/atlas
- Whitelist `0.0.0.0/0` for prod
- Replace MONGODB_URI with connection string

---

## 🔧 Tech Stack

**Backend:** Node.js · Express · MongoDB · Mongoose · JWT · bcrypt · Puppeteer · Multer · Cloudinary · OpenAI SDK · Helmet · express-validator

**Frontend:** React 18 · Redux Toolkit · React Router v6 · Tailwind CSS · Axios · react-hot-toast · Recharts

---

## 📄 License

MIT © ResumeAI 2024
=======
# resumeai
>>>>>>> adf9fb9e1eb5ecbe241288af14552e739b0cb0f2
