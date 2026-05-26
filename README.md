# VedaAI — AI Assessment Creator

A full-stack AI-powered assessment platform where teachers can create assignments, generate structured question papers using Google Gemini AI, and download polished exam PDFs — all in real time.

## Live Demo

- **Frontend:** Deployed on Vercel → _(add your link after deploy)_
- **Backend API:** Deployed on Render → _(add your link after deploy)_

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                   Browser (Next.js 14)                │
│  • Zustand state management                           │
│  • Socket.io-client (real-time job updates)           │
│  • React components (Sidebar, Form, Paper renderer)   │
└────────────────────────┬─────────────────────────────┘
                         │ HTTP + WebSocket
┌────────────────────────▼─────────────────────────────┐
│               Node.js + Express (TypeScript)          │
│                                                       │
│  REST API                                             │
│  ├─ POST /api/assignments  → create + enqueue job     │
│  ├─ GET  /api/assignments  → list (Redis cached 30s)  │
│  ├─ GET  /api/assignments/:id → get + result          │
│  ├─ POST /api/assignments/:id/regenerate              │
│  ├─ DELETE /api/assignments/:id                       │
│  └─ GET  /api/assignments/:id/pdf (Puppeteer)         │
│                                                       │
│  Socket.io                                            │
│  ├─ Client emits: join:assignment                     │
│  └─ Server emits: job:progress, job:complete, job:error│
│                                                       │
│  BullMQ Worker                                        │
│  ├─ Picks up generation jobs from Redis queue         │
│  ├─ Calls Gemini 1.5 Flash with structured prompt     │
│  ├─ Parses + validates JSON response                  │
│  ├─ Saves Result to MongoDB                           │
│  └─ Emits Socket.io events for real-time updates      │
│                                                       │
├─────────────────────────────────────────────────────  │
│  MongoDB (Atlas)   Redis    Google Gemini 1.5 Flash   │
└──────────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- **Next.js 14** (App Router) + TypeScript
- **Zustand** for global state management
- **Socket.io-client** for WebSocket real-time updates
- **Vanilla CSS** (custom design system — no Tailwind, no component library)
- **Axios** for HTTP requests
- **react-hot-toast** for notifications
- **lucide-react** for icons

### Backend
- **Node.js + Express** + TypeScript
- **MongoDB + Mongoose** for data persistence
- **Redis + BullMQ** for job queue and caching
- **Socket.io** for WebSocket server
- **Google Gemini 1.5 Flash** for AI generation
- **Puppeteer** for PDF generation
- **Multer** for file uploads
- **Zod** for request validation

---

## Features

### Core
- ✅ Create assignment with title, subject, class, due date
- ✅ Multiple question types with configurable count + marks
- ✅ File upload (JPEG, PNG, PDF)
- ✅ Real-time generation progress via WebSocket
- ✅ Structured question paper with sections (A, B, C...)
- ✅ Difficulty tags (Easy / Moderate / Hard) with color coding
- ✅ Answer Key (collapsible)
- ✅ Student Info section (Name, Roll Number, Section)

### Bonus
- ✅ **PDF Export** — Puppeteer renders a proper A4 formatted PDF
- ✅ **Regenerate** — Re-run AI generation for any assignment
- ✅ **Search + Filter** — Search assignments by title/subject/class
- ✅ **Redis caching** — Assignment list cached for 30 seconds
- ✅ **Assignment stats** — Total questions, marks, time on cards
- ✅ **Fallback polling** — Polls every 4s if WebSocket disconnects
- ✅ **Mobile responsive** — Full mobile layout with slide-out sidebar
- ✅ **Error boundaries** — Graceful error handling throughout
- ✅ **3-dot context menu** — View + Delete actions on cards

---

## Project Structure

```
VedaAI/
├── frontend/                    # Next.js 14 app
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # → redirects to /assignments
│   │   │   ├── assignments/
│   │   │   │   ├── page.tsx      # Assignment list
│   │   │   │   ├── new/page.tsx  # Create form
│   │   │   │   └── [id]/page.tsx # Output + progress
│   │   │   └── globals.css       # Full design system
│   │   ├── components/
│   │   │   ├── layout/           # Sidebar, Header
│   │   │   ├── assignments/      # AssignmentCard, EmptyState
│   │   │   ├── create/           # FileUpload, QuestionTypeRow
│   │   │   └── output/           # QuestionPaper, DifficultyBadge
│   │   ├── store/
│   │   │   └── assignmentStore.ts  # Zustand store
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts
│   │   ├── lib/
│   │   │   └── api.ts            # Axios API client
│   │   └── types/
│   │       └── index.ts          # Shared types + constants
│   └── package.json
│
├── backend/                     # Express API
│   ├── src/
│   │   ├── index.ts              # Server entry + socket init
│   │   ├── config/
│   │   │   ├── database.ts       # MongoDB connection
│   │   │   └── redis.ts          # Redis/ioredis connection
│   │   ├── models/
│   │   │   ├── Assignment.ts     # Mongoose Assignment model
│   │   │   └── Result.ts         # Mongoose Result model
│   │   ├── routes/
│   │   │   └── assignments.ts    # All REST endpoints
│   │   ├── services/
│   │   │   ├── aiService.ts      # Gemini integration
│   │   │   ├── promptBuilder.ts  # Structured prompt construction
│   │   │   └── pdfService.ts     # Puppeteer PDF generator
│   │   ├── queue/
│   │   │   └── jobQueue.ts       # BullMQ queue + worker
│   │   ├── socket/
│   │   │   └── socketManager.ts  # Socket.io setup
│   │   └── middleware/
│   │       ├── errorHandler.ts
│   │       └── upload.ts         # Multer file upload
│   └── package.json
│
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Redis server (local or Redis Cloud)
- Google Gemini API key

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env from example
cp .env.example .env

# Fill in your .env:
# MONGODB_URI=<your mongodb connection string>
# REDIS_URL=<your redis url>
# GEMINI_API_KEY=<your gemini api key>
# FRONTEND_URL=http://localhost:3000

# Run in development
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
echo "NEXT_PUBLIC_WS_URL=http://localhost:5000" >> .env.local

# Run in development
npm run dev
```

Visit `http://localhost:3000`

---

## Deployment

### Backend → Render
1. Create new **Web Service** on Render
2. Connect GitHub repo, set root directory to `backend/`
3. Build command: `npm install && npm run build`
4. Start command: `node dist/index.js`
5. Add environment variables in Render dashboard
6. Add a **Redis** add-on or use Redis Cloud (copy URL to `REDIS_URL`)

### Frontend → Vercel
1. Import repo on Vercel
2. Set root directory to `frontend/`
3. Add env vars:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL
   - `NEXT_PUBLIC_WS_URL` = your Render backend URL

---

## Approach & Design Decisions

### AI Prompt Engineering
The prompt sends a fully structured specification to Gemini:
- Exact question count and marks per type
- Difficulty distribution targets (30% Easy, 40% Moderate, 30% Hard)  
- Required JSON schema with sections, questions, and answer keys
- Strict instruction to return valid JSON only

The parser strips markdown code fences, extracts JSON with regex fallback, and validates the structure before saving — ensuring the frontend never receives raw LLM text.

### Real-time Updates
Socket.io rooms (`assignment:{id}`) allow efficient targeted broadcasts. The frontend joins the room immediately after creating an assignment. A polling fallback (every 4s) handles WebSocket disconnections gracefully.

### Job Architecture
BullMQ provides retry logic (3 attempts, exponential backoff) and concurrency control (3 parallel workers). Redis stores job state for fast status lookups, and the assignment list is cached for 30 seconds to reduce DB load.

### PDF Generation
Puppeteer renders a styled HTML template server-side, ensuring consistent cross-platform formatting that matches the on-screen paper layout — difficulty badges, answer key, student info fields and all.
